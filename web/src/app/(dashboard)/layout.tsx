import Sidebar from '@/src/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F9FAFB] overflow-hidden font-sans">
      {/* Sidebar - Fixa na esquerda ou Cabeçalho no Mobile */}
      <Sidebar />

      {/* Conteúdo Principal - Rolável e ocupa o resto da tela */}
      <main className="flex-1 overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}
