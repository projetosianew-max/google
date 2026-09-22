import React, { useState } from 'react';
import { BarbershopProvider, useBarbershop } from './context/BarbershopContext';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { WhatsAppWidget } from './components/common/WhatsAppWidget';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { AuthModal } from './components/common/AuthModal';
import { HomeView } from './components/client/HomeView';
import { BookingWizard } from './components/booking/BookingWizard';
import { ServicesView } from './components/client/ServicesView';
import { BarbersView } from './components/client/BarbersView';
import { AppointmentsView } from './components/client/AppointmentsView';
import { LoyaltyView } from './components/client/LoyaltyView';
import { StyleEvolutionView } from './components/client/StyleEvolutionView';
import { BarberDashboard } from './components/barber/BarberDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';

function MainContent() {
  const { currentUser } = useBarbershop();
  
  // Navigation states
  const [activeTab, setActiveTab] = useState<string>('home');
  const [bookingInitialService, setBookingInitialService] = useState<string | undefined>(undefined);
  const [bookingInitialBarber, setBookingInitialBarber] = useState<string | undefined>(undefined);

  // Modals & Drawers
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);

  const handleStartBooking = (serviceId?: string, barberId?: string) => {
    setBookingInitialService(serviceId);
    setBookingInitialBarber(barberId);
    setActiveTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectNotificationAction = (url?: string) => {
    setIsNotifOpen(false);
    if (url === '/appointments' || url === 'appointments') {
      setActiveTab('appointments');
    } else if (url === '/loyalty' || url === 'loyalty') {
      setActiveTab('loyalty');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090d] text-zinc-100 flex flex-col selection:bg-[#c5a059] selection:text-black font-sans antialiased">
      
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab: string) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectTab={(tab: string) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenNotifications={() => setIsNotifOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-24">
        
        {/* Role-based views */}
        {currentUser.role === 'admin' && activeTab === 'admin' ? (
          <AdminDashboard />
        ) : currentUser.role === 'barber' && activeTab === 'barber' ? (
          <BarberDashboard />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeView
                onStartBooking={handleStartBooking}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {activeTab === 'booking' && (
              <BookingWizard
                initialServiceId={bookingInitialService}
                initialBarberId={bookingInitialBarber}
                onFinish={() => setActiveTab('home')}
                onViewAppointments={() => setActiveTab('appointments')}
              />
            )}

            {activeTab === 'services' && (
              <ServicesView
                onStartBooking={(serviceId) => handleStartBooking(serviceId)}
              />
            )}

            {activeTab === 'barbers' && (
              <BarbersView
                onStartBooking={(serviceId, barberId) => handleStartBooking(serviceId, barberId)}
              />
            )}

            {activeTab === 'appointments' && (
              <AppointmentsView
                onStartBooking={() => handleStartBooking()}
              />
            )}

            {activeTab === 'loyalty' && (
              <LoyaltyView
                onStartBooking={() => handleStartBooking()}
              />
            )}

            {activeTab === 'style_evolution' && (
              <StyleEvolutionView
                onStartBooking={() => handleStartBooking()}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation for Mobile & Fast Tablet Access */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={(tab: string) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectTab={(tab: string) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onStartBooking={() => handleStartBooking()}
      />

      {/* Floating Action Button: WhatsApp Widget */}
      <WhatsAppWidget />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onSelectAction={handleSelectNotificationAction}
      />

      {/* Auth & Quick Demo Switcher Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <BarbershopProvider>
      <MainContent />
    </BarbershopProvider>
  );
}
