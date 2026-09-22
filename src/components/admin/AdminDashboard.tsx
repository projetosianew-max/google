import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Scissors, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Percent, 
  Search, 
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Award,
  Crown
} from 'lucide-react';
import { useBarbershop } from '../../context/BarbershopContext';
import { ServiceItem, Barber, AppointmentStatus } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { 
    services, 
    barbers, 
    appointments, 
    allUsers, 
    settings, 
    addService, 
    updateService, 
    addBarber, 
    updateBarber, 
    bookAppointment,
    updateAppointmentStatus,
    cancelAppointment
  } = useBarbershop();

  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'appointments' | 'clients' | 'services' | 'barbers' | 'reports'>('overview');

  // Manual appointment modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualClientName, setManualClientName] = useState('');
  const [manualClientPhone, setManualClientPhone] = useState('');
  const [manualServiceId, setManualServiceId] = useState(services[0]?.id || '');
  const [manualBarberId, setManualBarberId] = useState(barbers[0]?.id || '');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualTime, setManualTime] = useState('14:00');

  // New/Edit Service Modal
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [servicePrice, setServicePrice] = useState(70);
  const [serviceDuration, setServiceDuration] = useState(40);
  const [serviceCategory, setServiceCategory] = useState<'cabelo' | 'barba' | 'combo' | 'acabamento' | 'tratamento'>('cabelo');
  const [serviceImage, setServiceImage] = useState('https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80');

  // New Barber Modal
  const [barberModalOpen, setBarberModalOpen] = useState(false);
  const [barberName, setBarberName] = useState('');
  const [barberNickname, setBarberNickname] = useState('');
  const [barberBio, setBarberBio] = useState('');
  const [barberStart, setBarberStart] = useState('09:00');
  const [barberEnd, setBarberEnd] = useState('19:00');
  const [barberCommission, setBarberCommission] = useState(0.50);
  const [barberAvatar, setBarberAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');

  // Search in tables
  const [searchAppointment, setSearchAppointment] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // KPI Calculations
  const totalRevenue = useMemo(() => {
    return appointments
      .filter(a => a.status === 'completed' || a.status === 'confirmed')
      .reduce((sum, a) => sum + a.finalPrice, 0);
  }, [appointments]);

  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled' || a.status === 'no_show').length;

  const averageTicket = useMemo(() => {
    const valid = appointments.filter(a => a.status === 'completed');
    if (valid.length === 0) return 85;
    return valid.reduce((sum, a) => sum + a.finalPrice, 0) / valid.length;
  }, [appointments]);

  // Handle manual booking submit
  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualClientName || !manualClientPhone) return;

    await bookAppointment({
      customerId: 'walkin_' + Date.now(),
      customerName: manualClientName,
      customerPhone: manualClientPhone,
      customerEmail: 'balcao@barbeariapuyol.com.br',
      barberId: manualBarberId,
      serviceId: manualServiceId,
      date: manualDate,
      startTime: manualTime,
      paymentMethod: 'pay_at_shop',
      notes: 'Agendamento manual criado pela recepção.',
    });

    setShowManualModal(false);
    setManualClientName('');
    setManualClientPhone('');
  };

  // Handle Service Save
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingServiceId) {
      updateService(editingServiceId, {
        name: serviceName,
        description: serviceDesc,
        price: Number(servicePrice),
        durationMinutes: Number(serviceDuration),
        category: serviceCategory,
        imageUrl: serviceImage,
      });
    } else {
      addService({
        name: serviceName,
        description: serviceDesc,
        price: Number(servicePrice),
        durationMinutes: Number(serviceDuration),
        category: serviceCategory,
        imageUrl: serviceImage,
        active: true,
      });
    }
    setServiceModalOpen(false);
    setEditingServiceId(null);
  };

  // Handle Barber Save
  const handleSaveBarber = (e: React.FormEvent) => {
    e.preventDefault();
    addBarber({
      name: barberName,
      nickname: barberNickname,
      bio: barberBio,
      avatarUrl: barberAvatar,
      specialties: ['Degradê Navalhado', 'Visagismo', 'Barboterapia'],
      workingDays: [1, 2, 3, 4, 5, 6],
      startTime: barberStart,
      endTime: barberEnd,
      lunchBreakStart: '12:00',
      lunchBreakEnd: '13:00',
      slotDurationMinutes: 30,
      commissionRate: Number(barberCommission),
      active: true,
      email: `${barberName.toLowerCase().replace(/\s+/g, '.')}@puyol.com.br`,
      phone: '(11) 99999-9999',
      rating: 5.0,
      reviewCount: 0,
      totalAppointments: 0,
    });
    setBarberModalOpen(false);
    setBarberName('');
  };

  return (
    <div className="space-y-6 pb-20" id="admin-panel">
      
      {/* Top Admin Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#17140f] via-[#121217] to-[#0c0c10] border border-[#c5a059]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#f3e3b7] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
            Administração Geral Puyol
          </span>
          <h1 className="text-xl sm:text-2xl font-brand font-bold text-white mt-0.5">
            Painel de Controle Estratégico
          </h1>
          <p className="text-xs text-zinc-400">
            Métricas executivas, gestão de escala, financeiro e agenda centralizada.
          </p>
        </div>

        <button
          onClick={() => setShowManualModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d8b56f] text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#c5a059]/20"
          id="manual-booking-btn"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Agendamento Manual (Balcão)</span>
        </button>
      </div>

      {/* Admin Subnav */}
      <div className="flex border-b border-[#242433] gap-2 overflow-x-auto pb-2 scrollbar-none text-xs sm:text-sm font-semibold">
        {[
          { id: 'overview', label: 'Dashboard Geral', icon: BarChart3 },
          { id: 'appointments', label: 'Agendamentos', icon: Calendar },
          { id: 'clients', label: 'Clientes & CRM', icon: Users },
          { id: 'services', label: 'Serviços & Preços', icon: Scissors },
          { id: 'barbers', label: 'Barbeiros & Escala', icon: Users },
          { id: 'reports', label: 'Relatórios & Inteligência', icon: TrendingUp },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeAdminTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveAdminTab(item.id as any)}
              className={`px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#c5a059] text-black shadow-md shadow-[#c5a059]/20'
                  : 'text-zinc-400 hover:text-white hover:bg-[#151520]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          {/* Executive Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#121218] border border-[#242433] space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>Faturamento Total</span>
                <DollarSign className="w-4 h-4 text-[#c5a059]" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-white block">
                R$ {totalRevenue.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">
                +14.8% em relação ao mês anterior
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#121218] border border-[#242433] space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>Total de Atendimentos</span>
                <Scissors className="w-4 h-4 text-[#c5a059]" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-white block">
                {appointments.length}
              </span>
              <span className="text-[11px] text-zinc-400">
                {confirmedCount} confirmados • {completedCount} concluídos
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#121218] border border-[#242433] space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>Ticket Médio</span>
                <TrendingUp className="w-4 h-4 text-[#c5a059]" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-[#f3e3b7] block">
                R$ {averageTicket.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">
                Alta adesão a combos e barboterapia
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#121218] border border-[#242433] space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>Taxa de Ocupação</span>
                <Percent className="w-4 h-4 text-[#c5a059]" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-white block">
                84.2%
              </span>
              <span className="text-[11px] text-zinc-400">
                Picos nos finais de semana
              </span>
            </div>
          </div>

          {/* Recent Appointments Preview */}
          <div className="p-6 rounded-3xl bg-[#121218] border border-[#242433] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-brand font-bold text-lg text-white">
                Últimas Atividades na Barbearia
              </h3>
              <button
                onClick={() => setActiveAdminTab('appointments')}
                className="text-xs text-[#c5a059] hover:underline"
              >
                Ver todos os agendamentos →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-[#181824] text-zinc-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Serviço</th>
                    <th className="p-3">Barbeiro</th>
                    <th className="p-3">Data / Hora</th>
                    <th className="p-3">Valor</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#20202c]">
                  {appointments.slice(0, 6).map(apt => (
                    <tr key={apt.id} className="hover:bg-[#161620]">
                      <td className="p-3 font-semibold text-white">{apt.customerName}</td>
                      <td className="p-3">{apt.serviceName}</td>
                      <td className="p-3 text-[#c5a059]">{apt.barberName}</td>
                      <td className="p-3 font-mono">{apt.date.split('-').reverse().join('/')} às {apt.startTime}</td>
                      <td className="p-3 font-bold text-white">R$ {apt.finalPrice.toFixed(2).replace('.', ',')}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          apt.status === 'confirmed' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800' :
                          apt.status === 'completed' ? 'bg-blue-950/60 text-blue-400 border border-blue-800' :
                          apt.status === 'in_progress' ? 'bg-amber-950/60 text-amber-400' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPOINTMENTS MANAGEMENT */}
      {activeAdminTab === 'appointments' && (
        <div className="p-6 rounded-3xl bg-[#121218] border border-[#242433] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-brand font-bold text-lg text-white">
              Gestão Central de Agendamentos
            </h3>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={searchAppointment}
                  onChange={e => setSearchAppointment(e.target.value)}
                  className="w-full bg-[#181824] border border-[#2d2d3e] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-[#181824] border border-[#2d2d3e] rounded-xl px-3 py-1.5 text-xs text-white"
              >
                <option value="all">Todos os Status</option>
                <option value="confirmed">Confirmados</option>
                <option value="in_progress">Em Andamento</option>
                <option value="completed">Concluídos</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#181824] text-zinc-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Serviço</th>
                  <th className="p-3">Barbeiro</th>
                  <th className="p-3">Data e Hora</th>
                  <th className="p-3">Pagamento</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#20202c]">
                {appointments
                  .filter(a => {
                    const matchesSearch = a.customerName.toLowerCase().includes(searchAppointment.toLowerCase()) ||
                                          a.id.toLowerCase().includes(searchAppointment.toLowerCase());
                    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
                    return matchesSearch && matchesStatus;
                  })
                  .map(apt => (
                    <tr key={apt.id} className="hover:bg-[#161620]">
                      <td className="p-3 font-mono text-zinc-400 uppercase">#{apt.id.slice(0, 6)}</td>
                      <td className="p-3">
                        <span className="font-semibold text-white block">{apt.customerName}</span>
                        <span className="text-[11px] text-zinc-500">{apt.customerPhone}</span>
                      </td>
                      <td className="p-3">{apt.serviceName}</td>
                      <td className="p-3 text-[#c5a059]">{apt.barberName}</td>
                      <td className="p-3 font-mono">
                        {apt.date.split('-').reverse().join('/')} às {apt.startTime}
                      </td>
                      <td className="p-3 capitalize">{apt.paymentMethod === 'pix' ? 'Pix' : apt.paymentMethod === 'credit_card' ? 'Cartão' : 'No Local'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          apt.status === 'confirmed' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800' :
                          apt.status === 'completed' ? 'bg-blue-950/60 text-blue-400 border border-blue-800' :
                          apt.status === 'in_progress' ? 'bg-amber-950/60 text-amber-400' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        {apt.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold"
                            >
                              Concluir
                            </button>
                            <button
                              onClick={() => cancelAppointment(apt.id, 'Cancelado pelo administrador')}
                              className="px-2 py-1 rounded bg-red-950/60 text-red-300 hover:bg-red-900 border border-red-800 text-[11px]"
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                        {apt.status === 'completed' && (
                          <span className="text-[11px] text-zinc-500">Encerrado</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CLIENTS & CRM */}
      {activeAdminTab === 'clients' && (
        <div className="p-6 rounded-3xl bg-[#121218] border border-[#242433] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-brand font-bold text-lg text-white">
              Gestão de Clientes & Clube Puyol
            </h3>
            <span className="text-xs text-zinc-400">{allUsers.length} clientes registrados</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#181824] text-zinc-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Nome</th>
                  <th className="p-3">Contato</th>
                  <th className="p-3">Pontos Clube Puyol</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Ação Direta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#20202c]">
                {allUsers.map(user => (
                  <tr key={user.id} className="hover:bg-[#161620]">
                    <td className="p-3 font-semibold text-white">{user.name}</td>
                    <td className="p-3">
                      <div>{user.email}</div>
                      <div className="text-zinc-500">{user.phone}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-[#f3e3b7]">
                      {user.loyaltyPoints || 0} pts
                    </td>
                    <td className="p-3 uppercase text-[11px] font-bold text-emerald-400">
                      {user.loyaltyTier || 'bronze'}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          const cleanPhone = user.phone.replace(/\D/g, '');
                          window.open(`https://wa.me/55${cleanPhone}?text=Ol%C3%A1+${encodeURIComponent(user.name)}!+Como+est%C3%A1+seu+corte+na+Barbearia+Puyol?`, '_blank');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950/50 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chamar WhatsApp</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SERVICES MANAGEMENT */}
      {activeAdminTab === 'services' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-brand font-bold text-lg text-white">
              Catálogo de Serviços da Barbearia
            </h3>
            <button
              onClick={() => {
                setEditingServiceId(null);
                setServiceName('');
                setServiceDesc('');
                setServicePrice(70);
                setServiceDuration(40);
                setServiceModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#c5a059] text-black font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Serviço</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(srv => (
              <div
                key={srv.id}
                className="p-5 rounded-2xl bg-[#121218] border border-[#242433] flex flex-col justify-between space-y-3"
              >
                <div className="flex gap-3">
                  <img
                    src={srv.imageUrl}
                    alt={srv.name}
                    className="w-16 h-16 rounded-xl object-cover ring-1 ring-white/10"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm">{srv.name}</h4>
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">{srv.description}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#23232f] flex items-center justify-between text-xs">
                  <span className="text-zinc-400">{srv.durationMinutes} minutos</span>
                  <span className="text-base font-bold text-white">R$ {srv.price.toFixed(2).replace('.', ',')}</span>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingServiceId(srv.id);
                      setServiceName(srv.name);
                      setServiceDesc(srv.description);
                      setServicePrice(srv.price);
                      setServiceDuration(srv.durationMinutes);
                      setServiceCategory(srv.category);
                      setServiceImage(srv.imageUrl);
                      setServiceModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#1a1a26] text-zinc-300 hover:text-white text-xs flex items-center gap-1 border border-[#2d2d3e]"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => updateService(srv.id, { active: !srv.active })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      srv.active ? 'bg-amber-950/40 text-amber-300 border border-amber-800/40' : 'bg-emerald-950/40 text-emerald-300'
                    }`}
                  >
                    {srv.active ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: BARBERS MANAGEMENT */}
      {activeAdminTab === 'barbers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-brand font-bold text-lg text-white">
              Corpo de Barbeiros & Escalas de Atendimento
            </h3>
            <button
              onClick={() => setBarberModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#c5a059] text-black font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Barbeiro</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {barbers.map(b => (
              <div
                key={b.id}
                className="p-5 rounded-2xl bg-[#121218] border border-[#242433] space-y-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={b.avatarUrl}
                    alt={b.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#c5a059]/40"
                  />
                  <div>
                    <h4 className="font-bold text-white text-base">{b.name}</h4>
                    <p className="text-xs text-[#c5a059]">{b.nickname || 'Especialista'}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{b.totalAppointments}+ cortes realizados</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-[#171722] rounded-xl border border-[#262638]">
                    <span className="text-zinc-500 block text-[10px]">Horário de Trabalho:</span>
                    <span className="font-semibold text-white">{b.startTime} às {b.endTime}</span>
                  </div>
                  <div className="p-2.5 bg-[#171722] rounded-xl border border-[#262638]">
                    <span className="text-zinc-500 block text-[10px]">Comissão Contratada:</span>
                    <span className="font-semibold text-[#f3e3b7]">{(b.commissionRate * 100).toFixed(0)}% do serviço</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Status: {b.active ? '🟢 Em atividade' : '🔴 Inativo'}</span>
                  <button
                    onClick={() => updateBarber(b.id, { active: !b.active })}
                    className="text-xs text-[#c5a059] hover:underline font-semibold"
                  >
                    {b.active ? 'Suspender Escala' : 'Reativar Barbeiro'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: REPORTS */}
      {activeAdminTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Services */}
            <div className="p-6 rounded-3xl bg-[#121218] border border-[#242433] space-y-4">
              <h4 className="font-brand font-bold text-white text-base flex items-center gap-2">
                <Scissors className="w-4 h-4 text-[#c5a059]" />
                Serviços Mais Vendidos
              </h4>
              <div className="space-y-3">
                {services.slice(0, 4).map((srv, idx) => (
                  <div key={srv.id} className="flex items-center justify-between text-xs p-3 bg-[#171722] rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-[#f3e3b7] font-mono">{idx + 1}º</span>
                      <span className="font-semibold text-white">{srv.name}</span>
                    </div>
                    <span className="font-bold text-white">R$ {srv.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Barbers */}
            <div className="p-6 rounded-3xl bg-[#121218] border border-[#242433] space-y-4">
              <h4 className="font-brand font-bold text-white text-base flex items-center gap-2">
                <Award className="w-4 h-4 text-[#c5a059]" />
                Desempenho dos Profissionais
              </h4>
              <div className="space-y-3">
                {barbers.map(barber => (
                  <div key={barber.id} className="flex items-center justify-between text-xs p-3 bg-[#171722] rounded-xl">
                    <div className="flex items-center gap-3">
                      <img src={barber.avatarUrl} alt={barber.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <span className="font-semibold text-white block">{barber.name}</span>
                        <span className="text-[10px] text-[#c5a059]">{barber.rating.toFixed(2)} ★</span>
                      </div>
                    </div>
                    <span className="font-bold text-white">{barber.totalAppointments} atendimentos</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL WALK-IN BOOKING MODAL */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#121217] border border-[#2f2f42] rounded-2xl p-6 space-y-4">
            <h3 className="font-brand font-bold text-lg text-white">Agendamento Manual / Balcão</h3>
            <form onSubmit={handleCreateManualBooking} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-300 block mb-1">Nome do Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pedro Alvares"
                  value={manualClientName}
                  onChange={e => setManualClientName(e.target.value)}
                  className="w-full bg-[#181822] border border-[#2c2c3e] rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-zinc-300 block mb-1">Telefone / WhatsApp</label>
                <input
                  type="tel"
                  required
                  placeholder="(11) 99999-9999"
                  value={manualClientPhone}
                  onChange={e => setManualClientPhone(e.target.value)}
                  className="w-full bg-[#181822] border border-[#2c2c3e] rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-300 block mb-1">Serviço</label>
                  <select
                    value={manualServiceId}
                    onChange={e => setManualServiceId(e.target.value)}
                    className="w-full bg-[#181822] border border-[#2c2c3e] rounded-xl p-2.5 text-white"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - R${s.price}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-zinc-300 block mb-1">Barbeiro</label>
                  <select
                    value={manualBarberId}
                    onChange={e => setManualBarberId(e.target.value)}
                    className="w-full bg-[#181822] border border-[#2c2c3e] rounded-xl p-2.5 text-white"
                  >
                    {barbers.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-300 block mb-1">Data</label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={e => setManualDate(e.target.value)}
                    className="w-full bg-[#181822] border border-[#2c2c3e] rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 block mb-1">Horário</label>
                  <input
                    type="time"
                    value={manualTime}
                    onChange={e => setManualTime(e.target.value)}
                    className="w-full bg-[#181822] border border-[#2c2c3e] rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1c1c26] text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#c5a059] text-black font-bold"
                >
                  Confirmar Reserva Balcão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SERVICE EDIT/CREATE MODAL */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#121217] border border-[#2f2f42] rounded-2xl p-6 space-y-4">
            <h3 className="font-brand font-bold text-lg text-white">
              {editingServiceId ? 'Editar Serviço' : 'Novo Serviço Puyol'}
            </h3>
            <form onSubmit={handleSaveService} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-300 block mb-1">Nome do Procedimento</label>
                <input
                  type="text"
                  required
                  value={serviceName}
                  onChange={e => setServiceName(e.target.value)}
                  className="w-full bg-[#181822] border border-[#2c2c3e] rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-zinc-300 block mb-1">Descrição</label>
                <textarea
                  rows={2}
                  required
                  value={serviceDesc}
                  onChange={e => setServiceDesc(e.target.value)}
                  className="w-full bg-[#181822] border border-[#2c2c3e] rounded-xl p-2.5 text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-300 block mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={servicePrice}
                    onChange={e => setServicePrice(Number(e.target.value))}
                    className="w-full bg-[#181822] border border-[#2c2c3e] rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 block mb-1">Duração (minutos)</label>
                  <input
                    type="number"
                    required
                    value={serviceDuration}
                    onChange={e => setServiceDuration(Number(e.target.value))}
                    className="w-full bg-[#181822] border border-[#2c2c3e] rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-300 block mb-1">URL da Imagem</label>
                <input
                  type="text"
                  required
                  value={serviceImage}
                  onChange={e => setServiceImage(e.target.value)}
                  className="w-full bg-[#181822] border border-[#2c2c3e] rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1c1c26] text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#c5a059] text-black font-bold"
                >
                  Salvar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BARBER CREATE MODAL */}
      {barberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#121217] border border-[#2f2f42] rounded-2xl p-6 space-y-4">
            <h3 className="font-brand font-bold text-lg text-white">
              Cadastrar Novo Barbeiro
            </h3>
            <form onSubmit={handleSaveBarber} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-300 block mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={barberName}
                  onChange={e => setBarberName(e.target.value)}
                  className="w-full bg-[#181822] border border-[#2c2c3e] rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-zinc-300 block mb-1">Apelido Profissional</label>
                <input
                  type="text"
                  value={barberNickname}
                  onChange={e => setBarberNickname(e.target.value)}
                  placeholder="Ex: Mestre Navalha"
                  className="w-full bg-[#181822] border border-[#2c2c3e] rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-zinc-300 block mb-1">Mini Bio</label>
                <textarea
                  rows={2}
                  value={barberBio}
                  onChange={e => setBarberBio(e.target.value)}
                  placeholder="Especialista em visagismo e barba desenhada..."
                  className="w-full bg-[#181822] border border-[#2c2c3e] rounded-xl p-2.5 text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-300 block mb-1">Início da Jornada</label>
                  <input
                    type="time"
                    value={barberStart}
                    onChange={e => setBarberStart(e.target.value)}
                    className="w-full bg-[#181822] border border-[#2c2c3e] rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 block mb-1">Término da Jornada</label>
                  <input
                    type="time"
                    value={barberEnd}
                    onChange={e => setBarberEnd(e.target.value)}
                    className="w-full bg-[#181822] border border-[#2c2c3e] rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-300 block mb-1">Comissão (0.50 = 50%)</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={barberCommission}
                  onChange={e => setBarberCommission(Number(e.target.value))}
                  className="w-full bg-[#181822] border border-[#2c2c3e] rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-zinc-300 block mb-1">Foto de Perfil URL</label>
                <input
                  type="text"
                  value={barberAvatar}
                  onChange={e => setBarberAvatar(e.target.value)}
                  className="w-full bg-[#181822] border border-[#2c2c3e] rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBarberModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1c1c26] text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#c5a059] text-black font-bold"
                >
                  Cadastrar Barbeiro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
