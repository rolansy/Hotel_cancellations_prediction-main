import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/admin';
import { Booking, User, PredictionRequest } from '../types';

const AdminDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [activeTab, setActiveTab] = useState('bookings');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string[]>(['Active', 'Cancelled', 'Completed']);
  const [riskFilter, setRiskFilter] = useState<string[]>(['High', 'Medium', 'Low', 'Unknown']);
  const [roomTypeFilter, setRoomTypeFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadData();
  }, []);

  // Filter and sort bookings when data or filters change
  useEffect(() => {
    let filtered = [...bookings];

    // Apply status filter
    filtered = filtered.filter(booking => statusFilter.includes(booking.status));

    // Apply risk filter
    filtered = filtered.filter(booking => {
      const risk = getRiskLevel(booking.cancellation_prediction);
      return riskFilter.includes(risk);
    });

    // Apply room type filter
    if (roomTypeFilter.length > 0) {
      filtered = filtered.filter(booking => roomTypeFilter.includes(booking.room_type_reserved));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'user':
          aValue = a.user?.full_name || '';
          bValue = b.user?.full_name || '';
          break;
        case 'room_type':
          aValue = a.room_type_reserved;
          bValue = b.room_type_reserved;
          break;
        case 'price':
          aValue = a.avg_price_per_room;
          bValue = b.avg_price_per_room;
          break;
        case 'prediction':
          aValue = a.cancellation_prediction || 0;
          bValue = b.cancellation_prediction || 0;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    setFilteredBookings(filtered);
  }, [bookings, statusFilter, riskFilter, roomTypeFilter, sortBy, sortOrder]);

  // Initialize room type filter when bookings load
  useEffect(() => {
    if (bookings.length > 0 && roomTypeFilter.length === 0) {
      const uniqueRoomTypes = Array.from(new Set(bookings.map(b => b.room_type_reserved)));
      setRoomTypeFilter(uniqueRoomTypes);
    }
  }, [bookings]);

  const getRiskLevel = (prediction: number | null | undefined): string => {
    if (!prediction) return 'Unknown';
    if (prediction >= 0.7) return 'High';
    if (prediction >= 0.4) return 'Medium';
    return 'Low';
  };

  const loadData = async () => {
    try {
      const [bookingsData, usersData, analyticsData] = await Promise.all([
        adminAPI.getAllBookings(),
        adminAPI.getAllUsers(),
        adminAPI.getAnalytics()
      ]);
      setBookings(bookingsData);
      setUsers(usersData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePredictAllBookings = async () => {
    setPredicting(true);
    try {
      const result = await adminAPI.predictAllBookings();
      alert(`Predictions updated! ${result.updated_bookings} out of ${result.total_bookings} bookings processed.`);
      // Reload bookings to show updated predictions
      loadData();
    } catch (error: any) {
      alert('Error updating predictions: ' + (error.response?.data?.detail || 'Unknown error'));
    } finally {
      setPredicting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading admin dashboard...</div>
      </div>
    );
  }

  const getPredictionColor = (prediction: number | null | undefined) => {
    if (!prediction) return 'text-gray-500';
    if (prediction >= 0.7) return 'text-red-600 font-bold';
    if (prediction >= 0.4) return 'text-yellow-600 font-medium';
    return 'text-green-600';
  };

  const uniqueRoomTypes = Array.from(new Set(bookings.map(b => b.room_type_reserved)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage bookings, users, and analytics</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'bookings', label: 'All Bookings' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'users', label: 'User Management' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {/* Filters and Sorting */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Filters & Sorting</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="space-y-2">
                  {['Active', 'Cancelled', 'Completed'].map(status => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={statusFilter.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setStatusFilter([...statusFilter, status]);
                          } else {
                            setStatusFilter(statusFilter.filter(s => s !== status));
                          }
                        }}
                        className="rounded border-gray-300 mr-2"
                      />
                      <span className="text-sm">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Risk Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
                <div className="space-y-2">
                  {['High', 'Medium', 'Low', 'Unknown'].map(risk => (
                    <label key={risk} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={riskFilter.includes(risk)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRiskFilter([...riskFilter, risk]);
                          } else {
                            setRiskFilter(riskFilter.filter(r => r !== risk));
                          }
                        }}
                        className="rounded border-gray-300 mr-2"
                      />
                      <span className="text-sm">{risk}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Room Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {uniqueRoomTypes.map(roomType => (
                    <label key={roomType} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={roomTypeFilter.includes(roomType)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRoomTypeFilter([...roomTypeFilter, roomType]);
                          } else {
                            setRoomTypeFilter(roomTypeFilter.filter(rt => rt !== roomType));
                          }
                        }}
                        className="rounded border-gray-300 mr-2"
                      />
                      <span className="text-sm">{roomType}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sorting */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2"
                >
                  <option value="id">Booking ID</option>
                  <option value="user">User Name</option>
                  <option value="room_type">Room Type</option>
                  <option value="price">Price</option>
                  <option value="prediction">Risk Level</option>
                  <option value="status">Status</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {filteredBookings.length} of {bookings.length} bookings
              </div>
              <button
                onClick={handlePredictAllBookings}
                disabled={predicting}
                className={`px-4 py-2 rounded text-white ${
                  predicting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {predicting ? 'Predicting...' : 'Predict All Bookings'}
              </button>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adults/Children</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nights</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBookings.map(booking => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{booking.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div className="font-medium">{booking.user?.full_name}</div>
                          <div className="text-xs">{booking.user?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.room_type_reserved}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.no_of_adults}A / {booking.no_of_children}C
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.no_of_weekend_nights}W + {booking.no_of_week_nights}D
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${booking.avg_price_per_room}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${getPredictionColor(booking.cancellation_prediction)}`}>
                        {booking.cancellation_prediction 
                          ? `${(booking.cancellation_prediction * 100).toFixed(1)}% - ${getRiskLevel(booking.cancellation_prediction)}`
                          : 'Not predicted'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          booking.status === 'Cancelled'
                            ? 'bg-red-100 text-red-800' 
                            : booking.status === 'Completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900">Total Bookings</h3>
              <p className="text-3xl font-bold text-blue-600">{analytics.total_bookings}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900">Active Bookings</h3>
              <p className="text-3xl font-bold text-green-600">{analytics.active_bookings}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900">Cancelled Bookings</h3>
              <p className="text-3xl font-bold text-red-600">{analytics.cancelled_bookings}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900">High Risk Bookings</h3>
              <p className="text-3xl font-bold text-orange-600">{analytics.high_risk_bookings}</p>
              <p className="text-sm text-gray-500">
                {analytics.active_bookings > 0 ? `${((analytics.high_risk_bookings / analytics.active_bookings) * 100).toFixed(1)}% of active` : '0%'}
              </p>
            </div>
          </div>

          {/* Charts would go here - for now, show data tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Booking Status Distribution</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Active:</span>
                  <span className="font-medium">{analytics.active_bookings}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cancelled:</span>
                  <span className="font-medium">{analytics.cancelled_bookings}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span className="font-medium">{analytics.completed_bookings}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Room Type Distribution</h3>
              <div className="space-y-2">
                {Object.entries(
                  bookings.reduce((acc, booking) => {
                    acc[booking.room_type_reserved] = (acc[booking.room_type_reserved] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([roomType, count]) => (
                  <div key={roomType} className="flex justify-between">
                    <span>{roomType}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Users</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.full_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.phone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.city || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.role === 'ADMIN' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
