// Unified payment method types
export type CardPaymentMethod = 'visa' | 'mastercard' | 'carte_bancaire';
export type OnlinePaymentMethod = 'edinar_smart' | 'flouci' | 'd17' | 'mobiflouss' | 'paymee' | 'tayarapay' | CardPaymentMethod;
export type OfflinePaymentMethod = 'cash_at_gym';

export type PaymentMethod = CardPaymentMethod | OnlinePaymentMethod | OfflinePaymentMethod;

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';

export type PaymentType = 'class' | 'program' | 'private_session' | 'product' | 'subscription' | 'membership';

export interface PaymentError {
  code: string;
  message: string;
  details?: any;
}

export interface GymPaymentDetails {
  gymId: string;
  gymName: string;
  paymentCode: string;
  paymentInstructions: string;
}

export interface PaymentMethodDetails {
  id: string;
  type: PaymentMethod;
  label: string;
  description: string;
  icon: string;
  isOnline: boolean;
  supportedCurrencies: string[];
  processingFee?: number;
}

export interface PaymentRequest {
  // Core payment details
  amount: number;
  currency: string;
  description: string;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  
  // Related entities
  userId: string;
  itemId: string; // ID of the item being paid for (classId, programId, etc.)
  
  // Location info for gym payments
  gymId?: string;
  gymName?: string;
  
  // Metadata for tracking and notifications
  metadata: {
    itemName: string;
    itemType: PaymentType;
    bookingId?: string;
    subscriptionId?: string;
    productId?: string;
    programId?: string;
    classId?: string;
    sessionId?: string;
  };
  
  // Callbacks and redirects
  redirectUrl?: string;
  callbackUrl?: string;
  
  // Additional payment options
  savePaymentMethod?: boolean;
  isRecurring?: boolean;
}

export interface PaymentResponse {
  // Core response
  id: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  
  // Transaction details
  transactionId?: string;
  receiptUrl?: string;
  authorizationCode?: string;
  
  // Timing
  createdAt: Date;
  updatedAt?: Date;
  processedAt?: Date;
  expiresAt?: Date;
  
  // Related entities
  userId: string;
  itemId: string;
  itemType: PaymentType;
  
  // Gym payment details (if applicable)
  gymPaymentDetails?: GymPaymentDetails;
  
  // Error handling
  error?: PaymentError;
}

export const PAYMENT_METHODS: Record<PaymentMethod, PaymentMethodDetails> = {
  // Online payment methods
  edinar_smart: {
    id: 'edinar_smart',
    type: 'edinar_smart',
    label: 'e-Dinar Smart',
    description: 'National prepaid card system by La Poste Tunisienne',
    icon: '/payment/edinar-smart.svg',
    isOnline: true,
    supportedCurrencies: ['TND'],
  },
  carte_bancaire: {
    id: 'carte_bancaire',
    type: 'carte_bancaire',
    label: 'Carte Bancaire',
    description: 'Tunisian bank cards via SMT or Monétique Tunisie gateways',
    icon: '/payment/cb.svg',
    isOnline: true,
    supportedCurrencies: ['TND'],
  },
  visa: {
    id: 'visa',
    type: 'visa',
    label: 'Visa',
    description: 'International Visa cards',
    icon: '/payment/visa.svg',
    isOnline: true,
    supportedCurrencies: ['TND', 'USD', 'EUR'],
  },
  mastercard: {
    id: 'mastercard',
    type: 'mastercard',
    label: 'Mastercard',
    description: 'International Mastercard',
    icon: '/payment/mastercard.svg',
    isOnline: true,
    supportedCurrencies: ['TND', 'USD', 'EUR'],
  },
  flouci: {
    id: 'flouci',
    type: 'flouci',
    label: 'Flouci',
    description: 'Mobile wallet and payment app',
    icon: '/payment/flouci.svg',
    isOnline: true,
    supportedCurrencies: ['TND'],
  },
  d17: {
    id: 'd17',
    type: 'd17',
    label: 'D17',
    description: 'Payment solution provided by BIAT Bank',
    icon: '/payment/d17.svg',
    isOnline: true,
    supportedCurrencies: ['TND'],
  },
  mobiflouss: {
    id: 'mobiflouss',
    type: 'mobiflouss',
    label: 'Mobiflouss',
    description: 'USSD-based payment via Tunisie Télécom',
    icon: '/payment/mobiflouss.svg',
    isOnline: true,
    supportedCurrencies: ['TND'],
  },
  paymee: {
    id: 'paymee',
    type: 'paymee',
    label: 'Paymee',
    description: 'Aggregator for e-Dinar, cards, and wallets',
    icon: '/payment/paymee.svg',
    isOnline: true,
    supportedCurrencies: ['TND'],
  },
  tayarapay: {
    id: 'tayarapay',
    type: 'tayarapay',
    label: 'TayaraPay',
    description: 'For digital products',
    icon: '/payment/tayarapay.svg',
    isOnline: true,
    supportedCurrencies: ['TND'],
  },
  // Offline payment method
  cash_at_gym: {
    id: 'cash_at_gym',
    type: 'cash_at_gym',
    label: 'Cash at Gym',
    description: 'Pay in person at the gym counter',
    icon: '/payment/cash.svg',
    isOnline: false,
    supportedCurrencies: ['TND'],
  },
};

// Helper function to get payment method by ID
export const getPaymentMethod = (methodId: string): PaymentMethodDetails | undefined => {
  return PAYMENT_METHODS[methodId as keyof typeof PAYMENT_METHODS];
};

// Helper function to get online payment methods
export const getOnlinePaymentMethods = (): PaymentMethodDetails[] => {
  return Object.values(PAYMENT_METHODS).filter((method) => method.isOnline);
};

// Helper function to get offline payment methods
export const getOfflinePaymentMethods = (): PaymentMethodDetails[] => {
  return Object.values(PAYMENT_METHODS).filter((method) => !method.isOnline);
};

// Helper function to get supported payment methods for a currency
export const getSupportedPaymentMethods = (currency: string): PaymentMethodDetails[] => {
  return Object.values(PAYMENT_METHODS).filter((method) =>
    method.supportedCurrencies.includes(currency)
  );
};
