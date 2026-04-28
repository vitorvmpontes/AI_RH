'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/src/utils/supabase/client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Badge } from "@/src/components/ui/badge";
import { 
  CheckCircle2, 
  XCircle, 
  FileText, 
  BrainCircuit, 
  Trophy,
  Target,
  Award,
  Mail,
  Phone,
  Trash2,
  Loader2,
  Star
} from 'lucide-react';

interface CandidateDetailsModalProps {
  screeningId: string;
  candidateName: string;
  candidateEmail?: string;
  candidatePhone?: string;
  score: number;
  isFavorite?: boolean;
  aiSummary: string;
  matchingSkills: string[];
  missingSkills: string[];
  children: React.ReactNode; 
}

export default function CandidateDetailsModal({
  screeningId,
  candidateName,
  candidateEmail,
  candidatePhone,
  score,
  isFavorite = false,
  aiSummary,
  matchingSkills,
  missingSkills,
  children
}: CandidateDetailsModalProps) {
  
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);
  const [localIsFavorite, setLocalIsFavorite] = useState(isFavorite);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja remover este candidato desta vaga? Essa ação não pode ser desfeita.")) {
      return;
    }
    
    setLoadingDelete(true);
    const supabase = createClient();
    
    const { error } = await supabase
      .from('screenings')
      .delete()
      .eq('id', screeningId);
      
    setLoadingDelete(false);
    
    if (error) {
      alert("Erro ao excluir candidato: " + error.message);
    } else {
      router.refresh();
    }
  };

  const handleToggleFavorite = async () => {
    setLoadingFav(true);
    const newStatus = !localIsFavorite;
    
    // Update optimistically for better UX
    setLocalIsFavorite(newStatus);
    
    const supabase = createClient();
    const { error } = await supabase
      .from('screenings')
      .update({ is_favorite: newStatus })
      .eq('id', screeningId);
      
    if (error) {
      alert("Erro ao atualizar favorito: " + error.message);
      setLocalIsFavorite(!newStatus); // Revert on error
    } else {
      router.refresh(); // Refresh backend data just in case
    }
    
    setLoadingFav(false);
  };

  const isHighMatch = score >= 80;
  const isMediumMatch = score >= 50 && score < 80;
  const scoreColor = isHighMatch ? 'text-green-600' : isMediumMatch ? 'text-amber-500' : 'text-red-600';
  const scoreBg = isHighMatch ? 'bg-green-50' : isMediumMatch ? 'bg-amber-50' : 'bg-red-50';

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-4xl w-[95%] max-h-[90vh] overflow-hidden p-0 border border-gray-100 rounded-3xl shadow-2xl bg-white focus:outline-none">
        
        
        <div className={`p-6 md:p-8 ${scoreBg} border-b border-gray-100`}>
          <DialogHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2 flex-1 min-w-0 w-full">
                <DialogTitle className="text-2xl md:text-3xl font-extrabold text-gray-950 flex items-center gap-3">
                  <FileText className="text-gray-400 flex-shrink-0" size={28} />
                  <span className="truncate">{candidateName}</span>
                </DialogTitle>

                {(candidateEmail || candidatePhone) && (
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    {candidateEmail && (
                      <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                        <Mail size={14} className="text-blue-500" />
                        <a href={`mailto:${candidateEmail}`} className="hover:text-blue-600 transition-colors font-medium truncate max-w-[200px] md:max-w-none">{candidateEmail}</a>
                      </div>
                    )}
                    {candidatePhone && (
                      <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                        <Phone size={14} className="text-green-500" />
                        <a href={`tel:${candidatePhone}`} className="hover:text-blue-600 transition-colors font-medium">{candidatePhone}</a>
                      </div>
                    )}
                  </div>
                )}
                
                <p className="text-gray-500 font-bold flex items-center gap-2 text-xs uppercase tracking-wider mt-1">
                  <BrainCircuit size={14} className="text-blue-500" /> Relatório de Compatibilidade IA - Gemini
                </p>
              </div>

              {/* Destaque para o Score */}
              <div className="flex-shrink-0 flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-inner border border-gray-100">
                <Award size={20} className={`mt-0.5 ${scoreColor}`} />
                <div className="text-right">
                    <span className={`text-4xl font-black ${scoreColor} tabular-nums leading-none`}>
                      {score}%
                    </span>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">Match Score</p>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* CONTEÚDO ROLÁVEL:
          Adicionamos overflow-y-auto para criar a barra de rolagem apenas aqui.
          Isso resolve o problema do texto cortado.
        */}
        <div className="p-8 space-y-10 overflow-y-auto max-h-[calc(90vh-160px)]">
          
          {/* Seção 1: Resumo da IA */}
          <section className="relative p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Veredito da IA (Resumo Executivo)</h3>
            <p className="text-gray-700 leading-relaxed text-base italic whitespace-pre-wrap">
              "{aiSummary || "Aguardando processamento do Gemini..."}"
            </p>
          </section>

          {/* Seção 2: Grid de Habilidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Habilidades Identificadas */}
            <div className="space-y-4">
              <h4 className="font-bold text-green-700 flex items-center gap-2.5 text-sm uppercase tracking-wider">
                <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                Habilidades Identificadas ({matchingSkills?.length || 0})
              </h4>
              {/* Flexbox wrap permite que as badges fiquem lado a lado e quebrem linha se necessário */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                {matchingSkills?.map((skill, index) => (
                  <Badge 
                    key={index} 
                    className="px-3.5 py-1.5 bg-green-100 text-green-800 border border-green-200 hover:bg-green-200 transition-colors rounded-lg font-medium text-xs whitespace-nowrap"
                  >
                    {skill}
                  </Badge>
                ))}
                {(!matchingSkills || matchingSkills.length === 0) && (
                  <span className="text-sm text-gray-400 italic">Nenhuma correspondência direta encontrada.</span>
                )}
              </div>
            </div>

            {/* Lacunas de Competência */}
            <div className="space-y-4">
              <h4 className="font-bold text-red-700 flex items-center gap-2.5 text-sm uppercase tracking-wider">
                <XCircle size={18} className="text-red-500 flex-shrink-0" />
                Lacunas de Competência ({missingSkills?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-2.5 pt-1">
                {missingSkills?.map((skill, index) => (
                  <Badge 
                    key={index} 
                    className="px-3.5 py-1.5 bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 transition-colors rounded-lg font-medium text-xs whitespace-nowrap"
                  >
                    {skill}
                  </Badge>
                ))}
                {(!missingSkills || missingSkills.length === 0) && (
                  <span className="text-sm text-gray-400 italic">O candidato preenche todos os requisitos técnicos.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé Fixo do Modal */}
        <div className="p-4 md:p-6 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <button 
            onClick={handleDelete}
            disabled={loadingDelete}
            className="w-full sm:w-auto justify-center text-sm font-semibold text-red-600 hover:text-red-800 flex items-center gap-2 transition-colors disabled:opacity-50 px-4 py-2 border border-transparent hover:border-red-100 hover:bg-red-50 rounded-lg"
          >
            {loadingDelete ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Excluir Candidato
          </button>
          
          <button 
            onClick={handleToggleFavorite}
            disabled={loadingFav}
            className={`w-full sm:w-auto justify-center text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 px-4 py-2 rounded-lg border ${
              localIsFavorite 
                ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {loadingFav ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Star size={16} className={localIsFavorite ? "fill-amber-500 text-amber-500" : ""} />
            )}
            {localIsFavorite ? 'Candidato Favoritado' : 'Marcar como Favorito'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}