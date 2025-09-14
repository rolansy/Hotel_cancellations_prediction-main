from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None

class UserInDB(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class User(UserInDB):
    pass

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Room schemas
class RoomBase(BaseModel):
    room_type: str
    total_rooms: int
    available_rooms: int
    price: float

class RoomCreate(RoomBase):
    pass

class Room(RoomBase):
    id: int
    
    class Config:
        from_attributes = True

# Booking schemas
class BookingBase(BaseModel):
    booking_date: Optional[date] = None  # Date when booking was made
    no_of_adults: int
    no_of_children: int = 0
    no_of_weekend_nights: int = 0
    no_of_week_nights: int = 0
    type_of_meal_plan: str = "Not Selected"
    required_car_parking_space: bool = False
    room_type_reserved: str
    lead_time: int = 0
    arrival_year: int
    arrival_month: int
    arrival_date: int
    market_segment_type: str = "Online"
    no_of_special_requests: int = 0

class BookingCreate(BaseModel):
    room_id: int
    booking_date: Optional[str] = None  # String from frontend, will be converted to date
    no_of_adults: int
    no_of_children: int = 0
    no_of_weekend_nights: int = 0
    no_of_week_nights: int = 0
    type_of_meal_plan: str = "Not Selected"
    required_car_parking_space: bool = False
    room_type_reserved: str
    lead_time: int = 0
    arrival_year: int
    arrival_month: int
    arrival_date: int
    market_segment_type: str = "Online"
    no_of_special_requests: int = 0

class BookingInDB(BookingBase):
    id: int
    user_id: int
    room_id: int
    booking_date: Optional[date]
    repeated_guest: bool
    no_of_previous_cancellations: int
    no_of_previous_bookings_not_cancelled: int
    avg_price_per_room: float
    no_of_individuals: int
    no_of_days_booked: int
    cancellation_prediction: Optional[float]
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class Booking(BookingInDB):
    user: Optional[User] = None
    room: Optional[Room] = None

# Prediction schema
class PredictionRequest(BaseModel):
    no_of_adults: int
    no_of_children: int = 0
    no_of_weekend_nights: int = 0
    no_of_week_nights: int = 0
    type_of_meal_plan: str = "Not Selected"
    required_car_parking_space: bool = False
    room_type_reserved: str
    lead_time: int = 0
    arrival_year: int
    arrival_month: int
    arrival_date: int
    market_segment_type: str = "Online"
    repeated_guest: bool = False
    no_of_previous_cancellations: int = 0
    no_of_previous_bookings_not_cancelled: int = 0
    avg_price_per_room: float
    no_of_special_requests: int = 0

class PredictionResponse(BaseModel):
    will_cancel: bool
    cancellation_probability: float
    risk_level: str

# Analytics schemas
class BookingStats(BaseModel):
    total_bookings: int
    active_bookings: int
    cancelled_bookings: int
    completed_bookings: int
    high_risk_bookings: int

class MonthlyTrend(BaseModel):
    month: int
    count: int

class RoomTypeStats(BaseModel):
    room_type: str
    count: int
