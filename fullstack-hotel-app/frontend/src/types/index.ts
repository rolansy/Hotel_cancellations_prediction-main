export interface User {
  id: number;
  email: string;
  full_name?: string;
  phone?: string;
  city?: string;
  role: 'USER' | 'ADMIN';
  is_active: boolean;
  created_at: string;
}

export interface Room {
  id: number;
  room_type: string;
  total_rooms: number;
  available_rooms: number;
  price: number;
}

export interface Booking {
  id: number;
  user_id: number;
  room_id: number;
  no_of_adults: number;
  no_of_children: number;
  no_of_weekend_nights: number;
  no_of_week_nights: number;
  type_of_meal_plan: string;
  required_car_parking_space: boolean;
  room_type_reserved: string;
  lead_time: number;
  arrival_year: number;
  arrival_month: number;
  arrival_date: number;
  market_segment_type: string;
  repeated_guest: boolean;
  no_of_previous_cancellations: number;
  no_of_previous_bookings_not_cancelled: number;
  avg_price_per_room: number;
  no_of_special_requests: number;
  no_of_individuals: number;
  no_of_days_booked: number;
  cancellation_prediction?: number;
  status: 'Active' | 'Cancelled' | 'Completed';
  created_at: string;
  updated_at: string;
  user?: User;
  room?: Room;
}

export interface BookingCreate {
  room_id: number;
  no_of_adults: number;
  no_of_children: number;
  no_of_weekend_nights: number;
  no_of_week_nights: number;
  type_of_meal_plan: string;
  required_car_parking_space: boolean;
  room_type_reserved: string;
  lead_time: number;
  arrival_year: number;
  arrival_month: number;
  arrival_date: number;
  market_segment_type: string;
  no_of_special_requests: number;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export interface UserCreate {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  city?: string;
}

export interface UserUpdate {
  full_name?: string;
  phone?: string;
  city?: string;
}

export interface BookingStats {
  total_bookings: number;
  active_bookings: number;
  cancelled_bookings: number;
  completed_bookings: number;
  high_risk_bookings: number;
}

export interface MonthlyTrend {
  month: number;
  count: number;
}

export interface RoomTypeStats {
  room_type: string;
  count: number;
}

export interface PredictionData {
  hotel: string;
  lead_time: number;
  arrival_date_year: number;
  arrival_date_month: string;
  arrival_date_week_number: number;
  arrival_date_day_of_month: number;
  stays_in_weekend_nights: number;
  stays_in_week_nights: number;
  adults: number;
  children: number;
  babies: number;
  meal: string;
  country: string;
  market_segment: string;
  distribution_channel: string;
  is_repeated_guest: number;
  previous_cancellations: number;
  previous_bookings_not_canceled: number;
  reserved_room_type: string;
  assigned_room_type: string;
  booking_changes: number;
  deposit_type: string;
  agent: number;
  company: number;
  days_in_waiting_list: number;
  customer_type: string;
  adr: number;
  required_car_parking_spaces: number;
  total_of_special_requests: number;
}

export interface PredictionRequest {
  no_of_adults: number;
  no_of_children: number;
  no_of_weekend_nights: number;
  no_of_week_nights: number;
  type_of_meal_plan: string;
  required_car_parking_space: boolean;
  room_type_reserved: string;
  lead_time: number;
  arrival_year: number;
  arrival_month: number;
  arrival_date: number;
  market_segment_type: string;
  repeated_guest: boolean;
  no_of_previous_cancellations: number;
  no_of_previous_bookings_not_cancelled: number;
  avg_price_per_room: number;
  no_of_special_requests: number;
}

export interface PredictionResponse {
  will_cancel: boolean;
  cancellation_probability: number;
  risk_level: 'High' | 'Medium' | 'Low' | 'Unknown';
}
