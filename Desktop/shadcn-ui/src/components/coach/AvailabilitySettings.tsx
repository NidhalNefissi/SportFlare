import React, { useState, useEffect } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, X, Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

// Define types
type TimeRange = {
  id: string;
  start: string;
  end: string;
};

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

type DailyAvailability = {
  day: string;
  available: boolean;
  timeSlots: TimeRange[];
};

export function AvailabilitySettings() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: addDays(new Date(), 6), // Default to one week
  });
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Initialize with default availability
  const [availability, setAvailability] = useState<DailyAvailability[]>([
    { day: 'monday', available: true, timeSlots: [{ id: '1', start: '09:00', end: '17:00' }] },
    { day: 'tuesday', available: true, timeSlots: [{ id: '2', start: '09:00', end: '17:00' }] },
    { day: 'wednesday', available: true, timeSlots: [{ id: '3', start: '09:00', end: '17:00' }] },
    { day: 'thursday', available: true, timeSlots: [{ id: '4', start: '09:00', end: '17:00' }] },
    { day: 'friday', available: true, timeSlots: [{ id: '5', start: '09:00', end: '17:00' }] },
    { day: 'saturday', available: false, timeSlots: [{ id: '6', start: '10:00', end: '14:00' }] },
    { day: 'sunday', available: false, timeSlots: [] },
  ]);

  // Load saved availability from localStorage or API
  useEffect(() => {
    const savedAvailability = localStorage.getItem('coachAvailability');
    if (savedAvailability) {
      try {
        const parsed = JSON.parse(savedAvailability);
        // Convert string dates back to Date objects for blockedDates
        if (parsed.blockedDates) {
          parsed.blockedDates = parsed.blockedDates.map((date: string) => new Date(date));
        }
        setAvailability(parsed.availability || availability);
        setBlockedDates(parsed.blockedDates || []);
      } catch (error) {
        console.error('Failed to parse saved availability', error);
      }
    }
  }, []);

  const saveAvailability = () => {
    setIsLoading(true);
    // In a real app, you would save this to your backend
    const dataToSave = {
      availability,
      blockedDates,
      lastUpdated: new Date().toISOString(),
    };
    
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('coachAvailability', JSON.stringify(dataToSave));
      setIsLoading(false);
      toast({
        title: "Availability updated",
        description: "Your availability has been saved successfully.",
      });
      setIsOpen(false);
    }, 1000);
  };

  const addTimeSlot = (dayIndex: number) => {
    const newAvailability = [...availability];
    const newId = Date.now().toString();
    newAvailability[dayIndex].timeSlots.push({
      id: newId,
      start: '09:00',
      end: '10:00',
    });
    setAvailability(newAvailability);
  };

  const removeTimeSlot = (dayIndex: number, slotId: string) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].timeSlots = newAvailability[dayIndex].timeSlots.filter(
      (slot) => slot.id !== slotId
    );
    setAvailability(newAvailability);
  };

  const updateTimeSlot = (dayIndex: number, slotId: string, field: 'start' | 'end', value: string) => {
    const newAvailability = [...availability];
    const slotIndex = newAvailability[dayIndex].timeSlots.findIndex(slot => slot.id === slotId);
    if (slotIndex !== -1) {
      newAvailability[dayIndex].timeSlots[slotIndex][field] = value;
      setAvailability(newAvailability);
    }
  };

  const toggleDayAvailability = (dayIndex: number) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].available = !newAvailability[dayIndex].available;
    setAvailability(newAvailability);
  };

  const isDateBlocked = (date: Date) => {
    return blockedDates.some(blockedDate => isSameDay(blockedDate, date));
  };

  const toggleDateBlocked = (date: Date) => {
    if (isDateBlocked(date)) {
      setBlockedDates(blockedDates.filter(d => !isSameDay(d, date)));
    } else {
      setBlockedDates([...blockedDates, date]);
    }
  };

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Clock className="mr-2 h-4 w-4" />
          Set Availability
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Set Your Availability</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendar for blocking dates */}
          <div className="space-y-4">
            <h3 className="font-medium">Block Dates</h3>
            <div className="rounded-md border p-4">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => setDateRange({
                  from: range?.from,
                  to: range?.to,
                })}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
                modifiers={{
                  blocked: blockedDates,
                }}
                modifiersClassNames={{
                  blocked: 'bg-red-100 text-red-800 hover:bg-red-100',
                }}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (dateRange.from && dateRange.to) {
                      const dates = [];
                      let current = new Date(dateRange.from);
                      while (current <= dateRange.to) {
                        if (!isDateBlocked(current)) {
                          dates.push(new Date(current));
                        }
                        const newDate = addDays(current, 1);
                        current = newDate;
                      }
                      setBlockedDates([...blockedDates, ...dates]);
                    } else if (dateRange.from) {
                      if (!isDateBlocked(dateRange.from)) {
                        setBlockedDates([...blockedDates, dateRange.from]);
                      }
                    }
                  }}
                >
                  Block Selected Dates
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setBlockedDates([])}
                >
                  Clear All Blocks
                </Button>
              </div>
              
              {blockedDates.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Blocked Dates:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Array.from(new Set(blockedDates.map(date => date.toISOString().split('T')[0])))
                      .sort()
                      .map((dateStr, index) => {
                        const date = new Date(dateStr);
                        return (
                          <div key={index} className="flex items-center justify-between bg-gray-100 px-3 py-1 rounded text-sm">
                            <span>{format(date, 'MMM d, yyyy')}</span>
                            <button 
                              onClick={() => setBlockedDates(blockedDates.filter(d => !isSameDay(d, date)))}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Weekly schedule */}
          <div className="space-y-4">
            <h3 className="font-medium">Weekly Schedule</h3>
            <div className="space-y-4">
              {availability.map((day, dayIndex) => (
                <div key={day.day} className="rounded-md border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`${day.day}-available`}
                        checked={day.available}
                        onCheckedChange={() => toggleDayAvailability(dayIndex)}
                      />
                      <Label htmlFor={`${day.day}-available`} className="font-medium">
                        {dayNames[dayIndex]}
                      </Label>
                    </div>
                    {day.available && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addTimeSlot(dayIndex)}
                        className="text-sm"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Time
                      </Button>
                    )}
                  </div>
                  
                  {day.available && (
                    <div className="space-y-2 mt-2">
                      {day.timeSlots.map((slot) => (
                        <div key={slot.id} className="flex items-center space-x-2">
                          <div className="grid grid-cols-2 gap-2 flex-1">
                            <div>
                              <Input
                                type="time"
                                value={slot.start}
                                onChange={(e) => updateTimeSlot(dayIndex, slot.id, 'start', e.target.value)}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div>
                              <Input
                                type="time"
                                value={slot.end}
                                onChange={(e) => updateTimeSlot(dayIndex, slot.id, 'end', e.target.value)}
                                min={slot.start}
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeTimeSlot(dayIndex, slot.id)}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={saveAvailability} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
