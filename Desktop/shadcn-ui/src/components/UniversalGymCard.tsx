import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Dumbbell, QrCode, Share2 } from 'lucide-react';
import { ShareButton } from '@/components/ShareButton';
import { Gym } from '@/types';

interface UniversalGymCardProps {
    gym: Gym;
    onClick: () => void;
    onCheckIn: () => void;
    showCheckInButton?: boolean;
    className?: string;
}

export default function UniversalGymCard({
    gym,
    onClick,
    onCheckIn,
    showCheckInButton = true,
    className = ""
}: UniversalGymCardProps) {
    return (
        <Card className={`overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${className}`} onClick={onClick}>
            <div className="aspect-video bg-muted" />
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium">{gym.name}</h3>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="text-xs font-medium">{gym.rating}</span>
                        </div>
                        <div className="flex items-center">
                            <ShareButton
                                url={`${window.location.origin}/gyms/${gym.id}`}
                                title={`Check out ${gym.name} on SportFlare`}
                                description={gym.description}
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                icon={<Share2 className="h-3 w-3" />}
                            />
                        </div>
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
                {showCheckInButton && (
                    <Button
                        className="mt-2 w-full"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onCheckIn();
                        }}
                    >
                        <QrCode className="h-4 w-4 mr-2" />
                        Check In
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
