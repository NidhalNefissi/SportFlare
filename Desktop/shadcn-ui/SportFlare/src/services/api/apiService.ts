import { 
  User, 
  UserRole, 
  Class, 
  Program, 
  Gym, 
  Product, 
  Brand,
  Order, 
  Message, 
  Notification,
  AIMessage,
  ClassProposal,
  ClassModification,
  ClassStatus
} from '@/types';

import { 
  mockUsers, 
  mockClasses, 
  mockPrograms, 
  mockGyms, 
  mockProducts, 
  mockOrders, 
  mockNotifications, 
  mockMessages, 
  mockAIMessages,
  mockBrands,
  mockBookings,
  mockCheckIns,
  Booking,
  BookingStatus,
  PaymentStatus,
  PaymentMethod,
  CheckIn,
  cloneWithDates
} from './mockData';

// Storage helpers
const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(`sportflare_${key}`, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

const loadFromStorage = <T>(key: string): T[] | null => {
  try {
    const data = localStorage.getItem(`sportflare_${key}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return null;
  }
};

class ApiService {
  private users: User[];
  private classes: Class[];
  private programs: Program[];
  private gyms: Gym[];
  private products: Product[];
  private orders: Order[];
  private notifications: Notification[];
  private messages: Message[];
  private aiMessages: AIMessage[];
  private brands: Brand[];
  private bookings: Booking[];
  private checkIns: CheckIn[];
  private classProposals: ClassProposal[];
  private classModifications: ClassModification[];
  
  constructor() {
    // Load data from localStorage or use mock data
    this.users = loadFromStorage<User>('users') || cloneWithDates(mockUsers);
    this.classes = loadFromStorage<Class>('classes') || cloneWithDates(mockClasses);
    this.programs = loadFromStorage<Program>('programs') || cloneWithDates(mockPrograms);
    this.gyms = loadFromStorage<Gym>('gyms') || cloneWithDates(mockGyms);
    this.products = loadFromStorage<Product>('products') || cloneWithDates(mockProducts);
    this.orders = loadFromStorage<Order>('orders') || cloneWithDates(mockOrders);
    this.notifications = loadFromStorage<Notification>('notifications') || cloneWithDates(mockNotifications);
    this.messages = loadFromStorage<Message>('messages') || cloneWithDates(mockMessages);
    this.aiMessages = loadFromStorage<AIMessage>('aiMessages') || cloneWithDates(mockAIMessages);
    this.brands = loadFromStorage<Brand>('brands') || cloneWithDates(mockBrands);
    this.bookings = loadFromStorage<Booking>('bookings') || cloneWithDates(mockBookings);
    this.checkIns = loadFromStorage<CheckIn>('checkIns') || cloneWithDates(mockCheckIns);
    
    // Initialize class proposals and modifications with empty arrays
    // In a real app, these would be loaded from the backend
    this.classProposals = loadFromStorage<ClassProposal>('classProposals') || [];
    this.classModifications = loadFromStorage<ClassModification>('classModifications') || [];
  }
  
  // User methods
  
  // Authentication
  async login(email: string, password: string): Promise<User | null> {
    // In a real API this would validate credentials against the server
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user ? cloneWithDates(user) : null;
  }
  
  async register(userData: { 
    name: string, 
    email: string, 
    password: string, 
    role: UserRole 
  }): Promise<User> {
    // Check if email already exists
    const existingUser = this.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existingUser) {
      throw new Error('Email already registered');
    }
    
    // In a real API this would create the user in the database
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      avatar: `/assets/avatars/${userData.role}.jpg`,
    };
    
    this.users.push(newUser);
    saveToStorage('users', this.users);
    return cloneWithDates(newUser);
  }
  
  async getUsers(role?: UserRole): Promise<User[]> {
    let users = this.users;
    if (role) {
      users = users.filter(user => user.role === role);
    }
    return cloneWithDates(users);
  }
  
  async getUserById(id: string): Promise<User | null> {
    const user = this.users.find(u => u.id === id);
    return user ? cloneWithDates(user) : null;
  }
  
  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) return null;
    
    const updatedUser = { ...this.users[userIndex], ...updates };
    this.users[userIndex] = updatedUser;
    saveToStorage('users', this.users);
    
    return cloneWithDates(updatedUser);
  }
  
  // Class methods
  async getClasses(filters?: {
    coachId?: string;
    gymId?: string;
    date?: Date;
    tags?: string[];
  }): Promise<Class[]> {
    let filteredClasses = this.classes;
    
    if (filters) {
      if (filters.coachId) {
        filteredClasses = filteredClasses.filter(c => c.coachId === filters.coachId);
      }
      
      if (filters.gymId) {
        filteredClasses = filteredClasses.filter(c => c.gymId === filters.gymId);
      }
      
      if (filters.date) {
        const filterDate = new Date(filters.date);
        filteredClasses = filteredClasses.filter(c => {
          const classDate = new Date(c.date);
          return classDate.toDateString() === filterDate.toDateString();
        });
      }
      
      if (filters.tags && filters.tags.length > 0) {
        filteredClasses = filteredClasses.filter(c => 
          filters.tags!.some(tag => c.tags.includes(tag))
        );
      }
    }
    
    return cloneWithDates(filteredClasses);
  }
  
  async getClassById(id: string): Promise<Class | null> {
    const classItem = this.classes.find(c => c.id === id);
    return classItem ? cloneWithDates(classItem) : null;
  }
  
  async createClass(classData: Omit<Class, 'id'>): Promise<Class> {
    const newClass: Class = {
      ...classData,
      id: `class_${Date.now()}`,
    };
    
    this.classes.push(newClass);
    saveToStorage('classes', this.classes);
    
    return cloneWithDates(newClass);
  }
  
  async updateClass(id: string, updates: Partial<Class>): Promise<Class | null> {
    const classIndex = this.classes.findIndex(c => c.id === id);
    if (classIndex === -1) return null;
    
    const updatedClass = { ...this.classes[classIndex], ...updates };
    this.classes[classIndex] = updatedClass;
    saveToStorage('classes', this.classes);
    
    return cloneWithDates(updatedClass);
  }
  
  async deleteClass(id: string): Promise<boolean> {
    const classIndex = this.classes.findIndex(c => c.id === id);
    if (classIndex === -1) return false;
    
    this.classes.splice(classIndex, 1);
    saveToStorage('classes', this.classes);
    
    return true;
  }
  
  // Program methods
  async getPrograms(coachId?: string): Promise<Program[]> {
    let programs = this.programs;
    if (coachId) {
      programs = programs.filter(p => p.coachId === coachId);
    }
    return cloneWithDates(programs);
  }
  
  async getProgramById(id: string): Promise<Program | null> {
    const program = this.programs.find(p => p.id === id);
    return program ? cloneWithDates(program) : null;
  }
  
  async createProgram(programData: Omit<Program, 'id'>): Promise<Program> {
    const newProgram: Program = {
      ...programData,
      id: `program_${Date.now()}`,
    };
    
    this.programs.push(newProgram);
    saveToStorage('programs', this.programs);
    
    return cloneWithDates(newProgram);
  }
  
  // Gym methods
  async getGyms(): Promise<Gym[]> {
    return cloneWithDates(this.gyms);
  }
  
  async getGymById(id: string): Promise<Gym | null> {
    const gym = this.gyms.find(g => g.id === id);
    return gym ? cloneWithDates(gym) : null;
  }
  
  // Product methods
  async getProducts(filters?: {
    brandId?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Product[]> {
    let filteredProducts = this.products;
    
    if (filters) {
      if (filters.brandId) {
        filteredProducts = filteredProducts.filter(p => p.brandId === filters.brandId);
      }
      
      if (filters.category) {
        filteredProducts = filteredProducts.filter(p => p.category === filters.category);
      }
      
      if (filters.minPrice !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.price >= filters.minPrice!);
      }
      
      if (filters.maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.price <= filters.maxPrice!);
      }
    }
    
    return cloneWithDates(filteredProducts);
  }
  
  async getProductById(id: string): Promise<Product | null> {
    const product = this.products.find(p => p.id === id);
    return product ? cloneWithDates(product) : null;
  }
  
  // Order methods
  async createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    const newOrder: Order = {
      ...orderData,
      id: `order_${Date.now()}`,
      createdAt: new Date(),
    };
    
    this.orders.push(newOrder);
    saveToStorage('orders', this.orders);
    
    // Update product stock
    for (const item of orderData.products) {
      const productIndex = this.products.findIndex(p => p.id === item.product.id);
      if (productIndex !== -1) {
        this.products[productIndex].stock -= item.quantity;
      }
    }
    saveToStorage('products', this.products);
    
    // Create notification for the user
    this.createNotification({
      userId: orderData.userId,
      title: 'Order Placed',
      message: `Your order #${newOrder.id} has been placed and is being processed.`,
      type: 'order',
      isRead: false,
      createdAt: new Date(),
    });
    
    return cloneWithDates(newOrder);
  }
  
  async getUserOrders(userId: string): Promise<Order[]> {
    const orders = this.orders.filter(o => o.userId === userId);
    return cloneWithDates(orders);
  }
  
  async updateOrderStatus(id: string, status: 'pending' | 'shipped' | 'delivered' | 'cancelled'): Promise<Order | null> {
    const orderIndex = this.orders.findIndex(o => o.id === id);
    if (orderIndex === -1) return null;
    
    const updatedOrder = { ...this.orders[orderIndex], status };
    this.orders[orderIndex] = updatedOrder;
    saveToStorage('orders', this.orders);
    
    // Create notification for the user
    this.createNotification({
      userId: updatedOrder.userId,
      title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your order #${updatedOrder.id} has been ${status}.`,
      type: 'order',
      isRead: false,
      createdAt: new Date(),
    });
    
    return cloneWithDates(updatedOrder);
  }
  
  // Notification methods
  async getNotifications(userId: string): Promise<Notification[]> {
    const notifications = this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    
    return cloneWithDates(notifications);
  }
  
  async createNotification(notificationData: Omit<Notification, 'id'>): Promise<Notification> {
    const newNotification: Notification = {
      ...notificationData,
      id: `notification_${Date.now()}`,
    };
    
    this.notifications.push(newNotification);
    saveToStorage('notifications', this.notifications);
    
    return cloneWithDates(newNotification);
  }
  
  async markNotificationAsRead(id: string): Promise<Notification | null> {
    const notificationIndex = this.notifications.findIndex(n => n.id === id);
    if (notificationIndex === -1) return null;
    
    const updatedNotification = { ...this.notifications[notificationIndex], isRead: true };
    this.notifications[notificationIndex] = updatedNotification;
    saveToStorage('notifications', this.notifications);
    
    return cloneWithDates(updatedNotification);
  }
  
  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const userNotifications = this.notifications.filter(n => n.userId === userId);
    
    for (let i = 0; i < userNotifications.length; i++) {
      if (!userNotifications[i].isRead) {
        const index = this.notifications.findIndex(n => n.id === userNotifications[i].id);
        if (index !== -1) {
          this.notifications[index].isRead = true;
        }
      }
    }
    
    saveToStorage('notifications', this.notifications);
  }
  
  // Message methods
  async getMessages(senderId: string, receiverId: string): Promise<Message[]> {
    const messages = this.messages.filter(m => 
      (m.senderId === senderId && m.receiverId === receiverId) || 
      (m.senderId === receiverId && m.receiverId === senderId)
    ).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    return cloneWithDates(messages);
  }
  
  async sendMessage(messageData: Omit<Message, 'id' | 'timestamp' | 'isRead'>): Promise<Message> {
    const newMessage: Message = {
      ...messageData,
      id: `message_${Date.now()}`,
      timestamp: new Date(),
      isRead: false,
    };
    
    this.messages.push(newMessage);
    saveToStorage('messages', this.messages);
    
    // Create notification for receiver
    this.createNotification({
      userId: messageData.receiverId,
      title: 'New Message',
      message: `You have received a new message from ${
        this.users.find(u => u.id === messageData.senderId)?.name || 'Unknown'
      }.`,
      type: 'message',
      isRead: false,
      createdAt: new Date(),
    });
    
    return cloneWithDates(newMessage);
  }
  
  async markMessageAsRead(id: string): Promise<Message | null> {
    const messageIndex = this.messages.findIndex(m => m.id === id);
    if (messageIndex === -1) return null;
    
    const updatedMessage = { ...this.messages[messageIndex], isRead: true };
    this.messages[messageIndex] = updatedMessage;
    saveToStorage('messages', this.messages);
    
    return cloneWithDates(updatedMessage);
  }
  
  // AI Coach methods
  async getAIMessages(userId: string): Promise<AIMessage[]> {
    // In a real app, these would be stored per user
    return cloneWithDates(this.aiMessages);
  }
  
  async sendAIMessage(message: string, userId: string): Promise<AIMessage> {
    const userMessage: AIMessage = {
      id: `ai_message_${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    
    this.aiMessages.push(userMessage);
    
    // Simulate AI response (in a real app, this would be a call to an AI service)
    setTimeout(() => {
      const aiResponse: AIMessage = {
        id: `ai_message_${Date.now() + 1}`,
        role: 'assistant',
        content: this.generateAIResponse(message),
        timestamp: new Date(),
      };
      
      this.aiMessages.push(aiResponse);
      saveToStorage('aiMessages', this.aiMessages);
    }, 1000);
    
    saveToStorage('aiMessages', this.aiMessages);
    return cloneWithDates(userMessage);
  }
  
  private generateAIResponse(message: string): string {
    // Simple response generation - in a real app, this would be handled by an AI service
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('workout') || lowerMsg.includes('exercise')) {
      return "Based on your fitness goals, I recommend including compound exercises like squats, deadlifts, and bench presses in your workout routine. Would you like a specific workout plan?";
    } else if (lowerMsg.includes('diet') || lowerMsg.includes('nutrition') || lowerMsg.includes('food')) {
      return "Proper nutrition is key to achieving your fitness goals. Focus on whole foods, lean proteins, complex carbs, and healthy fats. Would you like me to create a meal plan for you?";
    } else if (lowerMsg.includes('weight loss') || lowerMsg.includes('lose weight')) {
      return "For sustainable weight loss, combine regular exercise with a calorie deficit. Aim for 150+ minutes of moderate activity weekly, strength training 2-3 times a week, and a balanced diet. Can I help you create a specific plan?";
    } else if (lowerMsg.includes('muscle') || lowerMsg.includes('strength') || lowerMsg.includes('gain')) {
      return "To build muscle, focus on progressive overload in your strength training, consume adequate protein (1.6-2.2g/kg of body weight), and ensure you're in a slight caloric surplus. Would you like specific exercises to target certain muscle groups?";
    } else {
      return "I'm here to help with your fitness journey! Feel free to ask me about workouts, nutrition, recovery, or any other fitness-related topics.";
    }
  }
  
  // Booking methods
  async getBookings(filters?: {
    userId?: string;
    classId?: string;
    gymId?: string;
    coachId?: string;
    status?: BookingStatus;
    date?: Date;
  }): Promise<Booking[]> {
    let filteredBookings = this.bookings;
    
    if (filters) {
      if (filters.userId) {
        filteredBookings = filteredBookings.filter(b => b.userId === filters.userId);
      }
      
      if (filters.classId) {
        filteredBookings = filteredBookings.filter(b => b.classId === filters.classId);
      }
      
      if (filters.gymId) {
        filteredBookings = filteredBookings.filter(b => b.gymId === filters.gymId);
      }
      
      if (filters.coachId) {
        filteredBookings = filteredBookings.filter(b => b.coachId === filters.coachId);
      }
      
      if (filters.status) {
        filteredBookings = filteredBookings.filter(b => b.status === filters.status);
      }
      
      if (filters.date) {
        const filterDate = new Date(filters.date);
        filteredBookings = filteredBookings.filter(b => {
          const bookingDate = new Date(b.date);
          return bookingDate.toDateString() === filterDate.toDateString();
        });
      }
    }
    
    return cloneWithDates(filteredBookings);
  }
  
  async getBookingById(id: string): Promise<Booking | null> {
    const booking = this.bookings.find(b => b.id === id);
    return booking ? cloneWithDates(booking) : null;
  }
  
  async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
    const newBooking: Booking = {
      ...bookingData,
      id: `booking_${Date.now()}`,
      createdAt: new Date(),
    };
    
    this.bookings.push(newBooking);
    saveToStorage('bookings', this.bookings);
    
    // Increase class enrollment
    const classIndex = this.classes.findIndex(c => c.id === bookingData.classId);
    if (classIndex !== -1) {
      this.classes[classIndex].enrolled += 1;
      saveToStorage('classes', this.classes);
    }
    
    // Create notification for the client
    this.createNotification({
      userId: bookingData.userId,
      title: 'Booking Confirmed',
      message: `Your booking for ${bookingData.className} on ${new Date(bookingData.date).toLocaleDateString()} has been confirmed.`,
      type: 'class',
      isRead: false,
      createdAt: new Date(),
    });
    
    // Create notification for the coach
    this.createNotification({
      userId: bookingData.coachId,
      title: 'New Booking',
      message: `New booking for your class ${bookingData.className} on ${new Date(bookingData.date).toLocaleDateString()}.`,
      type: 'class',
      isRead: false,
      createdAt: new Date(),
    });
    
    return cloneWithDates(newBooking);
  }
  
  async updateBookingStatus(id: string, status: BookingStatus, reason?: string): Promise<Booking | null> {
    const bookingIndex = this.bookings.findIndex(b => b.id === id);
    if (bookingIndex === -1) return null;
    
    const updates: Partial<Booking> = { status };
    
    if (status === 'cancelled') {
      updates.cancelledAt = new Date();
    }
    
    const updatedBooking = { ...this.bookings[bookingIndex], ...updates };
    this.bookings[bookingIndex] = updatedBooking;
    saveToStorage('bookings', this.bookings);
    
    if (status === 'completed' || status === 'cancelled') {
      // Create notification for the client
      this.createNotification({
        userId: updatedBooking.userId,
        title: `Booking ${status === 'completed' ? 'Completed' : 'Cancelled'}`,
        message: `Your booking for ${updatedBooking.className} has been ${status}${reason ? `: ${reason}` : '.'}`,
        type: 'class',
        isRead: false,
        createdAt: new Date(),
      });
    }
    
    return cloneWithDates(updatedBooking);
  }
  
  async checkInBooking(id: string): Promise<Booking | null> {
    const bookingIndex = this.bookings.findIndex(b => b.id === id);
    if (bookingIndex === -1) return null;
    
    const booking = this.bookings[bookingIndex];
    
    // Create check-in record
    const checkIn: CheckIn = {
      id: `checkin_${Date.now()}`,
      userId: booking.userId,
      userName: this.users.find(u => u.id === booking.userId)?.name || 'Unknown',
      gymId: booking.gymId,
      gymName: booking.gymName,
      classId: booking.classId,
      className: booking.className,
      timestamp: new Date(),
    };
    
    this.checkIns.push(checkIn);
    saveToStorage('checkIns', this.checkIns);
    
    // Update booking
    const updatedBooking = { ...booking, checkedIn: true, checkedInAt: new Date() };
    this.bookings[bookingIndex] = updatedBooking;
    saveToStorage('bookings', this.bookings);
    
    return cloneWithDates(updatedBooking);
  }
  
  // Check-in methods
  async getCheckIns(filters?: {
    userId?: string;
    gymId?: string;
    classId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<CheckIn[]> {
    let filteredCheckIns = this.checkIns;
    
    if (filters) {
      if (filters.userId) {
        filteredCheckIns = filteredCheckIns.filter(c => c.userId === filters.userId);
      }
      
      if (filters.gymId) {
        filteredCheckIns = filteredCheckIns.filter(c => c.gymId === filters.gymId);
      }
      
      if (filters.classId) {
        filteredCheckIns = filteredCheckIns.filter(c => c.classId === filters.classId);
      }
      
      if (filters.startDate) {
        const startTimestamp = new Date(filters.startDate).getTime();
        filteredCheckIns = filteredCheckIns.filter(c => 
          new Date(c.timestamp).getTime() >= startTimestamp
        );
      }
      
      if (filters.endDate) {
        const endTimestamp = new Date(filters.endDate).getTime();
        filteredCheckIns = filteredCheckIns.filter(c => 
          new Date(c.timestamp).getTime() <= endTimestamp
        );
      }
    }
    
    return cloneWithDates(filteredCheckIns.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
  }
  
  // Brand methods
  async getBrands(): Promise<Brand[]> {
    return cloneWithDates(this.brands);
  }
  
  async getBrandById(id: string): Promise<Brand | null> {
    const brand = this.brands.find(b => b.id === id);
    return brand ? cloneWithDates(brand) : null;
  }
}

const apiService = new ApiService();

// Import and add review methods
import { extendApiServiceWithReviews } from './reviewHelper';
extendApiServiceWithReviews(apiService);

export default apiService;