import { api } from './api';
import { Room, Booking, BookingCreate } from '../types';

export const roomAPI = {
  getRooms: async (): Promise<Room[]> => {
    const response = await api.get('/rooms');
    return response.data;
  },
};

export const bookingAPI = {
  createBooking: async (bookingData: BookingCreate): Promise<Booking> => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  getMyBookings: async (): Promise<Booking[]> => {
    const response = await api.get('/bookings/me');
    return response.data;
  },

  getUserBookings: async (): Promise<Booking[]> => {
    const response = await api.get('/bookings/me');
    return response.data;
  },

  getRooms: async (): Promise<Room[]> => {
    const response = await api.get('/rooms');
    return response.data;
  },

  cancelBooking: async (bookingId: number): Promise<void> => {
    await api.put(`/bookings/${bookingId}/cancel`);
  },
};
