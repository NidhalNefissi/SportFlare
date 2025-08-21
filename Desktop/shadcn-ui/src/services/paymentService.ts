import { v4 as uuidv4 } from 'uuid';
import { 
  PaymentMethod, 
  PaymentRequest, 
  PaymentResponse,
  PaymentStatus,
  PaymentType,
  PaymentError,
  GymPaymentDetails,
  CardPaymentMethod,
  OnlinePaymentMethod,
  getPaymentMethod,
  getOnlinePaymentMethods,
  getOfflinePaymentMethods,
  getSupportedPaymentMethods
} from '@/types/payment';

// Mock database for pending payments (in a real app, this would be a database table)
const pendingPayments = new Map<string, PaymentResponse>();

// Unified payment service
class PaymentService {
  private static instance: PaymentService;
  
  private constructor() {}

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Process a payment with the selected payment method
   * Handles both online and gym payments
   */
  public async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    const { 
      amount, 
      paymentMethod, 
      currency = 'TND',
      paymentType,
      userId,
      itemId,
      gymId,
      gymName,
      metadata
    } = paymentRequest;

    const method = getPaymentMethod(paymentMethod);
    if (!method) {
      throw new Error('Invalid payment method');
    }

    // Generate a unique transaction ID
    const paymentId = `pay_${uuidv4().substring(0, 12)}`;
    const transactionId = `txn_${uuidv4().substring(0, 12)}`;
    const now = new Date();

    // Common response structure
    const baseResponse: Omit<PaymentResponse, 'status'> = {
      id: paymentId,
      amount,
      currency,
      paymentMethod,
      transactionId,
      userId,
      itemId,
      itemType: paymentType,
      createdAt: now,
    };

    try {
      // Handle different payment methods
      if (method.isOnline) {
        // Process online payment (card or other online methods)
        return await this.processOnlinePayment({
          ...baseResponse,
          paymentMethod: paymentMethod as CardPaymentMethod | OnlinePaymentMethod,
          paymentRequest
        });
      } else {
        // Handle gym payment
        return await this.processGymPayment({
          ...baseResponse,
          gymId: gymId!,
          gymName: gymName!,
          paymentRequest
        });
      }
    } catch (error) {
      console.error('Payment processing failed:', error);
      return {
        ...baseResponse,
        status: 'failed',
        error: {
          code: 'PROCESSING_ERROR',
          message: error instanceof Error ? error.message : 'Payment processing failed'
        }
      };
    }
  }

  /**
   * Process an online payment (card or other online methods)
   */
  private async processOnlinePayment(
    params: Omit<PaymentResponse, 'status'> & {
      paymentMethod: CardPaymentMethod | OnlinePaymentMethod;
      paymentRequest: PaymentRequest;
    }
  ): Promise<PaymentResponse> {
    const { paymentMethod, paymentRequest } = params;
    
    // Simulate API call delay (1-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simulate 90% success rate for demo
    const isSuccess = Math.random() > 0.1;
    
    if (!isSuccess) {
      return {
        ...params,
        status: 'failed',
        error: {
          code: 'PAYMENT_DECLINED',
          message: 'Payment was declined by the payment processor'
        }
      };
    }

    // Success case
    return {
      ...params,
      status: 'completed',
      processedAt: new Date(),
      receiptUrl: `https://api.example.com/receipts/${params.transactionId}`,
      authorizationCode: `AUTH_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    };
  }

  /**
   * Process a gym payment (pay at gym counter)
   */
  private async processGymPayment(
    params: Omit<PaymentResponse, 'status'> & {
      gymId: string;
      gymName: string;
      paymentRequest: PaymentRequest;
    }
  ): Promise<PaymentResponse> {
    const { gymId, gymName, paymentRequest } = params;
    const now = new Date();
    
    // Set expiration (24 hours from now)
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Generate a payment code for gym reference
    const paymentCode = `GYM-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Create pending payment
    const pendingPayment: PaymentResponse = {
      ...params,
      status: 'pending',
      expiresAt,
      gymPaymentDetails: {
        gymId,
        gymName,
        paymentCode,
        paymentInstructions: `Please provide this code at the ${gymName} counter to complete your payment.`
      }
    };
    
    // Store the pending payment (in a real app, this would be saved to a database)
    pendingPayments.set(paymentRequest.itemId, pendingPayment);
    
    // Set a timeout to expire the payment (in a real app, this would be handled by a background job)
    setTimeout(() => {
      const payment = pendingPayments.get(paymentRequest.itemId);
      if (payment?.status === 'pending') {
        payment.status = 'cancelled';
        // In a real app, you would also update the database and notify the user
      }
    }, 24 * 60 * 60 * 1000); // 24 hours
    
    return pendingPayment;
  }

  /**
   * Complete a pending gym payment
   */
  public async completeGymPayment(paymentId: string): Promise<PaymentResponse> {
    // In a real app, this would verify the payment with the gym's system
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const payment = pendingPayments.get(paymentId);
    if (!payment) {
      throw new Error('Payment not found or already processed');
    }
    
    if (payment.status !== 'pending') {
      throw new Error(`Payment is already ${payment.status}`);
    }
    
    // Update payment status
    const updatedPayment: PaymentResponse = {
      ...payment,
      status: 'completed',
      processedAt: new Date(),
      receiptUrl: `https://api.example.com/receipts/${payment.transactionId}`
    };
    
    // In a real app, you would update the database here
    pendingPayments.set(paymentId, updatedPayment);
    
    return updatedPayment;
  }

  /**
   * Get payment status
   */
  public async getPaymentStatus(paymentId: string): Promise<PaymentResponse | undefined> {
    // In a real app, this would query the database
    await new Promise(resolve => setTimeout(resolve, 500));
    return pendingPayments.get(paymentId);
  }

  /**
   * Get all pending payments for a user
   */
  public async getUserPendingPayments(userId: string): Promise<PaymentResponse[]> {
    // In a real app, this would query the database
    await new Promise(resolve => setTimeout(resolve, 500));
    return Array.from(pendingPayments.values())
      .filter(payment => 
        payment.userId === userId && 
        payment.status === 'pending' &&
        (!payment.expiresAt || payment.expiresAt > new Date())
      );
  }

  // Generate a payment code for offline payments
  public async generateOfflinePaymentCode(
    amount: number, 
    currency: string = 'TND',
    metadata: Record<string, any> = {}
  ): Promise<{ paymentCode: string; expiresAt: Date }> {
    // In a real app, this would generate a unique code and store it in the database
    const paymentCode = `OFFLINE-${Math.floor(100000 + Math.random() * 900000)}`;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expires in 24 hours
    
    return { paymentCode, expiresAt };
  }

  // Verify an offline payment
  public async verifyOfflinePayment(paymentCode: string): Promise<boolean> {
    // In a real app, this would check with your backend to verify the payment
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true; // For demo purposes, always return true
  }

  // Get available payment methods for a given currency
  public getAvailablePaymentMethods(currency: string = 'TND') {
    return getSupportedPaymentMethods(currency);
  }

  // Get online payment methods
  public getOnlinePaymentMethods() {
    return getOnlinePaymentMethods();
  }

  // Get offline payment methods
  public getOfflinePaymentMethods() {
    return getOfflinePaymentMethods();
  }

  // Format currency
  public formatCurrency(amount: number, currency: string = 'TND'): string {
    return new Intl.NumberFormat('ar-TN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 3,
    }).format(amount);
  }
}

export const paymentService = PaymentService.getInstance();
