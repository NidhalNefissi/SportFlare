import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, QrCode, Share2 } from 'lucide-react';
import { ShareButton } from '@/components/ShareButton';
import { Gym } from '@/types';
import { useNavigate, Link } from 'react-router-dom';
import { mockClasses } from '@/data/mockData';

interface GymDetailDialogProps {
    gym: Gym | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onClassClick?: (classId: string) => void;
    onCheckInClick?: () => void;
    onBookClassClick?: () => void;
}

const GymDetailDialog = React.memo(({ gym, open, onOpenChange, onClassClick, onCheckInClick, onBookClassClick }: GymDetailDialogProps) => {
    const navigate = useNavigate();

    if (!gym) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] z-[1003]">
                <DialogHeader>
                    <DialogTitle>{gym.name}</DialogTitle>
                    <DialogDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {gym.address}, {gym.city}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="aspect-video bg-muted rounded-md" />
                        <div>
                            <h3 className="font-medium">Description</h3>
                            <p className="text-sm text-muted-foreground">{gym.description}</p>
                        </div>
                        <div>
                            <h3 className="font-medium">Amenities</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {gym.amenities.map((amenity, i) => (
                                    <Badge key={i} variant="secondary">{amenity}</Badge>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{gym.rating}</span>
                                <span className="text-muted-foreground text-sm">({Math.floor(Math.random() * 100) + 30} reviews)</span>
                            </div>
                            <ShareButton
                                url={`${window.location.origin}/gyms/${gym.id}`}
                                title={`Check out ${gym.name} on SportFlare`}
                                description={gym.description}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                icon={<Share2 className="h-3.5 w-3.5" />}
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="border rounded-md h-[200px] flex items-center justify-center bg-muted/50">
                            <MapPin className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="font-medium">Classes Today</h3>
                            <div className="space-y-2 mt-2">
                                {mockClasses.filter(c => gym && c.gym.id === gym.id).map((classItem) => (
                                    <div key={classItem.id} className="border rounded-md p-2 hover:shadow">
                                        <Link
                                            to={`/classes/${classItem.id}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onOpenChange(false);
                                                // Let the Link component handle the navigation
                                            }}
                                            className="flex items-center justify-between w-full"
                                        >
                                            <div>
                                                <div className="font-medium">{classItem.title}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(classItem.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} with {classItem.coach.name}
                                                </div>
                                            </div>
                                            <div className="text-sm font-semibold">{classItem.price} TND</div>
                                        </Link>
                                    </div>
                                ))}
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
                <DialogFooter className="sm:justify-between">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <div className="flex gap-2">
                        {onBookClassClick && (
                            <Button onClick={onBookClassClick}>
                                Book a Class
                            </Button>
                        )}
                        {onCheckInClick && (
                            <Button onClick={onCheckInClick}>
                                <QrCode className="h-4 w-4 mr-2" />
                                Check In
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});

GymDetailDialog.displayName = 'GymDetailDialog';

// Export as default to match the import in useUniversalGymDialog.tsx
export default GymDetailDialog;

// Also keep the named exports for other components that might be using them
export { GymDetailDialog };
export type { GymDetailDialogProps };
