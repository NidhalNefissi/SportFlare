import axios from 'axios';

// Set your API base URL here
const API_BASE_URL = 'http://localhost:3000/api'; // TODO: Update with real backend URL

// --- AUTH ---
export const login = async (credentials) => {
    // TODO: Implement login
};
export const register = async (data) => {
    // TODO: Implement register
};

// --- USER ---
export const getUsers = async () => {
    // TODO: Implement get users
};
export const getUserById = async (id) => {
    // TODO: Implement get user by id
};
export const updateUser = async (id, data) => {
    // TODO: Implement update user
};
export const deleteUser = async (id) => {
    // TODO: Implement delete user
};

// --- CLASS ---
export const getClasses = async () => {
    // TODO: Implement get classes
};
export const getClassById = async (id) => {
    // TODO: Implement get class by id
};
export const createClass = async (data) => {
    // TODO: Implement create class
};
export const updateClass = async (id, data) => {
    // TODO: Implement update class
};
export const deleteClass = async (id) => {
    // TODO: Implement delete class
};

// --- BOOKING ---
export const getBookings = async () => {
    // TODO: Implement get bookings
};
export const getBookingById = async (id) => {
    // TODO: Implement get booking by id
};
export const createBooking = async (data) => {
    // TODO: Implement create booking
};
export const updateBooking = async (id, data) => {
    // TODO: Implement update booking
};
export const deleteBooking = async (id) => {
    // TODO: Implement delete booking
};

// --- PRODUCT ---
export const getProducts = async () => {
    // TODO: Implement get products
};
export const getProductById = async (id) => {
    // TODO: Implement get product by id
};
export const createProduct = async (data) => {
    // TODO: Implement create product
};
export const updateProduct = async (id, data) => {
    // TODO: Implement update product
};
export const deleteProduct = async (id) => {
    // TODO: Implement delete product
};

// --- ORDER ---
export const getOrders = async () => {
    // TODO: Implement get orders
};
export const getOrderById = async (id) => {
    // TODO: Implement get order by id
};
export const createOrder = async (data) => {
    // TODO: Implement create order
};
export const updateOrder = async (id, data) => {
    // TODO: Implement update order
};
export const deleteOrder = async (id) => {
    // TODO: Implement delete order
};

// --- GYM ---
export const getGyms = async () => {
    // TODO: Implement get gyms
};
export const getGymById = async (id) => {
    // TODO: Implement get gym by id
};
export const createGym = async (data) => {
    // TODO: Implement create gym
};
export const updateGym = async (id, data) => {
    // TODO: Implement update gym
};
export const deleteGym = async (id) => {
    // TODO: Implement delete gym
};

// --- BRAND ---
export const getBrands = async () => {
    // TODO: Implement get brands
};
export const getBrandById = async (id) => {
    // TODO: Implement get brand by id
};
export const createBrand = async (data) => {
    // TODO: Implement create brand
};
export const updateBrand = async (id, data) => {
    // TODO: Implement update brand
};
export const deleteBrand = async (id) => {
    // TODO: Implement delete brand
};

// --- NOTIFICATION ---
export const getNotifications = async () => {
    // TODO: Implement get notifications
};
export const getNotificationById = async (id) => {
    // TODO: Implement get notification by id
};
export const createNotification = async (data) => {
    // TODO: Implement create notification
};
export const updateNotification = async (id, data) => {
    // TODO: Implement update notification
};
export const deleteNotification = async (id) => {
    // TODO: Implement delete notification
};

// --- RATING ---
export const getRatings = async () => {
    // TODO: Implement get ratings
};
export const getRatingById = async (id) => {
    // TODO: Implement get rating by id
};
export const createRating = async (data) => {
    // TODO: Implement create rating
};
export const updateRating = async (id, data) => {
    // TODO: Implement update rating
};
export const deleteRating = async (id) => {
    // TODO: Implement delete rating
};

// --- UPLOAD ---
export const uploadFile = async (file) => {
    // TODO: Implement file/image upload
};

// --- PAYMENT ---
export const createPayment = async (data) => {
    // TODO: Implement payment logic
};

// --- SUBSCRIPTION ---
export const getSubscriptions = async () => {
    // TODO: Implement get subscriptions
};
export const createSubscription = async (data) => {
    // TODO: Implement create subscription
};
export const updateSubscription = async (id, data) => {
    // TODO: Implement update subscription
};
export const cancelSubscription = async (id) => {
    // TODO: Implement cancel subscription
};

// --- CURRENCY ---
export const getCurrencies = async () => {
    // TODO: Implement get currencies
};
export const setCurrency = async (currency) => {
    // TODO: Implement set currency
}; 