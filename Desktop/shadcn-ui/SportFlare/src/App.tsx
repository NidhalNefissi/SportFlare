import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { NotificationProvider } from './context/NotificationContext';
import { CartProvider } from './context/CartContext';
import { AICoachProvider } from './context/AICoachContext';
import { ReviewProvider } from './context/ReviewContext';

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

// Admin pages
import UserManagement from './pages/UserManagement';
import ContentManagement from './pages/ContentManagement';
import AdminAnalytics from './pages/AdminAnalytics';

// Coach pages
import Students from './pages/Students';
import CoachAnalytics from './pages/CoachAnalytics';

// Gym pages
import ManageClasses from './pages/ManageClasses';
import CheckIns from './pages/CheckIns';
import GymAnalytics from './pages/GymAnalytics';
import GymPromotions from './pages/GymPromotions';

// Brand pages
import ManageProducts from './pages/ManageProducts';
import Orders from './pages/Orders';
import BrandAnalytics from './pages/BrandAnalytics';
import BrandPromotions from './pages/BrandPromotions';

// Class/Program Management pages
import ClassProposals from './pages/ClassProposals';
import ClassModifications from './pages/ClassModifications';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <NotificationProvider>
        <CartProvider>
          <AICoachProvider>
            <ReviewProvider>
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
                    <Route path="/subscription" element={<MainLayout><Subscription /></MainLayout>} />
                    <Route path="/notifications" element={<MainLayout><Notifications /></MainLayout>} />
                    
                    {/* Admin routes */}
                    <Route path="/users" element={<MainLayout><UserManagement /></MainLayout>} />
                    <Route path="/content" element={<MainLayout><ContentManagement /></MainLayout>} />
                    <Route path="/admin-analytics" element={<MainLayout><AdminAnalytics /></MainLayout>} />
                    
                    {/* Coach routes */}
                    <Route path="/students" element={<MainLayout><Students /></MainLayout>} />
                    <Route path="/create-class" element={<MainLayout><CreateClass /></MainLayout>} />
                    <Route path="/coach-analytics" element={<MainLayout><CoachAnalytics /></MainLayout>} />
                    
                    {/* Gym routes */}
                    <Route path="/manage-classes" element={<MainLayout><ManageClasses /></MainLayout>} />
                    <Route path="/check-ins" element={<MainLayout><CheckIns /></MainLayout>} />
                    <Route path="/gym-analytics" element={<MainLayout><GymAnalytics /></MainLayout>} />
                    <Route path="/gym-promotions" element={<MainLayout><GymPromotions /></MainLayout>} />
                    <Route path="/class-proposals" element={<MainLayout><ClassProposals /></MainLayout>} />
                    <Route path="/class-modifications" element={<MainLayout><ClassModifications /></MainLayout>} />
                    
                    {/* Brand routes */}
                    <Route path="/manage-products" element={<MainLayout><ManageProducts /></MainLayout>} />
                    <Route path="/orders" element={<MainLayout><Orders /></MainLayout>} />
                    <Route path="/brand-analytics" element={<MainLayout><BrandAnalytics /></MainLayout>} />
                    <Route path="/brand-promotions" element={<MainLayout><BrandPromotions /></MainLayout>} />
                    
                    {/* Redirect from index page */}
                    <Route path="/index" element={<Navigate to="/" replace />} />
                    
                    {/* 404 route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </ReviewProvider>
          </AICoachProvider>
        </CartProvider>
      </NotificationProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;