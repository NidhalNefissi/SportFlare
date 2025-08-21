import { addDays, isSameDay, parseISO, format, getDay, isAfter, isBefore, parse, isWithinInterval, addMinutes } from 'date-fns';

type TimeRange = {
  id: string;
  start: string;
  end: string;
};

type DailyAvailability = {
  day: string;
  available: boolean;
  timeSlots: TimeRange[];
};

type CoachAvailability = {
  availability: DailyAvailability[];
  blockedSlots: {
    [date: string]: Array<{
      start: string;
      end: string;
      coachId: string;
      bookingId?: string;
    }>;
  };
};

// These types should match the ones in AvailabilitySettings.ts

// Get coach availability from localStorage
const getCoachAvailability = (coachId: string): CoachAvailability => {
  const defaultAvailability: DailyAvailability[] = [
    { day: 'sunday', available: false, timeSlots: [] },
    { day: 'monday', available: true, timeSlots: [{ id: '1', start: '09:00', end: '17:00' }] },
    { day: 'tuesday', available: true, timeSlots: [{ id: '2', start: '09:00', end: '17:00' }] },
    { day: 'wednesday', available: true, timeSlots: [{ id: '3', start: '09:00', end: '17:00' }] },
    { day: 'thursday', available: true, timeSlots: [{ id: '4', start: '09:00', end: '17:00' }] },
    { day: 'friday', available: true, timeSlots: [{ id: '5', start: '09:00', end: '17:00' }] },
    { day: 'saturday', available: false, timeSlots: [{ id: '6', start: '10:00', end: '14:00' }] },
  ];

  try {
    const savedData = localStorage.getItem(`coach_${coachId}_availability`);
    if (savedData) {
      const parsed = JSON.parse(savedData, (key, value) => {
        if (key === 'date') return new Date(value);
        return value;
      });
      return {
        availability: parsed.availability || defaultAvailability,
        blockedSlots: parsed.blockedSlots || {},
      };
    }
  } catch (error) {
    console.error('Error parsing coach availability', error);
  }

  return {
    availability: defaultAvailability,
    blockedSlots: {},
  };
};

// Block a time slot for a coach
export const blockCoachTimeSlot = (
  coachId: string,
  date: Date,
  startTime: string,
  duration: number, // in hours
  bookingId?: string
): void => {
  const coachData = getCoachAvailability(coachId);
  const dateKey = format(date, 'yyyy-MM-dd');
  const [startHour, startMinute] = startTime.split(':').map(Number);
  
  const startDateTime = new Date(date);
  startDateTime.setHours(startHour, startMinute, 0, 0);
  
  const endDateTime = addMinutes(startDateTime, duration * 60);
  const endTime = format(endDateTime, 'HH:mm');
  
  const blockedSlot = {
    start: startTime,
    end: endTime,
    coachId,
    bookingId,
  };
  
  if (!coachData.blockedSlots[dateKey]) {
    coachData.blockedSlots[dateKey] = [];
  }
  
  coachData.blockedSlots[dateKey].push(blockedSlot);
  
  // Save back to localStorage
  try {
    localStorage.setItem(
      `coach_${coachId}_availability`,
      JSON.stringify(coachData, (_, value) => 
        value instanceof Date ? value.toISOString() : value
      )
    );
  } catch (error) {
    console.error('Error saving coach availability', error);
  }
};

