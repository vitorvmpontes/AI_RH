import { createClient } from '@/src/utils/supabase/server';
import Link from 'next/link';
import { StarIcon, UserIcon, BriefcaseIcon, ChevronRightIcon, SearchIcon } from 'lucide-react';
import CandidateDetailsModal from '@/src/components/CandidateDetailsModal';

export const metadata = {
  title: 'Candidatos Favoritos',
};

export default async function FavoritesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Busca todas as triagens favoritas onde a vaga pertence ao usuário logado
  const { data: screenings, error } = await supabase
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
        id,
        title,
        user_id
      )
    `)
    .eq('is_favorite', true)
    .eq('jobs.user_id', user?.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Erro ao buscar favoritos:", error);
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Superior */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <StarIcon className="text-amber-500 fill-amber-500" size={32} />
              Candidatos Favoritos
            </h1>
            <p className="text-gray-500 mt-1">Sua seleção pessoal dos melhores talentos triados pela IA.</p>
          </div>
        </div>

        {/* Lista de Favoritos */}
        <div className="space-y-4">
          {screenings?.map((screening: any) => (
            <CandidateDetailsModal
              key={screening.id}
              screeningId={screening.id}
              candidateName={screening.candidates?.full_name}
              candidateEmail={screening.candidates?.email}
              candidatePhone={screening.candidates?.phone}
              score={screening.score}
              isFavorite={screening.is_favorite}
              aiSummary={screening.ai_summary}
              matchingSkills={screening.matching_skills}
              missingSkills={screening.missing_skills}
            >
              <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group gap-6">
                
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors shrink-0">
                    <UserIcon size={28} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors flex items-center gap-2">
                      {screening.candidates?.full_name}
                      <StarIcon size={16} className="text-amber-500 fill-amber-500" />
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <BriefcaseIcon size={14} className="text-gray-400" />
                      Vaga: <span className="font-medium text-gray-700">{screening.jobs?.title}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 w-full md:w-auto justify-end">
                  <div className="text-right">
                    <span className={`text-2xl font-black ${
                      screening.score >= 80 ? 'text-green-600' : 
                      screening.score >= 50 ? 'text-orange-500' : 'text-red-500'
                    }`}>
                      {screening.score}%
                    </span>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Match</p>
                  </div>
                  <ChevronRightIcon className="text-gray-300 group-hover:text-amber-500 transition-all" size={24} />
                </div>

              </div>
            </CandidateDetailsModal>
          ))}

          {/* Estado Vazio */}
          {(!screenings || screenings.length === 0) && (
            <div className="text-center py-24 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
              <StarIcon className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-xl font-medium text-gray-900">Nenhum candidato favorito</h3>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">
                Você ainda não favoritou nenhum candidato. Avalie os currículos enviados nas suas vagas e marque com uma estrela aqueles que se destacarem!
              </p>
              <Link href="/dashboard" className="inline-flex mt-6 bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 text-gray-700 font-medium px-6 py-2.5 rounded-lg transition-colors shadow-sm">
                Voltar para Minhas Vagas
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
