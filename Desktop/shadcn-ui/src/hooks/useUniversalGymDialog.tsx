import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gym } from '@/types';
import GymDetailDialog from '@/components/GymDetailDialog';
import QRScanner from '@/components/QRScanner';

export function useUniversalGymDialog() {
    const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
    const [isGymDialogOpen, setIsGymDialogOpen] = useState(false);
    const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
    const navigate = useNavigate();

    const handleViewGym = useCallback((gym: Gym) => {
        // Only update if the gym is different or dialog is not open
        if (gym.id !== selectedGym?.id || !isGymDialogOpen) {
            setSelectedGym(gym);
            setIsGymDialogOpen(true);
        }
    }, [isGymDialogOpen, selectedGym?.id]);

    const handleCheckIn = useCallback((gym?: Gym) => {
        if (gym) {
            setSelectedGym(gym);
        }
        setIsQRScannerOpen(true);
    }, []);

    const handleCheckInFromDialog = useCallback(() => {
        setIsGymDialogOpen(false);
        // Small delay to allow dialog to close before opening QR scanner
        setTimeout(() => {
            setIsQRScannerOpen(true);
        }, 100);
    }, []);

    const handleClassClick = useCallback(() => {
        if (selectedGym) {
            // Navigate to Classes page with gym filter preselected
            navigate(`/classes?gym=${encodeURIComponent(selectedGym.name)}`);
            // Close the dialog after a small delay
            setTimeout(() => {
                setIsGymDialogOpen(false);
            }, 100);
        }
    }, [navigate, selectedGym]);

    const handleQRScanSuccess = useCallback((result: string) => {
        console.log('QR Scan successful:', result);
        // Handle successful check-in here
        setIsQRScannerOpen(false);
    }, []);

    const GymDialogComponents = () => (
        <>
            {/* Gym Detail Dialog */}
            <GymDetailDialog
                gym={selectedGym}
                open={isGymDialogOpen}
                onOpenChange={setIsGymDialogOpen}
                onClassClick={handleClassClick}
                onBookClassClick={handleClassClick}
                onCheckInClick={handleCheckInFromDialog}
            />

            {/* QR Scanner Modal */}
            <QRScanner
                isOpen={isQRScannerOpen}
                onClose={() => setIsQRScannerOpen(false)}
                onScanSuccess={handleQRScanSuccess}
                title="Gym Check-In"
            />
        </>
    );

    return {
        selectedGym,
        isGymDialogOpen,
        isQRScannerOpen,
        handleViewGym,
        handleCheckIn,
        handleCheckInFromDialog,
        handleClassClick,
        GymDialogComponents,
    };
}
