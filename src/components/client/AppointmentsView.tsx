import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CalendarPlus, 
  XCircle, 
  RotateCcw, 
  Star, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useBarbershop } from '../../context/BarbershopContext';
import { Appointment } from '../../types';
import { ReviewModal } from './ReviewModal';
import { RepeatCutModal } from './RepeatCutModal';

interface AppointmentsViewProps {
  onStartBooking: () => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({ onStartBooking }) => {
  const { 
    currentUser, 
    appointments, 
    cancelAppointment, 
    settings 
  } = useBarbershop();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [reviewingAppointment, setReviewingAppointment] = useState<Appointment | null>(null);
  const [repeatingCut, setRepeatingCut] = useState<Appointment | null>(null);

  // Filter appointments for the current user
  const userAppointments = appointments.filter(a => a.customerId === currentUser.id);

  const upcoming = userAppointments.filter(a => a.status === 'confirmed' || a.status === 'in_progress');
  const history = userAppointments.filter(a => a.status === 'completed' || a.status === 'cancelled' || a.status === 'no_show');

  const handleCancelSubmit = (appointmentId: string) => {
    cancelAppointment(appointmentId, cancelReason || 'Cancelado pelo cliente');
    setCancellingId(null);
    setCancelReason('');
  };

  const handleAddToCalendar = (apt: Appointment) => {
    const [y, m, d] = apt.date.split('-');
    const [startH, startM] = apt.startTime.split(':');
    const [endH, endM] = apt.endTime.split(':');

    const startIso = `${y}${m}${d}T${startH}${startM}00`;
    const endIso = `${y}${m}${d}T${endH}${endM}00`;
    const title = encodeURIComponent(`Barbearia Puyol: ${apt.serviceName}`);
    const details = encodeURIComponent(`Atendimento com ${apt.barberName}. Código da reserva: ${apt.id}`);
    const location = encodeURIComponent(`${settings.address}, ${settings.city}`);

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
    window.open(gcalUrl, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            Confirmado
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/60 text-[#f3e3b7] border border-amber-800/40 animate-pulse">
            Em Atendimento
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-950/60 text-blue-400 border border-blue-800/40">
            Concluído
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
            Cancelado
          </span>
        );
      case 'no_show':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-950/60 text-red-400 border border-red-800/40">
            Não Compareceu
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#c5a059]">
            Gestão de Horários
          </span>
          <h1 className="text-2xl sm:text-3xl font-brand font-bold text-white mt-0.5">
            Meus Agendamentos
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Acompanhe suas reservas em tempo real, reagende ou cancele com facilidade.
          </p>
        </div>

        <button
          onClick={onStartBooking}
          className="px-5 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d8b56f] text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 self-start sm:self-auto shadow-md shadow-[#c5a059]/20"
        >
          <Calendar className="w-4 h-4" />
          <span>Novo Agendamento</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#242433] gap-4">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 text-sm font-semibold relative flex items-center gap-2 transition-colors ${
            activeTab === 'upcoming' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <span>Próximos Horários</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'upcoming' ? 'bg-[#c5a059] text-black' : 'bg-[#1e1e28] text-zinc-400'
          }`}>
            {upcoming.length}
          </span>
          {activeTab === 'upcoming' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c5a059]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-semibold relative flex items-center gap-2 transition-colors ${
            activeTab === 'history' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <span>Histórico Passado</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'history' ? 'bg-[#c5a059] text-black' : 'bg-[#1e1e28] text-zinc-400'
          }`}>
            {history.length}
          </span>
          {activeTab === 'history' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c5a059]" />
          )}
        </button>
      </div>

      {/* Policy Notice for Upcoming */}
      {activeTab === 'upcoming' && (
        <div className="p-3.5 rounded-xl bg-[#171720] border border-[#2b2b3b] text-xs text-zinc-400 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#c5a059] flex-shrink-0 mt-0.5" />
          <p>
            <strong className="text-zinc-200">Política de Cancelamento:</strong> Cancelamentos ou reagendamentos podem ser realizados sem qualquer custo até {settings.cancelMinNoticeHours} horas antes do atendimento agendado.
          </p>
        </div>
      )}

      {/* Appointments Cards List */}
      <div className="space-y-4">
        {(activeTab === 'upcoming' ? upcoming : history).length === 0 ? (
          <div className="p-12 text-center bg-[#121218] border border-[#23232f] rounded-2xl space-y-3">
            <Calendar className="w-12 h-12 text-zinc-600 mx-auto" />
            <h3 className="text-base font-semibold text-white">
              {activeTab === 'upcoming' ? 'Nenhum agendamento futuro no momento.' : 'Você ainda não possui histórico de cortes.'}
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Garanta seu visual na melhor barbearia da cidade reservando agora.
            </p>
            <button
              onClick={onStartBooking}
              className="mt-2 px-5 py-2.5 rounded-xl bg-[#c5a059] text-black font-bold text-xs"
            >
              Agendar Agora
            </button>
          </div>
        ) : (
          (activeTab === 'upcoming' ? upcoming : history).map(apt => (
            <div
              key={apt.id}
              className="p-5 rounded-2xl bg-[#121218] border border-[#242433] hover:border-[#333346] flex flex-col justify-between space-y-4 transition-all"
            >
              {/* Top Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#20202c] gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1a1a26] border border-[#2e2e42] flex items-center justify-center text-[#c5a059]">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 font-mono uppercase">
                      Reserva #{apt.id.toUpperCase()}
                    </span>
                    <h3 className="font-bold text-white text-base leading-snug">
                      {apt.serviceName}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  {getStatusBadge(apt.status)}
                  <span className="text-base font-bold text-white">
                    R$ {apt.finalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Info Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 bg-[#171722] rounded-xl border border-[#242433]">
                  <span className="text-zinc-500 block text-[10px]">Profissional:</span>
                  <span className="font-semibold text-white">{apt.barberName}</span>
                </div>
                <div className="p-2.5 bg-[#171722] rounded-xl border border-[#242433]">
                  <span className="text-zinc-500 block text-[10px]">Data do Corte:</span>
                  <span className="font-semibold text-white">
                    {apt.date.split('-').reverse().join('/')}
                  </span>
                </div>
                <div className="p-2.5 bg-[#171722] rounded-xl border border-[#242433]">
                  <span className="text-zinc-500 block text-[10px]">Horário:</span>
                  <span className="font-semibold text-white">
                    {apt.startTime} às {apt.endTime}
                  </span>
                </div>
              </div>

              {/* Action Buttons depending on status */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                
                {/* Left side actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleAddToCalendar(apt)}
                    className="px-3 py-1.5 rounded-lg bg-[#181824] hover:bg-[#222232] text-zinc-300 text-xs font-medium border border-[#2c2c3e] flex items-center gap-1.5"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Salvar no Calendário</span>
                  </button>

                  <button
                    onClick={() => window.open(settings.googleMapsUrl, '_blank')}
                    className="px-3 py-1.5 rounded-lg bg-[#181824] hover:bg-[#222232] text-zinc-300 text-xs font-medium border border-[#2c2c3e] flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Como Chegar</span>
                  </button>
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-2">
                  {apt.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => setCancellingId(apt.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-300 text-xs font-semibold border border-red-800/40 flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancelar</span>
                      </button>
                    </>
                  )}

                  {apt.status === 'completed' && (
                    <>
                      <button
                        onClick={() => setReviewingAppointment(apt)}
                        className="px-3 py-1.5 rounded-lg bg-[#1e1c15] hover:bg-[#29261a] text-[#f3e3b7] text-xs font-semibold border border-[#c5a059]/40 flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5 fill-[#c5a059] text-[#c5a059]" />
                        <span>Avaliar Atendimento</span>
                      </button>

                      <button
                        onClick={() => setRepeatingCut(apt)}
                        className="px-3 py-1.5 rounded-lg bg-[#c5a059] hover:bg-[#d8b56f] text-black text-xs font-bold flex items-center gap-1 shadow-sm"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Repetir Corte</span>
                      </button>
                    </>
                  )}

                  {apt.status === 'cancelled' && (
                    <button
                      onClick={() => setRepeatingCut(apt)}
                      className="px-3 py-1.5 rounded-lg bg-[#22222e] hover:bg-[#2d2d3d] text-zinc-200 text-xs font-semibold border border-[#353548] flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span>Agendar Novamente</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Cancel Confirmation Prompt */}
              {cancellingId === apt.id && (
                <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-800/50 space-y-2.5 text-xs animate-in fade-in duration-150">
                  <p className="font-semibold text-red-300">
                    Tem certeza de que deseja cancelar este agendamento?
                  </p>
                  <input
                    type="text"
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                    placeholder="Motivo do cancelamento (opcional)"
                    className="w-full bg-[#121217] border border-red-900/50 rounded-lg p-2 text-white text-xs focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setCancellingId(null)}
                      className="px-3 py-1.5 rounded-lg bg-[#1f1f28] text-zinc-300 hover:bg-[#2b2b3a]"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={() => handleCancelSubmit(apt.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold"
                    >
                      Confirmar Cancelamento
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {reviewingAppointment && (
        <ReviewModal
          isOpen={true}
          onClose={() => setReviewingAppointment(null)}
          appointment={reviewingAppointment}
        />
      )}

      {/* Repeat Cut Modal */}
      {repeatingCut && (
        <RepeatCutModal
          isOpen={true}
          onClose={() => setRepeatingCut(null)}
          pastCut={repeatingCut}
          onSuccess={() => setActiveTab('upcoming')}
        />
      )}
    </div>
  );
};
