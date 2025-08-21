import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { 
  Check, 
  Crown, 
  CreditCard, 
  CalendarRange,
  Clock,
  UserPlus,
  ArrowRight,
  RefreshCcw,
  XCircle,
  FileText,
  ShieldCheck,
  Award
} from 'lucide-react';

// Subscription plans data
const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Basic access to the platform',
    features: [
      'Track workouts',
      'Browse classes and gyms',
      'Basic analytics',
      'Community access'
    ],
    limitations: [
      'Limited class bookings (2 per month)',
      'No AI coaching',
      'No premium content access',
      'Basic workout analytics'
    ],
    recommended: false,
    color: 'bg-gray-100'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    description: 'Enhanced fitness experience',
    features: [
      'All Free features',
      'Unlimited class bookings',
      'AI coaching (10 sessions/month)',
      'Advanced analytics',
      'Workout plan creation',
      '10% discount on marketplace'
    ],
    limitations: [
      'Limited personal coaching',
      'Standard support'
    ],
    recommended: true,
    color: 'bg-blue-50'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    description: 'Ultimate fitness solution',
    features: [
      'All Premium features',
      '1-on-1 coaching sessions (2/month)',
      'Unlimited AI coaching',
      'Custom nutrition plans',
      'Priority support',
      'Early access to new features',
      '20% discount on marketplace'
    ],
    limitations: [],
    recommended: false,
    color: 'bg-purple-50'
  }
];

// Add-ons data
const addOns = [
  {
    id: 'nutrition',
    name: 'Nutrition Planning',
    price: 4.99,
    description: 'Custom nutrition plans and meal recommendations',
    icon: <FileText className="h-5 w-5" />
  },
  {
    id: 'personal-coaching',
    name: 'Personal Coaching',
    price: 9.99,
    description: '2 additional 1-on-1 coaching sessions per month',
    icon: <UserPlus className="h-5 w-5" />
  },
  {
    id: 'family',
    name: 'Family Add-on',
    price: 7.99,
    description: 'Add up to 3 family members to your subscription',
    icon: <UserPlus className="h-5 w-5" />
  }
];

// Payment method interface
interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  last4?: string;
  expiryDate?: string;
  name: string;
  isDefault: boolean;
}

// Mock payment methods
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'card-1',
    type: 'card',
    last4: '4242',
    expiryDate: '04/25',
    name: 'Visa ending in 4242',
    isDefault: true
  },
  {
    id: 'card-2',
    type: 'card',
    last4: '1234',
    expiryDate: '12/24',
    name: 'Mastercard ending in 1234',
    isDefault: false
  },
  {
    id: 'paypal-1',
    type: 'paypal',
    name: 'PayPal - john@example.com',
    isDefault: false
  }
];

// Subscription billing history
const mockBillingHistory = [
  {
    id: 'inv-001',
    date: new Date('2023-06-01'),
    amount: 9.99,
    status: 'Paid',
    plan: 'Premium Monthly'
  },
  {
    id: 'inv-002',
    date: new Date('2023-07-01'),
    amount: 9.99,
    status: 'Paid',
    plan: 'Premium Monthly'
  },
  {
    id: 'inv-003',
    date: new Date('2023-08-01'),
    amount: 9.99,
    status: 'Paid',
    plan: 'Premium Monthly'
  }
];

