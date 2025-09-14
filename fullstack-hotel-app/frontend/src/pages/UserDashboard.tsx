import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { bookingAPI } from '../services/booking';
import { Booking, Room } from '../types';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    room_id: '',
    no_of_adults: 2,
    no_of_children: 0,
    no_of_weekend_nights: 2,
    no_of_week_nights: 3,
    type_of_meal_plan: 'Meal Plan 1',
    required_car_parking_space: false,
    room_type_reserved: 'Room Type 1',
    check_in_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from today
    market_segment_type: 'Online',
    no_of_special_requests: 0,
    booking_date: new Date().toISOString().split('T')[0] // Today's date as booking date
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingsData, roomsData] = await Promise.all([
        bookingAPI.getUserBookings(),
        bookingAPI.getRooms()
      ]);
      setBookings(bookingsData);
      setRooms(roomsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Calculate lead time (days between current date and check-in date)
      const currentDate = new Date();
      const checkInDate = new Date(formData.check_in_date);
      const lead_time = Math.max(0, Math.floor((checkInDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
      
      // Extract year, month, date from check_in_date for backend compatibility
      const arrival_year = checkInDate.getFullYear();
      const arrival_month = checkInDate.getMonth() + 1;
      const arrival_date = checkInDate.getDate();
      
      const bookingData = {
        ...formData,
        room_id: parseInt(formData.room_id),
        lead_time: lead_time,
        arrival_year: arrival_year,
        arrival_month: arrival_month,
        arrival_date: arrival_date,
        booking_date: new Date().toISOString().split('T')[0] // Current date as booking date
      };
      
      await bookingAPI.createBooking(bookingData);
      setShowBookingForm(false);
      loadData();
      alert('Booking created successfully!');
    } catch (error: any) {
      alert('Error creating booking: ' + (error.response?.data?.detail || 'Unknown error'));
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingAPI.cancelBooking(bookingId);
        loadData();
        alert('Booking cancelled successfully!');
      } catch (error) {
        alert('Error cancelling booking');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.full_name}</h1>
        <p className="text-gray-600">Manage your hotel bookings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Book a Room</h2>
              <button
                onClick={() => setShowBookingForm(!showBookingForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {showBookingForm ? 'Hide Form' : 'New Booking'}
              </button>
            </div>

            {showBookingForm && (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Room</label>
                    <select
                      value={formData.room_id}
                      onChange={(e) => setFormData({...formData, room_id: e.target.value, room_type_reserved: rooms.find(r => r.id === parseInt(e.target.value))?.room_type || 'Room Type 1'})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    >
                      <option value="">Select a room</option>
                      {rooms.map(room => (
                        <option key={room.id} value={room.id}>
                          {room.room_type} - ${room.price}/night
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Booking Date (Today)</label>
                    <input
                      type="date"
                      value={formData.booking_date}
                      readOnly
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Check-in Date</label>
                    <input
                      type="date"
                      value={formData.check_in_date}
                      onChange={(e) => setFormData({...formData, check_in_date: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      min={new Date().toISOString().split('T')[0]} // Cannot select past dates
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Market Segment</label>
                    <select
                      value={formData.market_segment_type}
                      onChange={(e) => setFormData({...formData, market_segment_type: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Complementary">Complementary</option>
                      <option value="Aviation">Aviation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Weekend Nights</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.no_of_weekend_nights}
                      onChange={(e) => setFormData({...formData, no_of_weekend_nights: parseInt(e.target.value)})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Week Nights</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.no_of_week_nights}
                      onChange={(e) => setFormData({...formData, no_of_week_nights: parseInt(e.target.value)})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Adults</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.no_of_adults}
                      onChange={(e) => setFormData({...formData, no_of_adults: parseInt(e.target.value)})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Children</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.no_of_children}
                      onChange={(e) => setFormData({...formData, no_of_children: parseInt(e.target.value)})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Meal Plan</label>
                    <select
                      value={formData.type_of_meal_plan}
                      onChange={(e) => setFormData({...formData, type_of_meal_plan: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="Meal Plan 1">Meal Plan 1</option>
                      <option value="Meal Plan 2">Meal Plan 2</option>
                      <option value="Meal Plan 3">Meal Plan 3</option>
                      <option value="Not Selected">Not Selected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Special Requests</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.no_of_special_requests}
                      onChange={(e) => setFormData({...formData, no_of_special_requests: parseInt(e.target.value)})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.required_car_parking_space}
                      onChange={(e) => setFormData({...formData, required_car_parking_space: e.target.checked})}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">Car Parking Required</label>
                  </div>
                </div>
                
                {/* Lead Time Display */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    Lead Time: {(() => {
                      const currentDate = new Date();
                      const checkInDate = new Date(formData.check_in_date);
                      const leadTime = Math.max(0, Math.floor((checkInDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
                      return leadTime;
                    })()} days
                  </p>
                  <p className="text-xs text-blue-600">
                    (Days between today and check-in date)
                  </p>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                >
                  Create Booking
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bookings List */}
        <div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Your Bookings</h2>
            {bookings.length === 0 ? (
              <p className="text-gray-500">No bookings yet</p>
            ) : (
              <div className="space-y-4">
                {bookings.map(booking => (
                  <div key={booking.id} className="border rounded p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{booking.room?.room_type}</h3>
                        <p className="text-sm text-gray-600">
                          {booking.room_type_reserved} - {booking.no_of_adults} adults, {booking.no_of_children} children
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.no_of_weekend_nights} weekend nights, {booking.no_of_week_nights} week nights
                        </p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          booking.status === 'Cancelled'
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      {booking.status === 'Active' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
