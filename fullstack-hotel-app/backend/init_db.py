import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from database import engine, SessionLocal, User, Room, Booking, create_tables
from auth import get_password_hash
from datetime import datetime

def init_database():
    """Initialize database with mock accounts and data"""
    create_tables()
    
    db = SessionLocal()
    
    try:
        # Clear existing users and recreate with proper mock accounts
        print("Clearing existing data and creating mock accounts...")
        
        # Delete existing data
        db.query(Booking).delete()
        db.query(User).delete()
        db.query(Room).delete()
        
        # Create mock users (same as original Streamlit app)
        print("Creating mock users...")
        
        # Admin user
        admin_user = User(
            email="admin@hotel.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Hotel Administrator",
            phone="1234567890",
            city="New York",
            role="ADMIN",
            is_active=True
        )
        db.add(admin_user)
        
        # Regular users
        regular_users = [
            {
                "email": "john.doe@email.com",
                "password": "password123",
                "full_name": "John Doe",
                "phone": "1111111111",
                "city": "Boston",
                "role": "USER"
            },
            {
                "email": "jane.smith@email.com",
                "password": "password123",
                "full_name": "Jane Smith",
                "phone": "2222222222",
                "city": "Chicago",
                "role": "USER"
            },
            {
                "email": "mike.wilson@email.com",
                "password": "password123",
                "full_name": "Mike Wilson",
                "phone": "3333333333",
                "city": "Los Angeles",
                "role": "USER"
            },
            {
                "email": "user@hotel.com",
                "password": "user123",
                "full_name": "Test User",
                "phone": "9999999999",
                "city": "San Francisco",
                "role": "USER"
            }
        ]
        
        for user_data in regular_users:
            user = User(
                email=user_data["email"],
                hashed_password=get_password_hash(user_data["password"]),
                full_name=user_data["full_name"],
                phone=user_data["phone"],
                city=user_data["city"],
                role=user_data["role"],
                is_active=True
            )
            db.add(user)
        
        # Create room types
        print("Creating room types...")
        rooms = [
            {"room_type": "Room_Type 1", "total_rooms": 50, "available_rooms": 45, "price": 100.0},
            {"room_type": "Room_Type 2", "total_rooms": 30, "available_rooms": 25, "price": 150.0},
            {"room_type": "Room_Type 3", "total_rooms": 20, "available_rooms": 18, "price": 200.0},
            {"room_type": "Room_Type 4", "total_rooms": 15, "available_rooms": 12, "price": 250.0},
            {"room_type": "Room_Type 5", "total_rooms": 10, "available_rooms": 8, "price": 300.0},
            {"room_type": "Room_Type 6", "total_rooms": 8, "available_rooms": 6, "price": 350.0},
            {"room_type": "Room_Type 7", "total_rooms": 5, "available_rooms": 4, "price": 400.0}
        ]
        
        for room_data in rooms:
            room = Room(
                room_type=room_data["room_type"],
                total_rooms=room_data["total_rooms"],
                available_rooms=room_data["available_rooms"],
                price=room_data["price"]
            )
            db.add(room)
        
        # Commit users and rooms first
        db.commit()
        
        # Create some sample bookings
        print("Creating sample bookings...")
        sample_bookings = [
            {
                "user_id": 2,  # John Doe
                "room_id": 1,
                "no_of_adults": 2,
                "no_of_children": 1,
                "no_of_weekend_nights": 2,
                "no_of_week_nights": 3,
                "type_of_meal_plan": "Meal Plan 1",
                "required_car_parking_space": True,
                "room_type_reserved": "Room_Type 1",
                "lead_time": 30,
                "arrival_year": 2024,
                "arrival_month": 6,
                "arrival_date": 15,
                "market_segment_type": "Online",
                "repeated_guest": False,
                "no_of_previous_cancellations": 0,
                "no_of_previous_bookings_not_cancelled": 2,
                "avg_price_per_room": 100.0,
                "no_of_special_requests": 1,
                "status": "Active"
            },
            {
                "user_id": 3,  # Jane Smith
                "room_id": 2,
                "no_of_adults": 1,
                "no_of_children": 0,
                "no_of_weekend_nights": 1,
                "no_of_week_nights": 4,
                "type_of_meal_plan": "Meal Plan 2",
                "required_car_parking_space": False,
                "room_type_reserved": "Room_Type 2",
                "lead_time": 45,
                "arrival_year": 2024,
                "arrival_month": 7,
                "arrival_date": 20,
                "market_segment_type": "Offline",
                "repeated_guest": True,
                "no_of_previous_cancellations": 1,
                "no_of_previous_bookings_not_cancelled": 3,
                "avg_price_per_room": 150.0,
                "no_of_special_requests": 0,
                "status": "Active"
            },
            {
                "user_id": 4,  # Mike Wilson
                "room_id": 3,
                "no_of_adults": 2,
                "no_of_children": 2,
                "no_of_weekend_nights": 3,
                "no_of_week_nights": 2,
                "type_of_meal_plan": "Meal Plan 3",
                "required_car_parking_space": True,
                "room_type_reserved": "Room_Type 3",
                "lead_time": 60,
                "arrival_year": 2024,
                "arrival_month": 8,
                "arrival_date": 10,
                "market_segment_type": "Corporate",
                "repeated_guest": False,
                "no_of_previous_cancellations": 0,
                "no_of_previous_bookings_not_cancelled": 1,
                "avg_price_per_room": 200.0,
                "no_of_special_requests": 2,
                "status": "Cancelled"
            }
        ]
        
        for booking_data in sample_bookings:
            # Calculate derived fields
            booking_data["no_of_individuals"] = booking_data["no_of_adults"] + booking_data["no_of_children"]
            booking_data["no_of_days_booked"] = booking_data["no_of_weekend_nights"] + booking_data["no_of_week_nights"]
            
            booking = Booking(**booking_data)
            db.add(booking)
        
        db.commit()
        print("Database initialized successfully!")
        
        # Print account information
        print("\n" + "="*50)
        print("MOCK ACCOUNTS CREATED:")
        print("="*50)
        print("ADMIN ACCOUNT:")
        print("Email: admin@hotel.com")
        print("Password: admin123")
        print()
        print("USER ACCOUNTS:")
        print("Email: user@hotel.com | Password: user123")
        print("Email: john.doe@email.com | Password: password123")
        print("Email: jane.smith@email.com | Password: password123")
        print("Email: mike.wilson@email.com | Password: password123")
        print("="*50)
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
