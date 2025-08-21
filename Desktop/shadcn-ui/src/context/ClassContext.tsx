import React, { createContext, useState, ReactNode } from 'react';
import { mockClasses } from '@/data/mockData';

// Mock types
export interface Booking {
    id: string;
    classId: string;
    userId: string;
    status: string;
    time: Date;
    userName: string;
    classTitle: string;
    gymId: string;
}
export interface CheckIn {
    id: string;
    classId: string;
    userId: string;
    gymId: string;
    userName: string;
    classTitle: string;
    time: Date;
    status: string;
}

const initialBookings: Booking[] = [];
const initialCheckIns: CheckIn[] = [];

export const ClassContext = createContext({
    classes: mockClasses,
    bookings: initialBookings,
    checkIns: initialCheckIns,
    handleAcceptClass: (id: string) => { },
    handleRejectClass: (id: string) => { },
    handleCounterPropose: (id: string) => { },
    handleEditClass: (id: string) => { },
    handleCancelClass: (id: string) => { },
    handleManualCheckIn: () => { },
    handleQRCheckIn: () => { },
});

export const ClassProvider = ({ children }: { children: ReactNode }) => {
    const [classes, setClasses] = useState(mockClasses);
    const [bookings, setBookings] = useState<Booking[]>(initialBookings);
    const [checkIns, setCheckIns] = useState<CheckIn[]>(initialCheckIns);

    const handleAcceptClass = (id: string) => {
        setClasses(prev => prev.map(c => c.id === id ? { ...c, status: 'confirmed', gymProposal: undefined } : c));
    };
    const handleRejectClass = (id: string) => {
        setClasses(prev => prev.map(c => c.id === id ? { ...c, status: 'rejected', gymProposal: undefined } : c));
    };
    const handleCounterPropose = (id: string) => {
        setClasses(prev => prev.map(c => c.id === id ? { ...c, status: 'counter_proposed', gymProposal: { price: (c.price || 0) + 5, capacity: (c.capacity || 0) - 2 } } : c));
    };
    const handleEditClass = (id: string) => {
        // For demo, just log
        alert('Edit class ' + id);
    };
    const handleCancelClass = (id: string) => {
        setClasses(prev => prev.map(c => c.id === id ? { ...c, status: 'rejected' } : c));
    };
    const handleManualCheckIn = () => {
        alert('Manual check-in (demo)');
    };
    const handleQRCheckIn = () => {
        alert('QR check-in (demo)');
    };

    return (
        <ClassContext.Provider value={{
            classes,
            bookings,
            checkIns,
            handleAcceptClass,
            handleRejectClass,
            handleCounterPropose,
            handleEditClass,
            handleCancelClass,
            handleManualCheckIn,
            handleQRCheckIn,
        }}>
            {children}
        </ClassContext.Provider>
    );
}; 