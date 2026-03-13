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
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# Configuração de CORS para o Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
        # 4. Extração de texto
        resume_text = extract_text_from_pdf(temp_path)
        if not resume_text:
            raise HTTPException(status_code=500, detail="Falha ao extrair texto do currículo.")

        # 5. Análise com Gemini IA
        analysis = analyze_resume(job_description, resume_text)

        # 6. Salvar Candidato e Resultado da Triagem (Exemplo simplificado)
        # Primeiro, inserimos o candidato (ou buscamos se já existe)
        # Nota: Em um sistema real, você extrairia o e-mail do texto para evitar duplicatas
        candidate_data = {
            "full_name": file.filename.replace(".pdf", ""), # Placeholder até extrair nome real
            "email": f"teste_{os.urandom(2).hex()}@example.com", # Placeholder
            "raw_text": resume_text
        }
        
        c_res = supabase.table("candidates").insert(candidate_data).execute()
        candidate_id = c_res.data[0]["id"]

        # Agora salvamos a triagem na tabela 'screenings'
        screening_data = {
            "job_id": job_id,
            "candidate_id": candidate_id,
            "score": analysis["score"],
            "ai_summary": analysis["ai_summary"],
            "matching_skills": analysis["matching_skills"],
            "missing_skills": analysis["missing_skills"],
            "status": "completed"
        }
        
        supabase.table("screenings").insert(screening_data).execute()

        return {
            "status": "success",
            "candidate_id": candidate_id,
            "analysis": analysis
        }

    except Exception as e:
        print(f"Erro no processamento: {e}")
        raise HTTPException(status_code=500, detail="Erro interno no processamento da IA.")
    
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)