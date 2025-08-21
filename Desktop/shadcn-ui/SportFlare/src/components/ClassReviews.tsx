import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { Review } from '@/types';
import { useReviews } from '@/context/ReviewContext';
import apiService from '@/services/api/apiService';
import { formatDistanceToNow } from 'date-fns';

import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import ClassRatingForm from './ClassRatingForm';

interface ClassReviewsProps {
  classId: string;
  className: string;
}

export default function ClassReviews({ classId, className }: ClassReviewsProps) {
  const { user } = useUser();
  const { fetchReviews, markHelpful, replyToReview } = useReviews();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [helpfulClicked, setHelpfulClicked] = useState<Record<string, boolean>>({});

  const loadReviews = async () => {
    setLoading(true);
    try {
      const fetchedReviews = await fetchReviews(classId, 'class');
      setReviews(fetchedReviews);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [classId]);

  const handleHelpfulClick = async (reviewId: string) => {
    if (!user || helpfulClicked[reviewId]) return;
    
    try {
      await markHelpful(reviewId);
      
      // Update local state
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === reviewId 
            ? { ...review, helpfulCount: (review.helpfulCount || 0) + 1 } 
            : review
        )
      );
      
      // Mark as clicked to prevent multiple clicks
      setHelpfulClicked(prev => ({ ...prev, [reviewId]: true }));
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
    }
  };

  const handleReply = async (reviewId: string) => {
    if (!user || !replyText.trim() || submittingReply) return;
    
    setSubmittingReply(true);
    try {
      await replyToReview(reviewId, {
        userId: user.id,
        userName: user.name,
        content: replyText
      });
      
      // Update local state with the reply
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === reviewId 
            ? { 
                ...review, 
                reply: {
                  userId: user.id,
                  userName: user.name,
                  content: replyText,
                  timestamp: new Date()
                } 
              } 
            : review
        )
      );
      
      // Reset reply state
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to reply to review:', error);
    } finally {
      setSubmittingReply(false);
    }
  };

  const isUserOwnerOrAdmin = () => {
    if (!user) return false;
    // Check if user is admin or the coach of this class
    return user.role === 'admin' || user.role === 'coach';
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return <div className="py-4 text-center text-muted-foreground">Loading reviews...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Reviews</h3>
        {user && (
          <ClassRatingForm 
            classId={classId} 
            className={className} 
            afterSubmit={loadReviews}
          />
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">No reviews yet</p>
          {user && (
            <p className="mt-2 text-sm">Be the first to review {className}!</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={review.user.avatar} />
                      <AvatarFallback>
                        {review.user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{review.user.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {review.user.role}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-sm">
                  <p>{review.comment}</p>
                </div>
                
                <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 p-0 ${helpfulClicked[review.id] ? 'text-primary' : ''}`}
                    onClick={() => handleHelpfulClick(review.id)}
                    disabled={!user || helpfulClicked[review.id]}
                  >
                    <ThumbsUp className="mr-1 h-4 w-4" />
                    Helpful ({review.helpfulCount || 0})
                  </Button>
                  
                  {isUserOwnerOrAdmin() && !review.reply && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 p-0"
                      onClick={() => setReplyingTo(review.id)}
                    >
                      <MessageSquare className="mr-1 h-4 w-4" />
                      Reply
                    </Button>
                  )}
                </div>
                
                {/* Reply section */}
                {review.reply && (
                  <div className="mt-3 rounded-md bg-muted/50 p-3">
                    <div className="flex items-start space-x-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          Reply from {review.reply.userName}
                        </p>
                        <p className="mt-1 text-sm">{review.reply.content}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(review.reply.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Reply form */}
                {replyingTo === review.id && (
                  <div className="mt-3 space-y-2">
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={2}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReply(review.id)}
                        disabled={!replyText.trim() || submittingReply}
                      >
                        {submittingReply ? 'Submitting...' : 'Submit Reply'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}