import { useState, useEffect } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { Notification } from '@/types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  BellRing, 
  Check, 
  CheckCheck, 
  Calendar, 
  MessageSquare, 
  ShoppingBag,
  Clock,
  Info,
  Trash,
  Dumbbell,
  Filter
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function NotificationsPage() {
  const { notifications, markAsRead, deleteNotification, clearAllNotifications } = useNotifications();
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'system' | 'class' | 'order' | 'message'>('all');
  const [showClearDialog, setShowClearDialog] = useState(false);

  // Format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diff / (1000 * 60));
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes} min${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    // Filter by read status
    if (filter === 'read' && !notification.isRead) return false;
    if (filter === 'unread' && notification.isRead) return false;
    
    // Filter by type
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    
    return true;
  });

  // Get notification icon based on type
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'system':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'class':
        return <Dumbbell className="h-4 w-4 text-green-500" />;
      case 'order':
        return <ShoppingBag className="h-4 w-4 text-purple-500" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-amber-500" />;
      default:
        return <BellRing className="h-4 w-4" />;
    }
  };

  // Get notification badge variant based on type
  const getNotificationBadgeVariant = (type: Notification['type']) => {
    switch (type) {
      case 'system':
        return "default";
      case 'class':
        return "secondary";
      case 'order':
        return "outline";
      case 'message':
        return "destructive";
      default:
        return "outline";
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    filteredNotifications.forEach(notification => {
      if (!notification.isRead) {
        markAsRead(notification.id);
      }
    });
    
    toast({
      title: "Notifications marked as read",
      description: "All notifications have been marked as read."
    });
  };

  // Handle clear all notifications
  const handleClearAll = () => {
    clearAllNotifications();
    setShowClearDialog(false);
    
    toast({
      title: "Notifications cleared",
      description: "All notifications have been cleared."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your fitness journey</p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={!filteredNotifications.some(n => !n.isRead)}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={filteredNotifications.length === 0}>
                <Trash className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your current notifications.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAll}>
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Tabs 
          defaultValue="all" 
          className="w-full" 
          onValueChange={(value) => setFilter(value as 'all' | 'unread' | 'read')}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {notifications.filter(n => !n.isRead).length > 0 && (
                <Badge className="ml-2 bg-primary" variant="secondary">
                  {notifications.filter(n => !n.isRead).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="hidden md:flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select 
            className="text-sm border-0 bg-transparent" 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'system' | 'class' | 'order' | 'message')}
          >
            <option value="all">All types</option>
            <option value="system">System</option>
            <option value="class">Classes</option>
            <option value="order">Orders</option>
            <option value="message">Messages</option>
          </select>
        </div>
      </div>

      {filteredNotifications.length > 0 ? (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-all ${notification.isRead ? 'bg-card' : 'bg-muted/20 border-l-4 border-l-primary'}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className={`h-10 w-10 ${!notification.isRead ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                    <AvatarFallback>
                      {getNotificationIcon(notification.type)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`font-medium ${!notification.isRead ? 'text-primary' : ''}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                      <Badge variant={getNotificationBadgeVariant(notification.type)}>
                        {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatDate(new Date(notification.createdAt))}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Mark as read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <BellRing className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">No notifications</CardTitle>
            <CardDescription>
              {filter === 'all' && typeFilter === 'all' 
                ? "You don't have any notifications yet."
                : "No notifications match your current filters."
              }
            </CardDescription>
          </CardContent>
        </Card>
      )}

      {/* Mobile filter */}
      <div className="md:hidden">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Filter by type</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <select 
              className="w-full p-2 border rounded-md"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'system' | 'class' | 'order' | 'message')}
            >
              <option value="all">All types</option>
              <option value="system">System</option>
              <option value="class">Classes</option>
              <option value="order">Orders</option>
              <option value="message">Messages</option>
            </select>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}