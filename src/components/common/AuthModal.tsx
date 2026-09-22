import React, { useState } from 'react';
import { X, Mail, Phone, Lock, User as UserIcon, ShieldCheck, Briefcase, CheckCircle2, ArrowRight } from 'lucide-react';
import { useBarbershop } from '../../context/BarbershopContext';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { currentUser, login, signup, switchUserRole, logout } = useBarbershop();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (mode === 'signup') {
      if (!name.trim()) return setError('Por favor, informe seu nome completo.');
      if (!email.trim() || !email.includes('@')) return setError('Informe um e-mail válido.');
      if (!phone.trim() || phone.length < 10) return setError('Informe um telefone com DDD válido.');
      if (password.length < 6) return setError('A senha deve ter pelo menos 6 caracteres.');

      const ok = signup(name.trim(), email.trim(), phone.trim(), role);
      if (ok) {
        setSuccessMsg('Conta criada com sucesso! 100 pontos foram creditados no seu Clube Puyol.');
        setTimeout(() => onClose(), 1200);
      }
    } else if (mode === 'login') {
      if (!email.trim()) return setError('Informe seu e-mail ou telefone cadastrado.');
      if (!password.trim()) return setError('Informe sua senha de acesso.');

      const ok = login(email.trim(), role);
      if (ok) {
        setSuccessMsg('Login realizado com sucesso! Bem-vindo de volta.');
        setTimeout(() => onClose(), 800);
      } else {
        setError('Usuário não encontrado. Use um dos perfis de demonstração abaixo para testar.');
      }
    } else if (mode === 'forgot') {
      if (!email.trim() || !email.includes('@')) return setError('Informe seu e-mail cadastrado.');
      setSuccessMsg('Instruções de recuperação de senha enviadas para o seu e-mail!');
      setTimeout(() => setMode('login'), 2000);
    }
  };

  const handleQuickDemoLogin = (targetRole: UserRole) => {
    switchUserRole(targetRole);
    setSuccessMsg(`Conectado como ${targetRole === 'admin' ? 'Administrador' : targetRole === 'barber' ? 'Barbeiro' : 'Cliente'}!`);
    setTimeout(() => onClose(), 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#111116] border border-[#2b2b38] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        id="auth-modal"
      >
        {/* Top Header */}
        <div className="p-5 border-b border-[#23232c] flex items-center justify-between bg-gradient-to-r from-[#171720] to-[#111116]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#c5a059]">
              Barbearia Puyol
            </span>
            <h3 className="font-brand font-bold text-lg text-white">
              {mode === 'login' ? 'Entrar na sua Conta' : mode === 'signup' ? 'Cadastre-se' : 'Recuperar Senha'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-4">

          {/* Quick Demo Access Switcher */}
          <div className="p-3 bg-[#181822] rounded-xl border border-[#2e2e3f] space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-zinc-300">Acesso Rápido Demo:</span>
              <span className="text-[10px] text-[#c5a059]">Clique para testar</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('client')}
                className={`p-2 rounded-lg text-xs font-medium border flex flex-col items-center gap-1 transition-all ${
                  currentUser.role === 'client'
                    ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                    : 'bg-[#121217] border-[#292936] text-zinc-300 hover:border-emerald-500/40'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cliente</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('barber')}
                className={`p-2 rounded-lg text-xs font-medium border flex flex-col items-center gap-1 transition-all ${
                  currentUser.role === 'barber'
                    ? 'bg-amber-950/60 border-amber-500/60 text-amber-300'
                    : 'bg-[#121217] border-[#292936] text-zinc-300 hover:border-amber-500/40'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                <span>Barbeiro</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className={`p-2 rounded-lg text-xs font-medium border flex flex-col items-center gap-1 transition-all ${
                  currentUser.role === 'admin'
                    ? 'bg-red-950/60 border-red-500/60 text-red-300'
                    : 'bg-[#121217] border-[#292936] text-zinc-300 hover:border-red-500/40'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Standard Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Lucas Ferreira"
                    className="w-full bg-[#181822] border border-[#2b2b38] rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white focus:border-[#c5a059] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full bg-[#181822] border border-[#2b2b38] rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white focus:border-[#c5a059] focus:outline-none"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Telefone / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full bg-[#181822] border border-[#2b2b38] rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white focus:border-[#c5a059] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-zinc-300">
                    Senha
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-[#c5a059] hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#181822] border border-[#2b2b38] rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white focus:border-[#c5a059] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-xl bg-[#c5a059] hover:bg-[#d8b56f] text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#c5a059]/20 transition-all"
            >
              <span>{mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Cadastrar e Ganhar 100 Pontos' : 'Enviar Link de Redefinição'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle between Login and Signup */}
          <div className="pt-3 border-t border-[#23232c] text-center text-xs text-zinc-400">
            {mode === 'login' ? (
              <p>
                Não tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-[#c5a059] font-semibold hover:underline"
                >
                  Cadastre-se gratuitamente
                </button>
              </p>
            ) : (
              <p>
                Já possui cadastro?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[#c5a059] font-semibold hover:underline"
                >
                  Fazer login
                </button>
              </p>
            )}
          </div>

          {/* Current Connected User Profile display & Logout */}
          <div className="p-3 bg-[#0d0d12] rounded-xl border border-[#23232c] flex items-center justify-between text-xs text-zinc-400">
            <div>
              <span className="block text-zinc-200 font-medium">{currentUser.name}</span>
              <span className="text-[11px] text-zinc-500">{currentUser.email}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="text-xs text-red-400 hover:text-red-300 font-medium"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
