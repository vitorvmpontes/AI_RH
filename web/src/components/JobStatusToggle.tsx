'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/src/utils/supabase/client';
import { Play, Pause, Loader2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

interface JobStatusToggleProps {
  jobId: string;
  initialStatus: boolean;
}

export default function JobStatusToggle({ jobId, initialStatus }: JobStatusToggleProps) {
  const [isActive, setIsActive] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleToggle = async () => {
    setLoading(true);
    const newStatus = !isActive;

    const { error } = await supabase
      .from('jobs')
      .update({ is_active: newStatus })
      .eq('id', jobId);

    if (error) {
      alert('Erro ao atualizar status: ' + error.message);
    } else {
      setIsActive(newStatus);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <Button
      variant="outline"
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 font-medium px-4 py-2 rounded-lg transition-all shadow-sm ${
        isActive 
          ? 'text-amber-600 border-amber-200 hover:bg-amber-50' 
          : 'text-green-600 border-green-200 hover:bg-green-50'
      }`}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : isActive ? (
        <>
          <Pause size={18} /> Pausar Vaga
        </>
      ) : (
        <>
          <Play size={18} /> Reativar Vaga
        </>
      )}
    </Button>
  );
}
