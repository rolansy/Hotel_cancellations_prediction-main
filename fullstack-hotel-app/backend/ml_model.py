import pickle
import numpy as np
import pandas as pd
from typing import List
from schemas import PredictionRequest, PredictionResponse

class MLPredictor:
    def __init__(self, model_path: str = "model.pkl", scaler_path: str = "scaler.pkl"):
        """Initialize the ML predictor with model and scaler paths"""
        self.model = None
        self.scaler = None
        self.load_model(model_path, scaler_path)
    
    def load_model(self, model_path: str, scaler_path: str):
        """Load the trained model and scaler"""
        try:
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
            with open(scaler_path, 'rb') as f:
                self.scaler = pickle.load(f)
            print("Model and scaler loaded successfully")
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model = None
            self.scaler = None
    
    def prepare_features(self, request: PredictionRequest) -> List[float]:
        """Prepare features for prediction"""
        # Map categorical features to numeric values
        meal_plan_mapping = {
            'Meal Plan 1': 0,
            'Meal Plan 2': 1,
            'Meal Plan 3': 2,
            'Not Selected': 3
        }
        
        room_type_mapping = {
            'Room Type 1': 0,
            'Room Type 2': 1,
            'Room Type 3': 2,
            'Room Type 4': 3,
            'Room Type 5': 4,
            'Room Type 6': 5,
            'Room Type 7': 6
        }
        
        market_segment_mapping = {
            'Aviation': 0,
            'Complementary': 1,
            'Corporate': 2,
            'Offline': 3,
            'Online': 4
        }
        
        # Calculate derived features
        no_of_individuals = request.no_of_adults + request.no_of_children
        no_of_days_booked = request.no_of_weekend_nights + request.no_of_week_nights
        
        # Prepare feature vector (must match training data order)
        features = [
            request.no_of_adults,
            request.no_of_children,
            request.no_of_weekend_nights,
            request.no_of_week_nights,
            meal_plan_mapping.get(request.type_of_meal_plan, 3),
            1 if request.required_car_parking_space else 0,
            room_type_mapping.get(request.room_type_reserved, 0),
            request.lead_time,
            request.arrival_year,
            request.arrival_month,
            request.arrival_date,
            market_segment_mapping.get(request.market_segment_type, 4),
            1 if request.repeated_guest else 0,
            request.no_of_previous_cancellations,
            request.no_of_previous_bookings_not_cancelled,
            request.avg_price_per_room,
            request.no_of_special_requests,
            no_of_individuals,
            no_of_days_booked
        ]
        
        return features
    
    def predict(self, request: PredictionRequest) -> PredictionResponse:
        """Make prediction for cancellation"""
        if self.model is None or self.scaler is None:
            return PredictionResponse(
                will_cancel=False,
                cancellation_probability=0.5,
                risk_level="Unknown"
            )
        
        try:
            # Prepare features
            features = self.prepare_features(request)
            
            # Scale features
            scaled_features = self.scaler.transform(np.array([features]))
            
            # Make prediction
            prediction = self.model.predict(scaled_features)[0]
            probability = self.model.predict_proba(scaled_features)[0]
            
            # Extract cancellation probability (class 0 = canceled, class 1 = not canceled)
            cancellation_prob = probability[0] if prediction == 0 else 1 - probability[1]
            will_cancel = prediction == 0
            
            # Determine risk level
            if cancellation_prob >= 0.7:
                risk_level = "High"
            elif cancellation_prob >= 0.4:
                risk_level = "Medium"
            else:
                risk_level = "Low"
            
            return PredictionResponse(
                will_cancel=will_cancel,
                cancellation_probability=float(cancellation_prob),
                risk_level=risk_level
            )
            
        except Exception as e:
            print(f"Prediction error: {e}")
            return PredictionResponse(
                will_cancel=False,
                cancellation_probability=0.5,
                risk_level="Unknown"
            )

# Global predictor instance
predictor = MLPredictor()
