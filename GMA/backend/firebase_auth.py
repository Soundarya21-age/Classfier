import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, status, Header
from config import settings
from typing import Optional
import os

# Initialize Firebase only if not already initialized
try:
    if not firebase_admin._apps:
        if os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred)
            print(f"Firebase initialized successfully")
        else:
            print(f"Warning: Firebase credentials not found at {settings.FIREBASE_CREDENTIALS_PATH}")
except Exception as e:
    print(f"Firebase initialization error: {str(e)}")

async def verify_firebase_token(token: str):
    try:
        decoded_token = auth.verify_id_token(token)
        print(f"Token verified successfully for user: {decoded_token.get('email')}")
        return decoded_token
    except Exception as e:
        print(f"Token verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
        )

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        print("No Authorization header provided")
        raise HTTPException(status_code=401, detail="Not authenticated - Missing Authorization header")
    
    try:
        # Handle both "Bearer token" and plain token formats
        token = authorization.replace("Bearer ", "").strip()
        if not token:
            print("Empty token after parsing")
            raise HTTPException(status_code=401, detail="Not authenticated - Empty token")
        
        print(f"Verifying token... (length: {len(token)})")
        decoded_token = await verify_firebase_token(token)
        return decoded_token
    except HTTPException:
        raise
    except Exception as e:
        print(f"Auth error: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

