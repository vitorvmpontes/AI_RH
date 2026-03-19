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
      // Chamada para o seu Backend Python (FastAPI)
      const response = await fetch('http://localhost:8000/upload-resume', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert("Currículo analisado com sucesso!");
        window.location.reload(); // Recarrega para mostrar o novo candidato na lista
      } else {
        alert("Erro ao processar currículo.");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Certifique-se de que o servidor Python está rodando!");
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