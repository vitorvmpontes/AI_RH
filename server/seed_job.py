import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Configuração do Supabase
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def create_test_job():
    job_data = {
        "title": "Desenvolvedor Full Stack Júnior",
        "company_name": "Tech Inovação UFV",
        "location": "Remoto",
        "description": """
        Procuramos um desenvolvedor com conhecimentos em:
        - React e Next.js para o frontend.
        - Python e FastAPI para o desenvolvimento de APIs.
        - Experiência básica com bancos de dados relacionais (PostgreSQL).
        - Desejável conhecimento em integração com APIs de Inteligência Artificial.
        - Inglês técnico para leitura.
        """
    }

    try:
        response = supabase.table("jobs").insert(job_data).execute()
        job_id = response.data[0]['id']
        print("-" * 30)
        print("✅ Vaga de teste criada com sucesso!")
        print(f"ID DA VAGA: {job_id}")
        print("-" * 30)
        print("Copie o ID acima para usar no seu teste do Swagger/FastAPI.")
        return job_id
    except Exception as e:
        print(f"❌ Erro ao criar vaga: {e}")

if __name__ == "__main__":
    create_test_job()