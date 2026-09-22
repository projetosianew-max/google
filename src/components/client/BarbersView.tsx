import React from 'react';
import { Star, Scissors, Heart, Calendar, Clock, Award } from 'lucide-react';
import { useBarbershop } from '../../context/BarbershopContext';

interface BarbersViewProps {
  onStartBooking: (serviceId?: string, barberId?: string) => void;
}

export const BarbersView: React.FC<BarbersViewProps> = ({ onStartBooking }) => {
  const { barbers, currentUser, toggleFavoriteBarber, getAvailableSlots, services } = useBarbershop();

  // Helper to get today or tomorrow date string
  const getTodayDateStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#c5a059]">
          Mestres da Navalha
        </span>
        <h1 className="text-2xl sm:text-3xl font-brand font-bold text-white mt-0.5">
          Nossos Barbeiros
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Especialistas de alta precisão treinados na tradicional escola de visagismo Puyol.
        </p>
      </div>

      {/* Barbers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {barbers.filter(b => b.active).map(barber => {
          const isFavorite = currentUser.favoriteBarberIds?.includes(barber.id);
          // Preview available slots today for a standard haircut (40 min)
          const previewSlots = getAvailableSlots(barber.id, getTodayDateStr(), 40).slice(0, 4);

          return (
            <div
              key={barber.id}
              className="p-6 rounded-3xl bg-[#121218] border border-[#242433] hover:border-[#38384d] flex flex-col justify-between space-y-5 transition-all shadow-xl"
            >
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                  <img
                    src={barber.avatarUrl}
                    alt={barber.name}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover ring-2 ring-[#c5a059]/40 shadow-lg"
                  />
                  <button
                    onClick={() => toggleFavoriteBarber(barber.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:text-red-400 transition-colors"
                    title="Favoritar barbeiro"
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        {barber.name}
                      </h2>
                      <span className="text-xs text-[#c5a059] font-semibold">
                        {barber.nickname || 'Especialista Sênior'}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1 bg-[#1a1a26] px-2.5 py-1 rounded-full border border-white/5 text-xs font-bold text-[#f3e3b7] self-center sm:self-auto">
                      <Star className="w-3.5 h-3.5 fill-[#c5a059] text-[#c5a059]" />
                      <span>{barber.rating.toFixed(2)}</span>
                      <span className="text-[10px] text-zinc-500">({barber.reviewCount})</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {barber.bio}
                  </p>

                  <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start pt-1">
                    {barber.specialties.map(spec => (
                      <span
                        key={spec}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#191924] text-zinc-300 border border-[#2b2b3b]"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats & Next slots */}
              <div className="pt-4 border-t border-[#23232f] space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#171722] border border-[#242433] flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#c5a059]" />
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Atendimentos</span>
                      <span className="font-bold text-white">{barber.totalAppointments}+ cortes</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#171722] border border-[#242433] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#c5a059]" />
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Jornada</span>
                      <span className="font-bold text-white">{barber.startTime} às {barber.endTime}</span>
                    </div>
                  </div>
                </div>

                {/* Next available times preview */}
                {previewSlots.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-zinc-400 font-medium block">
                      Próximos horários livres para hoje:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {previewSlots.map(s => (
                        <button
                          key={s.time}
                          onClick={() => onStartBooking(undefined, barber.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#1a1a24] hover:bg-[#c5a059] text-zinc-300 hover:text-black text-xs font-semibold border border-[#2b2b3a] transition-all"
                        >
                          {s.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => onStartBooking(undefined, barber.id)}
                  className="w-full py-3 rounded-xl bg-[#c5a059] hover:bg-[#d8b56f] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#c5a059]/20 transition-all"
                >
                  <Scissors className="w-4 h-4 transform -rotate-45" />
                  <span>AGENDAR COM ESTE BARBEIRO</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
