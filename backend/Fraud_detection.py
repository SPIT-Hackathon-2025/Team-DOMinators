import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE
from collections import defaultdict, deque
import os

# Initialize Flask app
app = Flask(__name__)

# Load dataset path
dataset_path = 'C:/Users/Anand Shah/SPIT_HACK/Team-DOMinators/dataset.csv'

# Convert timestamp to minutes
def time_to_minutes(time_str):
    hours, minutes, seconds = map(int, time_str.split(':'))
    return hours * 60 + minutes + seconds / 60

# Feature Engineering Function
def engineer_features(df, for_training=False):
    df['timestamp_minutes'] = df['timestamp'].apply(time_to_minutes)
    df['transaction_amount'] = pd.to_numeric(df['transaction_amount'], errors='coerce')
    df['from_id'] = pd.to_numeric(df['from_id'], errors='coerce')
    df['to_id'] = pd.to_numeric(df['to_id'], errors='coerce')
    df = df.fillna(0)
    if for_training and 'is_fraud' in df.columns:
        return df
    else:
        return df[['timestamp_minutes', 'transaction_amount', 'from_id', 'to_id']]

# Fraud Detector Class
class FraudDetector:
    def __init__(self):
        self.model = XGBClassifier(scale_pos_weight=10, eval_metric='aucpr')
        self.user_history = defaultdict(deque)
        self.time_window = 60
    
    def train(self, X_train, y_train):
        smote = SMOTE(sampling_strategy='auto', random_state=42, k_neighbors=2)
        X_resampled, y_resampled = smote.fit_resample(X_train, y_train)
        self.model.fit(X_resampled, y_resampled)
    
    def predict(self, X, transaction):
        transaction['timestamp_minutes'] = time_to_minutes(transaction['timestamp'])
        from_id, timestamp, amount = transaction['from_id'], transaction['timestamp_minutes'], transaction['transaction_amount']
        
        if amount > 5000:
            return 1
        
        history = self.user_history[from_id]
        while history and (timestamp - history[0][0] > self.time_window):
            history.popleft()
        history.append((timestamp, amount))
        if sum(entry[1] for entry in history) >= 3500:
            return 1
        
        supervised_probs = self.model.predict_proba(X)[:, 1]
        return int(supervised_probs[0] > 0.5)

# Load dataset and train model
if os.path.exists(dataset_path):
    training_data = pd.read_csv(dataset_path)
    training_df = engineer_features(training_data, for_training=True)
    X_train = training_df[['timestamp_minutes', 'transaction_amount', 'from_id', 'to_id']].values
    y_train = training_df['is_fraud'].values
    detector = FraudDetector()
    detector.train(X_train, y_train)
else:
    raise FileNotFoundError("Dataset file not found!")

@app.route('/predict', methods=['POST'])
def predict_transaction():
    transaction = request.json
    df_tx = engineer_features(pd.DataFrame([transaction]))
    fraud_status = detector.predict(df_tx.values, transaction)
    transaction['is_fraud'] = fraud_status
    
    df_new_entry = engineer_features(pd.DataFrame([transaction]), for_training=True)
    df_new_entry['is_fraud'] = fraud_status
    df_new_entry.to_csv(dataset_path, mode='a', header=not os.path.exists(dataset_path), index=False)
    
    return jsonify({"fraud_status": "Fraudulent" if fraud_status == 1 else "Legitimate"})

if __name__ == "__main__":
    app.run(debug=True)