export default function SubscriptionPage() {
  const { user, setUser } = useUser();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState(user?.subscription?.plan || 'free');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancellationDialog, setShowCancellationDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [billingHistory, setBillingHistory] = useState(mockBillingHistory);

  // Format date as MM/DD/YYYY
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Calculate total subscription price
  const calculateTotalPrice = () => {
    const basePlan = subscriptionPlans.find(plan => plan.id === selectedPlan);
    let basePrice = basePlan?.price || 0;
    
    // Apply annual discount
    if (billingPeriod === 'annual') {
      basePrice = basePrice * 10; // 2 months free
    }
    
    // Add add-ons
    const addOnsTotal = selectedAddOns.reduce((total, addonId) => {
      const addon = addOns.find(item => item.id === addonId);
      return total + (addon?.price || 0);
    }, 0);
    
    return {
      basePrice,
      addOnsTotal,
      total: basePrice + addOnsTotal
    };
  };

  // Handle plan change
  const handlePlanChange = (planId: string) => {
    setSelectedPlan(planId);
  };

  // Handle add-on toggle
  const handleAddOnToggle = (addonId: string) => {
    setSelectedAddOns(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId) 
        : [...prev, addonId]
    );
  };

  // Set payment method as default
  const setDefaultPaymentMethod = (methodId: string) => {
    setPaymentMethods(prev => prev.map(method => ({
      ...method,
      isDefault: method.id === methodId
    })));

    toast({
      title: "Default payment method updated",
      description: "Your default payment method has been updated successfully."
    });
  };

  // Remove payment method
  const removePaymentMethod = (methodId: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== methodId));

    toast({
      title: "Payment method removed",
      description: "Your payment method has been removed successfully."
    });
  };

  // Handle subscription update
  const handleUpdateSubscription = () => {
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      if (user) {
        const updatedUser = {
          ...user,
          subscription: {
            id: user.subscription?.id || '1',
            plan: selectedPlan as 'free' | 'premium' | 'pro',
            startDate: new Date(),
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            autoRenew: true
          }
        };
        setUser(updatedUser);
      }
      
      setIsProcessing(false);
      
      toast({
        title: "Subscription updated",
        description: `Your subscription has been updated to ${selectedPlan.toUpperCase()}.`,
      });
    }, 2000);
  };

  // Handle subscription cancellation
  const handleCancelSubscription = () => {
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      if (user) {
        const updatedUser = {
          ...user,
          subscription: {
            ...user.subscription!,
            autoRenew: false
          }
        };
        setUser(updatedUser);
      }
      
      setIsProcessing(false);
      setShowCancellationDialog(false);
      
      toast({
        title: "Auto-renewal disabled",
        description: "Your subscription will not renew at the end of the billing period.",
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Subscription</h1>
          <p className="text-muted-foreground">Manage your subscription plan and billing</p>
        </div>
      </div>

      <Tabs defaultValue="plans">
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
        </TabsList>
        
        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          {/* Current Subscription */}
          {user?.subscription && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  Current Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary">{user.subscription.plan}</Badge>
                        {user.subscription.autoRenew ? (
                          <Badge variant="outline" className="border-green-500 text-green-600">
                            <RefreshCcw className="mr-1 h-3 w-3" />
                            Auto-renew on
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-red-500 text-red-600">
                            <XCircle className="mr-1 h-3 w-3" />
                            Expires soon
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Renews on {formatDate(new Date(user.subscription.endDate))}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            {user.subscription.autoRenew ? "Cancel Subscription" : "Reactivate"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {user.subscription.autoRenew
                                ? "Cancel your subscription?"
                                : "Reactivate your subscription?"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {user.subscription.autoRenew
                                ? "Your subscription will remain active until the end of the current billing period."
                                : "Your subscription will be renewed at the end of the current period."}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          {user.subscription.autoRenew && (
                            <div className="py-4">
                              <label className="text-sm font-medium">
                                Please tell us why you're cancelling (optional)
                              </label>
                              <textarea
                                className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                rows={3}
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Your feedback helps us improve"
                              />
                            </div>
                          )}
                          <AlertDialogFooter>
                            <AlertDialogCancel>Nevermind</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                if (user?.subscription?.autoRenew) {
                                  handleCancelSubscription();
                                } else {
                                  // Handle reactivation
                                  if (user) {
                                    const updatedUser = {
                                      ...user,
                                      subscription: {
                                        ...user.subscription!,
                                        autoRenew: true
                                      }
                                    };
                                    setUser(updatedUser);
                                    toast({
                                      title: "Subscription reactivated",
                                      description: "Your subscription will renew automatically."
                                    });
                                  }
                                }
                              }}
                            >
                              {user.subscription.autoRenew ? "Cancel Subscription" : "Reactivate"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subscription Plans */}
          <Card>
            <CardHeader>
              <CardTitle>Choose a Plan</CardTitle>
              <CardDescription>
                Select the plan that best fits your fitness journey
              </CardDescription>
              <div className="flex items-center justify-end">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${billingPeriod === 'monthly' ? 'font-medium' : 'text-muted-foreground'}`}>
                    Monthly
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="billing-toggle"
                      className="peer sr-only"
                      checked={billingPeriod === 'annual'}
                      onChange={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
                    />
                    <label
                      htmlFor="billing-toggle"
                      className="flex h-6 w-11 cursor-pointer items-center rounded-full bg-muted p-1 transition-colors duration-300 peer-checked:bg-primary"
                    >
                      <div className="h-4 w-4 rounded-full bg-white transition-transform duration-300 peer-checked:translate-x-5" />
                    </label>
                  </div>
                  <span className={`text-sm ${billingPeriod === 'annual' ? 'font-medium' : 'text-muted-foreground'}`}>
                    Annual <Badge variant="outline" className="ml-1 text-xs">Save 16%</Badge>
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                {subscriptionPlans.map((plan) => (
                  <Card 
                    key={plan.id}
                    className={`border-2 ${selectedPlan === plan.id ? 'border-primary' : 'border-muted'} ${plan.color}`}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        {plan.recommended && (
                          <Badge className="bg-primary">Recommended</Badge>
                        )}
                      </div>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-2">
                        <span className="text-2xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      {billingPeriod === 'annual' && plan.price > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          ${(plan.price * 10).toFixed(2)} billed annually (2 months free)
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Features</h4>
                        <ul className="space-y-2">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Check className="h-4 w-4 text-green-500 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {plan.limitations.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Limitations</h4>
                          <ul className="space-y-2">
                            {plan.limitations.map((limitation, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                                <span>{limitation}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant={selectedPlan === plan.id ? "default" : "outline"}
                        className="w-full"
                        onClick={() => handlePlanChange(plan.id)}
                      >
                        {selectedPlan === plan.id ? "Selected" : (
                          user?.subscription?.plan === plan.id ? "Current Plan" : "Select Plan"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Add-ons */}
          <Card>
            <CardHeader>
              <CardTitle>Customize with Add-ons</CardTitle>
              <CardDescription>
                Enhance your subscription with these optional add-ons
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {addOns.map((addon) => (
                <Card key={addon.id} className="border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 rounded-full bg-muted">
                        {addon.icon}
                      </div>
                      <CardTitle className="text-md">{addon.name}</CardTitle>
                    </div>
                    <Checkbox
                      checked={selectedAddOns.includes(addon.id)}
                      onCheckedChange={() => handleAddOnToggle(addon.id)}
                    />
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mt-2">{addon.description}</CardDescription>
                    <div className="mt-4 font-medium">
                      ${addon.price}/month
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Plan ({selectedPlan})</span>
                  <span>${calculateTotalPrice().basePrice.toFixed(2)}</span>
                </div>
                {selectedAddOns.length > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Add-ons</span>
                      <span>${calculateTotalPrice().addOnsTotal.toFixed(2)}</span>
                    </div>
                    {selectedAddOns.map(addonId => {
                      const addon = addOns.find(a => a.id === addonId);
                      return addon ? (
                        <div key={addon.id} className="flex justify-between pl-4 text-sm">
                          <span className="text-muted-foreground">{addon.name}</span>
                          <span>${addon.price.toFixed(2)}</span>
                        </div>
                      ) : null;
                    })}
                  </>
                )}
                <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                  <span>Total ({billingPeriod})</span>
                  <span>${calculateTotalPrice().total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleUpdateSubscription}
                disabled={isProcessing || selectedPlan === user?.subscription?.plan}
              >
                {isProcessing ? "Processing..." : "Update Subscription"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View your billing history and download invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <div className="grid grid-cols-5 font-medium p-3 border-b text-sm">
                  <div>Date</div>
                  <div>Invoice</div>
                  <div>Plan</div>
                  <div>Amount</div>
                  <div className="text-right">Status</div>
                </div>
                {billingHistory.length > 0 ? (
                  billingHistory.map((invoice) => (
                    <div key={invoice.id} className="grid grid-cols-5 p-3 border-b last:border-0 text-sm">
                      <div>{formatDate(invoice.date)}</div>
                      <div>{invoice.id}</div>
                      <div>{invoice.plan}</div>
                      <div>${invoice.amount.toFixed(2)}</div>
                      <div className="text-right">
                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No billing history found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Payment Methods Tab */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payment methods and default payment option
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.length > 0 ? (
                paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center space-x-4">
                      {method.type === 'card' ? (
                        <CreditCard className="h-8 w-8 text-primary" />
                      ) : (
                        <div className="h-8 w-8 bg-blue-500 text-white flex items-center justify-center font-bold rounded">
                          P
                        </div>
                      )}
                      <div>
                        <div className="font-medium">
                          {method.name}
                          {method.isDefault && (
                            <Badge variant="secondary" className="ml-2">Default</Badge>
                          )}
                        </div>
                        {method.type === 'card' && method.expiryDate && (
                          <div className="text-sm text-muted-foreground">Expires {method.expiryDate}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!method.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDefaultPaymentMethod(method.id)}
                        >
                          Set as Default
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePaymentMethod(method.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No payment methods found
                </div>
              )}
              
              {/* Add Payment Method */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full mt-4">
                    Add Payment Method
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Payment Method</DialogTitle>
                    <DialogDescription>
                      Add a new credit card or payment method to your account
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Card Number</label>
                      <Input placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Expiration Date</label>
                        <Input placeholder="MM/YY" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">CVC</label>
                        <Input placeholder="123" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name on Card</label>
                      <Input placeholder="John Doe" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="save-card" />
                      <label htmlFor="save-card" className="text-sm">
                        Set as default payment method
                      </label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={() => {
                      toast({
                        title: "Payment method added",
                        description: "Your new payment method has been added successfully."
                      });
                    }}>
                      Add Payment Method
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}