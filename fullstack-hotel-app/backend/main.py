from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
import uvicorn
from datetime import timedelta, datetime

# Import our modules
from database import get_db, create_tables, User, Room, Booking
from schemas import (
    UserCreate, UserUpdate, User as UserSchema, Token,
    RoomCreate, Room as RoomSchema,
    BookingCreate, Booking as BookingSchema,
    PredictionRequest, PredictionResponse,
    BookingStats, MonthlyTrend, RoomTypeStats
)
from auth import (
    authenticate_user, create_access_token, get_password_hash,
    get_current_active_user, get_current_admin_user, ACCESS_TOKEN_EXPIRE_MINUTES
)
from ml_model import predictor

# Create FastAPI app
app = FastAPI(title="Hotel Booking System API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173",
        "https://hotel-cancellations-prediction-main.vercel.app",
        "https://hotel-cancellations-prediction-main-*.vercel.app",
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup
@app.on_event("startup")
def startup_event():
    create_tables()
    # Add initial data if needed
    db = next(get_db())
    
    # Create admin user if not exists
    admin_user = db.query(User).filter(User.email == "admin@hotel.com").first()
    if not admin_user:
        admin_user = User(
            email="admin@hotel.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Administrator",
            role="ADMIN"
        )
        db.add(admin_user)
        db.commit()
    
    # Create default rooms if not exist
    if db.query(Room).count() == 0:
        default_rooms = [
            Room(room_type="Room Type 1", total_rooms=50, available_rooms=50, price=100.0),
            Room(room_type="Room Type 2", total_rooms=30, available_rooms=30, price=150.0),
            Room(room_type="Room Type 3", total_rooms=20, available_rooms=20, price=200.0),
            Room(room_type="Room Type 4", total_rooms=25, available_rooms=25, price=180.0),
            Room(room_type="Room Type 5", total_rooms=15, available_rooms=15, price=250.0),
        ]
        db.add_all(default_rooms)
        db.commit()
    
    db.close()

# Auth endpoints
@app.post("/auth/register", response_model=UserSchema)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        phone=user.phone,
        city=user.city,
        role="USER"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@app.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user and return JWT token"""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserSchema)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return current_user

# User endpoints
@app.put("/users/me", response_model=UserSchema)
def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

# Room endpoints
@app.get("/rooms", response_model=List[RoomSchema])
def get_rooms(db: Session = Depends(get_db)):
    """Get all available rooms"""
    return db.query(Room).all()

@app.post("/rooms", response_model=RoomSchema)
def create_room(
    room: RoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new room (Admin only)"""
    db_room = Room(**room.dict())
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

# Booking endpoints
@app.post("/bookings", response_model=BookingSchema)
def create_booking(
    booking: BookingCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new booking"""
    from datetime import datetime, date
    
    # Get room details
    room = db.query(Room).filter(Room.id == booking.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    if room.available_rooms <= 0:
        raise HTTPException(status_code=400, detail="No rooms available")
    
    # Get user's booking history for repeated guest and previous bookings
    user_bookings = db.query(Booking).filter(Booking.user_id == current_user.id).all()
    repeated_guest = len(user_bookings) > 0
    no_of_previous_cancellations = len([b for b in user_bookings if b.status == "Cancelled"])
    no_of_previous_bookings_not_cancelled = len([b for b in user_bookings if b.status == "Completed"])
    
    # Calculate derived fields
    no_of_individuals = booking.no_of_adults + booking.no_of_children
    no_of_days_booked = booking.no_of_weekend_nights + booking.no_of_week_nights
    
    # Convert booking_date string to date object if it's a string
    booking_date_obj = None
    if booking.booking_date:
        if isinstance(booking.booking_date, str):
            booking_date_obj = datetime.strptime(booking.booking_date, "%Y-%m-%d").date()
        else:
            booking_date_obj = booking.booking_date
    
    # Create prediction request
    prediction_request = PredictionRequest(
        **booking.dict(exclude={'booking_date'}),
        repeated_guest=repeated_guest,
        no_of_previous_cancellations=no_of_previous_cancellations,
        no_of_previous_bookings_not_cancelled=no_of_previous_bookings_not_cancelled,
        avg_price_per_room=room.price
    )
    
    # Get prediction
    prediction = predictor.predict(prediction_request)
    
    # Create booking with proper date object
    booking_dict = booking.dict(exclude={'booking_date'})
    db_booking = Booking(
        **booking_dict,
        user_id=current_user.id,
        booking_date=booking_date_obj,  # Use converted date object
        repeated_guest=repeated_guest,
        no_of_previous_cancellations=no_of_previous_cancellations,
        no_of_previous_bookings_not_cancelled=no_of_previous_bookings_not_cancelled,
        avg_price_per_room=room.price,
        no_of_individuals=no_of_individuals,
        no_of_days_booked=no_of_days_booked,
        cancellation_prediction=prediction.cancellation_probability,
        status="Active"
    )
    
    # Update room availability
    room.available_rooms -= 1
    
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    
    return db_booking

@app.get("/bookings/me", response_model=List[BookingSchema])
def get_my_bookings(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's bookings"""
    return db.query(Booking).filter(Booking.user_id == current_user.id).all()

@app.put("/bookings/{booking_id}/cancel")
def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cancel a booking"""
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == current_user.id
    ).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.status != "Active":
        raise HTTPException(status_code=400, detail="Cannot cancel this booking")
    
    # Update booking status
    booking.status = "Cancelled"
    
    # Update room availability
    room = db.query(Room).filter(Room.id == booking.room_id).first()
    if room:
        room.available_rooms += 1
    
    db.commit()
    return {"message": "Booking cancelled successfully"}

# Admin endpoints
@app.get("/admin/bookings", response_model=List[BookingSchema])
def get_all_bookings(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all bookings (Admin only)"""
    return db.query(Booking).all()

@app.get("/admin/users", response_model=List[UserSchema])
def get_all_users(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all users (Admin only)"""
    return db.query(User).all()

@app.get("/admin/analytics/stats", response_model=BookingStats)
def get_booking_stats(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get booking statistics (Admin only)"""
    total_bookings = db.query(Booking).count()
    active_bookings = db.query(Booking).filter(Booking.status == "Active").count()
    cancelled_bookings = db.query(Booking).filter(Booking.status == "Cancelled").count()
    completed_bookings = db.query(Booking).filter(Booking.status == "Completed").count()
    high_risk_bookings = db.query(Booking).filter(
        Booking.cancellation_prediction >= 0.7,
        Booking.status == "Active"
    ).count()
    
    return BookingStats(
        total_bookings=total_bookings,
        active_bookings=active_bookings,
        cancelled_bookings=cancelled_bookings,
        completed_bookings=completed_bookings,
        high_risk_bookings=high_risk_bookings
    )

@app.get("/admin/analytics/monthly-trends", response_model=List[MonthlyTrend])
def get_monthly_trends(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get monthly booking trends (Admin only)"""
    results = db.query(Booking.arrival_month, db.func.count(Booking.id).label('count'))\
                .group_by(Booking.arrival_month)\
                .order_by(Booking.arrival_month)\
                .all()
    
    return [MonthlyTrend(month=month, count=count) for month, count in results]

@app.get("/admin/analytics/room-types", response_model=List[RoomTypeStats])
def get_room_type_stats(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get room type statistics (Admin only)"""
    results = db.query(Booking.room_type_reserved, db.func.count(Booking.id).label('count'))\
                .group_by(Booking.room_type_reserved)\
                .all()
    
    return [RoomTypeStats(room_type=room_type, count=count) for room_type, count in results]

# Prediction endpoint
@app.post("/predict", response_model=PredictionResponse)
def predict_cancellation(
    request: PredictionRequest,
    current_user: User = Depends(get_current_admin_user)
):
    """Predict booking cancellation (Admin only)"""
    return predictor.predict(request)

@app.post("/admin/predict-all-bookings")
def predict_all_bookings(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Predict cancellation for all active bookings (Admin only)"""
    # Get all active bookings
    active_bookings = db.query(Booking).filter(Booking.status == "Active").all()
    
    updated_count = 0
    for booking in active_bookings:
        try:
            # Create prediction request from booking data
            prediction_request = PredictionRequest(
                no_of_adults=booking.no_of_adults,
                no_of_children=booking.no_of_children,
                no_of_weekend_nights=booking.no_of_weekend_nights,
                no_of_week_nights=booking.no_of_week_nights,
                type_of_meal_plan=booking.type_of_meal_plan,
                required_car_parking_space=booking.required_car_parking_space,
                room_type_reserved=booking.room_type_reserved,
                lead_time=booking.lead_time,
                arrival_year=booking.arrival_year,
                arrival_month=booking.arrival_month,
                arrival_date=booking.arrival_date,
                market_segment_type=booking.market_segment_type,
                repeated_guest=booking.repeated_guest,
                no_of_previous_cancellations=booking.no_of_previous_cancellations,
                no_of_previous_bookings_not_cancelled=booking.no_of_previous_bookings_not_cancelled,
                avg_price_per_room=booking.avg_price_per_room,
                no_of_special_requests=booking.no_of_special_requests
            )
            
            # Get prediction
            prediction = predictor.predict(prediction_request)
            
            # Update booking with prediction
            booking.cancellation_prediction = prediction.cancellation_probability
            updated_count += 1
            
        except Exception as e:
            print(f"Error predicting for booking {booking.id}: {e}")
            continue
    
    db.commit()
    
    return {
        "message": f"Predictions updated for {updated_count} bookings",
        "total_bookings": len(active_bookings),
        "updated_bookings": updated_count
    }

@app.get("/")
def read_root():
    """Health check endpoint"""
    return {"message": "Hotel Booking System API", "status": "running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
