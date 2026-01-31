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

from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request

# Logging middleware to see if requests hit the server
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Incoming request: {request.method} {request.url}")
    try:
        response = await call_next(request)
        print(f"Response status: {response.status_code}")
        return response
    except Exception as e:
        print(f"Request failed: {str(e)}")
        raise e

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

    # 7. Daily Timeline (New)
    daily_timeline = helper.daily_timeline(selected_user, df)

    # 8. Activity Heatmap (New)
    heatmap = helper.activity_heatmap(selected_user, df)
    # Convert pivot table to easy JSON format (e.g. list of records or custom dict)
    # Heatmap returns a pivot table (DataFrame). to_dict() might need robust handling for frontend.
    # Let's convert it to a structure: {day: {period: count}}
    heatmap_data = heatmap.to_dict()

    # 9. Sentiment Analysis (New)
    sentiment_counts, sentiment_samples = helper.sentiment_analysis(selected_user, df)
    
    # 10. User Detailed Stats (New)
    # user_detailed_stats takes only df, usually for Overall. If selected_user is specific, it might just return that user or all.
    # helper.py line 140 says: "This function only makes sense for 'Overall' view"
    if selected_user == 'Overall':
        user_stats_df = helper.user_detailed_stats(df)
        user_stats = user_stats_df.to_dict(orient="records")
    else:
        user_stats = []

    # 11. Extra Stats (New)
    deleted_count, empty_messages, avg_msg_len, max_msg_len, avg_word_count, max_word_count = helper.extra_stats(selected_user, df)
    
    import numpy as np

    def convert_numpy(obj):
        if isinstance(obj, (np.intc, np.intp, np.int8,
                            np.int16, np.int32, np.int64, np.uint8,
                            np.uint16, np.uint32, np.uint64)):
            return int(obj)
        elif isinstance(obj, (np.float16, np.float32, np.float64)):
            return float(obj)
        elif isinstance(obj, (np.ndarray,)): 
            return obj.tolist()
        elif isinstance(obj, dict):
            return {k: convert_numpy(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [convert_numpy(i) for i in obj]
        return obj

    response_data = {
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
        },
        "daily_timeline": daily_timeline.to_dict(orient="records"),
        "activity_heatmap": heatmap_data,
        "sentiment": {
            "counts": sentiment_counts.to_dict(),
            "samples": sentiment_samples.to_dict(orient="records")
        },
        "user_detailed_stats": user_stats,
        "extra_stats": {
            "deleted_messages": deleted_count,
            "empty_messages": empty_messages,
            "avg_msg_length": avg_msg_len,
            "max_msg_length": max_msg_len,
            "avg_word_count": avg_word_count,
            "max_word_count": max_word_count
        }
    }
    
    return convert_numpy(response_data)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)