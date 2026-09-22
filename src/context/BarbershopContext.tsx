import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { 
  User, 
  Barber, 
  ServiceItem, 
  Appointment, 
  Review, 
  LoyaltyReward, 
  LoyaltyTierConfig, 
  LoyaltyTransaction,
  Coupon, 
  BlockedTime, 
  HaircutHistoryItem, 
  BarbershopSettings, 
  AppNotification, 
  UserRole, 
  AppointmentStatus,
  PaymentMethod,
  LoyaltyTierLevel
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_USERS,
  INITIAL_BARBERS,
  INITIAL_SERVICES,
  INITIAL_LOYALTY_TIERS,
  INITIAL_LOYALTY_REWARDS,
  INITIAL_COUPONS,
  INITIAL_APPOINTMENTS,
  INITIAL_REVIEWS,
  INITIAL_HAIRCUT_HISTORY,
  INITIAL_NOTIFICATIONS
} from '../data/initialData';

interface BookAppointmentParams {
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  barberId: string;
  serviceId: string;
  date: string;
  startTime: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  pointsToRedeem?: number;
  notes?: string;
}

interface BarbershopContextType {
  currentUser: User;
  currentRole: UserRole;
  switchUserRole: (role: UserRole) => void;
  users: User[];
  allUsers: User[];
  barbers: Barber[];
  services: ServiceItem[];
  appointments: Appointment[];
  reviews: Review[];
  loyaltyRewards: LoyaltyReward[];
  loyaltyTiers: LoyaltyTierConfig[];
  loyaltyTransactions: LoyaltyTransaction[];
  coupons: Coupon[];
  blockedTimes: BlockedTime[];
  haircutHistory: HaircutHistoryItem[];
  notifications: AppNotification[];
  settings: BarbershopSettings;
  