// Check if a time slot is available for a coach
export const isTimeSlotAvailable = (
  coachId: string,
  date: Date,
  startTime: string,
  duration: number // in hours
): boolean => {
  const coachData = getCoachAvailability(coachId);
  const dateKey = format(date, 'yyyy-MM-dd');
  const [startHour, startMinute] = startTime.split(':').map(Number);
  
  const startDateTime = new Date(date);
  startDateTime.setHours(startHour, startMinute, 0, 0);
  
  const endDateTime = addMinutes(startDateTime, duration * 60);
  
  // Check if the time slot is within the coach's available hours
  const dayOfWeek = date.getDay();
  const dayAvailability = coachData.availability[dayOfWeek];
  
  if (!dayAvailability.available) {
    return false;
  }
  
  // Check if the time slot is within any of the coach's available time slots
  const isWithinAvailableHours = dayAvailability.timeSlots.some(slot => {
    const [slotStartHour, slotStartMinute] = slot.start.split(':').map(Number);
    const [slotEndHour, slotEndMinute] = slot.end.split(':').map(Number);
    
    const slotStart = new Date(date);
    slotStart.setHours(slotStartHour, slotStartMinute, 0, 0);
    
    const slotEnd = new Date(date);
    slotEnd.setHours(slotEndHour, slotEndMinute, 0, 0);
    
    return isWithinInterval(startDateTime, { start: slotStart, end: slotEnd }) &&
           isWithinInterval(endDateTime, { start: slotStart, end: slotEnd });
  });
  
  if (!isWithinAvailableHours) {
    return false;
  }
  
  // Check for blocked slots
  const blockedSlots = coachData.blockedSlots[dateKey] || [];
  
  return !blockedSlots.some(slot => {
    const slotStart = parse(slot.start, 'HH:mm', date);
    const slotEnd = parse(slot.end, 'HH:mm', date);
    
    return (
      (startDateTime >= slotStart && startDateTime < slotEnd) || // Start time is within a blocked slot
      (endDateTime > slotStart && endDateTime <= slotEnd) ||   // End time is within a blocked slot
      (startDateTime <= slotStart && endDateTime >= slotEnd)   // Slot completely contains a blocked slot
    );
  });
};

// Get available time slots for a specific date and coach
export const getAvailableTimeSlots = (coachId: string, date: Date): string[] => {
  const coachData = getCoachAvailability(coachId);
  const dayOfWeek = date.getDay();
  const dayAvailability = coachData.availability[dayOfWeek];
  const now = new Date();
  
  // If day is not available, return empty array
  if (!dayAvailability.available || dayAvailability.timeSlots.length === 0) {
    return [];
  }
  
  const dateKey = format(date, 'yyyy-MM-dd');
  const blockedSlots = coachData.blockedSlots[dateKey] || [];
  
  // Generate time slots based on available time ranges
  const timeSlots: string[] = [];
  
  dayAvailability.timeSlots.forEach(slot => {
    const [startHour, startMinute] = slot.start.split(':').map(Number);
    const [endHour, endMinute] = slot.end.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMinute = startMinute;

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      const slotDate = new Date(date);
      slotDate.setHours(currentHour, currentMinute, 0, 0);
      
      // Only include future time slots that aren't blocked
      if (
        isAfter(slotDate, now) && 
        isTimeSlotAvailable(coachId, date, timeString, 1) // 1 hour slots by default
      ) {
        timeSlots.push(timeString);
      }
      
      // Increment by 1 hour
      currentHour += 1;
      if (currentHour >= 24) break;
    }
  });

  return timeSlots;
};

// Check if a date is available for booking
export const isDateAvailable = (coachId: string, date: Date): boolean => {
  const coachData = getCoachAvailability(coachId);
  const dayOfWeek = date.getDay();
  const dayAvailability = coachData.availability[dayOfWeek];
  
  // If day is not available, return false
  if (!dayAvailability.available || dayAvailability.timeSlots.length === 0) {
    return false;
  }
  
  // Check if there are any available time slots for this date
  return getAvailableTimeSlots(coachId, date).length > 0;
};

// Get the next available date for booking
export const getNextAvailableDate = (coachId: string, fromDate: Date = new Date()): Date => {
  let currentDate = new Date(fromDate);
  
  // Check up to 60 days in the future
  for (let i = 0; i < 60; i++) {
    if (isDateAvailable(coachId, currentDate)) {
      return currentDate;
    }
    currentDate = addDays(currentDate, 1);
  }
  
  // If no available date found in the next 60 days, return a date far in the future
  return addDays(fromDate, 60);
};
