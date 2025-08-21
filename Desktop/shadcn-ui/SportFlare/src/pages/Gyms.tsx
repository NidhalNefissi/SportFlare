import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gym } from '@/types';
import { Search, MapPin, Star, Dumbbell, Compass } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

// Mock data
const mockGyms: Gym[] = [
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
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [isGymDialogOpen, setIsGymDialogOpen] = useState(false);

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

  const handleViewGym = (gym: Gym) => {
    setSelectedGym(gym);
    setIsGymDialogOpen(true);
  };

  const cities = Array.from(new Set(mockGyms.map(gym => gym.city)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Fitness Centers</h1>
        <p className="text-muted-foreground">Find gyms and fitness studios in your area</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search gyms, amenities, or location..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="nearby">Nearby</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>

        {/* All Gyms Tab */}
        <TabsContent value="all" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGyms.map((gym) => (
              <GymCard key={gym.id} gym={gym} onClick={() => handleViewGym(gym)} />
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
                <GymCard key={gym.id} gym={gym} onClick={() => handleViewGym(gym)} />
              ))}
          </div>
        </TabsContent>

        {/* Map View Tab */}
        <TabsContent value="map" className="space-y-6">
          <div className="border rounded-md h-[60vh] flex items-center justify-center bg-muted/50">
            <div className="text-center space-y-2">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">Map View</h3>
              <p className="text-muted-foreground">Interactive map would be displayed here.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Gym Detail Dialog */}
      <Dialog open={isGymDialogOpen} onOpenChange={setIsGymDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{selectedGym?.name}</DialogTitle>
            <DialogDescription className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {selectedGym?.address}, {selectedGym?.city}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-md" />
              
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="text-sm text-muted-foreground">{selectedGym?.description}</p>
              </div>

              <div>
                <h3 className="font-medium">Amenities</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedGym?.amenities.map((amenity, i) => (
                    <Badge key={i} variant="secondary">{amenity}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{selectedGym?.rating}</span>
                <span className="text-muted-foreground text-sm">({Math.floor(Math.random() * 100) + 30} reviews)</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border rounded-md h-[200px] flex items-center justify-center bg-muted/50">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              
              <div>
                <h3 className="font-medium">Classes Today</h3>
                <div className="space-y-2 mt-2">
                  <div className="border rounded-md p-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">HIIT Workout</p>
                      <Badge>10:00 AM</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">with Jane Smith</p>
                  </div>
                  <div className="border rounded-md p-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">Yoga Flow</p>
                      <Badge>2:00 PM</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">with Mike Johnson</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium">Hours</h3>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mon-Fri</span>
                    <span>6:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sat</span>
                    <span>8:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sun</span>
                    <span>8:00 AM - 6:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex sm:justify-between gap-2">
            <Button variant="outline" onClick={() => setIsGymDialogOpen(false)}>
              Back to List
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">Check In</Button>
              <Button>Book a Class</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface GymCardProps {
  gym: Gym;
  onClick: () => void;
}

const GymCard = ({ gym, onClick }: GymCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <div className="aspect-video bg-muted" />
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{gym.name}</h3>
          <div className="flex items-center">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-xs font-medium">{gym.rating}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{gym.description}</p>
        <div className="flex items-center mt-2 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3 mr-1" />
          <span>{gym.address}, {gym.city}</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {gym.amenities.slice(0, 3).map((amenity, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              <Dumbbell className="h-2.5 w-2.5 mr-1" />
              {amenity}
            </Badge>
          ))}
          {gym.amenities.length > 3 && (
            <Badge variant="outline" className="text-xs">+{gym.amenities.length - 3} more</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};