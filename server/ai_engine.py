import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def analyze_resume(job_description, resume_text):
    # Usando o modelo flash que é rápido e ótimo para extração de dados
    model = genai.GenerativeModel('gemini-1.5-flash')
    
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
      "missing_skills": ["lista", "de", "habilidades", "faltantes"]
    }}
    """
    
    response = model.generate_content(
        prompt,
        generation_config={"response_mime_type": "application/json"}
    )
    
    return json.loads(response.text)