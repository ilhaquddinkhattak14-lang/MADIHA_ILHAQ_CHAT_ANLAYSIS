import re
import pandas as pd
def preprocess(data):
    pattern = r'\d{1,2}/\d{1,2}/\d{2,4},\s\d{1,2}:\d{2}\s?(?:am|pm|AM|PM)?\s-\s'
    messages = re.split(pattern, data)[1:]
    dates = re.findall(pattern, data)
    dates = [d.replace('\u202f', ' ').strip(' -') for d in dates]
    df = pd.DataFrame({'user_messages': messages, 'message_date': dates})
    try:
        df['message_date'] = pd.to_datetime(df['message_date'], format='%d/%m/%Y, %I:%M %p')
    except:
        df['message_date'] = pd.to_datetime(df['message_date']) # Fallback to auto-detection
    df.rename(columns={'message_date': 'date'}, inplace=True)
    df = df[~df['user_messages'].str.contains(r'[\u0600-\u06FF]', na=False)]
    users = []
    messages = []

    for message in df['user_messages']:
        entry = re.split(r'([\w\W]+?):\s', message, maxsplit=1)  # split only once
        if len(entry) >= 3:  # means it has "user: message"
            users.append(entry[1])
            messages.append(entry[2])
        else:  # system notification (no ":")
            users.append('group_notification')
            messages.append(entry[0])
    df['user'] = users
    df['message'] = messages
    df.drop(columns=['user_messages'], inplace=True)
    df['year'] = df['date'].dt.year
    df['month'] = df['date'].dt.month_name()
    df['month_num'] = df['date'].dt.month
    df['day_name'] = df['date'].dt.day_name()
    df['day'] = df['date'].dt.day
    df['hour'] = df['date'].dt.hour
    df['minute'] = df['date'].dt.minute
    return df