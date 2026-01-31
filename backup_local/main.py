import streamlit as st
import preprocessing
import helper
import matplotlib.pyplot as plt
import seaborn as sns

st.set_page_config(page_title="WhatsApp Chat Analyzer", page_icon="📊", layout="wide")

# Custom CSS for premium look
st.markdown("""
    <style>
    .main {
        background-color: #f5f7f9;
    }
    .stHeader {
        background-color: #ffffff;
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .stats-card {
        background-color: white;
        padding: 1.5rem;
        border-radius: 10px;
        border-left: 5px solid #25D366;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    </style>
    """, unsafe_allow_html=True)

st.sidebar.title("📁 WhatsApp Chat Analyzer")
st.sidebar.markdown("---")

upload_file = st.sidebar.file_uploader("Upload Chat File (.txt)", help="Export WhatsApp chat without media and upload here.")

if upload_file is not None:
    bytes_data = upload_file.getvalue()
    data = bytes_data.decode('utf-8')
    df = preprocessing.preprocess(data)
    
    # Check if df is empty
    if df.empty:
        st.error("Error: Could not parse any messages from the uploaded file. Please check the file format.")
    else:
        st.success("Chat uploaded successfully!")
        
        # --- Data Preview ---
        with st.expander("👀 Preview Processed Data"):
            st.dataframe(df.head(10), use_container_width=True)
        
        # User selection
        user_list = df['user'].unique().tolist()
        if 'group_notification' in user_list:
            user_list.remove('group_notification')
        user_list.sort()
        user_list.insert(0, "Overall")

        selected_user = st.sidebar.selectbox("Show Analysis for", user_list)
        
        if st.sidebar.button("Show Analysis"):
            
            # --- Top Statistics ---
            st.title("📊 Statistics Overview")
            num_messages, words, num_media_messages, num_links = helper.fetch_stats(selected_user, df)
            
            col1, col2, col3, col4 = st.columns(4)
            with col1:
                st.metric("Total Messages", num_messages)
            with col2:
                st.metric("Total Words", words)
            with col3:
                st.metric("Media Shared", num_media_messages)
            with col4:
                st.metric("Links Shared", num_links)
            
            st.markdown("---")
            
            # --- Timelines ---
            st.title("📈 Timeline Analysis")
            
            # Monthly Timeline
            st.subheader("Monthly Timeline")
            timeline = helper.monthly_timeline(selected_user, df)
            fig, ax = plt.subplots(figsize=(12, 6))
            ax.plot(timeline['time'], timeline['message'], color='#25D366', marker='o', linestyle='-', linewidth=2)
            plt.xticks(rotation='vertical')
            st.pyplot(fig)
            
            # Daily Timeline
            st.subheader("Daily Timeline")
            daily_timeline = helper.daily_timeline(selected_user, df)
            fig, ax = plt.subplots(figsize=(12, 6))
            ax.plot(daily_timeline['date'], daily_timeline['message'], color='#128C7E', linewidth=1)
            plt.xticks(rotation='vertical')
            st.pyplot(fig)
            
            st.markdown("---")

            # --- Activity Map ---
            st.title("🗓️ Activity Analysis")
            col1, col2 = st.columns(2)

            with col1:
                st.subheader("Most Busy Day")
                busy_day = helper.week_activity_map(selected_user, df)
                fig, ax = plt.subplots()
                ax.bar(busy_day.index, busy_day.values, color='#075E54')
                plt.xticks(rotation='vertical')
                st.pyplot(fig)
                
            with col2:
                st.subheader("Most Busy Month")
                busy_month = helper.month_activity_map(selected_user, df)
                fig, ax = plt.subplots()
                ax.bar(busy_month.index, busy_month.values, color='#34B7F1')
                plt.xticks(rotation='vertical')
                st.pyplot(fig)
            
            # Activity Heatmap
            st.subheader("Weekly Activity Heatmap")
            user_heatmap = helper.activity_heatmap(selected_user, df)
            fig, ax = plt.subplots(figsize=(15, 6))
            sns.heatmap(user_heatmap, ax=ax, cmap='YlGnBu')
            st.pyplot(fig)
            
            st.markdown("---")
            
            # --- Advanced Metrics ---
            st.title("🛡️ Message Metrics & Quality")
            deleted_count, empty_messages, avg_chars, max_chars, avg_words, max_words = helper.extra_stats(selected_user, df)
            
            col1, col2, col3, col4 = st.columns(4)
            with col1:
                st.metric("Deleted Messages", deleted_count, delta_color="inverse")
                st.caption("Messages like 'This message was deleted'")
            with col2:
                st.metric("Empty Messages", empty_messages)
                st.caption("Messages with only whitespace")
            with col3:
                st.metric("Avg. Words/Msg", avg_words)
                st.caption(f"Max: {max_words} words")
            with col4:
                st.metric("Avg. Chars/Msg", int(avg_chars))
                st.caption(f"Max: {max_chars} chars")
                
            st.markdown("---")

            # --- User Engagement (Overall Only) ---
            if selected_user == 'Overall':
                st.title("👥 User Engagement Insights")
                
                # Detailed User Table
                st.subheader("Message, Word, & Emoji Usage per User")
                detailed_df = helper.user_detailed_stats(df)
                st.dataframe(detailed_df, use_container_width=True)
                
                col1, col2 = st.columns(2)
                with col1:
                    st.subheader("Messages Shared by Top Users")
                    x, new_df = helper.most_busy_users(df)
                    fig, ax = plt.subplots()
                    ax.bar(x.index, x.values, color='#25D366')
                    plt.xticks(rotation='vertical')
                    st.pyplot(fig)
                with col2:
                    st.subheader("Activity Percentage")
                    st.dataframe(new_df, use_container_width=True)
                
                st.markdown("---")

            # --- Sentiment Analysis ---
            st.title("🎭 Sentiment Analysis")
            sentiment_counts, sample_sentiments = helper.sentiment_analysis(selected_user, df)
            
            col1, col2 = st.columns([1, 2])
            with col1:
                fig, ax = plt.subplots()
                colors = {'Positive': '#25D366', 'Neutral': '#F4B400', 'Negative': '#EA4335'}
                # Use standard colors if sentiment labels don't match exactly
                ax.pie(sentiment_counts.values, labels=sentiment_counts.index, 
                       autopct="%0.1f%%", colors=[colors.get(x, '#cccccc') for x in sentiment_counts.index])
                st.pyplot(fig)
            with col2:
                st.write("Sentiment Distribution Breakdown:")
                st.dataframe(sentiment_counts, use_container_width=True)
            
            st.subheader("Sample Message Sentiments")
            st.dataframe(sample_sentiments, use_container_width=True)
            
            st.markdown("---")

            # --- Word Analysis ---
            st.title("🔤 Word Analysis")
            
            col1, col2 = st.columns(2)
            with col1:
                st.subheader("Word Cloud")
                df_wc = helper.create_wordcloud(selected_user, df)
                fig, ax = plt.subplots()
                ax.imshow(df_wc)
                ax.axis("off")
                st.pyplot(fig)
            
            with col2:
                st.subheader("Most Common Words")
                most_common_df = helper.most_common_words(selected_user, df)
                fig, ax = plt.subplots()
                ax.barh(most_common_df[0], most_common_df[1], color='#128C7E')
                plt.xticks(rotation='vertical')
                st.pyplot(fig)
            
            st.markdown("---")

            # --- Emoji Analysis ---
            st.title("😀 Emoji Analysis")
            emoji_df = helper.emoji_helper(selected_user, df)
            
            if not emoji_df.empty:
                col1, col2 = st.columns(2)
                with col1:
                    st.dataframe(emoji_df.rename(columns={0: "Emoji", 1: "Count"}), use_container_width=True)
                with col2:
                    top_emojis = emoji_df.head(10)
                    fig, ax = plt.subplots()
                    ax.pie(top_emojis[1], labels=top_emojis[0], autopct="%0.2f")
                    st.pyplot(fig)
            else:
                st.info("No emojis found in this chat.")



 
