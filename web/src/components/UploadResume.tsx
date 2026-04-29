'use client';

import { useState } from 'react';
import { UploadIcon, Loader2 } from 'lucide-react';

export default function UploadResume({ jobId }: { jobId: string }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_id', jobId);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      console.log(`Tentando chamar API em: ${apiUrl}/upload-resume`);
      
      const response = await fetch(`${apiUrl}/upload-resume`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert("Currículo analisado com sucesso!");
        window.location.reload();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Erro da API:", errorData);
        alert(`Erro ao processar currículo: ${errorData.detail || 'Erro interno no servidor'}`);
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      
      const isLocalhost = (process.env.NEXT_PUBLIC_API_URL || '').includes('localhost');
      if (isLocalhost && window.location.hostname !== 'localhost') {
        alert("Erro de configuração: O frontend está tentando conectar ao localhost, mas você está em produção. Verifique a variável NEXT_PUBLIC_API_URL na Vercel.");
      } else {
        alert("Erro de conexão: Certifique-se de que o servidor Python está rodando e acessível!");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <label className={`
        flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all
        ${uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 text-white'}
      `}>
        {uploading ? <Loader2 className="animate-spin" size={20} /> : <UploadIcon size={20} />}
        {uploading ? 'Analisando com IA...' : 'Subir Currículo (PDF)'}
        <input 
          type="file" 
          className="hidden" 
          accept=".pdf" 
          onChange={handleUpload} 
          disabled={uploading}
        />
      </label>
    </div>
  );
}