  // Methods
  getAvailableSlots: (barberId: string, date: string, serviceDurationMinutes: number) => { time: string; barberId: string; barberName: string }[];
  bookAppointment: (params: BookAppointmentParams) => Promise<Appointment>;
  repeatAppointment: (appointmentId: string, newDate: string, newTime: string, newBarberId?: string) => Promise<Appointment>;
  cancelAppointment: (appointmentId: string, reason?: string) => void;
  rescheduleAppointment: (appointmentId: string, newDate: string, newTime: string) => void;
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => void;
  addReview: (appointmentId: string, rating: number, comment: string) => void;
  toggleFavoriteBarber: (barberId: string) => void;
  toggleFavoriteService: (serviceId: string) => void;
  applyCoupon: (code: string, servicePrice: number) => { valid: boolean; discount: number; message: string; coupon?: Coupon };
  redeemLoyaltyReward: (rewardId: string) => boolean;
  addStylePhoto: (data: { photoUrl: string; notes: string; serviceName: string; barberName: string; date: string }) => void;
  addHaircutHistoryItem: (item: any) => void;
  addBlockedTime: (blocked: Omit<BlockedTime, 'id'>) => void;
  removeBlockedTime: (id: string) => void;
  updateBarberAvailability: (barberId: string, data: Partial<Barber>) => void;
  addService: (service: Omit<ServiceItem, 'id'>) => void;
  updateService: (id: string, service: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;
  addBarber: (barber: Omit<Barber, 'id'>) => void;
  updateBarber: (id: string, barber: Partial<Barber>) => void;
  addCoupon: (coupon: Omit<Coupon, 'id' | 'currentUses'>) => void;
  updateCoupon: (id: string, coupon: Partial<Coupon>) => void;
  updateSettings: (newSettings: Partial<BarbershopSettings>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  login: (email: string, role?: UserRole) => boolean;
  signup: (name: string, email: string, phone: string, role?: UserRole) => boolean;
  logout: () => void;
}

const STORAGE_PREFIX = 'puyol_barbershop_';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error('Error loading from storage', e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving to storage', e);
  }
}

const BarbershopContext = createContext<BarbershopContextType | undefined>(undefined);

export const BarbershopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('users', INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = loadFromStorage<User | null>('currentUser', null);
    return saved || users[0];
  });
  const [barbers, setBarbers] = useState<Barber[]>(() => loadFromStorage('barbers', INITIAL_BARBERS));
  const [services, setServices] = useState<ServiceItem[]>(() => loadFromStorage('services', INITIAL_SERVICES));
  const [appointments, setAppointments] = useState<Appointment[]>(() => loadFromStorage('appointments', INITIAL_APPOINTMENTS));
  const [reviews, setReviews] = useState<Review[]>(() => loadFromStorage('reviews', INITIAL_REVIEWS));
  const [loyaltyRewards] = useState<LoyaltyReward[]>(() => loadFromStorage('loyaltyRewards', INITIAL_LOYALTY_REWARDS));
  const [loyaltyTiers] = useState<LoyaltyTierConfig[]>(() => loadFromStorage('loyaltyTiers', INITIAL_LOYALTY_TIERS));
  const [coupons, setCoupons] = useState<Coupon[]>(() => loadFromStorage('coupons', INITIAL_COUPONS));
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>(() => loadFromStorage('blockedTimes', []));
  const [haircutHistory, setHaircutHistory] = useState<HaircutHistoryItem[]>(() => loadFromStorage('haircutHistory', INITIAL_HAIRCUT_HISTORY));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadFromStorage('notifications', INITIAL_NOTIFICATIONS));
  const [settings, setSettings] = useState<BarbershopSettings>(() => {
    const loaded = loadFromStorage('settings', INITIAL_SETTINGS);
    return {
      ...loaded,
      cancelMinNoticeHours: loaded.cancelMinNoticeHours ?? loaded.minCancellationNoticeHours ?? 2,
    };
  });

  const INITIAL_LOYALTY_TRANSACTIONS: LoyaltyTransaction[] = [
    {
      id: 'tx_1',
      userId: 'user_client_1',
      points: 150,
      type: 'earned',
      description: 'Pontos ganhos no agendamento #apt_demo_1',
      createdAt: '2026-03-20T10:00:00Z',
    },
    {
      id: 'tx_2',
      userId: 'user_client_1',
      points: 200,
      type: 'earned',
      description: 'Pontos ganhos no agendamento #apt_demo_2',
      createdAt: '2026-03-10T15:30:00Z',
    },
    {
      id: 'tx_3',
      userId: 'user_client_1',
      points: 400,
      type: 'earned',
      description: 'Bônus de boas-vindas ao Clube Puyol',
      createdAt: '2026-03-01T09:00:00Z',
    },
  ];

  const [loyaltyTransactions, setLoyaltyTransactions] = useState<LoyaltyTransaction[]>(() =>
    loadFromStorage('loyaltyTransactions', INITIAL_LOYALTY_TRANSACTIONS)
  );

  // Sync to local storage
  useEffect(() => saveToStorage('users', users), [users]);
  useEffect(() => saveToStorage('currentUser', currentUser), [currentUser]);
  useEffect(() => saveToStorage('barbers', barbers), [barbers]);
  useEffect(() => saveToStorage('services', services), [services]);
  useEffect(() => saveToStorage('appointments', appointments), [appointments]);
  useEffect(() => saveToStorage('reviews', reviews), [reviews]);
  useEffect(() => saveToStorage('coupons', coupons), [coupons]);
  useEffect(() => saveToStorage('blockedTimes', blockedTimes), [blockedTimes]);
  useEffect(() => saveToStorage('haircutHistory', haircutHistory), [haircutHistory]);
  useEffect(() => saveToStorage('notifications', notifications), [notifications]);
  useEffect(() => saveToStorage('settings', settings), [settings]);
  useEffect(() => saveToStorage('loyaltyTransactions', loyaltyTransactions), [loyaltyTransactions]);

  // Current active role
  const currentRole = currentUser.role;

  // Switch demo user by role
  const switchUserRole = (role: UserRole) => {
    const targetUser = users.find(u => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
    } else {
      // Create user for this role if not found
      const newUser: User = {
        id: `user_${role}_${Date.now()}`,
        name: role === 'admin' ? 'Carlos Puyol' : role === 'barber' ? 'Mestre João' : 'Cliente Visitante',
        email: `${role}@puyol.com.br`,
        phone: '(11) 99999-8888',
        role,
        createdAt: new Date().toISOString(),
        loyaltyPoints: role === 'client' ? 750 : undefined,
        loyaltyTier: role === 'client' ? 'Gold' : undefined,
      };
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
    }
  };

  // Helper to parse "HH:mm" into minutes from midnight
  const timeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Helper to convert minutes from midnight to "HH:mm"
  const minutesToTime = (totalMinutes: number): string => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // Calculate real-time available time slots
  const getAvailableSlots = (barberId: string, date: string, serviceDurationMinutes: number) => {
    // Determine which barbers to check
    const targetBarbers = barberId === 'any' 
      ? barbers.filter(b => b.active)
      : barbers.filter(b => b.id === barberId && b.active);

    if (targetBarbers.length === 0) return [];

    // Parse date day of week (0 = Sunday, 1 = Monday, etc.)
    // Note: using explicit date components to avoid timezone offset shifts
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();

    const availableSlotsMap: Map<string, { time: string; barberId: string; barberName: string }> = new Map();

    targetBarbers.forEach(barber => {
      // Check if barber works on this day
      if (!barber.workingDays.includes(dayOfWeek)) {
        return;
      }

      const barberStartMin = timeToMinutes(barber.startTime);
      const barberEndMin = timeToMinutes(barber.endTime);
      const lunchStartMin = barber.lunchBreakStart ? timeToMinutes(barber.lunchBreakStart) : null;
      const lunchEndMin = barber.lunchBreakEnd ? timeToMinutes(barber.lunchBreakEnd) : null;

      // Existing active appointments for this barber on this date
      const barberAppointments = appointments.filter(
        a => a.barberId === barber.id && a.date === date && a.status !== 'cancelled'
      );

      // Blocked times for this barber or all
      const barberBlocked = blockedTimes.filter(
        b => (b.barberId === barber.id || b.barberId === 'all') && b.date === date
      );

      // Interval step: 30 minutes
      const step = 30;

      for (let timeMin = barberStartMin; timeMin + serviceDurationMinutes <= barberEndMin; timeMin += step) {
        const slotEndMin = timeMin + serviceDurationMinutes;

        // Check lunch overlap
        if (lunchStartMin !== null && lunchEndMin !== null) {
          // If slot overlaps with lunch break
          if (timeMin < lunchEndMin && slotEndMin > lunchStartMin) {
            continue;
          }
        }

        // Check appointment overlaps
        const hasAppointmentConflict = barberAppointments.some(apt => {
          const aptStart = timeToMinutes(apt.startTime);
          const aptEnd = timeToMinutes(apt.endTime);
          return timeMin < aptEnd && slotEndMin > aptStart;
        });

        if (hasAppointmentConflict) {
          continue;
        }

        // Check blocked time conflicts
        const hasBlockedConflict = barberBlocked.some(blk => {
          const blkStart = timeToMinutes(blk.startTime);
          const blkEnd = timeToMinutes(blk.endTime);
          return timeMin < blkEnd && slotEndMin > blkStart;
        });

        if (hasBlockedConflict) {
          continue;
        }

        const slotTimeStr = minutesToTime(timeMin);
        
        // In case multiple barbers have this slot, keep one or if target is specific, set it
        if (!availableSlotsMap.has(slotTimeStr)) {
          availableSlotsMap.set(slotTimeStr, {
            time: slotTimeStr,
            barberId: barber.id,
            barberName: barber.name,
          });
        }
      }
    });

    return Array.from(availableSlotsMap.values()).sort((a, b) => 
      timeToMinutes(a.time) - timeToMinutes(b.time)
    );
  };

  // Coupon validation
  const applyCoupon = (code: string, servicePrice: number) => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === cleanCode && c.active);
    
    if (!found) {
      return { valid: false, discount: 0, message: 'Cupom inválido ou expirado.' };
    }

    if (found.maxUses && found.currentUses >= found.maxUses) {
      return { valid: false, discount: 0, message: 'Este cupom atingiu o limite de usos.' };
    }

    if (found.minOrderValue && servicePrice < found.minOrderValue) {
      return { 
        valid: false, 
        discount: 0, 
        message: `Válido apenas para valores acima de R$ ${found.minOrderValue.toFixed(2)}.` 
      };
    }

    let discount = 0;
    if (found.type === 'percent') {
      discount = (servicePrice * found.value) / 100;
    } else {
      discount = Math.min(servicePrice, found.value);
    }

    return {
      valid: true,
      discount: Math.round(discount * 100) / 100,
      message: `Cupom ${found.code} aplicado com sucesso!`,
      coupon: found,
    };
  };

  // Book appointment
  const bookAppointment = async (params: BookAppointmentParams): Promise<Appointment> => {
    const service = services.find(s => s.id === params.serviceId);
    if (!service) throw new Error('Serviço não encontrado');

    // If barberId is 'any', pick the first available barber for this slot
    let actualBarberId = params.barberId;
    if (actualBarberId === 'any') {
      const slots = getAvailableSlots('any', params.date, service.durationMinutes);
      const matchingSlot = slots.find(s => s.time === params.startTime);
      if (matchingSlot) {
        actualBarberId = matchingSlot.barberId;
      } else {
        actualBarberId = barbers[0].id;
      }
    }

    const barber = barbers.find(b => b.id === actualBarberId) || barbers[0];

    // Calculate end time
    const startMin = timeToMinutes(params.startTime);
    const endMin = startMin + service.durationMinutes;
    const endTime = minutesToTime(endMin);

    // Calculate discounts
    let discount = 0;
    let couponUsed: Coupon | undefined;

    if (params.couponCode) {
      const couponRes = applyCoupon(params.couponCode, service.price);
      if (couponRes.valid) {
        discount += couponRes.discount;
        couponUsed = couponRes.coupon;
      }
    }

    // Points discount (e.g., 500 points = R$ 10)
    let pointsUsed = 0;
    if (params.pointsToRedeem && params.pointsToRedeem > 0) {
      const pointsDiscount = (params.pointsToRedeem / 500) * 10;
      discount += pointsDiscount;
      pointsUsed = params.pointsToRedeem;
    }

    const finalPrice = Math.max(0, service.price - discount);

    const newAppointment: Appointment = {
      id: `apt_${Date.now()}`,
      customerId: params.customerId || currentUser.id,
      customerName: params.customerName || currentUser.name,
      customerPhone: params.customerPhone || currentUser.phone,
      customerEmail: params.customerEmail || currentUser.email,
      barberId: barber.id,
      barberName: barber.name,
      serviceId: service.id,
      serviceName: service.name,
      serviceDuration: service.durationMinutes,
      servicePrice: service.price,
      date: params.date,
      startTime: params.startTime,
      endTime,
      status: 'confirmed',
      paymentMethod: params.paymentMethod,
      paymentStatus: params.paymentMethod === 'pay_at_shop' ? 'pending' : 'approved',
      discountApplied: discount > 0 ? discount : undefined,
      couponCode: params.couponCode,
      pointsUsed: pointsUsed > 0 ? pointsUsed : undefined,
      finalPrice,
      notes: params.notes,
      createdAt: new Date().toISOString(),
    };

    setAppointments(prev => [newAppointment, ...prev]);

    // Update coupon usages
    if (couponUsed) {
      setCoupons(prev => prev.map(c => c.id === couponUsed!.id ? { ...c, currentUses: c.currentUses + 1 } : c));
    }

    // Deduct points from user if redeemed
    if (pointsUsed > 0) {
      setUsers(prev => prev.map(u => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            loyaltyPoints: Math.max(0, (u.loyaltyPoints || 0) - pointsUsed),
          };
        }
        return u;
      }));
      setCurrentUser(prev => ({
        ...prev,
        loyaltyPoints: Math.max(0, (prev.loyaltyPoints || 0) - pointsUsed),
      }));
    }

    // Notification
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      title: 'Agendamento Confirmado! ✓',
      message: `Seu horário para ${service.name} com ${barber.name} está confirmado para ${params.date.split('-').reverse().join('/')} às ${params.startTime}.`,
      type: 'appointment',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);

    return newAppointment;
  };

  // Repeat previous appointment
  const repeatAppointment = async (
    appointmentId: string, 
    newDate: string, 
    newTime: string,
    newBarberId?: string
  ): Promise<Appointment> => {
    const past = appointments.find(a => a.id === appointmentId);
    if (!past) throw new Error('Agendamento não encontrado');

    return bookAppointment({
      customerId: past.customerId,
      customerName: past.customerName,
      customerPhone: past.customerPhone,
      customerEmail: past.customerEmail,
      barberId: newBarberId || past.barberId,
      serviceId: past.serviceId,
      date: newDate,
      startTime: newTime,
      paymentMethod: past.paymentMethod,
      notes: 'Repetição de corte anterior',
    });
  };

  // Cancel appointment
  const cancelAppointment = (appointmentId: string, reason?: string) => {
    setAppointments(prev => prev.map(a => {
      if (a.id === appointmentId) {
        return {
          ...a,
          status: 'cancelled',
          notes: reason ? `${a.notes ? a.notes + ' | ' : ''}Cancelado: ${reason}` : a.notes,
        };
      }
      return a;
    }));

    const apt = appointments.find(a => a.id === appointmentId);
    if (apt) {
      const cancelNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        userId: apt.customerId,
        title: 'Agendamento Cancelado',
        message: `O agendamento de ${apt.serviceName} do dia ${apt.date.split('-').reverse().join('/')} foi cancelado.`,
        type: 'appointment',
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications(prev => [cancelNotif, ...prev]);
    }
  };

  // Reschedule appointment
  const rescheduleAppointment = (appointmentId: string, newDate: string, newTime: string) => {
    setAppointments(prev => prev.map(a => {
      if (a.id === appointmentId) {
        const startMin = timeToMinutes(newTime);
        const endMin = startMin + a.serviceDuration;
        return {
          ...a,
          date: newDate,
          startTime: newTime,
          endTime: minutesToTime(endMin),
          status: 'confirmed',
        };
      }
      return a;
    }));

    const apt = appointments.find(a => a.id === appointmentId);
    if (apt) {
      const reschedNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        userId: apt.customerId,
        title: 'Agendamento Reagendado',
        message: `Seu novo horário para ${apt.serviceName} é ${newDate.split('-').reverse().join('/')} às ${newTime}.`,
        type: 'appointment',
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications(prev => [reschedNotif, ...prev]);
    }
  };

  // Update appointment status (e.g., completed)
  const updateAppointmentStatus = (appointmentId: string, status: AppointmentStatus) => {
    let completedApt: Appointment | undefined;

    setAppointments(prev => prev.map(a => {
      if (a.id === appointmentId) {
        const updated: Appointment = {
          ...a,
          status,
          paymentStatus: status === 'completed' ? 'approved' : a.paymentStatus,
        };
        if (status === 'completed') completedApt = updated;
        return updated;
      }
      return a;
    }));

    // If marked as completed, award loyalty points & add to haircut history
    if (status === 'completed' && completedApt) {
      const pointsEarned = Math.floor(completedApt.finalPrice * settings.pointsPerRealSpent);
      
      setUsers(prev => prev.map(u => {
        if (u.id === completedApt!.customerId) {
          const newTotalPoints = (u.loyaltyPoints || 0) + pointsEarned;
          // Determine tier
          let newTier: LoyaltyTierLevel = 'Bronze';
          if (newTotalPoints >= 1500) newTier = 'Black';
          else if (newTotalPoints >= 700) newTier = 'Gold';
          else if (newTotalPoints >= 300) newTier = 'Silver';

          return {
            ...u,
            loyaltyPoints: newTotalPoints,
            loyaltyTier: newTier,
          };
        }
        return u;
      }));

      // Add to style history
      const historyItem: HaircutHistoryItem = {
        id: `hist_${Date.now()}`,
        customerId: completedApt.customerId,
        appointmentId: completedApt.id,
        serviceName: completedApt.serviceName,
        barberName: completedApt.barberName,
        barberId: completedApt.barberId,
        date: completedApt.date,
        price: completedApt.finalPrice,
        notes: completedApt.notes || 'Atendimento concluído com maestria Puyol.',
      };
      setHaircutHistory(prev => [historyItem, ...prev]);

      // Notify customer
      const completionNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        userId: completedApt.customerId,
        title: 'Corte Concluído! + Pontos Puyol',
        message: `Você ganhou ${pointsEarned} pontos pelo atendimento de ${completedApt.serviceName}! Deixe uma avaliação para o barbeiro.`,
        type: 'loyalty',
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications(prev => [completionNotif, ...prev]);
    }
  };

  // Add review
  const addReview = (appointmentId: string, rating: number, comment: string) => {
    const apt = appointments.find(a => a.id === appointmentId);
    if (!apt) return;

    const newRev: Review = {
      id: `rev_${Date.now()}`,
      appointmentId,
      customerId: apt.customerId,
      customerName: apt.customerName,
      barberId: apt.barberId,
      barberName: apt.barberName,
      serviceId: apt.serviceId,
      serviceName: apt.serviceName,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    setReviews(prev => [newRev, ...prev]);

    // Recalculate barber rating
    setBarbers(prev => prev.map(b => {
      if (b.id === apt.barberId) {
        const allBarberReviews = [...reviews.filter(r => r.barberId === b.id), newRev];
        const avg = allBarberReviews.reduce((sum, r) => sum + r.rating, 0) / allBarberReviews.length;
        return {
          ...b,
          rating: Math.round(avg * 100) / 100,
          reviewCount: allBarberReviews.length,
        };
      }
      return b;
    }));

    // Mark appointment with reviewId
    setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, reviewId: newRev.id } : a));
  };

  // Favorites
  const toggleFavoriteBarber = (barberId: string) => {
    setCurrentUser(prev => {
      const favorites = prev.favoriteBarberIds || [];
      const updated = favorites.includes(barberId)
        ? favorites.filter(id => id !== barberId)
        : [...favorites, barberId];
      return { ...prev, favoriteBarberIds: updated };
    });
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const favorites = u.favoriteBarberIds || [];
        const updated = favorites.includes(barberId)
          ? favorites.filter(id => id !== barberId)
          : [...favorites, barberId];
        return { ...u, favoriteBarberIds: updated };
      }
      return u;
    }));
  };

  const toggleFavoriteService = (serviceId: string) => {
    setCurrentUser(prev => {
      const favorites = prev.favoriteServiceIds || [];
      const updated = favorites.includes(serviceId)
        ? favorites.filter(id => id !== serviceId)
        : [...favorites, serviceId];
      return { ...prev, favoriteServiceIds: updated };
    });
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const favorites = u.favoriteServiceIds || [];
        const updated = favorites.includes(serviceId)
          ? favorites.filter(id => id !== serviceId)
          : [...favorites, serviceId];
        return { ...u, favoriteServiceIds: updated };
      }
      return u;
    }));
  };

  // Loyalty rewards
  const redeemLoyaltyReward = (rewardId: string): boolean => {
    const reward = loyaltyRewards.find(r => r.id === rewardId);
    if (!reward) return false;
    const currentPoints = currentUser.loyaltyPoints || 0;
    if (currentPoints < reward.pointsCost) return false;

    // Deduct points
    const newPoints = currentPoints - reward.pointsCost;
    setCurrentUser(prev => ({ ...prev, loyaltyPoints: newPoints }));
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, loyaltyPoints: newPoints } : u));

    // Send notification with voucher
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      title: 'Recompensa Resgatada! 🎉',
      message: `Você resgatou "${reward.title}". O desconto será aplicado automaticamente no seu próximo agendamento.`,
      type: 'loyalty',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev]);
    return true;
  };

  // Add style photo to private customer gallery
  const addStylePhoto = (data: { photoUrl: string; notes: string; serviceName: string; barberName: string; date: string }) => {
    const newItem: HaircutHistoryItem = {
      id: `hist_${Date.now()}`,
      customerId: currentUser.id,
      appointmentId: `apt_custom_${Date.now()}`,
      serviceName: data.serviceName,
      barberName: data.barberName,
      barberId: barbers[0].id,
      date: data.date,
      price: 70.0,
      photoUrl: data.photoUrl,
      notes: data.notes,
    };
    setHaircutHistory(prev => [newItem, ...prev]);
  };

  const addHaircutHistoryItem = (item: any) => {
    const newItem: HaircutHistoryItem = {
      id: item.id || `haircut_${Date.now()}`,
      customerId: item.customerId || currentUser.id,
      appointmentId: item.appointmentId || `apt_${Date.now()}`,
      serviceName: item.serviceName || 'Corte Degradê Puyol',
      barberName: item.barberName || 'Mestre Barbeiro',
      barberId: item.barberId || (barbers[0]?.id || 'barber_1'),
      date: item.date || new Date().toISOString().split('T')[0],
      price: item.price || 70,
      photoUrl: item.photoUrl,
      notes: item.notes,
      rating: item.rating || 5,
    };
    setHaircutHistory(prev => [newItem, ...prev]);
  };

  // Blocked times
  const addBlockedTime = (blocked: Omit<BlockedTime, 'id'>) => {
    const newBlocked: BlockedTime = { ...blocked, id: `blk_${Date.now()}` };
    setBlockedTimes(prev => [...prev, newBlocked]);
  };

  const removeBlockedTime = (id: string) => {
    setBlockedTimes(prev => prev.filter(b => b.id !== id));
  };

  // Barber management
  const updateBarberAvailability = (barberId: string, data: Partial<Barber>) => {
    setBarbers(prev => prev.map(b => b.id === barberId ? { ...b, ...data } : b));
  };

  const addBarber = (barberData: any) => {
    const newBarber: Barber = {
      id: `barber_${Date.now()}`,
      name: barberData.name || 'Barbeiro Puyol',
      nickname: barberData.nickname || '',
      email: barberData.email || 'barbeiro@puyol.com.br',
      phone: barberData.phone || '(11) 99999-9999',
      avatarUrl: barberData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: barberData.bio || '',
      specialties: barberData.specialties || ['Corte Clássico'],
      rating: barberData.rating || 5.0,
      reviewCount: barberData.reviewCount || 0,
      totalAppointments: barberData.totalAppointments || 0,
      active: barberData.active ?? true,
      workingDays: barberData.workingDays || [1, 2, 3, 4, 5, 6],
      startTime: barberData.startTime || '09:00',
      endTime: barberData.endTime || '20:00',
      lunchBreakStart: barberData.lunchBreak?.start || barberData.lunchBreakStart || '12:00',
      lunchBreakEnd: barberData.lunchBreak?.end || barberData.lunchBreakEnd || '13:00',
      slotDurationMinutes: barberData.slotDurationMinutes || 30,
      commissionRate: barberData.commissionRate ?? 0.50,
      ...barberData,
    };
    setBarbers(prev => [...prev, newBarber]);
  };

  const updateBarber = (id: string, barberData: Partial<Barber>) => {
    setBarbers(prev => prev.map(b => b.id === id ? { ...b, ...barberData } : b));
  };

  // Service management
  const addService = (serviceData: Omit<ServiceItem, 'id'>) => {
    const newService: ServiceItem = {
      ...serviceData,
      id: `srv_${Date.now()}`,
    };
    setServices(prev => [...prev, newService]);
  };

  const updateService = (id: string, serviceData: Partial<ServiceItem>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...serviceData } : s));
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: false } : s));
  };

  // Coupon management
  const addCoupon = (couponData: Omit<Coupon, 'id' | 'currentUses'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `coup_${Date.now()}`,
      currentUses: 0,
    };
    setCoupons(prev => [...prev, newCoupon]);
  };

  const updateCoupon = (id: string, couponData: Partial<Coupon>) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, ...couponData } : c));
  };

  // Settings
  const updateSettings = (newSettings: Partial<BarbershopSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Authentication
  const login = (email: string, role?: UserRole): boolean => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      return true;
    }
    // If not found, log in with specified role or client
    const targetRole = role || 'client';
    const demoUser = users.find(u => u.role === targetRole);
    if (demoUser) {
      setCurrentUser(demoUser);
      return true;
    }
    return false;
  };

  const signup = (name: string, email: string, phone: string, role: UserRole = 'client'): boolean => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      phone,
      role,
      createdAt: new Date().toISOString(),
      loyaltyPoints: settings.welcomeBonusPoints,
      loyaltyTier: 'Bronze',
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);

    // Welcome notification
    const welcomeNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: newUser.id,
      title: 'Bem-vindo à Barbearia Puyol! ✂️',
      message: `Você ganhou ${settings.welcomeBonusPoints} pontos de boas-vindas no Clube Puyol!`,
      type: 'loyalty',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [welcomeNotif, ...prev]);

    return true;
  };

  const logout = () => {
    // Return to default client
    const client = users.find(u => u.role === 'client') || users[0];
    setCurrentUser(client);
  };

  return (
    <BarbershopContext.Provider
      value={{
        currentUser,
        currentRole,
        switchUserRole,
        users,
        allUsers: users,
        barbers,
        services,
        appointments,
        reviews,
        loyaltyRewards,
        loyaltyTiers,
        loyaltyTransactions,
        coupons,
        blockedTimes,
        haircutHistory,
        notifications,
        settings,
        getAvailableSlots,
        bookAppointment,
        repeatAppointment,
        cancelAppointment,
        rescheduleAppointment,
        updateAppointmentStatus,
        addReview,
        toggleFavoriteBarber,
        toggleFavoriteService,
        applyCoupon,
        redeemLoyaltyReward,
        addStylePhoto,
        addHaircutHistoryItem,
        addBlockedTime,
        removeBlockedTime,
        updateBarberAvailability,
        addService,
        updateService,
        deleteService,
        addBarber,
        updateBarber,
        addCoupon,
        updateCoupon,
        updateSettings,
        markNotificationRead,
        markAllNotificationsRead,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </BarbershopContext.Provider>
  );
};

export const useBarbershop = () => {
  const context = useContext(BarbershopContext);
  if (!context) {
    throw new Error('useBarbershop must be used within a BarbershopProvider');
  }
  return context;
};
