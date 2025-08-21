import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, X, CheckCircle } from 'lucide-react';

interface QRScannerProps {
    isOpen: boolean;
    onClose: () => void;
    onScanSuccess: (result: string) => void;
    title?: string;
}

export default function QRScanner({ isOpen, onClose, onScanSuccess, title = "Scan QR Code" }: QRScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Simulate QR code scanning (in a real app, you'd use a QR code library like qr-scanner)
    const startScanning = async () => {
        try {
            setError(null);
            setIsScanning(true);

            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Use back camera if available
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }

            // Simulate successful scan after 3 seconds (replace with actual QR scanning logic)
            setTimeout(() => {
                const mockQRResult = `gym-checkin-${Date.now()}`;
                handleScanSuccess(mockQRResult);
            }, 3000);

        } catch (err) {
            setError('Camera access denied or not available');
            setIsScanning(false);
        }
    };

    const stopScanning = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsScanning(false);
    };

    const handleScanSuccess = (result: string) => {
        setScanResult(result);
        setIsScanning(false);
        stopScanning();

        // Call the success callback
        onScanSuccess(result);

        // Auto-close after 1.5 seconds to show success state
        setTimeout(() => {
            onClose();
            setScanResult(null);
        }, 1500);
    };

    const handleClose = () => {
        stopScanning();
        setScanResult(null);
        setError(null);
        onClose();
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopScanning();
        };
    }, []);

    // Stop scanning when modal closes
    useEffect(() => {
        if (!isOpen) {
            stopScanning();
            setScanResult(null);
            setError(null);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Camera Preview */}
                    <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
                        {!isScanning && !scanResult && !error && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center text-white space-y-2">
                                    <Camera className="h-12 w-12 mx-auto opacity-50" />
                                    <p className="text-sm opacity-75">Click "Start Scanning" to begin</p>
                                </div>
                            </div>
                        )}

                        {isScanning && (
                            <>
                                <video
                                    ref={videoRef}
                                    className="w-full h-full object-cover"
                                    playsInline
                                    muted
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="border-2 border-white rounded-lg w-48 h-48 relative">
                                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                                    </div>
                                </div>
                                <div className="absolute bottom-4 left-0 right-0 text-center">
                                    <p className="text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full inline-block">
                                        Position QR code within the frame
                                    </p>
                                </div>
                            </>
                        )}

                        {scanResult && (
                            <div className="absolute inset-0 flex items-center justify-center bg-green-600">
                                <div className="text-center text-white space-y-2">
                                    <CheckCircle className="h-16 w-16 mx-auto" />
                                    <p className="text-lg font-semibold">Check-in Successful!</p>
                                    <p className="text-sm opacity-90">Welcome to the gym</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="absolute inset-0 flex items-center justify-center bg-red-600">
                                <div className="text-center text-white space-y-2">
                                    <X className="h-12 w-12 mx-auto" />
                                    <p className="text-sm">{error}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex gap-2">
                        {!isScanning && !scanResult && (
                            <Button onClick={startScanning} className="flex-1" disabled={!!error}>
                                <Camera className="h-4 w-4 mr-2" />
                                Start Scanning
                            </Button>
                        )}

                        {isScanning && (
                            <Button onClick={stopScanning} variant="outline" className="flex-1">
                                Stop Scanning
                            </Button>
                        )}

                        <Button onClick={handleClose} variant="outline">
                            {scanResult ? 'Close' : 'Cancel'}
                        </Button>
                    </div>

                    {error && (
                        <div className="text-center">
                            <Button onClick={() => setError(null)} variant="outline" size="sm">
                                Try Again
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
