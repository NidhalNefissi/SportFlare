import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import apiService from '@/services/api/apiService';
import { useReviews } from '@/context/ReviewContext';
import { toast } from 'sonner';

import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface ClassRatingFormProps {
  classId: string;
  className: string;
  afterSubmit?: () => void;
}

export default function ClassRatingForm({
  classId,
  className,
  afterSubmit,
}: ClassRatingFormProps) {
  const { user } = useUser();
  const { createReview, hasUserReviewed } = useReviews();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const checkIfReviewed = async () => {
    if (!user) return;
    const reviewed = await hasUserReviewed(classId, 'class', user.id);
    setHasReviewed(reviewed);
  };

  const handleSubmit = async () => {
    if (!user || rating === 0 || !comment.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await createReview({
        userId: user.id,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          avatar: user.avatar || ''
        },
        entityId: classId,
        entityType: 'class',
        rating,
        comment,
      });
      
      toast.success('Review submitted successfully');
      setIsOpen(false);
      setRating(0);
      setComment('');
      setHasReviewed(true);
      
      if (afterSubmit) {
        afterSubmit();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to submit review');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if user has already reviewed when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      checkIfReviewed();
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Write a Review
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate {className}</DialogTitle>
        </DialogHeader>
        
        {hasReviewed ? (
          <div className="py-6 text-center">
            <p className="mb-2">You have already reviewed this class.</p>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div>
                <div className="mb-2 text-sm font-medium">Your Rating</div>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-8 w-8 cursor-pointer ${
                        star <= (hoverRating || rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="comment" className="mb-2 block text-sm font-medium">
                  Your Review
                </label>
                <Textarea
                  id="comment"
                  placeholder="Write your review here..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={rating === 0 || !comment.trim() || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}