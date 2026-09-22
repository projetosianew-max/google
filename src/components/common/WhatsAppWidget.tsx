import React, { useState } from 'react';
import { MessageSquare, X, Send, Scissors, Calendar, CreditCard, User, HelpCircle } from 'lucide-react';
import { useBarbershop } from '../../context/BarbershopContext';

export const WhatsAppWidget: React.FC = () => {
  const { settings, barbers } = useBarbershop();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('geral');
  const [selectedBarberId, setSelectedBarberId] = useState<string>(barbers[0]?.id || '');
  const [customNote, setCustomNote] = useState('');

  const topics = [
    {
      id: 'geral',
      title: 'Falar com Atendimento',
      desc: 'Dúvidas gerais e recepção',
      icon: <HelpCircle className="w-4 h-4 text-[#c5a059]" />,
      defaultMsg: 'Olá! Gostaria de falar com o atendimento da Barbearia Puyol do Corte Original.',
    },
    {
      id: 'servico',
      title: 'Dúvida sobre Serviço',
      desc: 'Cortes, barboterapia, combos',
      icon: <Scissors className="w-4 h-4 text-[#c5a059]" />,
      defaultMsg: 'Olá! Gostaria de tirar uma dúvida sobre os serviços e procedimentos da Barbearia Puyol.',
    },
    {
      id: 'agendamento',
      title: 'Dúvida sobre Agendamento',
      desc: 'Horários, encaixes ou remarcação',
      icon: <Calendar className="w-4 h-4 text-[#c5a059]" />,
      defaultMsg: 'Olá! Gostaria de informações sobre horários disponíveis e agendamentos na Barbearia Puyol.',
    },
    {
      id: 'pagamento',
      title: 'Dúvida sobre Pagamento',
      desc: 'Pix, cartões ou Clube Puyol',
      icon: <CreditCard className="w-4 h-4 text-[#c5a059]" />,
      defaultMsg: 'Olá! Tenho uma dúvida sobre as formas de pagamento e cupons da barbearia.',
    },
    {
      id: 'barbeiro',
      title: 'Falar com Barbeiro',
      desc: 'Conversar direto com seu profissional',
      icon: <User className="w-4 h-4 text-[#c5a059]" />,
      defaultMsg: 'Olá! Gostaria de falar com o barbeiro sobre meu estilo de corte.',
    },
  ];

  const handleSend = () => {
    const topic = topics.find(t => t.id === selectedTopic) || topics[0];
    let message = topic.defaultMsg;

    if (selectedTopic === 'barbeiro') {
      const barber = barbers.find(b => b.id === selectedBarberId);
      if (barber) {
        message = `Olá! Gostaria de falar diretamente com o barbeiro ${barber.name} (${barber.nickname || 'Puyol'}).`;
      }
    }

    if (customNote.trim()) {
      message += ` Detalhes adicionais: "${customNote.trim()}"`;
    }

    const cleanPhone = settings.whatsapp.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    setCustomNote('');
  };

  return (
    <>
      {/* Floating trigger button (visible on mobile and desktop) */}
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black shadow-2xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all group ring-4 ring-emerald-500/20"
          title="Falar no WhatsApp"
          id="floating-whatsapp-btn"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-black" />
          ) : (
            <>
              <MessageSquare className="w-6 h-6 text-black fill-current" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border border-white"></span>
              </span>
            </>
          )}
        </button>
      </div>

      {/* Modal / Popover */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-[#121218] border border-[#2b2b38] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            id="whatsapp-chat-modal"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-[#13221b] to-[#121218] p-4 border-b border-[#1e3427] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-black">
                  <MessageSquare className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm sm:text-base">
                    Barbearia Puyol • WhatsApp
                  </h3>
                  <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                    Atendimento Online Imediato
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <p className="text-zinc-300">
                Selecione o assunto da sua mensagem para direcionarmos ao profissional correto:
              </p>

              {/* Topics Grid */}
              <div className="space-y-2">
                {topics.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      selectedTopic === topic.id
                        ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
                        : 'bg-[#181822] border-[#292938] hover:border-[#3d3d52] text-zinc-300'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-black/40 mt-0.5">
                      {topic.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white flex items-center justify-between">
                        <span>{topic.title}</span>
                        {selectedTopic === topic.id && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">{topic.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Select barber if topic is 'barbeiro' */}
              {selectedTopic === 'barbeiro' && (
                <div className="p-3 bg-[#181822] rounded-xl border border-[#2b2b38] space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">
                    Escolha o Barbeiro:
                  </label>
                  <select
                    value={selectedBarberId}
                    onChange={e => setSelectedBarberId(e.target.value)}
                    className="w-full bg-[#0e0e13] border border-[#333344] text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    {barbers.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.nickname || 'Especialista'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Optional Custom note */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Mensagem ou observação (opcional):
                </label>
                <textarea
                  rows={2}
                  value={customNote}
                  onChange={e => setCustomNote(e.target.value)}
                  placeholder="Ex: Gostaria de saber se há vaga para hoje às 17h..."
                  className="w-full bg-[#181822] border border-[#2b2b38] rounded-xl p-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none resize-none"
                />
              </div>

              {/* Action button */}
              <button
                onClick={handleSend}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all"
                id="send-whatsapp-btn"
              >
                <Send className="w-4 h-4" />
                <span>Iniciar Conversa no WhatsApp</span>
              </button>

              <div className="text-center text-[11px] text-zinc-400">
                Número oficial: <span className="text-zinc-300">{settings.phone}</span> • Horário de resposta: 09h às 20h
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
