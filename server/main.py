import os
import shutil
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv

# Importando suas funções utilitárias
from extract import extract_text_from_pdf
from ai_engine import analyze_resume

load_dotenv()

app = FastAPI(title="AI Resume Screener API")

# Configuração do Supabase
url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY")
supabase: Client = create_client(url, key)

# Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...), 
    job_id: str = Form(...)
):
    # 1. Validação de formato
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Por favor, envie um arquivo PDF.")

    # 2. Buscar descrição da vaga no Supabase
    try:
        job_query = supabase.table("jobs").select("description").eq("id", job_id).single().execute()
        if not job_query.data:
            raise HTTPException(status_code=404, detail="Vaga não encontrada.")
        job_description = job_query.data["description"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar vaga: {str(e)}")

    # 3. Processamento do arquivo temporário
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        print(f"--- Iniciando processamento de currículo: {file.filename} ---")
        # 4. Extração de texto
        resume_text = extract_text_from_pdf(temp_path)
        if not resume_text:
            print("Erro: Falha ao extrair texto do PDF")
            raise HTTPException(status_code=500, detail="Falha ao extrair texto do currículo.")

        # 5. Análise com Gemini IA
        print("Enviando para análise da IA...")
        analysis = analyze_resume(job_description, resume_text)
        print("Análise da IA concluída.")

        # 6. Salvar Candidato e Resultado da Triagem 
        candidate_info = analysis.get("candidate_info", {})
        
        extracted_email = candidate_info.get("email")
        if not extracted_email or str(extracted_email).lower() in ["null", "none", "n/a", "não informado"]:
            extracted_email = ""
            
        extracted_phone = candidate_info.get("phone")
        if not extracted_phone or str(extracted_phone).lower() in ["null", "none", "n/a", "não informado"]:
            extracted_phone = ""
            
        extracted_name = candidate_info.get("full_name")
        if not extracted_name or str(extracted_name).lower() in ["null", "none", "n/a", "não informado"]:
            extracted_name = file.filename.replace(".pdf", "")

        print(f"Salvando candidato: {extracted_name} ({extracted_email})")
        # Inserimos o candidato
        candidate_data = {
            "full_name": extracted_name,
            "email": extracted_email,
            "phone": extracted_phone,
            "raw_text": resume_text
        }
        
        try:
            # Usamos upsert para o candidato baseado no email (se houver)
            # Isso permite atualizar informações se o mesmo candidato enviar um novo currículo
            if extracted_email:
                c_res = supabase.table("candidates").upsert(candidate_data, on_conflict="email").execute()
            else:
                c_res = supabase.table("candidates").insert(candidate_data).execute()
            
            candidate_id = c_res.data[0]["id"]
        except Exception as db_err:
            print(f"Erro ao processar candidato no banco: {db_err}")
            raise HTTPException(status_code=500, detail="Erro ao salvar candidato no banco de dados.")

        print(f"Candidato ID: {candidate_id}. Salvando resultado da triagem...")
        screening_data = {
            "job_id": job_id,
            "candidate_id": candidate_id,
            "score": analysis["score"],
            "ai_summary": analysis["ai_summary"],
            "matching_skills": analysis["matching_skills"],
            "missing_skills": analysis["missing_skills"],
            "status": "completed"
        }
        
        # Usamos upsert para evitar erro de duplicidade se o candidato já foi triado para esta vaga
        supabase.table("screenings").upsert(screening_data, on_conflict="job_id,candidate_id").execute()
        print("Processamento finalizado com sucesso.")

        return {
            "status": "success",
            "candidate_id": candidate_id,
            "analysis": analysis
        }

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Erro CRÍTICO no processamento: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro interno no servidor: {str(e)}")
    
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)