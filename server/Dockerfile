FROM python:3.11-slim

# Definir o diretório de trabalho dentro do contêiner
WORKDIR /app

# Instalar dependências do sistema necessárias para algumas libs Python (ex: processamento de PDF)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiar os arquivos de requisitos primeiro para aproveitar o cache de camadas do Docker
COPY requirements.txt .

# Atualizar o pip e instalar as dependências
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar o restante do código do projeto
COPY . .

# Expor a porta que a aplicação vai rodar
EXPOSE 8000

# Comando para rodar a aplicação
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
