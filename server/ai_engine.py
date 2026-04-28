from google import genai
from google.genai import types
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def analyze_resume(job_description, resume_text):
    prompt = f"""
    Você é um recrutador técnico experiente. Analise o currículo abaixo em relação à descrição da vaga fornecida.
    
    Descrição da Vaga:
    {job_description}
    
    Texto do Currículo:
    {resume_text}
    
    Responda estritamente em formato JSON com a seguinte estrutura:
    {{
      "score": (inteiro de 0 a 100),
      "ai_summary": "um resumo de 3 frases sobre o candidato",
      "matching_skills": ["lista", "de", "habilidades", "encontradas"],
      "missing_skills": ["lista", "de", "habilidades", "faltantes"],
      "candidate_info": {{
        "full_name": "Nome completo do candidato (ou null se não encontrar)",
        "email": "Email do candidato (ou null se não encontrar)",
        "phone": "Telefone do candidato (ou null se não encontrar)"
      }}
    }}
    """
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )
    
    return json.loads(response.text)