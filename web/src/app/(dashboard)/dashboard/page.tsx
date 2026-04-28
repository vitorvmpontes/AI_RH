import { createClient } from '@/src/utils/supabase/server';
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { BriefcaseIcon, UsersIcon, ChevronRightIcon } from 'lucide-react';
import { CreateJobModal } from '@/src/components/CreateJobModal';

export const metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  // Inicializa o cliente do Supabase (Server Side)
  const supabase = await createClient();
  
  // Obtém o usuário logado
  const { data: { user } } = await supabase.auth.getUser();

  // Busca as vagas ordenadas pela data de criação e associadas ao usuário atual
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*, screenings(count)')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Erro ao carregar vagas:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header do Dashboard */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel de Recrutamento</h1>
            <p className="text-gray-500 mt-1">Gerencie suas vagas e analise candidatos com IA.</p>
          </div>
          
          {user && <CreateJobModal userId={user.id} />}
        </div>

        {/* Grid de Vagas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs?.map((job) => (
            <Link 
              key={job.id} 
              href={`/dashboard/jobs/${job.id}`}
              className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-md transition-all relative overflow-hidden"
            >
              {/* Indicador visual discreto */}
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <BriefcaseIcon size={24} />
                </div>
                <span className="text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                  Ativa
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-850 group-hover:text-blue-600 transition-colors">
                {job.title}
              </h3>
              
              <p className="text-gray-500 text-sm mt-2 line-clamp-2 min-h-[40px]">
                {job.description}
              </p>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <UsersIcon size={16} />
                  <span>{job.screenings?.[0]?.count || 0} candidatos</span>
                </div>
                <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">
                  Ver detalhes
                  <ChevronRightIcon size={16} />
                </div>
              </div>
            </Link>
          ))}

          {/* Estado Vazio */}
          {jobs?.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-gray-200 rounded-2xl">
              <BriefcaseIcon className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900">Nenhuma vaga encontrada</h3>
              <p className="text-gray-500 mt-1">Comece criando sua primeira vaga de emprego.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}