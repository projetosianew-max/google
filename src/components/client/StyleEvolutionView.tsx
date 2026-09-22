import React, { useState } from 'react';
import { Camera, Calendar, Scissors, RotateCcw, Clock, Upload, Plus, Sparkles, Check } from 'lucide-react';
import { useBarbershop } from '../../context/BarbershopContext';
import { HaircutHistoryItem } from '../../types';
import { RepeatCutModal } from './RepeatCutModal';

interface StyleEvolutionViewProps {
  onStartBooking: () => void;
}

export const StyleEvolutionView: React.FC<StyleEvolutionViewProps> = ({ onStartBooking }) => {
  const { haircutHistory, addHaircutHistoryItem } = useBarbershop();
  const [selectedCutForRepeat, setSelectedCutForRepeat] = useState<HaircutHistoryItem | null>(null);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);

  // New photo state
  const [newServiceName, setNewServiceName] = useState('Degradê Puyol Personalizado');
  const [newBarberName, setNewBarberName] = useState('Mestre João');
  const [newNotes, setNewNotes] = useState('Fade alto 0.5 navalhado, acabamento alinhado com lâmina e toalha quente.');
  const [newPhotoUrl, setNewPhotoUrl] = useState('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80');

  const handleSaveCut = (e: React.FormEvent) => {
    e.preventDefault();
    addHaircutHistoryItem({
      appointmentId: 'manual_' + Date.now(),
      serviceName: newServiceName,
      barberName: newBarberName,
      date: new Date().toISOString().split('T')[0],
      price: 90,
      notes: newNotes,
      photoUrl: newPhotoUrl,
    });
    setIsAddingPhoto(false);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#c5a059]">
            Visagismo & Transformação
          </span>
          <h1 className="text-2xl sm:text-3xl font-brand font-bold text-white mt-0.5">
            Evolução do Estilo & Galeria
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Veja suas fotos anteriores, detalhes de corte e especificações de navalha guardadas.
          </p>
        </div>

        <button
          onClick={() => setIsAddingPhoto(!isAddingPhoto)}
          className="px-4 py-2.5 rounded-xl bg-[#1c1c28] hover:bg-[#282838] border border-[#2f2f42] text-zinc-200 text-xs sm:text-sm font-semibold flex items-center gap-2 self-start sm:self-auto"
        >
          <Camera className="w-4 h-4 text-[#c5a059]" />
          <span>Registrar Foto do Corte</span>
        </button>
      </div>

      {/* Manual photo upload form */}
      {isAddingPhoto && (
        <form onSubmit={handleSaveCut} className="p-5 rounded-2xl bg-[#14141c] border border-[#303044] space-y-4 animate-in fade-in duration-200">
          <h3 className="font-bold text-white text-base">Registrar Foto do Seu Corte</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-zinc-300 font-medium block mb-1">Serviço</label>
              <input
                type="text"
                value={newServiceName}
                onChange={e => setNewServiceName(e.target.value)}
                className="w-full bg-[#1b1b26] border border-[#2e2e40] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#c5a059]"
              />
            </div>
            <div>
              <label className="text-zinc-300 font-medium block mb-1">Barbeiro</label>
              <input
                type="text"
                value={newBarberName}
                onChange={e => setNewBarberName(e.target.value)}
                className="w-full bg-[#1b1b26] border border-[#2e2e40] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#c5a059]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-zinc-300 font-medium block mb-1">Foto URL (ou selecione foto demonstrativa)</label>
              <input
                type="text"
                value={newPhotoUrl}
                onChange={e => setNewPhotoUrl(e.target.value)}
                className="w-full bg-[#1b1b26] border border-[#2e2e40] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#c5a059]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-zinc-300 font-medium block mb-1">Notas de Personalização (Lâmina, Pente, Fade, Barba)</label>
              <textarea
                rows={2}
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
                className="w-full bg-[#1b1b26] border border-[#2e2e40] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#c5a059] resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingPhoto(false)}
              className="px-4 py-2 rounded-xl bg-[#1d1d28] text-zinc-300 text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#c5a059] text-black font-bold text-xs"
            >
              Salvar Registro
            </button>
          </div>
        </form>
      )}

      {/* History Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {haircutHistory.map(cut => (
          <div
            key={cut.id}
            className="rounded-3xl bg-[#121218] border border-[#242433] overflow-hidden flex flex-col justify-between shadow-xl"
          >
            <div className="relative h-56 overflow-hidden">
              <img
                src={cut.photoUrl || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80'}
                alt={cut.serviceName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121218] via-transparent to-transparent" />

              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10 text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>{cut.date.split('-').reverse().join('/')}</span>
              </div>

              <div className="absolute bottom-3 right-3 bg-[#0d0d12]/90 px-3 py-1 rounded-xl border border-[#c5a059]/40 text-sm font-bold text-[#f3e3b7]">
                R$ {cut.price.toFixed(2).replace('.', ',')}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">
                    {cut.serviceName}
                  </h3>
                  <span className="text-xs text-[#c5a059] font-semibold">
                    💈 {cut.barberName}
                  </span>
                </div>

                {cut.notes && (
                  <div className="mt-3 p-3 bg-[#171722] rounded-xl border border-[#262638] text-xs text-zinc-300">
                    <span className="text-zinc-500 font-semibold block text-[10px] uppercase">
                      Especificação do Barbeiro:
                    </span>
                    <p className="mt-0.5 leading-relaxed">{cut.notes}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedCutForRepeat(cut)}
                className="w-full py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d8b56f] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#c5a059]/20 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>REPETIR ESTE CORTE</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedCutForRepeat && (
        <RepeatCutModal
          isOpen={true}
          onClose={() => setSelectedCutForRepeat(null)}
          pastCut={selectedCutForRepeat}
          onSuccess={() => onStartBooking()}
        />
      )}
    </div>
  );
};
