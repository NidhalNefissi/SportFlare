import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X, Edit, Clock, AlertCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface BookingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any & {
    isModificationRequest?: boolean;
    proposedChanges?: any;
    message?: string;
  };
  onAccept: (bookingId: string, message?: string) => void;
  onReject: (bookingId: string, reason?: string) => void;
  onSubmitProposal: (bookingId: string, changes: any, message: string) => void;
  isCoach?: boolean;
}

const BookingDetailsDialog: React.FC<BookingDetailsDialogProps> = ({
  open,
  onOpenChange,
  booking,
  onAccept,
  onReject,
  onSubmitProposal,
  isCoach = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isCounterProposing, setIsCounterProposing] = useState(false);
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [proposedDuration, setProposedDuration] = useState(0);
  const [message, setMessage] = useState('I would like to suggest the following changes to your booking:');

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [modificationMessage, setModificationMessage] = useState(
    booking.message || 'I would like to suggest the following changes to your booking:'
  );
  
  // Determine if this is a counter-proposal (client responding to coach's modification request)
  const isCounterProposal = !isCoach && booking.status === 'modification_requested';

  useEffect(() => {
    if (booking?.proposedChanges) {
      // When it's a counter-proposal, pre-fill with the coach's proposed changes
      if (isCounterProposal) {
        setProposedDate(booking.proposedChanges.date || format(new Date(booking.date), 'yyyy-MM-dd'));
        setProposedTime(booking.proposedChanges.time || booking.time);
        setProposedDuration(booking.proposedChanges.duration || booking.duration);
        setModificationMessage('I would like to propose the following adjustments to your suggested changes:');
      } else {
        setProposedDate('');
        setProposedTime('');
        setProposedDuration(0);
      }
    }
  }, [booking, isCounterProposal]);

  if (!booking) return null;

  const isModificationRequest = booking.isModificationRequest || false;

  const handleProposeChanges = async () => {
    if (!modificationMessage.trim()) {
      toast({
        title: 'Message Required',
        description: 'Please provide a message explaining the requested changes.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const changes: any = {};
      if (proposedDate) changes.date = proposedDate;
      if (proposedTime) changes.time = proposedTime;
      if (proposedDuration) changes.duration = proposedDuration;
      
      await onSubmitProposal(booking.id, changes, modificationMessage);
      setIsEditing(false);
      
      toast({
        title: 'Modification Request Sent',
        description: 'Your requested changes have been sent to the coach.',
      });
    } catch (error) {
      console.error('Error submitting modification request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit modification request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isModificationRequest ? 'Modification Request' : 'Session Details'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {format(new Date(booking.date), 'EEEE, MMMM d, yyyy')} at {booking.time}
            {isModificationRequest && ' (Current)'}
          </p>
        </DialogHeader>

        {(isModificationRequest || isCounterProposal) && (
          <div className={`p-4 rounded-md mb-4 ${
            isCounterProposal 
              ? 'bg-blue-50 dark:bg-blue-900/20' 
              : 'bg-yellow-50 dark:bg-yellow-900/20'
          }`}>
            <div className="flex items-start">
              <AlertCircle className={`h-4 w-4 mt-0.5 mr-2 flex-shrink-0 ${
                isCounterProposal 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-yellow-600 dark:text-yellow-400'
              }`} />
              <div>
                <p className={`text-sm font-medium ${
                  isCounterProposal 
                    ? 'text-blue-800 dark:text-blue-200' 
                    : 'text-yellow-800 dark:text-yellow-200'
                }`}>
                  {isCounterProposal 
                    ? 'Modification Request from Coach' 
                    : 'Modification Request'}
                </p>
                <p className={`text-sm ${
                  isCounterProposal 
                    ? 'text-blue-700 dark:text-blue-300' 
                    : 'text-yellow-700 dark:text-yellow-300'
                }`}>
                  {booking.message || 'A modification has been requested for this session.'}
                </p>
                {isCounterProposal && booking.proposedChanges?.message && (
                  <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-md border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Coach's Message:</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{booking.proposedChanges.message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge 
                variant={
                  booking.status === 'confirmed' ? 'default' : 
                  booking.status === 'rejected' ? 'destructive' :
                  'outline'
                }
                className={
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }
              >
                {booking.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Duration</span>
              <span className="text-sm">
                {isModificationRequest && proposedDuration ? (
                  <span className="flex items-center">
                    <span className="line-through text-muted-foreground mr-2">{booking.duration}</span>
                    <span>→</span>
                    <span className="ml-2 text-foreground">{proposedDuration}</span>
                  </span>
                ) : (
                  `${booking.duration} minutes`
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Location</span>
              <span className="text-sm">
                {isModificationRequest && booking.proposedChanges?.gymName ? (
                  <span className="flex items-center">
                    <span className="line-through text-muted-foreground mr-2">{booking.gymName}</span>
                    <span>→</span>
                    <span className="ml-2 text-foreground">{booking.proposedChanges.gymName}</span>
                  </span>
                ) : (
                  booking.gymName
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Price</span>
              <span className="text-sm">
                {isModificationRequest && booking.proposedChanges?.price ? (
                  <span className="flex items-center">
                    <span className="line-through text-muted-foreground mr-2">{booking.price} TND</span>
                    <span>→</span>
                    <span className="ml-2 text-foreground">{booking.proposedChanges.price} TND</span>
                  </span>
                ) : (
                  booking.price ? `${booking.price} TND` : 'Price not available'
                )}
              </span>
            </div>
          </div>

          {(isEditing || isCounterProposing) ? (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="modificationMessage">Message</Label>
                <Textarea
                  id="modificationMessage"
                  value={modificationMessage}
                  onChange={(e) => setModificationMessage(e.target.value)}
                  placeholder="Please explain the requested changes..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="proposedDate">Proposed Date</Label>
                  <Input
                    id="proposedDate"
                    type="date"
                    value={proposedDate || format(new Date(booking.date), 'yyyy-MM-dd')}
                    onChange={(e) => setProposedDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proposedTime">Proposed Time</Label>
                  <Input
                    id="proposedTime"
                    type="time"
                    value={proposedTime || booking.time}
                    onChange={(e) => setProposedTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="30"
                  step="30"
                  value={proposedDuration || booking.duration}
                  onChange={(e) => setProposedDuration(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">
                  {isCoach ? 'Message to Client' : 'Message to Coach'}
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={isCoach ? 'Please explain the proposed changes...' : 'Please explain the changes you would like to request...'}
                  className="min-h-[100px]"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {isCoach 
                    ? 'The client will receive this message with your proposed changes.'
                    : 'The coach will review your requested changes and respond shortly.'}
                </p>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <div className="flex justify-end space-x-2 w-full">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setIsCounterProposing(false);
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleProposeChanges}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    {isCounterProposing ? 'Submit Counter-Proposal' : isModificationRequest ? 'Request Changes' : 'Submit Changes'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 pt-4 border-t">
              {isCounterProposal ? (
                // Client actions when coach has requested modifications
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      className="flex-1"
                      onClick={() => onAccept(booking.id, 'I accept the proposed changes.')}
                      disabled={isSubmitting}
                    >
                      <Check className="h-4 w-4 mr-2" /> Accept Changes
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setIsCounterProposing(true);
                        setModificationMessage('I would like to propose the following adjustments to your suggested changes:');
                      }}
                      disabled={isSubmitting}
                    >
                      <Edit className="h-4 w-4 mr-2" /> Propose Adjustments
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => onReject(booking.id, 'I would like to keep the original booking details.')}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4 mr-2" /> Keep Original Booking
                  </Button>
                </div>
              ) : isCoach ? (
                // Coach actions
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={() => onAccept(booking.id)}
                    disabled={isSubmitting}
                  >
                    <Check className="h-4 w-4 mr-2" /> Accept
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => onReject(booking.id)}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4 mr-2" /> Reject
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsEditing(true);
                      setModificationMessage('I would like to suggest the following changes to your booking:');
                    }}
                    disabled={isSubmitting}
                  >
                    <Edit className="h-4 w-4 mr-2" /> Modify
                  </Button>
                </div>
              ) : (
                // Client actions
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsEditing(true);
                      setModificationMessage('I would like to request the following changes to my booking:');
                    }}
                    disabled={isSubmitting || booking.status === 'rejected'}
                  >
                    <Edit className="h-4 w-4 mr-2" /> Request Changes
                  </Button>
                  {booking.status === 'pending' && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => onReject(booking.id, 'I would like to cancel this booking request.')}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4 mr-2" /> Cancel Request
                    </Button>
                  )}
                </div>
              )}
              
              {!isCoach && booking.status === 'rejected' && (
                <div className="text-sm text-muted-foreground italic">
                  This booking has been rejected. Please contact the coach for more information.
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailsDialog;
