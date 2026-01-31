from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import database
import schemas
import auth
import preprocessing
import helper
import pandas as pd
import io
from typing import List

app = FastAPI(title="WhatsApp Chat Analyzer API")

from fastapi.responses import JSONResponse
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"message": f"An unexpected error occurred: {str(exc)}"},
    )

# Create tables on startup
database.create_db_and_tables()

# Dependency to get DB session
get_db = auth.get_db

@app.post("/auth/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if len(user.password) > 72:
        raise HTTPException(status_code=400, detail="Password cannot be longer than 72 characters.")
    
    db_user = db.query(database.User).filter(
        (database.User.username == user.username) | (database.User.email == user.email)
    ).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = database.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/auth/token", response_model=schemas.Token)
def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(database.User).filter(database.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Analysis Endpoints (Protected by JWT)

async def get_df_from_file(file: UploadFile):
    contents = await file.read()
    data = contents.decode("utf-8")
    df = preprocessing.preprocess(data)
    return df

@app.post("/analyze")
async def analyze_chat(
    file: UploadFile = File(...),
    selected_user: str = Form("Overall"),
    current_user: database.User = Depends(auth.get_current_user)
):
    import base64
    df = await get_df_from_file(file)
    
    # 1. Stats
    num_messages, words, num_media, num_links = helper.fetch_stats(selected_user, df)
    
    # 2. Busiest Users
    x, busy_users_df = helper.most_busy_users(df)
    
    # 3. WordCloud
    df_wc = helper.create_wordcloud(selected_user, df)
    img_buffer = io.BytesIO()
    df_wc.to_image().save(img_buffer, format='PNG')
    wordcloud_img = base64.b64encode(img_buffer.getvalue()).decode()
    
    # 4. Emojis
    emoji_df = helper.emoji_helper(selected_user, df)
    
    # 5. Timeline
    timeline = helper.monthly_timeline(selected_user, df)
    
    # 6. Activity Map
    busy_day = helper.week_activity_map(selected_user, df)
    busy_month = helper.month_activity_map(selected_user, df)
    
    return {
        "stats": {
            "num_messages": num_messages,
            "num_words": words,
            "num_media": num_media,
            "num_links": num_links
        },
        "busiest_users": {
            "top_users": x.to_dict(),
            "percentages": busy_users_df.to_dict(orient="records")
        },
        "wordcloud": f"data:image/png;base64,{wordcloud_img}",
        "emojis": emoji_df.to_dict(orient="records"),
        "timeline": timeline.to_dict(orient="records"),
        "activity_map": {
            "busy_day": busy_day.to_dict(),
            "busy_month": busy_month.to_dict()
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)