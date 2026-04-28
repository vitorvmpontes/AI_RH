'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/src/utils/supabase/client';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

export default function DeleteJobButton({ jobId }: { jobId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta vaga? Todos os currículos e dados dos candidatos associados a ela serão permanentemente apagados. Essa ação não pode ser desfeita.")) {
      return;
    }

    setLoading(true);
    const supabase = createClient();
    
    // Deleta os screenings (triagens) atrelados à vaga primeiro, 
    // prevenindo falhas de Foreign Key, caso ON DELETE CASCADE não esteja configurado no DB
    await supabase.from('screenings').delete().eq('job_id', jobId);
    
    // Por fim, deleta a vaga em si
    const { error } = await supabase.from('jobs').delete().eq('id', jobId);
    
    setLoading(false);

    if (error) {
      alert("Erro ao excluir vaga: " + error.message);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <Button 
      variant="destructive" 
      onClick={handleDelete} 
      disabled={loading}
      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-all shadow-sm disabled:opacity-50"
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
      Excluir Vaga
    </Button>
  );
}
