export type UserRole = 'client' | 'barber' | 'admin';

export type LoyaltyTierLevel = 'Bronze' | 'Silver' | 'Gold' | 'Black';

export type AppointmentStatus = 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export type PaymentMethod = 'pix' | 'credit_card' | 'pay_at_shop';

export type PaymentStatus = 'pending' | 'approved' | 'refunded' | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  // Specific client data
  loyaltyPoints?: number;
  loyaltyTier?: LoyaltyTierLevel;
  favoriteBarberIds?: string[];
  favoriteServiceIds?: string[];
}

export interface Barber {
  id: string;
  name: string;
  nickname?: string;
  email: string;
  phone: string;
  avatarUrl: string;
  bio: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  totalAppointments: number;
  active: boolean;
  workingDays: number[]; // 0 = Domingo, 1 = Segunda, etc.
  startTime: string; // "09:00"
  endTime: string; // "20:00"
  lunchBreakStart?: string; // "12:00"
  lunchBreakEnd?: string; // "13:00"
  slotDurationMinutes: number; // typically 30 or 45
  commissionRate: number; // e.g. 0.50 = 50%
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number; // in BRL
  durationMinutes: number;
  imageUrl: string;
  category: 'cabelo' | 'barba' | 'combo' | 'acabamento' | 'tratamento';
  active: boolean;
  popular?: boolean;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  barberId: string;
  barberName: string;
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  servicePrice: number;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "15:00"
  endTime: string; // "15:45"
  status: AppointmentStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  discountApplied?: number;
  couponCode?: string;
  pointsUsed?: number;
  finalPrice: number;
  notes?: string;
  createdAt: string;
  reviewId?: string;
  haircutHistoryId?: string;
}

export interface Review {
  id: string;
  appointmentId: string;
  customerId: string;
  customerName: string;
  barberId: string;
  barberName: string;
  serviceId: string;
  serviceName: string;
  rating: number; // 1 - 5
  comment: string;
  createdAt: string;
}

export interface LoyaltyReward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  pointsRequired?: number; // alias
  discountType: 'fixed' | 'percent' | 'free_service';
  discountValue: number; // R$ or % or serviceId
  icon: string;
  active: boolean;
}

export interface LoyaltyTierConfig {
  id?: string;
  name?: string;
  level: LoyaltyTierLevel;
  minPoints: number;
  benefits: string[];
  perks?: string[]; // alias for benefits
  discountBonusPercentage: number;
  colorHex: string;
}

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  points: number;
  type: 'earned' | 'redeemed';
  description: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number; // e.g. 10% or R$ 15
  minOrderValue?: number;
  maxUses?: number;
  currentUses: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
  applicableServiceIds?: string[];
}

export interface BlockedTime {
  id: string;
  barberId: string; // or 'all'
  date: string; // "YYYY-MM-DD"
  startTime: string; // "12:00"
  endTime: string; // "13:30"
  reason: string;
}

export interface HaircutHistoryItem {
  id: string;
  customerId: string;
  appointmentId: string;
  serviceName: string;
  barberName: string;
  barberId: string;
  date: string;
  price: number;
  photoUrl?: string;
  notes?: string; // e.g. "Degradê navalhado alto, barba com toalha quente e balm"
  rating?: number;
}

export interface BarbershopSettings {
  name: string;
  slogan: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  googleMapsUrl: string;
  openingHoursWeekday: string;
  openingHoursSaturday: string;
  openingHoursSunday: string;
  minCancellationNoticeHours: number;
  cancelMinNoticeHours?: number;
  pointsPerRealSpent: number;
  welcomeBonusPoints: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'appointment' | 'loyalty' | 'promo' | 'system';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}
