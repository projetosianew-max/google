import React, { useState } from 'react';
import { Crown, Sparkles, Gift, Check, ArrowRight, Clock, Award, ShieldCheck } from 'lucide-react';
import { useBarbershop } from '../../context/BarbershopContext';
import { LoyaltyReward } from '../../types';

interface LoyaltyViewProps {
  onStartBooking: () => void;
}

export const LoyaltyView: React.FC<LoyaltyViewProps> = ({ onStartBooking }) => {
  const { 
    currentUser, 
    loyaltyTiers, 
    loyaltyRewards, 
    loyaltyTransactions, 
    redeemLoyaltyReward 
  } = useBarbershop();

  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const points = currentUser.loyaltyPoints || 0;
  const currentTier = loyaltyTiers.find(t => t.id === currentUser.loyaltyTier) || loyaltyTiers[0];

  // Calculate next reward or tier
  const nextTargetPoints = points < 500 ? 500 : points < 1000 ? 1000 : points < 1500 ? 1500 : 2000;
  const progressPercent = Math.min(100, Math.round((points / nextTargetPoints) * 100));

  const handleRedeem = (reward: LoyaltyReward) => {
    setRedeemError(null);
    setRedeemSuccess(null);

    const ok = redeemLoyaltyReward(reward.id);
    if (ok) {
      setRedeemSuccess(`Parabéns! Você resgatou "${reward.title}". Seu voucher exclusivo já está disponível na sua conta!`);
      setTimeout(() => setRedeemSuccess(null), 4000);
    } else {
      setRedeemError(`Saldo insuficiente. Você precisa de ${reward.pointsRequired} pontos para resgatar este benefício.`);
      setTimeout(() => setRedeemError(null), 3000);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Banner / Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#211a0c] via-[#1a140a] to-[#121217] border border-[#c5a059]/40 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 text-[#f3e3b7] text-xs font-bold uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Programa de Fidelidade Exclusivo</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-brand font-extrabold text-white">
              Clube Puyol
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-md">
              A cada corte ou serviço realizado, você acumula pontos reais para trocar por descontos, produtos e rituais gratuitos.
            </p>
          </div>

          {/* Points Balance Card */}
          <div className="p-5 rounded-2xl bg-[#0e0e13]/80 border border-[#c5a059]/40 text-center w-full sm:w-auto min-w-[200px] shadow-xl">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">
              Seu Saldo Atual
            </span>
            <div className="flex items-center justify-center gap-1.5 my-1">
              <Sparkles className="w-5 h-5 text-[#c5a059]" />
              <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                {points}
              </span>
              <span className="text-xs font-bold text-[#c5a059]">pts</span>
            </div>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#c5a059]/20 text-[#f3e3b7] border border-[#c5a059]/30">
              Categoria: {currentTier.name}
            </span>
          </div>
        </div>

        {/* Progress Bar to next reward */}
        <div className="mt-8 pt-6 border-t border-[#332714]/80 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-300">
              Progresso para próxima recompensa ({nextTargetPoints} pts):
            </span>
            <span className="font-bold text-[#f3e3b7]">
              {points} / {nextTargetPoints} pts ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-[#8a6828] via-[#c5a059] to-[#f3e3b7] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Alerts */}
      {redeemSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs sm:text-sm flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{redeemSuccess}</span>
        </div>
      )}

      {redeemError && (
        <div className="p-4 rounded-2xl bg-red-950/50 border border-red-800 text-red-300 text-xs sm:text-sm flex items-center gap-3">
          <span>{redeemError}</span>
        </div>
      )}

      {/* Rewards Catalog */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-brand font-bold text-white">
            Recompensas para Resgate
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Use seus pontos acumulados para desbloquear cortes, barbas e cosméticos Puyol.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loyaltyRewards.map(reward => {
            const reqPoints = reward.pointsRequired ?? (reward as any).pointsCost ?? 0;
            const canAfford = points >= reqPoints;

            return (
              <div
                key={reward.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  canAfford
                    ? 'bg-[#14141c] border-[#38384d] hover:border-[#c5a059]'
                    : 'bg-[#101015] border-[#22222d] opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      canAfford ? 'bg-[#c5a059]/20 text-[#f3e3b7]' : 'bg-[#1b1b24] text-zinc-500'
                    }`}>
                      <Gift className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">
                        {reward.title}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {reward.description}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-[#1c1c28] border border-[#2e2e42] text-xs font-mono font-bold text-[#f3e3b7] whitespace-nowrap">
                    {reqPoints} pts
                  </span>
                </div>

                <div className="mt-5 pt-3 border-t border-[#23232f] flex items-center justify-between">
                  <span className="text-xs text-zinc-400">
                    {canAfford ? '✓ Saldo suficiente disponível' : `Faltam ${reqPoints - points} pts`}
                  </span>

                  <button
                    disabled={!canAfford}
                    onClick={() => handleRedeem(reward)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      canAfford
                        ? 'bg-[#c5a059] hover:bg-[#d8b56f] text-black shadow-md shadow-[#c5a059]/20'
                        : 'bg-[#1d1d28] text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    Resgatar Recompensa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tier Benefits */}
      <div className="p-6 rounded-3xl bg-[#121218] border border-[#23232f] space-y-4">
        <h3 className="font-brand font-bold text-lg text-white">
          Categorias & Multiplicadores
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {loyaltyTiers.map(tier => {
            const isCurrent = tier.id === currentTier.id;

            return (
              <div
                key={tier.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-[#1a170f] border-[#c5a059] ring-1 ring-[#c5a059]/30'
                    : 'bg-[#16161f] border-[#252535]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-sm">{tier.name}</span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#c5a059] text-black">
                      Atual
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mb-2">A partir de {tier.minPoints} pontos</p>
                <ul className="text-xs space-y-1 text-zinc-300">
                  {(tier.perks ?? tier.benefits ?? []).map(perk => (
                    <li key={perk} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Points History */}
      <div className="p-6 rounded-3xl bg-[#121218] border border-[#23232f] space-y-4">
        <h3 className="font-brand font-bold text-lg text-white">
          Extrato de Pontuação
        </h3>

        <div className="divide-y divide-[#20202c]">
          {loyaltyTransactions.map(tx => (
            <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-white font-medium block">{tx.description}</span>
                <span className="text-zinc-500 text-[10px]">
                  {new Date(tx.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <span className={`font-mono font-bold text-sm ${
                tx.type === 'earned' ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {tx.type === 'earned' ? `+${tx.points}` : `-${tx.points}`} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
