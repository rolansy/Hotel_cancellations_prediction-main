from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hotel_bookings.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    phone = Column(String)
    city = Column(String)
    role = Column(String, default="USER")  # USER or ADMIN
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    bookings = relationship("Booking", back_populates="user")

class Room(Base):
    __tablename__ = "rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    room_type = Column(String, nullable=False)
    total_rooms = Column(Integer, nullable=False)
    available_rooms = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    
    # Relationship
    bookings = relationship("Booking", back_populates="room")

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    room_id = Column(Integer, ForeignKey("rooms.id"))
    
    # Booking details
    booking_date = Column(Date)  # Date when booking was made
    no_of_adults = Column(Integer, nullable=False)
    no_of_children = Column(Integer, default=0)
    no_of_weekend_nights = Column(Integer, default=0)
    no_of_week_nights = Column(Integer, default=0)
    type_of_meal_plan = Column(String, default="Not Selected")
    required_car_parking_space = Column(Boolean, default=False)
    room_type_reserved = Column(String, nullable=False)
    lead_time = Column(Integer, default=0)
    arrival_year = Column(Integer, nullable=False)
    arrival_month = Column(Integer, nullable=False)
    arrival_date = Column(Integer, nullable=False)
    market_segment_type = Column(String, default="Online")
    repeated_guest = Column(Boolean, default=False)
    no_of_previous_cancellations = Column(Integer, default=0)
    no_of_previous_bookings_not_cancelled = Column(Integer, default=0)
    avg_price_per_room = Column(Float, nullable=False)
    no_of_special_requests = Column(Integer, default=0)
    
    # Calculated fields
    no_of_individuals = Column(Integer)
    no_of_days_booked = Column(Integer)
    
    # Prediction and status
    cancellation_prediction = Column(Float)
    status = Column(String, default="Active")  # Active, Cancelled, Completed
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="bookings")
    room = relationship("Room", back_populates="bookings")

# Create tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
