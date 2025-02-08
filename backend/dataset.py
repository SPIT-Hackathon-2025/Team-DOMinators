import numpy as np
import pandas as pd
import random

# Function to generate a random time string in "HH:MM:SS" format.
def random_time():
    h = random.randint(0, 23)
    m = random.randint(0, 59)
    s = random.randint(0, 59)
    return f"{h:02d}:{m:02d}:{s:02d}"

# Generate a synthetic dataset with n records.
def generate_dataset(n=1000):
    data = []
    for i in range(n):
        timestamp = random_time()
        # Decide fraud probability: 20% chance to be fraud.
        is_fraud = np.random.choice([0, 1], p=[0.8, 0.2])
        # If fraudulent, generate a high transaction amount (>=5000), else lower.
        if is_fraud:
            amount = round(random.uniform(5000, 15000), 2)
        else:
            amount = round(random.uniform(10, 5000), 2)
        # Random IDs between 1000 and 9999.
        from_id = random.randint(1000, 9999)
        to_id = random.randint(1000, 9999)
        data.append({
            "timestamp": timestamp,
            "transaction_amount": amount,
            "from_id": from_id,
            "to_id": to_id,
            "is_fraud": is_fraud
        })
    return pd.DataFrame(data)

# Generate the dataset and save to CSV.
df_dataset = generate_dataset(n=1000)
df_dataset.to_csv('C:/Users/Anand Shah/SPIT_HACK/Team-DOMinators/dataset.csv', index=False)