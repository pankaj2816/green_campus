# 🌱 Green Campus Dashboard

A full-stack AI-powered sustainability dashboard to monitor and analyze campus resources like energy, water, waste, and solar usage.

---

## 🚀 Features

* 📊 Real-time dashboard (Energy, Water, Waste, Solar)
* 🤖 AI-based Forecasting (Next 12 months prediction)
* ⚠️ AI Risk Analysis (Growth-based risk detection)
* 🌍 Carbon Footprint Indicator (ISO 14064 inspired)
* 🔐 User Authentication (Login/Register)
* 📂 Excel Data Upload (Non-technical user friendly)

---

## 🏗️ Project Structure

```
GreenCampusProject/
│
├── backend/
│   ├── app/
│   ├── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── package.json
│
└── README.md
```

---

## ⚙️ Backend Setup (FastAPI)

### 1️⃣ Go to backend folder

```
cd backend
```

### 2️⃣ Create virtual environment

```
python -m venv venv
venv\Scripts\activate
```

### 3️⃣ Install dependencies

```
pip install -r requirements.txt
```

### 4️⃣ Run server

```
python -m uvicorn app.main:app --reload
```

👉 Backend will run on:

```
http://127.0.0.1:8000
```

---

## 💻 Frontend Setup (React)

### 1️⃣ Go to frontend folder

```
cd frontend
```

### 2️⃣ Install dependencies

```
npm install
```

### 3️⃣ Run frontend

```
npm start
```

👉 Frontend will run on:

```
http://localhost:3000
```

---

## 🔐 Authentication

* Register a new user from frontend
* Login to access dashboard
* JWT-based authentication system

---

## 📂 Data Upload

* Upload Excel file via dashboard
* Supported data:

  * Energy (kWh)
  * Water (KL)
  * Waste (kg)
  * Solar (kWh)

---

## 🤖 AI Features

### 🔮 Forecasting

* Predicts next 12 months using historical data
* Based on trend + average growth

### ⚠️ Risk Engine

* Detects:

  * High consumption growth
  * Cost risk
  * Carbon impact

---

## 🌍 Carbon Footprint

* Based on:

  * Energy consumption × emission factor
* Displays in:

  * tCO₂ (tons of CO₂)
* Inspired by ISO 14064 standards

---

## 🛠️ Tech Stack

* Backend: FastAPI + SQLAlchemy
* Frontend: React + Chart.js
* Database: SQLite
* AI Logic: Python (custom forecasting)

---

## 📌 Future Improvements

* Seasonal AI forecasting
* Building-level predictions
* ISO 14040 Life Cycle Analysis
* Public web deployment
* Role-based access (Admin/Manager)

---

## 👨‍💻 Author

Pankaj
Green Campus Sustainability Project 🌱

---

## ⭐ How to Run (Quick)

```
Backend → python -m uvicorn app.main:app --reload
Frontend → npm start
```

---
