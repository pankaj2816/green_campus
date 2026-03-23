from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import energy, water, waste, dashboard, auth
from app.routers import insights
from app.routers import compliance
from app.routers import forecast, ai_risk
from app.routers import solar
from app.routers import data_import

# Create tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(title="Green Campus MVP")

# ✅ UPDATED CORS (for deployment + local)
origins = [
    "http://localhost:3000",          # local frontend
    "https://*.vercel.app",           # deployed frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ✅ easiest for now (production later restrict)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(energy.router)
app.include_router(water.router)
app.include_router(waste.router)
app.include_router(dashboard.router)
app.include_router(insights.router)
app.include_router(compliance.router)
app.include_router(forecast.router)
app.include_router(ai_risk.router)
app.include_router(solar.router)
app.include_router(data_import.router)

@app.get("/")
def root():
    return {"message": "Green Campus Backend Running"}