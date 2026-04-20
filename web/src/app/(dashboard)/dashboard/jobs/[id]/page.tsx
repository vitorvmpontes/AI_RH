import { createClient } from '@/src/utils/supabase/server';
import UploadResume from '@/src/components/UploadResume';
import CandidateDetailsModal from '@/src/components/CandidateDetailsModal';
import { 
  ArrowLeft, 
  UserIcon, 
  ChevronRight, 
  BriefcaseIcon, 
  CalendarIcon,
  SearchIcon 
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from "@/src/components/ui/badge";

export default async function JobDetailsPage({ params }: { params: { id: string } }) {
  // No Next.js 15, params deve ser aguardado
  const { id } = await params;
  const supabase = await createClient();

  // Busca a vaga e todos os candidatos que já passaram pela triagem da IA
  const { data: job, error } = await supabase
    .from('jobs')
    .select(`
      *,
      screenings (
        id,
        score,
        ai_summary,
        matching_skills,
        missing_skills,
        created_at,
        candidates (
          full_name,
          email,
          resume_url
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error || !job) {
    return (
      <div className="p-20 text-center">
        <h1 className="text-2xl font-bold">Vaga não encontrada</h1>
        <Link href="/dashboard" className="text-blue-600 hover:underline mt-4 block">Voltar ao dashboard</Link>
      </div>
    );
  }

  // Ordenar candidatos pelo score (do maior para o menor)
  const sortedScreenings = job.screenings?.sort((a: any, b: any) => b.score - a.score);

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      {/* Header Superior */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6 w-fit">
            <ArrowLeft size={16} /> Voltar para Vagas
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <BriefcaseIcon size={20} />
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Vaga Aberta</Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-gray-500 text-sm">
                <span className="flex items-center gap-1.5"><CalendarIcon size={14} /> Criada em {new Date(job.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <UploadResume jobId={id} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Coluna Esquerda: Descrição da Vaga */}
          <div className="lg:col-span-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Sobre a Vaga</h2>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                {job.description}
              </p>
            </div>
          </div>

          {/* Coluna Direita: Lista de Candidatos */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Candidatos Triados 
                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                  {job.screenings?.length || 0}
                </span>
              </h2>
            </div>

            <div className="space-y-3">
              {sortedScreenings?.map((screening: any) => (
                <CandidateDetailsModal
                  key={screening.id}
                  candidateName={screening.candidates?.full_name}
                  score={screening.score}
                  aiSummary={screening.ai_summary}
                  matchingSkills={screening.matching_skills}
                  missingSkills={screening.missing_skills}
                >
                  <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        <UserIcon size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {screening.candidates?.full_name}
                        </h4>
                        <p className="text-sm text-gray-500">{screening.candidates?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <span className={`text-2xl font-black ${
                          screening.score >= 80 ? 'text-green-600' : 
                          screening.score >= 50 ? 'text-orange-500' : 'text-red-500'
                        }`}>
                          {screening.score}%
                        </span>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Match</p>
                      </div>
                      <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-all" size={20} />
                    </div>
                  </div>
                </CandidateDetailsModal>
              ))}

              {/* Estado Vazio */}
              {job.screenings?.length === 0 && (
                <div className="text-center py-20 bg-gray-50 border-2 border-dashed rounded-2xl">
                  <SearchIcon className="mx-auto text-gray-300 mb-3" size={40} />
                  <p className="text-gray-500">Nenhum currículo enviado para esta vaga.</p>
                  <p className="text-sm text-gray-400">Use o botão acima para iniciar a triagem com IA.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}