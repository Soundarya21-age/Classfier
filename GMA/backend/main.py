from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine, Base
from routers import auth, uploads, tests 
import models
from config import settings
import uvicorn

# Define the FastAPI application instance
app = FastAPI(
    title="GMA Doctor Interface API",
    description="API for GMA video upload and blind testing",
    version="1.0.0"
)

# CORS middleware - Add BEFORE routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=3600,
)

# Function to run initialization steps (DB creation and router inclusion)
def initialize_app(app: FastAPI):
    # Create tables (Will only create them if they don't exist)
    Base.metadata.create_all(bind=engine)

    # Mount uploads directory as static files so frontend can access uploaded videos
    try:
        app.mount("/uploads", StaticFiles(directory=settings.UPLOADS_DIR), name="uploads")
    except Exception:
        # If mounting fails, log but continue; StaticFiles requires the directory to exist
        print(f"Warning: failed to mount uploads directory: {settings.UPLOADS_DIR}")

    # Include routers (Final, explicit configuration)
    # Ensure all routers have prefix="" or tags=[]
    app.include_router(auth.router, prefix="/api/auth")
    app.include_router(uploads.router, prefix="/api/uploads") 
    app.include_router(tests.router, prefix="/api/tests") 

    @app.get("/")
    async def root():
        return {
            "message": "GMA Doctor Interface API",
            "version": "1.0.0",
            "docs": "/docs"
        }

    @app.get("/health")
    async def health_check():
        return {"status": "healthy"}

    @app.get("/api/tests/debug")
    async def debug_test():
        """Debug endpoint - no auth required"""
        return {
            "message": "Debug endpoint working",
            "firebase_initialized": True
        }

# Run initialization when the module is imported
initialize_app(app)

if __name__ == "__main__":
    # Guard against multiprocessing issues when using uvicorn.run
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)