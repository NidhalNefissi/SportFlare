import { ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { useNotifications } from '@/context/NotificationContext';
import { UserRole } from '@/types';
import { 
  Home, 
  Dumbbell, 
  ShoppingBag, 
  Building, 
  Users, 
  User, 
  Bell, 
  Crown, 
  MessageSquare,
  LogOut,
  Menu,
  X,
  BarChart2,
  Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

interface NavItemProps {
  icon: ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  onClick: () => void;
  badge?: number;
}

const NavItem = ({ icon, label, href, isActive, onClick, badge }: NavItemProps) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-2 text-left",
        isActive ? "bg-muted" : "hover:bg-muted/50"
      )}
      onClick={onClick}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <Badge variant="destructive" className="ml-auto">
          {badge}
        </Badge>
      )}
    </Button>
  );
};

const getRoleNavItems = (role: UserRole): { icon: ReactNode; label: string; href: string }[] => {
  const baseNavItems = [
    { icon: <Home size={20} />, label: 'Dashboard', href: '/' },
    { icon: <Dumbbell size={20} />, label: 'Classes', href: '/classes' },
    { icon: <ShoppingBag size={20} />, label: 'Marketplace', href: '/marketplace' },
    { icon: <Building size={20} />, label: 'Gyms', href: '/gyms' },
    { icon: <Users size={20} />, label: 'Coaches', href: '/coaches' },
    { icon: <MessageSquare size={20} />, label: 'AI Coach', href: '/ai-coach' },
  ];

  // Admin-specific routes
  if (role === 'admin') {
    return [
      ...baseNavItems,
      { icon: <User size={20} />, label: 'User Management', href: '/users' },
      { icon: <Crown size={20} />, label: 'Content Management', href: '/content' },
      { icon: <BarChart2 size={20} />, label: 'Analytics', href: '/admin-analytics' },
    ];
  }

  // Coach-specific routes
  if (role === 'coach') {
    return [
      ...baseNavItems,
      { icon: <Users size={20} />, label: 'My Students', href: '/students' },
      { icon: <Crown size={20} />, label: 'Create Class', href: '/create-class' },
      { icon: <BarChart2 size={20} />, label: 'Analytics', href: '/coach-analytics' },
    ];
  }

  // Gym-specific routes
  if (role === 'gym') {
    return [
      ...baseNavItems,
      { icon: <Dumbbell size={20} />, label: 'Manage Classes', href: '/manage-classes' },
      { icon: <Users size={20} />, label: 'Check-ins', href: '/check-ins' },
      { icon: <BarChart2 size={20} />, label: 'Analytics', href: '/gym-analytics' },
      { icon: <Tag size={20} />, label: 'Promotions', href: '/gym-promotions' },
    ];
  }

  // Brand-specific routes
  if (role === 'brand') {
    return [
      ...baseNavItems,
      { icon: <ShoppingBag size={20} />, label: 'Manage Products', href: '/manage-products' },
      { icon: <Crown size={20} />, label: 'Orders', href: '/orders' },
      { icon: <BarChart2 size={20} />, label: 'Analytics', href: '/brand-analytics' },
      { icon: <Tag size={20} />, label: 'Promotions', href: '/brand-promotions' },
    ];
  }

  // Default (client) routes
  return baseNavItems;
};

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useUser();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (mounted && !user && location.pathname !== '/login' && location.pathname !== '/register') {
      navigate('/login');
    }
  }, [user, mounted, navigate, location.pathname]);

  if (!user && location.pathname !== '/login' && location.pathname !== '/register') {
    return null; // Return null during the redirect
  }

  const navItems = user ? getRoleNavItems(user.role) : [];

  const handleNavigation = (href: string) => {
    navigate(href);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-card p-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
            SF
          </div>
          <h1 className="text-xl font-bold">SportFlare</h1>
        </div>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={location.pathname === item.href}
              onClick={() => handleNavigation(item.href)}
              badge={item.label === 'Notifications' ? unreadCount : undefined}
            />
          ))}
        </nav>

        <div className="pt-4 border-t space-y-2">
          <NavItem
            icon={<User size={20} />}
            label="Profile"
            href="/profile"
            isActive={location.pathname === '/profile'}
            onClick={() => handleNavigation('/profile')}
          />
          <NavItem
            icon={<Bell size={20} />}
            label="Notifications"
            href="/notifications"
            isActive={location.pathname === '/notifications'}
            onClick={() => handleNavigation('/notifications')}
            badge={unreadCount}
          />
          <NavItem
            icon={<Crown size={20} />}
            label="Subscription"
            href="/subscription"
            isActive={location.pathname === '/subscription'}
            onClick={() => handleNavigation('/subscription')}
          />
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-left hover:bg-muted/50"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-10 border-b bg-background p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
            SF
          </div>
          <h1 className="text-xl font-bold">SportFlare</h1>
        </div>

        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 p-4 border-b">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  SF
                </div>
                <h1 className="text-xl font-bold">SportFlare</h1>
              </div>

              <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                  <NavItem
                    key={item.href}
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    isActive={location.pathname === item.href}
                    onClick={() => handleNavigation(item.href)}
                    badge={item.label === 'Notifications' ? unreadCount : undefined}
                  />
                ))}
              </nav>

              <div className="p-4 border-t space-y-2">
                <NavItem
                  icon={<User size={20} />}
                  label="Profile"
                  href="/profile"
                  isActive={location.pathname === '/profile'}
                  onClick={() => handleNavigation('/profile')}
                />
                <NavItem
                  icon={<Bell size={20} />}
                  label="Notifications"
                  href="/notifications"
                  isActive={location.pathname === '/notifications'}
                  onClick={() => handleNavigation('/notifications')}
                  badge={unreadCount}
                />
                <NavItem
                  icon={<Crown size={20} />}
                  label="Subscription"
                  href="/subscription"
                  isActive={location.pathname === '/subscription'}
                  onClick={() => handleNavigation('/subscription')}
                />
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-left hover:bg-muted/50"
                  onClick={handleLogout}
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-4 pt-20 lg:pt-4 overflow-auto">{children}</div>
      </main>
    </div>
  );
}