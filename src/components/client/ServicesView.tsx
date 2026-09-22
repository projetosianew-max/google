import React, { useState } from 'react';
import { Scissors, Clock, Heart, Search, Sparkles } from 'lucide-react';
import { useBarbershop } from '../../context/BarbershopContext';

interface ServicesViewProps {
  onStartBooking: (serviceId?: string) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ onStartBooking }) => {
  const { services, currentUser, toggleFavoriteService } = useBarbershop();
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'todos', label: 'Todos os Serviços' },
    { id: 'combo', label: 'Combos Completos' },
    { id: 'cabelo', label: 'Cortes & Fade' },
    { id: 'barba', label: 'Barba & Toalha Quente' },
    { id: 'acabamento', label: 'Acabamento & Sobrancelha' },
    { id: 'tratamento', label: 'Tratamentos Capilares' },
  ];

  const filteredServices = services.filter(service => {
    if (!service.active) return false;
    const matchesCategory = selectedCategory === 'todos' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#c5a059]">
            Menu de Procedimentos
          </span>
          <h1 className="text-2xl sm:text-3xl font-brand font-bold text-white mt-0.5">
            Catálogo de Serviços Puyol
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Escolha seu corte ou ritual masculino com garantia de excelência.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar serviço..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#14141c] border border-[#2b2b3b] rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#c5a059]"
          />
        </div>
      </div>

      {/* Categories chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-[#c5a059] text-black shadow-md shadow-[#c5a059]/20'
                : 'bg-[#14141a] text-zinc-400 border border-[#242433] hover:text-white hover:bg-[#1a1a24]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.map(service => {
          const isFavorite = currentUser.favoriteServiceIds?.includes(service.id);

          return (
            <div
              key={service.id}
              className="rounded-2xl bg-[#121218] border border-[#242433] hover:border-[#38384f] overflow-hidden flex flex-col justify-between group transition-all"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121218] via-transparent to-transparent" />

                <button
                  onClick={() => toggleFavoriteService(service.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-sm text-white hover:text-red-400 transition-colors"
                  title="Favoritar serviço"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </button>

                {service.popular && (
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-[#c5a059] text-black text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 shadow">
                    <Sparkles className="w-3 h-3" />
                    <span>Destaque</span>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#c5a059]" />
                    {service.durationMinutes} min
                  </span>
                  <span className="text-base font-extrabold text-white bg-[#0e0e14]/90 px-3 py-1 rounded-lg border border-[#c5a059]/40">
                    R$ {service.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-base leading-snug">
                    {service.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <button
                  onClick={() => onStartBooking(service.id)}
                  className="mt-5 w-full py-3 rounded-xl bg-[#c5a059] hover:bg-[#d8b56f] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#c5a059]/20 transition-all"
                >
                  <Scissors className="w-4 h-4 transform -rotate-45" />
                  <span>AGENDAR ESTE SERVIÇO</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
