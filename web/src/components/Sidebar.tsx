'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BriefcaseIcon, StarIcon, BrainCircuit, Menu, X, LogOut, Loader2 } from 'lucide-react';
import { createClient } from '@/src/utils/supabase/client';

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      name: 'Minhas Vagas',
      href: '/dashboard',
      icon: BriefcaseIcon,
      active: pathname === '/dashboard' || (pathname.startsWith('/dashboard/jobs') && !pathname.includes('/favorites'))
    },
    {
      name: 'Candidatos Favoritos',
      href: '/dashboard/favorites',
      icon: StarIcon,
      active: pathname === '/dashboard/favorites'
    }
  ];

  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-sm">
            <BrainCircuit size={24} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">AI<span className="text-blue-600">RH</span></h1>
        </div>
        {/* Fechar menu no mobile */}
        <button 
          className="md:hidden text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <h2 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 mt-2">Menu Principal</h2>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${
                item.active
                  ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
              }`}
            >
              <Icon size={18} className={item.active ? 'text-blue-600' : 'text-gray-400'} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-3">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 shadow-inner">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Status</p>
          <p className="text-sm text-gray-800 font-bold mb-3">Triagem de IA Ativa.</p>
          <button className="w-full bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 text-gray-700 text-xs font-bold py-2.5 rounded-lg transition-colors shadow-sm">
            Ver Limites
          </button>
        </div>

        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-semibold text-sm disabled:opacity-50"
        >
          {isLoggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
          Sair da Conta
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4 shrink-0 z-20 shadow-sm">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-gray-600 hover:text-gray-900 p-1.5 bg-gray-50 rounded-lg border border-gray-200 transition-colors shadow-sm"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-sm">
            <BrainCircuit size={20} />
          </div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">AI<span className="text-blue-600">RH</span></h1>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop = fixa, Mobile = Absolute/Off-Canvas) */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 md:w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-2xl transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:shadow-sm
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <SidebarContent />
      </div>
    </>
  );
}
