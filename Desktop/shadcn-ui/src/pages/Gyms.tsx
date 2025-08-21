import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gym } from '@/types';
import { Search, Compass } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import UniversalGymCard from '@/components/UniversalGymCard';
import { useUniversalGymDialog } from '@/hooks/useUniversalGymDialog';
import { useNavigate } from 'react-router-dom';

// Mock data
export const mockGyms: Gym[] = [
  {
    id: '1',
    name: 'FitZone Gym',
    description: 'Modern gym with state-of-the-art equipment',
    address: '123 Fitness St',
    city: 'New York',
    image: '/assets/gyms/fitzone.jpg',
    amenities: ['Pool', 'Sauna', 'Parking'],
    rating: 4.8,
    latitude: 40.712776,
    longitude: -74.005974
  },
  {
    id: '2',
    name: 'ZenFit Studio',
    description: 'Peaceful studio focused on mind-body connection',
    address: '456 Zen Ave',
    city: 'Los Angeles',
    image: '/assets/gyms/zenfit.jpg',
    amenities: ['Meditation Room', 'Tea Bar'],
    rating: 4.7,
    latitude: 34.052235,
    longitude: -118.243683
  },
  {
    id: '3',
    name: 'PowerHouse Gym',
    description: 'Dedicated to strength training and bodybuilding',
    address: '789 Iron St',
    city: 'Chicago',
    image: '/assets/gyms/powerhouse.jpg',
    amenities: ['Free Weights', 'Power Racks', 'Supplements Bar'],
    rating: 4.5,
    latitude: 41.878113,
    longitude: -87.629799
  },
  {
    id: '4',
    name: 'Cardio Center',
    description: 'Focused on cardiovascular health and endurance',
    address: '101 Runner Blvd',
    city: 'Miami',
    image: '/assets/gyms/cardio.jpg',
    amenities: ['Treadmills', 'Rowing Machines', 'Indoor Track'],
    rating: 4.3,
    latitude: 25.761680,
    longitude: -80.191790
  },
  {
    id: '5',
    name: 'CrossFit Arena',
    description: 'High-intensity functional fitness training center',
    address: '202 Box Ave',
    city: 'Austin',
    image: '/assets/gyms/crossfit.jpg',
    amenities: ['Olympic Weights', 'Climbing Ropes', 'Open Space'],
    rating: 4.9,
    latitude: 30.267153,
    longitude: -97.743061
  },
  {
    id: '6',
    name: 'Yoga Haven',
    description: 'Tranquil space for yoga and pilates enthusiasts',
    address: '303 Calm St',
    city: 'Portland',
    image: '/assets/gyms/yoga.jpg',
    amenities: ['Heated Rooms', 'Equipment Provided', 'Relaxation Area'],
    rating: 4.6,
    latitude: 45.523064,
    longitude: -122.676483
  }
];

export default function Gyms() {
  const [searchQuery, setSearchQuery] = useState('');
  const [city, setCity] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const {
    handleViewGym,
    handleCheckIn,
    handleClassClick,
    GymDialogComponents
  } = useUniversalGymDialog();

  const navigate = useNavigate();

  // Filter gyms based on search query and filters
  const filteredGyms = mockGyms.filter((gym) => {
    const matchesSearch =
      gym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gym.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gym.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gym.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gym.amenities.some(amenity => amenity.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCity = city === 'all' || gym.city === city;

    return matchesSearch && matchesCity;
  });

  const cities = Array.from(new Set(mockGyms.map(gym => gym.city)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Gyms</h1>
        <p className="text-muted-foreground">Find and explore fitness centers near you.</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search gyms, amenities, or locations..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select city" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((cityName) => (
              <SelectItem key={cityName} value={cityName}>
                {cityName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Gyms</TabsTrigger>
          <TabsTrigger value="nearby">Nearby</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>

        {/* All Gyms Tab */}
        <TabsContent value="all" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGyms.map((gym) => (
              <UniversalGymCard
                key={gym.id}
                gym={gym}
                onClick={() => handleViewGym(gym)}
                onCheckIn={() => handleCheckIn(gym)}
              />
            ))}
          </div>
        </TabsContent>

        {/* Nearby Gyms Tab */}
        <TabsContent value="nearby" className="space-y-6">
          <div className="flex items-center justify-center p-8 border rounded-md">
            <div className="text-center space-y-2">
              <Compass className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">Location Access Required</h3>
              <p className="text-muted-foreground">Please allow access to your location to see nearby gyms.</p>
              <Button className="mt-2">Enable Location</Button>
            </div>
          </div>
        </TabsContent>

        {/* Popular Gyms Tab */}
        <TabsContent value="popular" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGyms
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 3)
              .map((gym) => (
                <UniversalGymCard
                  key={gym.id}
                  gym={gym}
                  onClick={() => handleViewGym(gym)}
                  onCheckIn={() => handleCheckIn(gym)}
                />
              ))}
          </div>
        </TabsContent>

        {/* Map View Tab */}
        <TabsContent value="map" className="space-y-6">
          <div className="border rounded-md h-[60vh] flex items-center justify-center bg-muted/50">
            <div className="text-center space-y-2">
              <Compass className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">Map View</h3>
              <p className="text-muted-foreground">Interactive map would be displayed here.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Universal Gym Dialog Components */}
      <GymDialogComponents />

      {/* Booking Modal (contextual) */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setIsBookingOpen(false)}>&times;</button>
            <div className="text-lg font-bold mb-4">Book a Class (Placeholder)</div>
            <p>This will open the booking flow for this gym/class.</p>
          </div>
        </div>
      )}
    </div>
  );
}