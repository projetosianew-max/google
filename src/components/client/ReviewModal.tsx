import React, { useState } from 'react';
import { X, Star, Send, CheckCircle2 } from 'lucide-react';
import { useBarbershop } from '../../context/BarbershopContext';
import { Appointment } from '../../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  appointment,
}) => {
  const { addReview } = useBarbershop();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addReview(appointment.id, rating, comment.trim());
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-[#121217] border border-[#2b2b3a] rounded-2xl shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200"
        id="review-modal"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#23232f]">
          <h3 className="font-brand font-bold text-lg text-white">
            Avaliar Atendimento
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Obrigado pela sua avaliação!</h4>
            <p className="text-xs text-zinc-400">
              Sua opinião ajuda a manter a excelência da Barbearia Puyol.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="pt-4 space-y-4">
            <div className="p-3 bg-[#181822] rounded-xl border border-[#272736] text-xs">
              <span className="text-zinc-400">Atendimento avaliado:</span>
              <p className="font-semibold text-white mt-0.5">{appointment.serviceName}</p>
              <p className="text-[#c5a059]">Barbeiro: {appointment.barberName}</p>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm font-semibold text-zinc-200">
                Como foi sua experiência?
              </p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (hoverRating || rating) >= star
                          ? 'fill-[#c5a059] text-[#c5a059]'
                          : 'text-zinc-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-medium text-zinc-300">
                Conte como foi seu atendimento (opcional):
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Ex: Corte impecável, acabamento muito preciso e ambiente nota 10..."
                className="w-full bg-[#181822] border border-[#2b2b38] rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#c5a059] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#c5a059] hover:bg-[#d6b36a] text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#c5a059]/20"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Avaliação</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
