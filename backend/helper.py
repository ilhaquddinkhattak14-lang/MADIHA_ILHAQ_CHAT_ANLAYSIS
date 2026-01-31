from urlextract import URLExtract
from wordcloud import WordCloud
import pandas as pd
from collections import Counter
import emoji
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

extract = URLExtract()
analyzer = SentimentIntensityAnalyzer()

def fetch_stats(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]
    num_messages = df.shape[0]
    words = []
    for message in df['message']:
        words.extend(message.split())
    num_media_messages = df[df['message'] == '<Media omitted>\n'].shape[0]
    links = []
    for message in df['message']:
        links.extend(extract.find_urls(message))
    return num_messages, len(words), num_media_messages, len(links)

def most_busy_users(df):
    x = df['user'].value_counts().head()
    df_percent = round((df['user'].value_counts() / df.shape[0]) * 100, 2).reset_index().rename(columns={'count': 'percent', 'user': 'name'})
    return x, df_percent

def create_wordcloud(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]
    
    # Filter out media omitted and system notifications
    temp = df[df['user'] != 'group_notification']
    temp = temp[temp['message'] != '<Media omitted>\n']
    
    # Basic stop words
    stop_words = ["the", "a", "is", "am", "are", "and", "or", "to", "in", "it", "i", "you", "my", "me", "was", "for", "with", "on", "this", "that", "of", "at", "but", "not", "have", "be", "as", "do", "we", "your", "can", "if", "so", "up", "all", "get", "go", "out", "now", "just", "like", "they", "will"]
    
    def remove_stop_words(message):
        y = []
        for word in message.lower().split():
            if word not in stop_words:
                y.append(word)
        return " ".join(y)

    wc = WordCloud(width=500, height=500, min_font_size=10, background_color='white')
    temp['message'] = temp['message'].apply(remove_stop_words)
    df_wc = wc.generate(temp['message'].str.cat(sep=" "))
    return df_wc

def most_common_words(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    temp = df[df['user'] != 'group_notification']
    temp = temp[temp['message'] != '<Media omitted>\n']

    stop_words = ["the", "a", "is", "am", "are", "and", "or", "to", "in", "it", "i", "you", "my", "me", "was", "for", "with", "on", "this", "that", "of", "at", "but", "not", "have", "be", "as", "do", "we", "your", "can", "if", "so", "up", "all", "get", "go", "out", "now", "just", "like", "they", "will"]
    words = []

    for message in temp['message']:
        for word in message.lower().split():
            if word not in stop_words:
                words.append(word)

    most_common_df = pd.DataFrame(Counter(words).most_common(20))
    return most_common_df

def emoji_helper(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    emojis = []
    for message in df['message']:
        emojis.extend([c for c in message if c in emoji.EMOJI_DATA])

    emoji_df = pd.DataFrame(Counter(emojis).most_common(len(Counter(emojis))))
    return emoji_df

def monthly_timeline(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    timeline = df.groupby(['year', 'month_num', 'month']).count()['message'].reset_index()
    time = []
    for i in range(timeline.shape[0]):
        time.append(timeline['month'][i] + "-" + str(timeline['year'][i]))
    timeline['time'] = time
    return timeline

def daily_timeline(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    daily_timeline = df.groupby('date').count()['message'].reset_index()
    return daily_timeline

def week_activity_map(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]
    return df['day_name'].value_counts()

def month_activity_map(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]
    return df['month'].value_counts()

def activity_heatmap(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]

    user_heatmap = df.pivot_table(index='day_name', columns='period', values='message', aggfunc='count').fillna(0)
    return user_heatmap

def sentiment_analysis(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]
    
    df = df[df['user'] != 'group_notification']
    df = df[df['message'] != '<Media omitted>\n']

    def get_sentiment(text):
        return analyzer.polarity_scores(text)['compound']

    df['sentiment_score'] = df['message'].apply(get_sentiment)
    
    def get_sentiment_label(score):
        if score >= 0.05:
            return 'Positive'
        elif score <= -0.05:
            return 'Negative'
        else:
            return 'Neutral'

    df['sentiment'] = df['sentiment_score'].apply(get_sentiment_label)
    return df['sentiment'].value_counts(), df[['user', 'message', 'sentiment', 'sentiment_score']].head(10)

def user_detailed_stats(df):
    # This function only makes sense for 'Overall' view
    users = df[df['user'] != 'group_notification']['user'].unique()
    user_data = []
    
    for user in users:
        user_df = df[df['user'] == user]
        num_messages = user_df.shape[0]
        
        # Word count
        words = []
        for msg in user_df['message']:
            words.extend(msg.split())
        num_words = len(words)
        
        # Emoji count
        emojis = []
        for msg in user_df['message']:
            emojis.extend([c for c in msg if c in emoji.EMOJI_DATA])
        num_emojis = len(emojis)
        
        # Media count
        num_media = user_df[user_df['message'] == '<Media omitted>\n'].shape[0]
        
        user_data.append({
            'User': user,
            'Messages': num_messages,
            'Words': num_words,
            'Emojis': num_emojis,
            'Media': num_media
        })
        
    return pd.DataFrame(user_data).sort_values(by='Messages', ascending=False)

def extra_stats(selected_user, df):
    if selected_user != 'Overall':
        df = df[df['user'] == selected_user]
    
    # Filter out group notifications for accurate results
    df = df[df['user'] != 'group_notification']
    
    if df.empty:
        return 0, 0, 0, 0, 0, 0
        
    # Deleted messages patterns (WhatsApp specific)
    deleted_patterns = ['This message was deleted', 'You deleted this message']
    deleted_count = df[df['message'].str.contains('|'.join(deleted_patterns), case=False)].shape[0]
    
    # Empty messages (just whitespace or truly empty)
    empty_messages = df[df['message'].str.strip() == ""].shape[0]
    
    # Message lengths
    message_lengths = df['message'].apply(len)
    avg_msg_length_chars = float(round(message_lengths.mean(), 2))
    max_msg_length_chars = int(message_lengths.max())
    
    # Word based lengths
    word_counts = df['message'].apply(lambda x: len(x.split()))
    avg_word_count = float(round(word_counts.mean(), 2))
    max_word_count = int(word_counts.max())
    
    return int(deleted_count), int(empty_messages), avg_msg_length_chars, max_msg_length_chars, avg_word_count, max_word_count


