import React, { useState, useMemo } from 'react';
import { X, Scissors, Calendar, Clock, ArrowRight, Check, Sparkles, AlertCircle } from 'lucide-react';
import { useBarbershop } from '../../context/BarbershopContext';
import { Appointment, HaircutHistoryItem } from '../../types';

interface RepeatCutModalProps {
  isOpen: boolean;
  onClose: () => void;
  pastCut?: HaircutHistoryItem | Appointment;
  onSuccess: (newApt: Appointment) => void;
}

export const RepeatCutModal: React.FC<RepeatCutModalProps> = ({
  isOpen,
  onClose,
  pastCut,
  onSuccess,
}) => {
  const { 
    barbers, 
    services, 
    getAvailableSlots, 
    repeatAppointment, 
    appointments, 
    haircutHistory 
  } = useBarbershop();

  // Find last cut reference if not explicitly passed
  const targetCut = useMemo(() => {
    if (pastCut) return pastCut;
    if (haircutHistory.length > 0) return haircutHistory[0];
    const completedApt = appointments.find(a => a.status === 'completed');
    return completedApt || null;
  }, [pastCut, haircutHistory, appointments]);

  // Target barber
  const originalBarber = useMemo(() => {
    if (!targetCut) return barbers[0];
    return barbers.find(b => b.id === ('barberId' in targetCut ? targetCut.barberId : barbers[0].id)) || barbers[0];
  }, [targetCut, barbers]);

  // Target service
  const originalService = useMemo(() => {
    if (!targetCut) return services[0];
    const sName = 'serviceName' in targetCut ? targetCut.serviceName : '';
    return services.find(s => s.name.toLowerCase().includes(sName.toLowerCase().slice(0, 10))) || services[0];
  }, [targetCut, services]);

  const [selectedBarberId, setSelectedBarberId] = useState<string>(originalBarber.id);
  const [allowChangeBarber, setAllowChangeBarber] = useState(false);

  // Date selection: default tomorrow or today
  const getTomorrowDateStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1); // skip Sunday
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTomorrowDateStr());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Slots
  const slots = useMemo(() => {
    return getAvailableSlots(selectedBarberId, selectedDate, originalService.durationMinutes);
  }, [selectedBarberId, selectedDate, originalService, getAvailableSlots]);

  if (!isOpen || !targetCut) return null;

  const handleConfirmRepeat = async () => {
    if (!selectedTime) {
      setErrorMsg('Por favor selecione um horário disponível.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const aptId = 'appointmentId' in targetCut ? targetCut.appointmentId : targetCut.id;
      const newApt = await repeatAppointment(aptId, selectedDate, selectedTime, selectedBarberId);
      onSuccess(newApt);
      onClose();
    } catch (e: any) {
      setErrorMsg(e.message || 'Erro ao repetir agendamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-[#111116] border border-[#2e2e3f] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        id="repeat-cut-modal"
      >
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-[#211a0c] via-[#1a140a] to-[#111116] p-5 border-b border-[#362912] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#c5a059] to-[#ebd296] text-black flex items-center justify-center shadow-lg shadow-[#c5a059]/20">
              <Scissors className="w-5 h-5 transform -rotate-45" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#f3e3b7] flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Agendamento Rápido em 2 Cliques
              </span>
              <h3 className="font-brand font-bold text-lg text-white">
                Repetir Meu Último Corte
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Summary of past cut */}
          <div className="p-3.5 bg-[#171722] rounded-xl border border-[#2b2b3a] flex items-center justify-between text-xs">
            <div>
              <span className="text-zinc-400 block text-[11px]">Serviço & Barbeiro salvos:</span>
              <span className="text-white font-bold text-sm block mt-0.5">
                ✂️ {targetCut.serviceName}
              </span>
              <span className="text-[#c5a059] font-medium">
                💈 {targetCut.barberName}
              </span>
            </div>
            <span className="text-sm font-bold text-white bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
              R$ {('finalPrice' in targetCut ? targetCut.finalPrice : ('price' in targetCut ? (targetCut as any).price : 70)).toFixed(2).replace('.', ',')}
            </span>
          </div>

          {/* Change barber toggle if needed */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Barbeiro:</span>
            {!allowChangeBarber ? (
              <button
                type="button"
                onClick={() => setAllowChangeBarber(true)}
                className="text-[#c5a059] hover:underline font-medium"
              >
                Trocar barbeiro para este corte
              </button>
            ) : (
              <select
                value={selectedBarberId}
                onChange={e => setSelectedBarberId(e.target.value)}
                className="bg-[#181824] border border-[#333348] text-white rounded-lg p-1.5 text-xs focus:outline-none focus:border-[#c5a059]"
              >
                {barbers.filter(b => b.active).map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Date Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#c5a059]" />
              Escolha a nova data:
            </label>
            <input
              type="date"
              value={selectedDate}
              min={getTomorrowDateStr()}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full bg-[#181822] border border-[#2b2b38] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          {/* Available Slots for this repeat */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#c5a059]" />
                Horários livres para {selectedDate.split('-').reverse().join('/')}:
              </label>
              <span className="text-[11px] text-zinc-500">
                {slots.length} opções
              </span>
            </div>

            {slots.length === 0 ? (
              <div className="p-4 bg-[#181822] border border-[#2b2b38] rounded-xl text-center text-xs text-zinc-400 space-y-2">
                <p>Nenhum horário livre com este barbeiro nesta data.</p>
                <button
                  type="button"
                  onClick={() => setAllowChangeBarber(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#272736] text-white text-xs hover:bg-[#343448]"
                >
                  Ver com outro barbeiro
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {slots.map(slot => {
                  const isSelected = selectedTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setSelectedTime(slot.time)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-[#c5a059] border-[#c5a059] text-black shadow-md shadow-[#c5a059]/20'
                          : 'bg-[#181822] border-[#2c2c3b] text-zinc-200 hover:border-[#c5a059]/50'
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {errorMsg && (
            <p className="text-xs text-red-400 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </p>
          )}

          {/* Action button */}
          <button
            disabled={!selectedTime || isSubmitting}
            onClick={handleConfirmRepeat}
            className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              selectedTime && !isSubmitting
                ? 'bg-[#c5a059] hover:bg-[#d6b36a] text-black shadow-xl shadow-[#c5a059]/25 cursor-pointer'
                : 'bg-[#22222e] text-zinc-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <span>Confirmando agendamento rápido...</span>
            ) : (
              <>
                <span>Confirmar Repetição de Corte</span>
                <Check className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
