import React from 'react';
import { X, Bell, CheckCheck, Sparkles, Calendar, Tag, ShieldAlert } from 'lucide-react';
import { useBarbershop } from '../../context/BarbershopContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (url?: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useBarbershop();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-4 h-4 text-[#c5a059]" />;
      case 'loyalty':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'promo':
        return <Tag className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-sm bg-[#111116] border-l border-[#272733] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        id="notification-drawer"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#23232c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#c5a059]" />
            <h3 className="font-semibold text-white text-base">Notificações</h3>
            <span className="text-xs bg-[#242430] text-zinc-300 px-2 py-0.5 rounded-full font-medium">
              {notifications.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.read) && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-[#c5a059] hover:underline flex items-center gap-1"
                title="Marcar todas como lidas"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Ler todas</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-zinc-500">
              <Bell className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">Nenhuma notificação no momento.</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => {
                  markNotificationRead(notif.id);
                  if (notif.actionUrl && onSelectAction) {
                    onSelectAction(notif.actionUrl);
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  notif.read
                    ? 'bg-[#15151c]/60 border-[#23232c] text-zinc-400'
                    : 'bg-[#1a1a24] border-[#36364a] text-zinc-200 shadow-sm ring-1 ring-[#c5a059]/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${notif.read ? 'bg-black/30' : 'bg-[#c5a059]/15'}`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className={`text-xs font-semibold truncate ${notif.read ? 'text-zinc-300' : 'text-white'}`}>
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-[#c5a059] flex-shrink-0"></span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-zinc-500 mt-2 block">
                      {new Date(notif.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#23232c] bg-[#0d0d11] text-center text-xs text-zinc-500">
          Barbearia Puyol • Atualizações em tempo real
        </div>
      </div>
    </div>
  );
};
