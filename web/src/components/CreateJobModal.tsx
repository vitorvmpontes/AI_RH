'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/src/utils/supabase/client';
import { PlusIcon, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';

interface CreateJobModalProps {
  userId: string;
}

export function CreateJobModal({ userId }: CreateJobModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    location: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    
    const { data, error } = await supabase.from('jobs').insert({
      title: formData.title,
      company_name: formData.company_name,
      location: formData.location,
      description: formData.description,
      user_id: userId,
    }).select();

    setLoading(false);

    if (error) {
      alert('Erro ao criar vaga: ' + error.message);
    } else {
      setOpen(false);
      setFormData({ title: '', company_name: '', location: '', description: '' });
      router.refresh(); // Recarrega a página para exibir a nova vaga
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-all shadow-sm">
          <PlusIcon size={20} />
          Nova Vaga
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-6">
        <DialogHeader>
          <DialogTitle className="text-xl">Criar Nova Vaga</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da vaga para começar a receber candidatos.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Título da Vaga</label>
            <Input 
              name="title" 
              placeholder="Ex: Desenvolvedor Frontend Sênior" 
              value={formData.title}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nome da Empresa</label>
            <Input 
              name="company_name" 
              placeholder="Ex: Tech Corp" 
              value={formData.company_name}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Localização</label>
            <Input 
              name="location" 
              placeholder="Ex: Remoto, São Paulo - SP" 
              value={formData.location}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Descrição</label>
            <textarea 
              name="description" 
              placeholder="Descreva os requisitos, responsabilidades e benefícios..."
              value={formData.description}
              onChange={handleChange}
              required
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Criar Vaga'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
