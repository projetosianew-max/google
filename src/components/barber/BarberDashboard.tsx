import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Play, 
  XCircle, 
  Lock, 
  Unlock, 
  DollarSign, 
  Star, 
  UserCheck, 
  Camera, 
  Plus, 
  Scissors,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useBarbershop } from '../../context/BarbershopContext';
import { AppointmentStatus } from '../../types';

export const BarberDashboard: React.FC = () => {
  const { 
    currentUser, 
    barbers, 
    appointments, 
    updateAppointmentStatus, 
    blockedTimes, 
    addBlockedTime, 
    removeBlockedTime,
    addHaircutHistoryItem
  } = useBarbershop();

  // Selected date filter
  const getTodayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [filterDate, setFilterDate] = useState<string>(getTodayStr());
  const [blockStartTime, setBlockStartTime] = useState<string>('12:00');
  const [blockEndTime, setBlockEndTime] = useState<string>('13:00');
  const [blockReason, setBlockReason] = useState<string>('Almoço / Intervalo pessoal');
  const [showBlockForm, setShowBlockForm] = useState<boolean>(false);

  // Photo record modal for completed appointment
  const [photoAppointmentId, setPhotoAppointmentId] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80');
  const [photoNotes, setPhotoNotes] = useState<string>('Degradê navalhado alto, barba com toalha quente e finalização com pomada matte.');

  // Current barber data (Mestre João is default barber demo)
  const currentBarber = barbers.find(b => b.id === currentUser.id) || barbers[0];

  // Barber appointments
  const barberAppointments = appointments.filter(a => {
    const matchesBarber = a.barberId === currentBarber.id || a.barberId === 'any';
    const matchesDate = a.date === filterDate;
    return matchesBarber && matchesDate;
  });

  // Calculate stats
  const completedToday = appointments.filter(a => a.barberId === currentBarber.id && a.status === 'completed');
  const totalRevenue = completedToday.reduce((sum, a) => sum + a.finalPrice, 0);
  const commissionRate = currentBarber.commissionRate || 0.50; // 50% commission
  const commissionEarned = totalRevenue * commissionRate;

  const handleStatusChange = (appointmentId: string, status: AppointmentStatus) => {
    updateAppointmentStatus(appointmentId, status);
  };

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    addBlockedTime({
      barberId: currentBarber.id,
      date: filterDate,
      startTime: blockStartTime,
      endTime: blockEndTime,
      reason: blockReason,
    });
    setShowBlockForm(false);
  };

  const handleSavePhotoRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoAppointmentId) return;
    const apt = appointments.find(a => a.id === photoAppointmentId);
    if (apt) {
      addHaircutHistoryItem({
        appointmentId: apt.id,
        serviceName: apt.serviceName,
        barberName: currentBarber.name,
        date: apt.date,
        price: apt.finalPrice,
        notes: photoNotes,
        photoUrl: photoUrl,
      });
    }
    setPhotoAppointmentId(null);
  };

  return (
    <div className="space-y-8 pb-16" id="barber-dashboard">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1c1810] to-[#121217] border border-[#c5a059]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentBarber.avatarUrl}
            alt={currentBarber.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#c5a059]/40 shadow-lg"
          />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#f3e3b7] block">
              Painel Profissional do Barbeiro
            </span>
            <h1 className="text-xl sm:text-2xl font-brand font-bold text-white">
              {currentBarber.name} ({currentBarber.nickname || 'Puyol'})
            </h1>
            <p className="text-xs text-zinc-400">
              Especialista Puyol • Jornada: {currentBarber.startTime} às {currentBarber.endTime}
            </p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-[#171722] p-2 rounded-xl border border-[#2b2b3b]">
          <Calendar className="w-4 h-4 text-[#c5a059]" />
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="bg-transparent text-xs sm:text-sm text-white focus:outline-none"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#121218] border border-[#242433] flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 block">Agendamentos no Dia</span>
            <span className="text-2xl font-bold text-white mt-1 block">
              {barberAppointments.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#c5a059]/10 text-[#c5a059] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121218] border border-[#242433] flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 block">Cortes Concluídos</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1 block">
              {completedToday.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121218] border border-[#242433] flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 block">Comissão Acumulada</span>
            <span className="text-2xl font-bold text-[#f3e3b7] mt-1 block">
              R$ {commissionEarned.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[#c5a059] flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121218] border border-[#242433] flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 block">Média de Avaliação</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-2xl font-bold text-white">
                {currentBarber.rating.toFixed(2)}
              </span>
              <Star className="w-4 h-4 fill-[#c5a059] text-[#c5a059]" />
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Quick Action: Bloquear Horário Pessoal */}
      <div className="p-5 rounded-2xl bg-[#14141c] border border-[#242433] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#c5a059]" />
            <h3 className="font-bold text-white text-sm">Bloquear Horário Pessoal</h3>
          </div>
          <button
            onClick={() => setShowBlockForm(!showBlockForm)}
            className="text-xs font-semibold text-[#c5a059] hover:underline"
          >
            {showBlockForm ? 'Ocultar Formulário' : '+ Adicionar Bloqueio na Agenda'}
          </button>
        </div>

        {showBlockForm && (
          <form onSubmit={handleAddBlock} className="pt-2 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-zinc-400 block mb-1">Início</label>
              <input
                type="time"
                value={blockStartTime}
                onChange={e => setBlockStartTime(e.target.value)}
                className="w-full bg-[#1b1b26] border border-[#2e2e42] rounded-xl p-2 text-white"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Término</label>
              <input
                type="time"
                value={blockEndTime}
                onChange={e => setBlockEndTime(e.target.value)}
                className="w-full bg-[#1b1b26] border border-[#2e2e42] rounded-xl p-2 text-white"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Motivo</label>
              <input
                type="text"
                value={blockReason}
                onChange={e => setBlockReason(e.target.value)}
                className="w-full bg-[#1b1b26] border border-[#2e2e42] rounded-xl p-2 text-white"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d8b56f] text-black font-bold"
              >
                Bloquear Horário
              </button>
            </div>
          </form>
        )}

        {/* Current blocked intervals for this barber */}
        {blockedTimes.filter(b => b.barberId === currentBarber.id && b.date === filterDate).length > 0 && (
          <div className="pt-2 border-t border-[#23232f] flex flex-wrap gap-2">
            {blockedTimes
              .filter(b => b.barberId === currentBarber.id && b.date === filterDate)
              .map(b => (
                <div
                  key={b.id}
                  className="px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    {b.startTime} às {b.endTime} ({b.reason})
                  </span>
                  <button
                    onClick={() => removeBlockedTime(b.id)}
                    className="text-red-400 hover:text-white"
                    title="Remover bloqueio"
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Daily Agenda List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-brand font-bold text-white">
            Agenda do Dia ({filterDate.split('-').reverse().join('/')})
          </h2>
          <span className="text-xs text-zinc-400">
            {barberAppointments.length} atendimentos listados
          </span>
        </div>

        {barberAppointments.length === 0 ? (
          <div className="p-8 text-center bg-[#121218] border border-[#242433] rounded-2xl text-zinc-500 text-xs">
            Nenhum agendamento programado para esta data.
          </div>
        ) : (
          <div className="space-y-3">
            {barberAppointments.map(apt => (
              <div
                key={apt.id}
                className="p-5 rounded-2xl bg-[#121218] border border-[#242433] hover:border-[#38384d] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#1a1a24] border border-[#2d2d3e] flex flex-col items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-[#c5a059]" />
                    <span className="text-xs font-bold text-white mt-1">{apt.startTime}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-base">{apt.customerName}</h4>
                      <span className="text-xs text-zinc-400">({apt.customerPhone})</span>
                    </div>

                    <p className="text-xs text-[#c5a059] font-medium mt-0.5">
                      ✂️ {apt.serviceName} • {apt.startTime} às {apt.endTime}
                    </p>

                    {apt.notes && (
                      <p className="text-[11px] text-zinc-400 mt-1 italic">
                        Obs: "{apt.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Status and Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    apt.status === 'confirmed'
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                      : apt.status === 'in_progress'
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40 animate-pulse'
                        : apt.status === 'completed'
                          ? 'bg-blue-950/60 text-blue-400 border border-blue-800/40'
                          : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {apt.status === 'confirmed' ? 'Confirmado' : apt.status === 'in_progress' ? 'Em Andamento' : apt.status === 'completed' ? 'Concluído' : 'Cancelado'}
                  </span>

                  {apt.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusChange(apt.id, 'in_progress')}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs flex items-center gap-1.5 shadow"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Iniciar Atendimento</span>
                    </button>
                  )}

                  {apt.status === 'in_progress' && (
                    <button
                      onClick={() => handleStatusChange(apt.id, 'completed')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs flex items-center gap-1.5 shadow"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Finalizar Corte</span>
                    </button>
                  )}

                  {apt.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusChange(apt.id, 'no_show')}
                      className="px-2.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 text-xs font-medium border border-red-800/40"
                    >
                      Não Compareceu
                    </button>
                  )}

                  {apt.status === 'completed' && (
                    <button
                      onClick={() => setPhotoAppointmentId(apt.id)}
                      className="px-3 py-1.5 rounded-xl bg-[#1b1b28] hover:bg-[#252538] border border-[#2e2e42] text-[#f3e3b7] text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span>Anexar Foto ao Histórico</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attach Photo Modal */}
      {photoAppointmentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#121217] border border-[#2e2e40] rounded-2xl p-6 space-y-4">
            <h3 className="font-brand font-bold text-lg text-white">
              Anexar Foto e Detalhes do Corte
            </h3>
            <p className="text-xs text-zinc-400">
              Esses dados alimentarão o histórico exclusivo do cliente para repetição rápida.
            </p>

            <form onSubmit={handleSavePhotoRecord} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-300 font-medium block mb-1">URL da Foto</label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={e => setPhotoUrl(e.target.value)}
                  className="w-full bg-[#181822] border border-[#2a2a3b] rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-medium block mb-1">Especificações Técnicas (Pentes, Navalha, Acabamento)</label>
                <textarea
                  rows={3}
                  value={photoNotes}
                  onChange={e => setPhotoNotes(e.target.value)}
                  className="w-full bg-[#181822] border border-[#2a2a3b] rounded-xl p-2.5 text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPhotoAppointmentId(null)}
                  className="px-4 py-2 rounded-xl bg-[#1b1b24] text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#c5a059] text-black font-bold"
                >
                  Salvar no Perfil do Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
