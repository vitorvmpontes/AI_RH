import fitz  # PyMuPDF

def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Abre um PDF e extrai todo o texto de todas as páginas.
    """
    try:
        # Abre o documento
        doc = fitz.open(pdf_path)
        full_text = ""

        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            full_text += page.get_text()

        doc.close()
        
        # Limpeza básica de espaços em branco extras
        return " ".join(full_text.split())
    
    except Exception as e:
        print(f"Erro ao ler o PDF: {e}")
        return ""
