import React from 'react';
import { Home, Calendar, Scissors, Crown, User, ShieldCheck, Briefcase } from 'lucide-react';
import { useBarbershop } from '../../context/BarbershopContext';

interface BottomNavProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onSelectTab?: (tab: string) => void;
  onOpenAuth?: () => void;
  onStartBooking?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ 
  activeTab, 
  setActiveTab, 
  onSelectTab, 
  onOpenAuth, 
  onStartBooking 
}) => {
  const { currentRole } = useBarbershop();

  const handleTab = (tab: string) => {
    if (setActiveTab) setActiveTab(tab);
    if (onSelectTab) onSelectTab(tab);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0d]/95 backdrop-blur-lg border-t border-[#22222b] px-3 py-2 pb-safe">
      <div className="flex items-center justify-around relative">
        
        {/* Início */}
        <button
          onClick={() => handleTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-2 transition-colors ${
            activeTab === 'home' ? 'text-[#c5a059]' : 'text-zinc-400 hover:text-zinc-200'
          }`}
          id="mobile-nav-home"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Início</span>
        </button>

        {/* Agenda / Meus Horários */}
        <button
          onClick={() => handleTab('appointments')}
          className={`flex flex-col items-center gap-1 py-1 px-2 transition-colors ${
            activeTab === 'appointments' ? 'text-[#c5a059]' : 'text-zinc-400 hover:text-zinc-200'
          }`}
          id="mobile-nav-agenda"
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-medium">Agenda</span>
        </button>

        {/* Central AGENDAR (Featured Prominent Button) */}
        <div className="relative -top-4">
          <button
            onClick={() => {
              if (onStartBooking) onStartBooking();
              else handleTab('booking');
            }}
            className={`w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-xl transition-transform active:scale-95 border-2 ${
              activeTab === 'booking'
                ? 'bg-gradient-to-tr from-[#c5a059] to-[#e8cb88] text-black border-white ring-4 ring-[#c5a059]/20'
                : 'bg-gradient-to-tr from-[#c5a059] to-[#99742a] text-black border-[#e8cb88]/50 shadow-[#c5a059]/30'
            }`}
            id="mobile-nav-book-central"
          >
            <Scissors className="w-6 h-6 transform -rotate-45" />
            <span className="text-[9px] font-extrabold uppercase tracking-tight mt-0.5">Agendar</span>
          </button>
        </div>

        {/* Clube Puyol */}
        <button
          onClick={() => handleTab('loyalty')}
          className={`flex flex-col items-center gap-1 py-1 px-2 transition-colors ${
            activeTab === 'loyalty' ? 'text-[#c5a059]' : 'text-zinc-400 hover:text-zinc-200'
          }`}
          id="mobile-nav-clube"
        >
          <Crown className="w-5 h-5" />
          <span className="text-[10px] font-medium">Clube</span>
        </button>

        {/* Perfil / Admin / Barbeiro depending on active role */}
        {currentRole === 'admin' ? (
          <button
            onClick={() => handleTab('admin')}
            className={`flex flex-col items-center gap-1 py-1 px-2 transition-colors ${
              activeTab === 'admin' || activeTab === 'admin_panel' ? 'text-red-400' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            id="mobile-nav-admin"
          >
            <ShieldCheck className="w-5 h-5 text-red-400" />
            <span className="text-[10px] font-medium">Admin</span>
          </button>
        ) : currentRole === 'barber' ? (
          <button
            onClick={() => handleTab('barber')}
            className={`flex flex-col items-center gap-1 py-1 px-2 transition-colors ${
              activeTab === 'barber' || activeTab === 'barber_panel' ? 'text-amber-400' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            id="mobile-nav-barber"
          >
            <Briefcase className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] font-medium">Barbeiro</span>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className={`flex flex-col items-center gap-1 py-1 px-2 transition-colors ${
              activeTab === 'profile' ? 'text-[#c5a059]' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            id="mobile-nav-profile"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Perfil</span>
          </button>
        )}

      </div>
    </div>
  );
};
