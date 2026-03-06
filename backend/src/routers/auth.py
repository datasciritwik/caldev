from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from src.auth.security import verify_firebase_token, create_access_token
from src.models.models import User

router = APIRouter(prefix="/api/auth", tags=["Auth"])

class TokenExchangeReq(BaseModel):
    id_token: str

@router.post("/token")
async def exchange_token(req: TokenExchangeReq):
    # 1. Verify Firebase Token
    decoded_firebase_user = verify_firebase_token(req.id_token)
    
    firebase_uid = decoded_firebase_user.get("uid")
    email = decoded_firebase_user.get("email")
    avatar_url = decoded_firebase_user.get("picture")
    # For username, we can use display_name or part of email
    username = decoded_firebase_user.get("name") or email.split("@")[0]

    # 2. Sync User in Mongo
    user = await User.find_one(User.firebase_uid == firebase_uid)
    if not user:
        user = User(
            firebase_uid=firebase_uid,
            email=email,
            username=username,
            avatar_url=avatar_url
        )
        await user.insert()
    elif user.avatar_url != avatar_url:
        user.avatar_url = avatar_url
        await user.save()
    
    # 3. Issue Backend JWT
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }
