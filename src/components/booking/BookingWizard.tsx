import React, { useState, useMemo } from 'react';
import { 
  Scissors, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  CreditCard, 
  QrCode, 
  Store, 
  ArrowLeft, 
  ArrowRight, 
  Star, 
  Sparkles, 
  Tag, 
  MapPin, 
  MessageSquare, 
  CalendarPlus, 
  Copy, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { useBarbershop } from '../../context/BarbershopContext';
import { ServiceItem, Barber, PaymentMethod, Appointment } from '../../types';

interface BookingWizardProps {
  initialServiceId?: string;
  initialBarberId?: string;
  onFinish: () => void;
  onViewAppointments: () => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  initialServiceId,
  initialBarberId,
  onFinish,
  onViewAppointments,
}) => {
  const { 
    services, 
    barbers, 
    getAvailableSlots, 
    bookAppointment, 
    applyCoupon, 
    currentUser, 
    settings 
  } = useBarbershop();

  // Wizard state: 1 to 7
  const [step, setStep] = useState<number>(initialServiceId ? (initialBarberId ? 3 : 2) : 1);

  // Selections
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceId || (services[0]?.id || ''));
  const [selectedBarberId, setSelectedBarberId] = useState<string>(initialBarberId || 'any');
  
  // Date selection: default to today or tomorrow
  const getTodayDateStr = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateStr());
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Discount & notes
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string>('');
  const [usePoints, setUsePoints] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Booking result
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedPix, setCopiedPix] = useState<boolean>(false);

  // Computed details
  const selectedService = useMemo(() => 
    services.find(s => s.id === selectedServiceId) || services[0], 
    [services, selectedServiceId]
  );

  const selectedBarber = useMemo(() => {
    if (selectedBarberId === 'any') return null;
    return barbers.find(b => b.id === selectedBarberId) || null;
  }, [barbers, selectedBarberId]);

  // Compute available slots
  const availableSlots = useMemo(() => {
    if (!selectedService || !selectedDate) return [];
    return getAvailableSlots(selectedBarberId, selectedDate, selectedService.durationMinutes);
  }, [selectedBarberId, selectedDate, selectedService, getAvailableSlots]);

  // Calculation of totals
  const basePrice = selectedService ? selectedService.price : 0;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  // If user has at least 500 points and toggled, discount R$ 10 (or up to 1000 pts = R$ 20)
  const userPoints = currentUser.loyaltyPoints || 0;
  const redeemablePoints = userPoints >= 1000 ? 1000 : userPoints >= 500 ? 500 : 0;
  const pointsDiscount = usePoints && redeemablePoints >= 500 ? (redeemablePoints / 500) * 10 : 0;
  const finalPrice = Math.max(0, basePrice - couponDiscount - pointsDiscount);

  // Quick 7-days date generator
  const next7Days = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 8; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      
      const dayName = i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : d.toLocaleDateString('pt-BR', { weekday: 'short' });
      list.push({
        dateStr,
        dayNum: day,
        dayName: dayName.replace('.', ''),
        monthName: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        isSunday: d.getDay() === 0,
      });
    }
    return list;
  }, []);

  const handleApplyCoupon = () => {
    setCouponError('');
    if (!couponCode.trim()) return;
    const res = applyCoupon(couponCode, basePrice);
    if (res.valid) {
      setAppliedCoupon({ code: couponCode.toUpperCase(), discount: res.discount });
    } else {
      setCouponError(res.message);
    }
  };

  const handleConfirmAndPay = async () => {
    if (!selectedTime) return;
    setIsSubmitting(true);
    try {
      const apt = await bookAppointment({
        customerId: currentUser.id,
        customerName: currentUser.name,
        customerPhone: currentUser.phone,
        customerEmail: currentUser.email,
        barberId: selectedBarberId,
        serviceId: selectedService.id,
        date: selectedDate,
        startTime: selectedTime,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        pointsToRedeem: usePoints ? redeemablePoints : undefined,
        notes,
      });
      setCreatedAppointment(apt);
      setStep(7); // Final step
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Calendar / .ICS helper
  const handleAddToCalendar = () => {
    if (!createdAppointment) return;
    const [y, m, d] = createdAppointment.date.split('-');
    const [startH, startM] = createdAppointment.startTime.split(':');
    const [endH, endM] = createdAppointment.endTime.split(':');

    // Google Calendar URL format
    const startIso = `${y}${m}${d}T${startH}${startM}00`;
    const endIso = `${y}${m}${d}T${endH}${endM}00`;
    const title = encodeURIComponent(`Corte na Barbearia Puyol: ${createdAppointment.serviceName}`);
    const details = encodeURIComponent(`Atendimento com ${createdAppointment.barberName} na Barbearia Puyol do Corte Original. Código do agendamento: ${createdAppointment.id}`);
    const location = encodeURIComponent(settings.address + ', ' + settings.city);

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
    window.open(gcalUrl, '_blank');
  };

  const handleShareWhatsApp = () => {
    if (!createdAppointment) return;
    const msg = `Olá! Acabei de agendar meu horário na Barbearia Puyol!\n\n✂️ Serviço: ${createdAppointment.serviceName}\n💈 Barbeiro: ${createdAppointment.barberName}\n📅 Data: ${createdAppointment.date.split('-').reverse().join('/')}\n⏰ Horário: ${createdAppointment.startTime}\nIdentificador: ${createdAppointment.id}`;
    const cleanPhone = settings.whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Steps labels
  const stepsTitles = [
    'Serviço',
    'Barbeiro',
    'Data',
    'Horário',
    'Confirmar',
    'Pagamento',
    'Concluído'
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10" id="booking-wizard-container">
      
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
          <span className="font-semibold uppercase tracking-wider text-[#c5a059]">
            Etapa {step} de 7: {stepsTitles[step - 1]}
          </span>
          <span className="text-zinc-500">
            {Math.round((step / 7) * 100)}% concluído
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#1f1f28] rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-gradient-to-r from-[#8a6828] via-[#c5a059] to-[#f3e3b7] transition-all duration-300 rounded-full"
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>

        {/* Step Circles Indicator */}
        <div className="hidden sm:flex justify-between items-center mt-3 px-1">
          {stepsTitles.map((title, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < step;
            const isCurrent = stepNum === step;

            return (
              <div 
                key={title} 
                className="flex items-center gap-1.5 cursor-default text-[11px]"
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isCompleted 
                    ? 'bg-[#c5a059] text-black' 
                    : isCurrent 
                      ? 'bg-white text-black ring-2 ring-[#c5a059]' 
                      : 'bg-[#22222e] text-zinc-500'
                }`}>
                  {isCompleted ? '✓' : stepNum}
                </div>
                <span className={`${isCurrent ? 'text-white font-semibold' : 'text-zinc-500'}`}>
                  {title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Escolher Serviço */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-brand font-bold text-white">
              Escolha seu Serviço
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Selecione o corte, barboterapia ou combo ideal para o seu estilo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.filter(s => s.active).map(service => {
              const isSelected = selectedServiceId === service.id;
              return (
                <div
                  key={service.id}
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#181824] border-[#c5a059] ring-2 ring-[#c5a059]/30 shadow-xl'
                      : 'bg-[#121218] border-[#252532] hover:border-[#38384d] hover:bg-[#161620]'
                  }`}
                >
                  <div className="flex gap-4">
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="w-20 h-20 rounded-xl object-cover ring-1 ring-white/10 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="font-semibold text-white text-sm leading-snug">
                          {service.name}
                        </h3>
                        {service.popular && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#c5a059]/20 text-[#f3e3b7] border border-[#c5a059]/40 whitespace-nowrap">
                            Mais Pedido
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#23232f] flex items-center justify-between">
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#c5a059]" />
                      {service.durationMinutes} min
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white">
                        R$ {service.price.toFixed(2).replace('.', ',')}
                      </span>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        isSelected ? 'bg-[#c5a059] border-[#c5a059] text-black' : 'border-[#3f3f52]'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 rounded-xl bg-[#c5a059] hover:bg-[#d6b36a] text-black font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#c5a059]/20 transition-all"
            >
              <span>Continuar: Escolher Barbeiro</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Escolher Barbeiro */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-brand font-bold text-white">
              Escolha o Barbeiro
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Todos os nossos profissionais seguem o padrão de precisão cirúrgica Puyol.
            </p>
          </div>

          {/* Option: Qualquer Barbeiro Disponível */}
          <div
            onClick={() => setSelectedBarberId('any')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              selectedBarberId === 'any'
                ? 'bg-[#1b1912] border-[#c5a059] ring-2 ring-[#c5a059]/30'
                : 'bg-[#121218] border-[#252532] hover:border-[#38384d]'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-[#3a2f18] to-[#6d5624] border border-[#c5a059]/40 flex items-center justify-center text-[#e5c57e]">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm sm:text-base">
                  Qualquer Barbeiro Disponível
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Maior quantidade de horários disponíveis com o primeiro profissional livre.
                </p>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
              selectedBarberId === 'any' ? 'bg-[#c5a059] border-[#c5a059] text-black' : 'border-[#3f3f52]'
            }`}>
              {selectedBarberId === 'any' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </div>

          {/* Barbers List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {barbers.filter(b => b.active).map(barber => {
              const isSelected = selectedBarberId === barber.id;
              return (
                <div
                  key={barber.id}
                  onClick={() => setSelectedBarberId(barber.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#181824] border-[#c5a059] ring-2 ring-[#c5a059]/30 shadow-xl'
                      : 'bg-[#121218] border-[#252532] hover:border-[#38384d]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={barber.avatarUrl}
                      alt={barber.name}
                      className="w-14 h-14 rounded-xl object-cover ring-1 ring-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-white text-sm truncate">
                          {barber.name}
                        </h4>
                        <div className="flex items-center gap-1 text-[#f3e3b7] text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-[#c5a059] text-[#c5a059]" />
                          <span>{barber.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-[#c5a059] font-medium">
                        {barber.nickname || 'Especialista Puyol'}
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">
                        {barber.specialties.slice(0, 2).join(' • ')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#23232f] flex items-center justify-between text-xs text-zinc-400">
                    <span>{barber.totalAppointments}+ atendimentos</span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      isSelected ? 'bg-[#c5a059] border-[#c5a059] text-black' : 'border-[#3f3f52]'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl bg-[#1c1c24] hover:bg-[#252532] text-zinc-300 text-sm flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 rounded-xl bg-[#c5a059] hover:bg-[#d6b36a] text-black font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#c5a059]/20"
            >
              <span>Continuar: Escolher Data</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Escolher Data */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-brand font-bold text-white">
              Escolha o Dia do Atendimento
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Atendimento de segunda a sábado. Domingo fechado para descanso da equipe.
            </p>
          </div>

          {/* Quick Dates Carousel */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {next7Days.map(item => {
              const isSelected = selectedDate === item.dateStr;
              const disabled = item.isSunday;

              return (
                <button
                  key={item.dateStr}
                  disabled={disabled}
                  onClick={() => setSelectedDate(item.dateStr)}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                    disabled
                      ? 'opacity-40 bg-[#0e0e13] border-[#1e1e26] cursor-not-allowed'
                      : isSelected
                        ? 'bg-[#1e1b13] border-[#c5a059] text-white ring-2 ring-[#c5a059]/30 shadow-lg'
                        : 'bg-[#131319] border-[#252533] text-zinc-300 hover:border-[#38384a]'
                  }`}
                >
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                    {item.dayName}
                  </span>
                  <span className="text-2xl font-bold my-1 text-white">
                    {item.dayNum}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {disabled ? 'Fechado' : item.monthName}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom Date Input for future booking */}
          <div className="p-4 bg-[#14141a] rounded-2xl border border-[#252533] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#c5a059]" />
              <div>
                <h4 className="text-sm font-semibold text-white">Ou selecione uma data futura:</h4>
                <p className="text-xs text-zinc-400">Agende com antecedência garantida</p>
              </div>
            </div>
            <input
              type="date"
              min={getTodayDateStr()}
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-[#1c1c26] border border-[#313144] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl bg-[#1c1c24] hover:bg-[#252532] text-zinc-300 text-sm flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-3 rounded-xl bg-[#c5a059] hover:bg-[#d6b36a] text-black font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#c5a059]/20"
            >
              <span>Continuar: Ver Horários</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Escolher Horário em Tempo Real */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-brand font-bold text-white">
              Horários Disponíveis em Tempo Real
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Data: <span className="text-white font-semibold">{selectedDate.split('-').reverse().join('/')}</span> • 
              Duração: <span className="text-white font-semibold">{selectedService.durationMinutes} minutos</span>
            </p>
          </div>

          {availableSlots.length === 0 ? (
            <div className="p-8 bg-[#14141a] rounded-2xl border border-[#2b2b3b] text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-950/50 text-[#c5a059] flex items-center justify-center mx-auto border border-[#c5a059]/30">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Não encontramos horários disponíveis para esta data.
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                  Os horários podem estar preenchidos ou o barbeiro selecionado está em dia de folga. Experimente selecionar "Qualquer barbeiro disponível" ou outra data.
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedBarberId('any');
                    setStep(3);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#c5a059] text-black font-semibold text-xs"
                >
                  Ver outras datas / barbeiros
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {availableSlots.map(slot => {
                  const isSelected = selectedTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`py-3 px-2 rounded-xl border text-center font-semibold text-xs sm:text-sm transition-all ${
                        isSelected
                          ? 'bg-[#c5a059] border-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20 scale-102 font-bold'
                          : 'bg-[#15151e] border-[#292939] text-zinc-200 hover:border-[#c5a059]/60 hover:bg-[#1a1a26]'
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>

              {selectedTime && (
                <div className="p-3.5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    Horário selecionado: <strong>{selectedTime}</strong> ({selectedDate.split('-').reverse().join('/')}). Seu horário será reservado exclusivamente para você.
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(3)}
              className="px-5 py-2.5 rounded-xl bg-[#1c1c24] hover:bg-[#252532] text-zinc-300 text-sm flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
            <button
              disabled={!selectedTime}
              onClick={() => setStep(5)}
              className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                selectedTime
                  ? 'bg-[#c5a059] hover:bg-[#d6b36a] text-black shadow-lg shadow-[#c5a059]/20'
                  : 'bg-[#22222e] text-zinc-500 cursor-not-allowed'
              }`}
            >
              <span>Continuar: Confirmar Detalhes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Confirmar Detalhes e Cupons */}
      {step === 5 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-brand font-bold text-white">
              Confirme seu Agendamento
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Revise as informações antes de selecionar a forma de pagamento.
            </p>
          </div>

          {/* Booking Summary Card */}
          <div className="p-5 rounded-2xl bg-[#14141c] border border-[#2b2b3a] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#23232f] gap-3">
              <div className="flex items-center gap-3.5">
                <img
                  src={selectedService.imageUrl}
                  alt={selectedService.name}
                  className="w-16 h-16 rounded-xl object-cover ring-1 ring-white/10"
                />
                <div>
                  <h3 className="font-semibold text-white text-base">
                    {selectedService.name}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Duração prevista: {selectedService.durationMinutes} min
                  </p>
                </div>
              </div>
              <span className="text-xl font-bold text-white">
                R$ {basePrice.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#191924] rounded-xl border border-[#292939]">
                <span className="text-zinc-500 block mb-0.5">Barbeiro:</span>
                <span className="font-semibold text-white">
                  {selectedBarber ? selectedBarber.name : 'Qualquer barbeiro livre'}
                </span>
              </div>
              <div className="p-3 bg-[#191924] rounded-xl border border-[#292939]">
                <span className="text-zinc-500 block mb-0.5">Data:</span>
                <span className="font-semibold text-white">
                  {selectedDate.split('-').reverse().join('/')}
                </span>
              </div>
              <div className="p-3 bg-[#191924] rounded-xl border border-[#292939]">
                <span className="text-zinc-500 block mb-0.5">Horário:</span>
                <span className="font-semibold text-white">
                  {selectedTime}
                </span>
              </div>
            </div>

            {/* Cupons & Clube Puyol points */}
            <div className="pt-2 border-t border-[#23232f] space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Possui cupom? Ex: PUYOL10"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#1b1b26] border border-[#303042] rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white uppercase placeholder-zinc-500 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 rounded-xl bg-[#262636] hover:bg-[#34344a] text-zinc-200 text-xs font-semibold"
                >
                  Aplicar Cupom
                </button>
              </div>

              {couponError && (
                <p className="text-xs text-red-400">{couponError}</p>
              )}

              {appliedCoupon && (
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center justify-between">
                  <span>Cupom <strong>{appliedCoupon.code}</strong> aplicado!</span>
                  <span>- R$ {appliedCoupon.discount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}

              {/* Clube Puyol Points toggle */}
              {userPoints >= 500 && (
                <div className="p-3 bg-[#1c1a14] rounded-xl border border-[#c5a059]/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#e5c57e]" />
                    <div>
                      <span className="text-xs font-semibold text-white block">
                        Usar pontos do Clube Puyol ({userPoints} pts disponíveis)
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        Resgate {redeemablePoints} pontos por R$ {(redeemablePoints / 500 * 10).toFixed(2)} de desconto
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={usePoints}
                    onChange={e => setUsePoints(e.target.checked)}
                    className="w-5 h-5 accent-[#c5a059] rounded cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Total pricing calculation */}
            <div className="pt-3 border-t border-[#23232f] space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal do Serviço:</span>
                <span>R$ {basePrice.toFixed(2).replace('.', ',')}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Desconto de Cupom:</span>
                  <span>- R$ {couponDiscount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              {pointsDiscount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Desconto Clube Puyol:</span>
                  <span>- R$ {pointsDiscount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-[#23232f]">
                <span>Total a Pagar:</span>
                <span className="text-[#f3e3b7] text-lg">
                  R$ {finalPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(4)}
              className="px-5 py-2.5 rounded-xl bg-[#1c1c24] hover:bg-[#252532] text-zinc-300 text-sm flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
            <button
              onClick={() => setStep(6)}
              className="px-6 py-3 rounded-xl bg-[#c5a059] hover:bg-[#d6b36a] text-black font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#c5a059]/20"
            >
              <span>Continuar: Forma de Pagamento</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Pagamento */}
      {step === 6 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-brand font-bold text-white">
              Forma de Pagamento
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Total do atendimento: <span className="text-white font-bold">R$ {finalPrice.toFixed(2).replace('.', ',')}</span>
            </p>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setPaymentMethod('pix')}
              className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                paymentMethod === 'pix'
                  ? 'bg-emerald-950/40 border-emerald-500 text-white ring-2 ring-emerald-500/30'
                  : 'bg-[#14141c] border-[#292939] text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <QrCode className="w-6 h-6 text-emerald-400" />
              <span className="text-xs font-semibold">Pix Imediato</span>
            </button>

            <button
              onClick={() => setPaymentMethod('credit_card')}
              className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                paymentMethod === 'credit_card'
                  ? 'bg-amber-950/40 border-[#c5a059] text-white ring-2 ring-[#c5a059]/30'
                  : 'bg-[#14141c] border-[#292939] text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CreditCard className="w-6 h-6 text-[#c5a059]" />
              <span className="text-xs font-semibold">Cartão de Crédito</span>
            </button>

            <button
              onClick={() => setPaymentMethod('pay_at_shop')}
              className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                paymentMethod === 'pay_at_shop'
                  ? 'bg-blue-950/40 border-blue-500 text-white ring-2 ring-blue-500/30'
                  : 'bg-[#14141c] border-[#292939] text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Store className="w-6 h-6 text-blue-400" />
              <span className="text-xs font-semibold">No Estabelecimento</span>
            </button>
          </div>

          {/* Payment Method Details */}
          {paymentMethod === 'pix' && (
            <div className="p-5 bg-[#14141c] border border-emerald-800/40 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Chave Pix Copia e Cola</h3>
                  <p className="text-xs text-zinc-400">Pagamento instantâneo com aprovação imediata</p>
                </div>
              </div>

              {/* Fake QR code visualization */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#0d0d12] p-4 rounded-xl border border-[#23232f]">
                <div className="w-28 h-28 bg-white p-2 rounded-xl flex items-center justify-center">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=00020126580014BR.GOV.BCB.PIX0136barbeariapuyol@puyol.com.br5204000053039865802BR5925BARBEARIA+PUYOL6009SAO+PAULO"
                    alt="QR Code Pix"
                    className="w-full h-full"
                  />
                </div>
                <div className="flex-1 space-y-2 text-xs">
                  <p className="text-zinc-300">
                    Abra o app do seu banco e escaneie o código acima ou copie o código Pix abaixo:
                  </p>
                  <div className="flex items-center gap-2 bg-[#171722] p-2.5 rounded-lg border border-[#2b2b3a]">
                    <span className="truncate text-zinc-400 text-[11px] font-mono flex-1">
                      00020126580014BR.GOV.BCB.PIX0136barbeariapuyol@puyol.com.br520400005303986
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("00020126580014BR.GOV.BCB.PIX0136barbeariapuyol@puyol.com.br520400005303986");
                        setCopiedPix(true);
                        setTimeout(() => setCopiedPix(false), 2000);
                      }}
                      className="px-2.5 py-1 rounded bg-[#c5a059] text-black font-semibold text-[11px] flex items-center gap-1"
                    >
                      {copiedPix ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'credit_card' && (
            <div className="p-5 bg-[#14141c] border border-[#2b2b3a] rounded-2xl space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Número do Cartão</label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  className="w-full bg-[#1b1b26] border border-[#2f2f40] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#c5a059]"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Nome Impresso no Cartão</label>
                <input
                  type="text"
                  placeholder="Ex: LUCAS FERREIRA"
                  value={cardHolder}
                  onChange={e => setCardHolder(e.target.value.toUpperCase())}
                  className="w-full bg-[#1b1b26] border border-[#2f2f40] rounded-xl px-3 py-2.5 text-white uppercase focus:outline-none focus:border-[#c5a059]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Validade</label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                    className="w-full bg-[#1b1b26] border border-[#2f2f40] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="123"
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value)}
                    className="w-full bg-[#1b1b26] border border-[#2f2f40] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>
              <p className="text-[11px] text-zinc-500 pt-1">
                Transação 100% criptografada com certificado SSL seguro.
              </p>
            </div>
          )}

          {paymentMethod === 'pay_at_shop' && (
            <div className="p-5 bg-[#14141c] border border-blue-900/40 rounded-2xl text-xs space-y-2 text-zinc-300">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                <Store className="w-4 h-4" />
                <span>Pagar presencialmente na recepção</span>
              </div>
              <p>
                Seu horário ficará reservado com segurança. Ao chegar na Barbearia Puyol, você poderá efetuar o pagamento via Dinheiro, Cartão ou Pix na recepção com nossa equipe.
              </p>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(5)}
              className="px-5 py-2.5 rounded-xl bg-[#1c1c24] hover:bg-[#252532] text-zinc-300 text-sm flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
            <button
              disabled={isSubmitting}
              onClick={handleConfirmAndPay}
              className="px-7 py-3 rounded-xl bg-[#c5a059] hover:bg-[#d6b36a] text-black font-extrabold text-sm flex items-center gap-2 shadow-xl shadow-[#c5a059]/25 transition-all"
              id="finalize-booking-btn"
            >
              {isSubmitting ? (
                <span>Reservando seu horário...</span>
              ) : (
                <>
                  <span>Confirmar e Finalizar Agendamento</span>
                  <Check className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: AGENDAMENTO CONFIRMADO ✓ */}
      {step === 7 && createdAppointment && (
        <div className="space-y-6 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-500 text-black flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/40">
            <Check className="w-9 h-9 stroke-[3]" />
          </div>

          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#c5a059]">
              Sucesso Absoluto
            </span>
            <h2 className="text-2xl sm:text-3xl font-brand font-bold text-white mt-1">
              AGENDAMENTO CONFIRMADO ✓
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1">
              Seu horário está reservado com exclusividade na Barbearia Puyol.
            </p>
          </div>

          {/* Ticket Receipt Card */}
          <div className="max-w-md mx-auto p-6 rounded-2xl bg-[#13131b] border border-[#2d2d3d] text-left space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8a6828] via-[#c5a059] to-[#f3e3b7]" />

            <div className="flex items-center justify-between border-b border-[#23232f] pb-3">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest">Código da Reserva</span>
                <p className="font-mono text-xs font-bold text-[#f3e3b7]">#{createdAppointment.id.toUpperCase()}</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                Confirmado
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Serviço:</span>
                <span className="font-semibold text-white">{createdAppointment.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Barbeiro:</span>
                <span className="font-semibold text-white">{createdAppointment.barberName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Data:</span>
                <span className="font-semibold text-white">{createdAppointment.date.split('-').reverse().join('/')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Horário:</span>
                <span className="font-semibold text-white">{createdAppointment.startTime} às {createdAppointment.endTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Forma de Pagamento:</span>
                <span className="font-semibold text-white capitalize">
                  {createdAppointment.paymentMethod === 'pix' ? 'Pix' : createdAppointment.paymentMethod === 'credit_card' ? 'Cartão' : 'No Estabelecimento'}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-[#23232f]">
                <span className="text-white">Valor:</span>
                <span className="text-[#f3e3b7]">R$ {createdAppointment.finalPrice.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>

          {/* Action buttons (Google Calendar, Localização, WhatsApp, Ver Meus Agendamentos) */}
          <div className="max-w-md mx-auto grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleAddToCalendar}
              className="p-3 rounded-xl bg-[#1a1a24] hover:bg-[#252534] border border-[#2d2d3e] text-white text-xs font-semibold flex items-center justify-center gap-2"
            >
              <CalendarPlus className="w-4 h-4 text-[#c5a059]" />
              <span>Adicionar ao Calendário</span>
            </button>

            <button
              onClick={() => window.open(settings.googleMapsUrl, '_blank')}
              className="p-3 rounded-xl bg-[#1a1a24] hover:bg-[#252534] border border-[#2d2d3e] text-white text-xs font-semibold flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Abrir Localização</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="p-3 rounded-xl bg-[#1a1a24] hover:bg-[#252534] border border-[#2d2d3e] text-white text-xs font-semibold flex items-center justify-center gap-2 col-span-2 sm:col-span-1"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Falar no WhatsApp</span>
            </button>

            <button
              onClick={onViewAppointments}
              className="p-3 rounded-xl bg-[#c5a059] hover:bg-[#d8b56f] text-black text-xs font-bold flex items-center justify-center gap-2 col-span-2 sm:col-span-1 shadow-lg shadow-[#c5a059]/20"
            >
              <span>Ver Meus Horários</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
