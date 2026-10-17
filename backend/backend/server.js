const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/assess-risk", async (req, res) => {
  try {
    const mlResponse = await axios.post(
      "http://127.0.0.1:8000/predict",
      {
        ApplicantIncome: req.body.ApplicantIncome,
        CoapplicantIncome: req.body.CoapplicantIncome,
        LoanAmount: req.body.LoanAmount,
        Loan_Amount_Term: req.body.Loan_Amount_Term,
        Credit_History: req.body.Credit_History
      }
    );

    res.json(mlResponse.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({
      error: "ML service error",
      details: error.response?.data || error.message
    });
  }
});


app.listen(5000, () => {
  console.log("Express server running on port 5000");
});
