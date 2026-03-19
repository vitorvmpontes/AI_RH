'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Badge } from "@/src/components/ui/badge"; // Certifique-se de ter adicionado: npx shadcn-ui@latest add badge
import { CheckCircle2, XCircle, FileText, BrainCircuit } from 'lucide-react';

interface CandidateDetailsModalProps {
  candidateName: string;
  score: number;
  aiSummary: string;
  matchingSkills: string[];
  missingSkills: string[];
  children: React.ReactNode; // O elemento que dispara o modal (ex: o card do candidato)
}

export default function CandidateDetailsModal({
  candidateName,
  score,
  aiSummary,
  matchingSkills,
  missingSkills,
  children
}: CandidateDetailsModalProps) {
  
  const scoreColor = score >= 70 ? 'text-green-600' : score >= 50 ? 'text-orange-500' : 'text-red-600';

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4 mb-4">
          <div className="flex justify-between items-center gap-4">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <FileText className="text-gray-400" />
              Análise de: {candidateName}
            </DialogTitle>
            <div className={`text-4xl font-black ${scoreColor}`}>
              {score}%
              <span className="text-xs text-gray-400 block font-normal tracking-wider">MATCH SCORE</span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-8">
          {/* Resumo da IA */}
          <section className="bg-gray-50 p-5 rounded-xl border">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-gray-800">
              <BrainCircuit className="text-blue-600" size={20} />
              Veredito da IA (Gemini Flash)
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {aiSummary || "Nenhum resumo gerado para este candidato."}
            </p>
          </section>

          {/* Grid de Habilidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pontos Fortes */}
            <section>
              <h4 className="font-semibold text-green-700 flex items-center gap-2 mb-3">
                <CheckCircle2 size={18} />
                Habilidades Encontradas ({matchingSkills?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-2">
                {matchingSkills?.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                    {skill}
                  </Badge>
                ))}
                {(!matchingSkills || matchingSkills.length === 0) && (
                  <p className="text-sm text-gray-500 italic">Nenhuma habilidade correspondente detectada.</p>
                )}
              </div>
            </section>

            {/* Pontos de Atenção */}
            <section>
              <h4 className="font-semibold text-red-700 flex items-center gap-2 mb-3">
                <XCircle size={18} />
                Habilidades Faltantes ({missingSkills?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-2">
                {missingSkills?.map((skill, index) => (
                  <Badge key={index} variant="destructive" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
                    {skill}
                  </Badge>
                ))}
                {(!missingSkills || missingSkills.length === 0) && (
                  <p className="text-sm text-gray-500 italic">Candidato possui todas as habilidades da vaga.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}