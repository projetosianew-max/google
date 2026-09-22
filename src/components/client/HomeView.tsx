import React, { useState } from 'react';
import { 
  Scissors, 
  Calendar, 
  Crown, 
  History, 
  MessageSquare, 
  Sparkles, 
  Star, 
  ArrowRight, 
  Clock, 
  MapPin, 
  Heart, 
  CheckCircle, 
  ExternalLink 
} from 'lucide-react';
import { useBarbershop } from '../../context/BarbershopContext';
import { RepeatCutModal } from './RepeatCutModal';
import { Appointment } from '../../types';

interface HomeViewProps {
  onStartBooking: (serviceId?: string, barberId?: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onStartBooking,
  onNavigateTab,
}) => {
  const { 
    currentUser, 
    services, 
    barbers, 
    appointments, 
    haircutHistory, 
    settings, 
    toggleFavoriteBarber, 
    toggleFavoriteService 
  } = useBarbershop();

  const [repeatModalOpen, setRepeatModalOpen] = useState(false);

  // Find the user's latest past cut
  const lastCut = haircutHistory[0] || appointments.find(a => a.status === 'completed');

  // Find favorite barbers
  const favoriteBarber = barbers.find(b => currentUser.favoriteBarberIds?.includes(b.id)) || barbers[0];

  return (
    <div className="space-y-10 pb-16">
      
      {/* 4. Banner Principal */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#181822] via-[#111117] to-[#0a0a0c] border border-[#2b2b3b] shadow-2xl">
        {/* Subtle decorative gold glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[#c5a059]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative px-6 py-12 sm:px-12 sm:py-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#f3e3b7] text-xs font-bold uppercase tracking-wider mb-4">
            <Scissors className="w-3.5 h-3.5 transform -rotate-45" />
            <span>Tradição & Visagismo Masculino</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-brand font-extrabold text-white tracking-tight leading-tight">
            Seu estilo começa aqui.
          </h1>

          <p className="mt-4 text-sm sm:text-lg text-zinc-300 max-w-xl font-normal leading-relaxed">
            Agende seu próximo corte com quem entende de estilo. Precisão milimétrica, toalha quente e atendimento exclusivo.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onStartBooking()}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#d8b56f] hover:from-[#d8b56f] hover:to-[#e6c888] text-black font-extrabold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-[#c5a059]/25 hover:scale-102 active:scale-98 transition-all"
              id="hero-book-btn"
            >
              <Scissors className="w-5 h-5 transform -rotate-45" />
              <span>AGENDAR MEU CORTE</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => onNavigateTab('services')}
              className="px-6 py-4 rounded-xl bg-[#1a1a24] hover:bg-[#232332] text-zinc-200 hover:text-white border border-[#303042] text-sm font-semibold flex items-center justify-center transition-all"
            >
              Ver Catálogo de Serviços
            </button>
          </div>
        </div>
      </section>

      {/* 4. Atalhos Rápidos */}
      <section className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <button
          onClick={() => onStartBooking()}
          className="p-4 rounded-2xl bg-[#13131a] hover:bg-[#191922] border border-[#23232f] hover:border-[#c5a059]/40 flex flex-col items-center justify-center gap-2 text-center group transition-all"
        >
          <div className="w-11 h-11 rounded-xl bg-[#c5a059]/10 text-[#c5a059] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Scissors className="w-5 h-5 transform -rotate-45" />
          </div>
          <span className="text-xs font-semibold text-zinc-200 group-hover:text-white">Agendar</span>
        </button>

        <button
          onClick={() => onNavigateTab('appointments')}
          className="p-4 rounded-2xl bg-[#13131a] hover:bg-[#191922] border border-[#23232f] hover:border-[#c5a059]/40 flex flex-col items-center justify-center gap-2 text-center group transition-all"
        >
          <div className="w-11 h-11 rounded-xl bg-[#c5a059]/10 text-[#c5a059] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-zinc-200 group-hover:text-white">Meus Horários</span>
        </button>

        <button
          onClick={() => onNavigateTab('loyalty')}
          className="p-4 rounded-2xl bg-[#13131a] hover:bg-[#191922] border border-[#23232f] hover:border-[#c5a059]/40 flex flex-col items-center justify-center gap-2 text-center group transition-all"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Crown className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-zinc-200 group-hover:text-white">Fidelidade</span>
        </button>

        <button
          onClick={() => onNavigateTab('style_evolution')}
          className="p-4 rounded-2xl bg-[#13131a] hover:bg-[#191922] border border-[#23232f] hover:border-[#c5a059]/40 flex flex-col items-center justify-center gap-2 text-center group transition-all"
        >
          <div className="w-11 h-11 rounded-xl bg-[#c5a059]/10 text-[#c5a059] flex items-center justify-center group-hover:scale-110 transition-transform">
            <History className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-zinc-200 group-hover:text-white">Histórico & Fotos</span>
        </button>

        <button
          onClick={() => {
            const cleanPhone = settings.whatsapp.replace(/\D/g, '');
            window.open(`https://wa.me/${cleanPhone}?text=Ol%C3%A1!+Gostaria+de+um+atendimento+na+Barbearia+Puyol.`, '_blank');
          }}
          className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-[#13131a] hover:bg-[#191922] border border-[#23232f] hover:border-emerald-500/40 flex flex-col items-center justify-center gap-2 text-center group transition-all"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <MessageSquare className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-zinc-200 group-hover:text-white">WhatsApp</span>
        </button>
      </section>

      {/* 5. REPETIR MEU ÚLTIMO CORTE: "Seu próximo corte" Card */}
      {lastCut && (
        <section className="p-6 rounded-3xl bg-gradient-to-r from-[#1c170d] via-[#16130b] to-[#121217] border border-[#c5a059]/40 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#f3e3b7]">
                <Sparkles className="w-4 h-4 text-[#c5a059]" />
                <span>Seu próximo corte • Agendamento em 1 toque</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-brand font-bold text-white">
                Repetir seu último corte?
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-zinc-300 pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/5 font-medium">
                  ✂️ {lastCut.serviceName}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/5 font-medium text-[#f3e3b7]">
                  💈 {lastCut.barberName}
                </span>
                <span className="text-zinc-500 text-xs">
                  📅 Último atendimento: {lastCut.date.split('-').reverse().join('/')}
                </span>
              </div>
            </div>

            <button
              onClick={() => setRepeatModalOpen(true)}
              className="px-6 py-3.5 rounded-xl bg-[#c5a059] hover:bg-[#d8b56f] text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#c5a059]/25 hover:scale-102 active:scale-98 transition-all whitespace-nowrap"
              id="repeat-my-cut-home-btn"
            >
              <Scissors className="w-4 h-4 transform -rotate-45" />
              <span>REPETIR MEU CORTE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* 6. FAVORITOS: Barbeiro Favorito */}
      {favoriteBarber && (
        <section className="p-5 rounded-2xl bg-[#13131a] border border-[#262635] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={favoriteBarber.avatarUrl}
                alt={favoriteBarber.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#c5a059]/40"
              />
              <div className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-red-500 text-white shadow">
                <Heart className="w-3 h-3 fill-current" />
              </div>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#f3e3b7] uppercase tracking-wider block">
                Meu Barbeiro Favorito
              </span>
              <h3 className="font-bold text-white text-base">
                {favoriteBarber.name} ({favoriteBarber.nickname || 'Puyol'})
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Avaliação {favoriteBarber.rating.toFixed(1)} ★ • {favoriteBarber.totalAppointments}+ atendimentos
              </p>
            </div>
          </div>

          <button
            onClick={() => onStartBooking(undefined, favoriteBarber.id)}
            className="px-5 py-2.5 rounded-xl bg-[#1e1e2b] hover:bg-[#28283a] text-[#f3e3b7] text-xs font-semibold border border-[#c5a059]/30 flex items-center gap-2 transition-all"
          >
            <span>Agendar com {favoriteBarber.name.split(' ')[0]}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#c5a059]" />
          </button>
        </section>
      )}

      {/* 7. Catálogo de Serviços em Destaque */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-brand font-bold text-white">
              Nossos Serviços
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Procedimentos executados com os melhores produtos masculinos do mercado.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('services')}
            className="text-xs font-semibold text-[#c5a059] hover:underline flex items-center gap-1"
          >
            <span>Ver todos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.slice(0, 3).map(service => (
            <div
              key={service.id}
              className="rounded-2xl bg-[#121218] border border-[#23232f] hover:border-[#353547] overflow-hidden flex flex-col justify-between group transition-all"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121218] via-transparent to-transparent" />
                <button
                  onClick={() => toggleFavoriteService(service.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:text-red-400 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${currentUser.favoriteServiceIds?.includes(service.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#c5a059]" />
                    {service.durationMinutes} min
                  </span>
                  <span className="text-base font-extrabold text-white bg-[#0e0e14]/90 px-3 py-1 rounded-lg border border-[#c5a059]/30">
                    R$ {service.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">
                    {service.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed line-clamp-2">
                    {service.description}
                  </p>
                </div>

                <button
                  onClick={() => onStartBooking(service.id)}
                  className="mt-4 w-full py-2.5 rounded-xl bg-[#1a1a24] hover:bg-[#c5a059] text-zinc-200 hover:text-black font-semibold text-xs flex items-center justify-center gap-2 border border-[#2b2b3a] hover:border-[#c5a059] transition-all"
                >
                  <Scissors className="w-3.5 h-3.5 transform -rotate-45" />
                  <span>Agendar este serviço</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Nossos Barbeiros */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-brand font-bold text-white">
              Nossos Barbeiros
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Profissionais especialistas em técnicas clássicas e contemporâneas.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('barbers')}
            className="text-xs font-semibold text-[#c5a059] hover:underline flex items-center gap-1"
          >
            <span>Ver equipe</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {barbers.filter(b => b.active).map(barber => (
            <div
              key={barber.id}
              className="p-4 rounded-2xl bg-[#121218] border border-[#23232f] hover:border-[#3a3a4e] flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
                <div className="relative">
                  <img
                    src={barber.avatarUrl}
                    alt={barber.name}
                    className="w-full h-44 rounded-xl object-cover ring-1 ring-white/10"
                  />
                  <button
                    onClick={() => toggleFavoriteBarber(barber.id)}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/60 text-white hover:text-red-400 transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${currentUser.favoriteBarberIds?.includes(barber.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-sm">
                      {barber.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[#f3e3b7] text-xs font-bold">
                      <Star className="w-3 h-3 fill-[#c5a059] text-[#c5a059]" />
                      <span>{barber.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#c5a059] font-medium">
                    {barber.nickname || 'Barbeiro Sênior'}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                    {barber.bio}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onStartBooking(undefined, barber.id)}
                className="mt-4 w-full py-2 rounded-xl bg-[#181824] hover:bg-[#c5a059] text-zinc-200 hover:text-black font-semibold text-xs border border-[#2a2a3b] hover:border-[#c5a059] transition-all"
              >
                Agendar com {barber.name.split(' ')[0]}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 29. Localização & Horários */}
      <section className="p-6 rounded-3xl bg-[#121217] border border-[#242433] grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c5a059]">
            <MapPin className="w-4 h-4" />
            <span>Localização Nobre</span>
          </div>
          <h3 className="font-brand font-bold text-xl sm:text-2xl text-white">
            Barbearia Puyol do Corte Original
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {settings.address} - {settings.city} - {settings.state} • CEP {settings.zipCode}
          </p>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-400">
            <div>
              <span className="font-semibold text-zinc-200 block">Horário de Funcionamento:</span>
              <p>{settings.openingHoursWeekday}</p>
              <p>{settings.openingHoursSaturday}</p>
            </div>
            <div>
              <span className="font-semibold text-zinc-200 block">Contato Oficial:</span>
              <p>Telefone: {settings.phone}</p>
              <p>Instagram: {settings.instagram}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => window.open(settings.googleMapsUrl, '_blank')}
            className="w-full py-3 px-4 rounded-xl bg-[#c5a059] hover:bg-[#d8b56f] text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#c5a059]/20 transition-all"
            id="open-maps-btn"
          >
            <MapPin className="w-4 h-4" />
            <span>COMO CHEGAR (MAPA)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              const cleanPhone = settings.whatsapp.replace(/\D/g, '');
              window.open(`https://wa.me/${cleanPhone}?text=Ol%C3%A1!+Como+chego+na+Barbearia+Puyol?`, '_blank');
            }}
            className="w-full py-3 px-4 rounded-xl bg-[#191924] hover:bg-[#222230] text-zinc-200 text-xs font-semibold border border-[#2f2f42] flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Tirar Dúvida de Rota</span>
          </button>
        </div>
      </section>

      {/* Repeat cut modal trigger */}
      <RepeatCutModal
        isOpen={repeatModalOpen}
        onClose={() => setRepeatModalOpen(false)}
        pastCut={lastCut}
        onSuccess={() => onNavigateTab('appointments')}
      />
    </div>
  );
};
