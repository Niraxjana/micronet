from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib

app = FastAPI()


# Load the trained ML pipeline
pipeline = joblib.load("credit_pipeline.pkl")

# Load the feature names
columns = joblib.load("columns.pkl")


# Request data model
class LoanApplication(BaseModel):
    ApplicantIncome: float
    CoapplicantIncome: float
    LoanAmount: float
    Loan_Amount_Term: float
    Credit_History: float


@app.get("/")
def home():
    return {
        "message": "Microfinance Credit Risk ML Service is running"
    }


@app.post("/predict")
def predict(data: LoanApplication):

    # Convert request data into a dictionary
    input_data = data.model_dump()

    # Convert dictionary into DataFrame
    input_data = pd.DataFrame([input_data])

    # Make sure columns are in the same order as training
    input_data = input_data[columns]

    # Make prediction
    prediction = pipeline.predict(input_data)[0]

    # Get probabilities
    probabilities = pipeline.predict_proba(input_data)[0]

    # Find probability of Y (approved)
    classes = pipeline.classes_

    if "Y" in classes:
        y_index = list(classes).index("Y")
        approval_probability = probabilities[y_index]
    else:
        approval_probability = 0

    # Convert probability into project-specific credit score
    credit_score = 300 + (approval_probability * 600)

    # Determine risk
    if credit_score >= 780:
        risk_level = "Low Risk"
    elif credit_score >= 700:
        risk_level = "Moderate Risk"
    else:
        risk_level = "High Risk"

    # Determine eligibility
    if risk_level == "Low Risk":
        eligibility = "Eligible"
    elif risk_level == "Moderate Risk":
        eligibility = "Manual Review"
    else:
        eligibility = "Not Eligible"

    return {
        "prediction": str(prediction),
        "approval_probability": round(float(approval_probability), 4),
        "credit_score": round(float(credit_score), 2),
        "risk_level": risk_level,
        "eligibility": eligibility
    }