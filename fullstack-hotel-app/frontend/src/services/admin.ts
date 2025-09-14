import { api } from './api';
import { User, Booking, BookingStats, MonthlyTrend, RoomTypeStats, PredictionRequest, PredictionResponse } from '../types';

export const adminAPI = {
  getAllBookings: async (): Promise<Booking[]> => {
    const response = await api.get('/admin/bookings');
    return response.data;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  getBookingStats: async (): Promise<BookingStats> => {
    const response = await api.get('/admin/analytics/stats');
    return response.data;
  },

  getAnalytics: async (): Promise<any> => {
    const response = await api.get('/admin/analytics/stats');
    return response.data;
  },

  getMonthlyTrends: async (): Promise<MonthlyTrend[]> => {
    const response = await api.get('/admin/analytics/monthly-trends');
    return response.data;
  },

  getRoomTypeStats: async (): Promise<RoomTypeStats[]> => {
    const response = await api.get('/admin/analytics/room-types');
    return response.data;
  },

  predictCancellation: async (predictionData: PredictionRequest): Promise<PredictionResponse> => {
    const response = await api.post('/predict', predictionData);
    return response.data;
  },

  predictAllBookings: async (): Promise<any> => {
    const response = await api.post('/admin/predict-all-bookings');
    return response.data;
  },
};
