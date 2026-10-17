import { useState } from "react";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    ApplicantIncome: "",
    CoapplicantIncome: "",
    LoanAmount: "",
    Loan_Amount_Term: "",
    Credit_History: "1",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const assessRisk = async (e) => {
    e.preventDefault();

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/assess-risk",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ApplicantIncome: Number(formData.ApplicantIncome),
            CoapplicantIncome: Number(formData.CoapplicantIncome),
            LoanAmount: Number(formData.LoanAmount),
            Loan_Amount_Term: Number(formData.Loan_Amount_Term),
            Credit_History: Number(formData.Credit_History),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="card">
        <h1>Microfinance Credit Risk Assessment</h1>

        <p className="subtitle">
          Enter borrower details to assess loan risk.
        </p>

        <form onSubmit={assessRisk}>
          <div className="form-group">
            <label>Applicant Income</label>
            <input
              type="number"
              name="ApplicantIncome"
              value={formData.ApplicantIncome}
              onChange={handleChange}
              placeholder="Example: 5000"
              required
            />
          </div>

          <div className="form-group">
            <label>Coapplicant Income</label>
            <input
              type="number"
              name="CoapplicantIncome"
              value={formData.CoapplicantIncome}
              onChange={handleChange}
              placeholder="Example: 2000"
              required
            />
          </div>

          <div className="form-group">
            <label>Loan Amount</label>
            <input
              type="number"
              name="LoanAmount"
              value={formData.LoanAmount}
              onChange={handleChange}
              placeholder="Example: 150"
              required
            />
          </div>

          <div className="form-group">
            <label>Loan Amount Term</label>
            <select
              name="Loan_Amount_Term"
              value={formData.Loan_Amount_Term}
              onChange={handleChange}
              required
            >
              <option value="">Select term</option>
              <option value="360">360 months</option>
              <option value="240">240 months</option>
              <option value="180">180 months</option>
              <option value="120">120 months</option>
              <option value="60">60 months</option>
            </select>
          </div>

          <div className="form-group">
            <label>Credit History</label>
            <select
              name="Credit_History"
              value={formData.Credit_History}
              onChange={handleChange}
              required
            >
              <option value="1">Good / Available</option>
              <option value="0">Poor / Not Available</option>
            </select>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Assessing..." : "Assess Risk"}
          </button>
        </form>

        {error && (
          <div className="error">
            <strong>Error:</strong> {error}
          </div>
        )}

{result && (
  <div className="result">
    <h2>Risk Assessment Result</h2>

    <div className="result-item">
      <span>Prediction:</span>
      <strong>{result.prediction ?? "N/A"}</strong>
    </div>

    <div className="result-item">
      <span>Approval Probability:</span>
      <strong>
        {result.approval_probability !== undefined
          ? `${(result.approval_probability * 100).toFixed(2)}%`
          : "N/A"}
      </strong>
    </div>

    <div className="result-item">
      <span>Credit Score:</span>
      <strong>
        {result.credit_score !== undefined
          ? result.credit_score.toFixed(2)
          : "N/A"}
      </strong>
    </div>

    <div className="result-item">
      <span>Risk:</span>
      <strong>{result.risk_level ?? "N/A"}</strong>
    </div>

    <div className="result-item">
      <span>Eligibility:</span>
      <strong>{result.eligibility ?? "N/A"}</strong>
    </div>

    <details>
      <summary>View API Response</summary>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </details>
  </div>
)}
        
      </div>
    </div>
  );
}

export default App;