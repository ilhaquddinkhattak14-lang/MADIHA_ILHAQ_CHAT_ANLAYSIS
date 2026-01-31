import re
import pandas as pd

def preprocess(data):
    # Expanded pattern to handle various WhatsApp export formats
    patterns = [
        r'\d{1,2}/\d{1,2}/\d{2,4},\s\d{1,2}:\d{2}\s?(?:am|pm|AM|PM)?\s-\s',  # 24/12/2022, 10:30 am - 
        r'\d{1,2}/\d{1,2}/\d{2,4},\s\d{1,2}:\d{2}\s-\s',                    # 24/12/2022, 10:30 - 
        r'\[\d{1,2}/\d{1,2}/\d{2,4},\s\d{1,2}:\d{2}:\d{2}\]\s'             # [24/12/2022, 10:30:15] 
    ]
    
    pattern = '|'.join(patterns)
    
    messages = re.split(pattern, data)[1:]
    dates = re.findall(pattern, data)
    
    # Clean up dates
    dates = [d.replace('\u202f', ' ').strip(' -[]') for d in dates]
    
    df = pd.DataFrame({'user_messages': messages, 'message_date': dates})
    
    # Try multiple date formats
    date_formats = [
        '%d/%m/%Y, %I:%M %p', 
        '%d/%m/%y, %I:%M %p',
        '%d/%m/%Y, %H:%M',
        '%d/%m/%y, %H:%M',
        '%m/%d/%Y, %I:%M %p',
        '%m/%d/%y, %I:%M %p'
    ]
    
    df['date'] = None
    for fmt in date_formats:
        try:
            df['date'] = pd.to_datetime(df['message_date'], format=fmt)
            if not df['date'].isnull().all():
                break
        except:
            continue
            
    if df['date'].isnull().all():
        # Fallback to automatic parsing if specific formats fail
        df['date'] = pd.to_datetime(df['message_date'], errors='coerce')

    df.drop(columns=['message_date'], inplace=True)
    
    # Filter out non-English messages if requested (keeping the original filter logic but more explicit)
    # df = df[~df['user_messages'].str.contains(r'[\u0600-\u06FF]', na=False)]
    
    users = []
    messages = []

    for message in df['user_messages']:
        entry = re.split(r'([\w\W]+?):\s', message, maxsplit=1)
        if len(entry) >= 3:
            users.append(entry[1])
            messages.append(entry[2])
        else:
            users.append('group_notification')
            messages.append(entry[0])
            
    df['user'] = users
    df['message'] = messages
    df.drop(columns=['user_messages'], inplace=True)
    
    # Feature extraction
    df['year'] = df['date'].dt.year
    df['month'] = df['date'].dt.month_name()
    df['month_num'] = df['date'].dt.month
    df['day_name'] = df['date'].dt.day_name()
    df['day'] = df['date'].dt.day
    df['hour'] = df['date'].dt.hour
    df['minute'] = df['date'].dt.minute
    
    # Adding period (e.g., 23-00)
    period = []
    for hour in df[['day_name', 'hour']]['hour']:
        if hour == 23:
            period.append(str(hour) + "-" + str('00'))
        elif hour == 0:
            period.append(str('00') + "-" + str(hour + 1))
        else:
            period.append(str(hour) + "-" + str(hour + 1))

    df['period'] = period
    
    return df
