import React, { useState } from 'react';
import { useBarbershop } from '../../context/BarbershopContext';
import { 
  Scissors, 
  Bell, 
  Crown, 
  User as UserIcon, 
  ShieldCheck, 
  Briefcase, 
  FileCode2, 
  Menu, 
  X, 
  Sparkles,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { UserRole } from '../../types';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
  onOpenDocs?: () => void;
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onSelectTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenAuth,
  onOpenDocs,
  activeTab,
  setActiveTab,
  onSelectTab,
}) => {
  const handleTabChange = (tab: string) => {
    if (setActiveTab) setActiveTab(tab);
    if (onSelectTab) onSelectTab(tab);
  };
  const { currentUser, currentRole, switchUserRole, notifications, logout } = useBarbershop();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const roleLabels: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
    client: { label: 'Cliente', icon: <UserIcon className="w-3.5 h-3.5" />, color: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40' },
    barber: { label: 'Barbeiro', icon: <Briefcase className="w-3.5 h-3.5" />, color: 'bg-amber-950/60 text-amber-400 border-amber-800/40' },
    admin: { label: 'Administrador', icon: <ShieldCheck className="w-3.5 h-3.5" />, color: 'bg-red-950/60 text-red-400 border-red-800/40' },
  };

  const handleRoleSelect = (role: UserRole) => {
    switchUserRole(role);
    setRoleDropdownOpen(false);
    if (role === 'barber') {
      handleTabChange('barber');
    } else if (role === 'admin') {
      handleTabChange('admin');
    } else {
      handleTabChange('home');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0c]/95 backdrop-blur-md border-b border-[#23232c] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => handleTabChange('home')}
          className="flex items-center gap-3 cursor-pointer group"
          id="brand-logo"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c5a059] to-[#8a6828] flex items-center justify-center shadow-lg shadow-[#c5a059]/10 group-hover:scale-105 transition-transform border border-[#e5c57e]/30">
            <Scissors className="w-5 h-5 text-black transform -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-brand font-bold text-lg sm:text-xl tracking-wider text-white">
                PUYOL
              </span>
              <span className="text-[10px] tracking-widest uppercase px-1.5 py-0.5 rounded bg-[#c5a059]/15 text-[#e5c57e] border border-[#c5a059]/30 font-semibold">
                Original
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 tracking-wider hidden sm:block">
              DO CORTE ORIGINAL • DESDE 2016
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#131318] px-2 py-1.5 rounded-full border border-[#23232c]">
          <button
            onClick={() => handleTabChange('home')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'home'
                ? 'bg-[#c5a059] text-black font-semibold shadow-sm'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Início
          </button>
          <button
            onClick={() => handleTabChange('services')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'services'
                ? 'bg-[#c5a059] text-black font-semibold shadow-sm'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Serviços
          </button>
          <button
            onClick={() => handleTabChange('barbers')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'barbers'
                ? 'bg-[#c5a059] text-black font-semibold shadow-sm'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Barbeiros
          </button>
          <button
            onClick={() => handleTabChange('appointments')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'appointments'
                ? 'bg-[#c5a059] text-black font-semibold shadow-sm'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Meus Horários
          </button>
          <button
            onClick={() => handleTabChange('loyalty')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'loyalty'
                ? 'bg-[#c5a059] text-black font-semibold shadow-sm'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-[#e5c57e]" />
            Clube Puyol
          </button>
          <button
            onClick={() => handleTabChange('style_evolution')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'style_evolution'
                ? 'bg-[#c5a059] text-black font-semibold shadow-sm'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Meu Estilo
          </button>
          
          {currentRole === 'barber' && (
            <button
              onClick={() => handleTabChange('barber')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                activeTab === 'barber' || activeTab === 'barber_panel'
                  ? 'bg-amber-500 text-black font-semibold'
                  : 'text-amber-400 hover:bg-amber-950/30'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Painel Barbeiro
            </button>
          )}

          {currentRole === 'admin' && (
            <button
              onClick={() => handleTabChange('admin')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                activeTab === 'admin' || activeTab === 'admin_panel'
                  ? 'bg-red-500 text-black font-semibold'
                  : 'text-red-400 hover:bg-red-950/30'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Geral
            </button>
          )}
        </nav>

        {/* Right Actions: Role switcher, Notifications, Book CTA, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Architecture Docs Button */}
          <button
            onClick={() => onOpenDocs?.()}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181820] hover:bg-[#22222d] text-zinc-300 hover:text-white text-xs border border-[#2e2e3b] transition-all"
            title="Ver Arquitetura e Manual Técnico de Produção"
          >
            <FileCode2 className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Docs & Arquitetura</span>
          </button>

          {/* Quick Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${roleLabels[currentRole].color}`}
              title="Clique para alternar entre Cliente, Barbeiro e Admin"
              id="role-switcher-btn"
            >
              {roleLabels[currentRole].icon}
              <span className="hidden sm:inline">{roleLabels[currentRole].label}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#14141a] border border-[#2b2b36] rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-zinc-400 font-semibold border-b border-[#22222c]">
                  Alternar Perfil Demo
                </div>
                <button
                  onClick={() => handleRoleSelect('client')}
                  className="w-full text-left px-3 py-2 text-xs flex items-center justify-between text-zinc-200 hover:bg-white/5 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                    Cliente (Lucas)
                  </span>
                  {currentRole === 'client' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                </button>
                <button
                  onClick={() => handleRoleSelect('barber')}
                  className="w-full text-left px-3 py-2 text-xs flex items-center justify-between text-zinc-200 hover:bg-white/5 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                    Barbeiro (Mestre João)
                  </span>
                  {currentRole === 'barber' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
                </button>
                <button
                  onClick={() => handleRoleSelect('admin')}
                  className="w-full text-left px-3 py-2 text-xs flex items-center justify-between text-zinc-200 hover:bg-white/5 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                    Admin (Carlos Puyol)
                  </span>
                  {currentRole === 'admin' && <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>}
                </button>
              </div>
            )}
          </div>

          {/* Notifications button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full bg-[#14141a] hover:bg-[#1f1f27] text-zinc-300 hover:text-white border border-[#272733] transition-colors"
            title="Notificações"
            id="notifications-btn"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#c5a059] text-black text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#0a0a0c]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User profile avatar or Login button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-[#14141a] hover:bg-[#1c1c24] border border-[#272733] transition-colors group"
            id="auth-profile-btn"
          >
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-[#c5a059]/40"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#272733] flex items-center justify-center text-xs text-white">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <span className="text-xs font-medium text-zinc-200 group-hover:text-white max-w-[90px] truncate hidden sm:inline">
              {currentUser.name.split(' ')[0]}
            </span>
          </button>

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-[#14141a] text-zinc-400 hover:text-white border border-[#272733] md:hidden"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d0d12] border-b border-[#23232c] px-4 py-3 space-y-2 animate-in fade-in duration-150">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[#1c1c24]">
            <button
              onClick={() => { handleTabChange('home'); setMobileMenuOpen(false); }}
              className={`p-2.5 text-xs rounded-lg text-left ${activeTab === 'home' ? 'bg-[#c5a059] text-black font-semibold' : 'bg-[#14141a] text-zinc-200'}`}
            >
              Início
            </button>
            <button
              onClick={() => { handleTabChange('booking'); setMobileMenuOpen(false); }}
              className={`p-2.5 text-xs rounded-lg text-left font-semibold ${activeTab === 'booking' ? 'bg-[#c5a059] text-black' : 'bg-[#1f1910] text-[#e5c57e] border border-[#c5a059]/30'}`}
            >
              ✂️ Agendar Corte
            </button>
            <button
              onClick={() => { handleTabChange('services'); setMobileMenuOpen(false); }}
              className={`p-2.5 text-xs rounded-lg text-left ${activeTab === 'services' ? 'bg-[#c5a059] text-black font-semibold' : 'bg-[#14141a] text-zinc-200'}`}
            >
              Serviços
            </button>
            <button
              onClick={() => { handleTabChange('barbers'); setMobileMenuOpen(false); }}
              className={`p-2.5 text-xs rounded-lg text-left ${activeTab === 'barbers' ? 'bg-[#c5a059] text-black font-semibold' : 'bg-[#14141a] text-zinc-200'}`}
            >
              Barbeiros
            </button>
            <button
              onClick={() => { handleTabChange('appointments'); setMobileMenuOpen(false); }}
              className={`p-2.5 text-xs rounded-lg text-left ${activeTab === 'appointments' ? 'bg-[#c5a059] text-black font-semibold' : 'bg-[#14141a] text-zinc-200'}`}
            >
              Meus Horários
            </button>
            <button
              onClick={() => { handleTabChange('loyalty'); setMobileMenuOpen(false); }}
              className={`p-2.5 text-xs rounded-lg text-left ${activeTab === 'loyalty' ? 'bg-[#c5a059] text-black font-semibold' : 'bg-[#14141a] text-zinc-200'}`}
            >
              Clube Puyol
            </button>
            <button
              onClick={() => { handleTabChange('style_evolution'); setMobileMenuOpen(false); }}
              className={`p-2.5 text-xs rounded-lg text-left col-span-2 ${activeTab === 'style_evolution' ? 'bg-[#c5a059] text-black font-semibold' : 'bg-[#14141a] text-zinc-200'}`}
            >
              Galeria de Estilos (Meu Estilo)
            </button>
          </div>

          {currentRole === 'barber' && (
            <button
              onClick={() => { handleTabChange('barber'); setMobileMenuOpen(false); }}
              className="w-full p-2.5 text-xs rounded-lg bg-amber-950/40 text-amber-300 border border-amber-800/40 text-left font-semibold flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              Painel do Barbeiro
            </button>
          )}

          {currentRole === 'admin' && (
            <button
              onClick={() => { handleTabChange('admin'); setMobileMenuOpen(false); }}
              className="w-full p-2.5 text-xs rounded-lg bg-red-950/40 text-red-300 border border-red-800/40 text-left font-semibold flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Painel Administrativo
            </button>
          )}

          <div className="pt-2 flex items-center justify-between text-xs text-zinc-400">
            <button
              onClick={() => { onOpenDocs?.(); setMobileMenuOpen(false); }}
              className="flex items-center gap-1.5 text-[#e5c57e] hover:underline"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              Manual de Produção & Arquitetura
            </button>
            <button
              onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
              className="text-zinc-300 hover:text-white"
            >
              Conta & Trocar Perfil
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
