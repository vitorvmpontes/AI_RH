import { createClient } from '@/src/utils/supabase/server';
export const dynamic = 'force-dynamic';
import UploadResume from '@/src/components/UploadResume';
import CandidateDetailsModal from '@/src/components/CandidateDetailsModal';
import DeleteJobButton from '@/src/components/DeleteJobButton';
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
import JobStatusToggle from '@/src/components/JobStatusToggle';

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // No Next.js 15, params deve ser aguardado
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Busca os detalhes da vaga
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();

  if (jobError || !job) {
    console.error("Erro ao buscar vaga:", jobError);
    return (
      <div className="p-20 text-center">
        <h1 className="text-2xl font-bold">Vaga não encontrada</h1>
        <Link href="/dashboard" className="text-blue-600 hover:underline mt-4 block">Voltar ao dashboard</Link>
      </div>
    );
  }

  const isActive = job.is_active !== false;

  // 2. Busca os screenings (triagens) separadamente, similar à página de favoritos
  // ... resto do código mantido ...

  // 2. Busca os screenings (triagens) separadamente, similar à página de favoritos
  const { data: screenings, error: screeningsError } = await supabase
    .from('screenings')
    .select(`
      id,
      score,
      ai_summary,
      matching_skills,
      missing_skills,
      is_favorite,
      created_at,
      candidates (
        full_name,
        email,
        phone,
        resume_url
      ),
      jobs!inner (
        user_id
      )
    `)
    .eq('job_id', id)
    .eq('jobs.user_id', user?.id);

  if (screeningsError) {
    console.error("Erro ao buscar triagens:", screeningsError);
  }

  // Ordenar candidatos pelo score (do maior para o menor)
  const screeningsArray = screenings || [];
  const sortedScreenings = [...screeningsArray].sort((a: any, b: any) => (b.score || 0) - (a.score || 0));

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
                <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                  <BriefcaseIcon size={20} />
                </div>
                <Badge variant="outline" className={`border-2 ${
                  isActive 
                    ? 'text-blue-600 border-blue-100 bg-blue-50' 
                    : 'text-gray-500 border-gray-100 bg-gray-50'
                }`}>
                  {isActive ? 'Vaga Aberta' : 'Vaga Pausada'}
                </Badge>
              </div>
              <h1 className={`text-3xl font-bold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>{job.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-gray-500 text-sm">
                <span className="flex items-center gap-1.5"><CalendarIcon size={14} /> Criada em {new Date(job.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
              <JobStatusToggle jobId={id} initialStatus={isActive} />
              <div className="w-full sm:w-auto">
                <UploadResume jobId={id} disabled={!isActive} />
              </div>
              <div className="w-full sm:w-auto">
                <DeleteJobButton jobId={id} />
              </div>
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
                  {screeningsArray.length}
                </span>
              </h2>
            </div>

            <div className="space-y-3">
              {sortedScreenings.map((screening: any) => {
                // O Supabase pode retornar 'candidates' como objeto ou array de 1 elemento
                const candidate = Array.isArray(screening.candidates) 
                  ? screening.candidates[0] 
                  : screening.candidates;
                
                const candidateName = candidate?.full_name || "Candidato sem nome";
                const candidateEmail = candidate?.email || "";
                const candidatePhone = candidate?.phone || "";

                return (
                  <CandidateDetailsModal
                    key={screening.id}
                    screeningId={screening.id}
                    candidateName={candidateName}
                    candidateEmail={candidateEmail}
                    candidatePhone={candidatePhone}
                    score={screening.score}
                    isFavorite={screening.is_favorite}
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
                            {candidateName}
                          </h4>
                          <p className="text-sm text-gray-500">{candidateEmail}</p>
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
                );
              })}

              {/* Estado Vazio */}
              {screeningsArray.length === 0 && (
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