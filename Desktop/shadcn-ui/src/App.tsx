import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './context/UserContext';
import { NotificationProvider } from './context/NotificationContext';
import { CartProvider } from './context/CartContext';
import { AICoachProvider } from './context/AICoachContext';
import { ClassProvider } from './context/ClassContext';
import { BookingProvider } from './context/BookingContext';

// Layout
import { MainLayout } from './components/layout/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Classes from './pages/Classes';
import ClassDetail from './pages/ClassDetail';
import Marketplace from './pages/Marketplace';
import Gyms from './pages/Gyms';
import Coaches from './pages/Coaches';
import AICoach from './pages/AICoach';
import Profile from './pages/Profile';
import CreateClass from './pages/CreateClass';
import Subscription from './pages/Subscription';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';
import ManageProducts from './pages/ManageProducts';
import Orders from './pages/Orders';
import Analytics from './pages/Analytics';
import Promotions from './pages/Promotions';
import Support from './pages/admin/Support';
import UserManagement from './pages/admin/UserManagement';
import ContentManagement from './pages/admin/ContentManagement';
import ApproveUsers from './pages/admin/ApproveUsers';
import ContentReview from './pages/admin/ContentReview';
import AdminAnalytics from './pages/admin/Analytics';
import AdminSupport from './pages/admin/Support';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Booking from './pages/Booking';
import Currency from './pages/Currency';
import Students from './pages/students';
import ManageClasses from './pages/gym/ManageClasses';
import CheckIns from './pages/gym/CheckIns';
import Programs from './pages/Programs';
import ProgramDetail from './pages/ProgramDetail';
import CoachAnalytics from './pages/coach/Analytics';
import CoachEarnings from './pages/coach/Earnings';
import BrandProfile from './pages/brand/[brandId]';
import BrandAnalytics from './pages/BrandAnalytics';
import BrandPromotions from './pages/BrandPromotions';
import MyBookings from './pages/MyBookings';
import GymAnalytics from './pages/GymAnalytics';
import GymPromotions from './pages/GymPromotions';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <UserProvider>
      <NotificationProvider>
        <CartProvider>
          <AICoachProvider>
            <ClassProvider>
              <BookingProvider>
                <TooltipProvider>
                  <Toaster />
                  <BrowserRouter>
                    <Routes>
                      {/* Auth routes */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />

                      {/* Protected routes */}
                      <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
                      <Route path="/classes" element={<MainLayout><Classes /></MainLayout>} />
                      <Route path="/classes/:id" element={<MainLayout><ClassDetail /></MainLayout>} />
                      <Route path="/marketplace" element={<MainLayout><Marketplace /></MainLayout>} />
                      <Route path="/gyms" element={<MainLayout><Gyms /></MainLayout>} />
                      <Route path="/coaches" element={<MainLayout><Coaches /></MainLayout>} />
                      <Route path="/ai-coach" element={<MainLayout><AICoach /></MainLayout>} />
                      <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
                      <Route path="/create-class" element={<MainLayout><CreateClass /></MainLayout>} />
                      <Route path="/subscription" element={<MainLayout><Subscription /></MainLayout>} />
                      <Route path="/notifications" element={<MainLayout><Notifications /></MainLayout>} />
                      <Route path="/manage-products" element={<MainLayout><ManageProducts /></MainLayout>} />
                      <Route path="/orders" element={<MainLayout><Orders /></MainLayout>} />
                      <Route path="/analytics" element={<MainLayout><Analytics /></MainLayout>} />
                      <Route path="/students" element={<MainLayout><Students /></MainLayout>} />
                      <Route path="/promotions" element={<MainLayout><Promotions /></MainLayout>} />
                      <Route path="/support" element={<MainLayout><Support /></MainLayout>} />
                      <Route path="/admin/users" element={<MainLayout><UserManagement /></MainLayout>} />
                      <Route path="/admin/content" element={<MainLayout><ContentManagement /></MainLayout>} />
                      <Route path="/admin/approve-users" element={<MainLayout><ApproveUsers /></MainLayout>} />
                      <Route path="/admin/content-review" element={<MainLayout><ContentReview /></MainLayout>} />
                      <Route path="/admin/analytics" element={<MainLayout><AdminAnalytics /></MainLayout>} />
                      <Route path="/admin/support" element={<MainLayout><AdminSupport /></MainLayout>} />
                      <Route path="/currency" element={<MainLayout><Currency /></MainLayout>} />
                      <Route path="/gym/manage-classes" element={<MainLayout><ManageClasses /></MainLayout>} />
                      <Route path="/gym/check-ins" element={<MainLayout><CheckIns /></MainLayout>} />
                      <Route path="/programs" element={<MainLayout><Programs /></MainLayout>} />
                      <Route path="/programs/:id" element={<MainLayout><ProgramDetail /></MainLayout>} />
                      <Route path="/coach/analytics" element={<MainLayout><CoachAnalytics /></MainLayout>} />
                      <Route path="/coach/earnings" element={<MainLayout><CoachEarnings /></MainLayout>} />
                      <Route path="/brand/:brandId" element={<MainLayout><BrandProfile /></MainLayout>} />
                      <Route path="/brand-analytics" element={<MainLayout><BrandAnalytics /></MainLayout>} />
                      <Route path="/brand-promotions" element={<MainLayout><BrandPromotions /></MainLayout>} />
                      <Route path="/my-bookings" element={<MainLayout><MyBookings /></MainLayout>} />
                      <Route path="/gym-analytics" element={<MainLayout><GymAnalytics /></MainLayout>} />
                      <Route path="/gym-promotions" element={<MainLayout><GymPromotions /></MainLayout>} />

                      {/* Redirect from index page */}
                      <Route path="/index" element={<Navigate to="/" replace />} />

                      {/* 404 route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </BookingProvider>
            </ClassProvider>
          </AICoachProvider>
        </CartProvider>
      </NotificationProvider>
    </UserProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
