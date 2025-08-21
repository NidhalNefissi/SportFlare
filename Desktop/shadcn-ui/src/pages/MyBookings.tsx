import { useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useNavigate } from 'react-router-dom';
import UserBookings from '@/components/user/UserBookings';
import CoachBookings from '@/components/coach/CoachBookings';

export default function MyBookings() {
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/my-bookings' } });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // Or a loading spinner
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground">
            {user?.role === 'coach' 
              ? 'Manage your coaching sessions and availability' 
              : 'View and manage your scheduled sessions'}
          </p>
        </div>

      </div>

      {user?.role === 'coach' ? (
        <CoachBookings />
      ) : (
        <UserBookings />
      )}
    </div>
  );
}
