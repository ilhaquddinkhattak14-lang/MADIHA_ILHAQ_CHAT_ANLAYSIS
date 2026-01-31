import streamlit as st
import preprocessing
import helper
import matplotlib.pyplot as plt
st.sidebar.title("Whatsapp Chat Analyzer")
upload_file = st.sidebar.file_uploader("chose a file")
if upload_file is not None:
    bytes_data = upload_file.getvalue()
    data = bytes_data.decode('utf-8')
    df = preprocessing.preprocess(data)
    st.dataframe(df)
    user_list = df['user'].unique().tolist()
    user_list.remove('group_notification')
    user_list.sort()
    user_list.insert(0,"Overall")

    selected_user = st.sidebar.selectbox("Show Analysis wrt",user_list)
    if st.sidebar.button("Show Analysis"):
        st.header("Top Statistics")
        num_messages , words , num_media_messages , num_links = helper.fetch_stats(selected_user,df)
        col1 , col2 , col3 , col4 = st.columns(4)
        with col1:
            st.text("Total Messages")
            st.title(num_messages)
        with col2:
            st.text("Total Words")
            st.title(words)
        with col3:
            st.text("Total Media Shared")
            st.title(num_media_messages)
        with col4:
            st.text("Total Links Shared")
            st.title(num_links)
        st.header("Most messages per month")
        timeline = helper.monthly_timeline(selected_user, df)
        fig, ax = plt.subplots()
        ax.plot(timeline['time'], timeline['message'])
        plt.xticks(rotation='vertical')
        st.pyplot(fig)

        # activity map
        st.header('Activity Map')
        col1, col2 = st.columns(2)

        with col1:
            st.header("Most busy day")
            busy_day = helper.week_activity_map(selected_user, df)
            fig, ax = plt.subplots()
            ax.bar(busy_day.index, busy_day.values,color='orange')
            plt.xticks(rotation='vertical')
            st.pyplot(fig)
        with col2:
            st.header("Most busy month")
            busy_month = helper.month_activity_map(selected_user, df)
            fig, ax = plt.subplots()
            ax.bar(busy_month.index, busy_month.values,color='red')
            plt.xticks(rotation='vertical')
            st.pyplot(fig)

        # finding the busiest users in the group
        if selected_user == 'Overall':
            st.title('Most Busy Users of This Group')
            x , new_df = helper.most_busy_users(df)
            fig, ax = plt.subplots()

            col1, col2 = st.columns(2)

            with col1:
                st.text("Grahp of Most Busiest User in Group")
                ax.bar(x.index, x.values)
                plt.xticks(rotation='vertical')
                st.pyplot(fig)
            with col2:
                st.text("Messages Percentage Per User in Group")
                st.dataframe(new_df)
        st.header("Most Used Words")
        df_wc = helper.create_wordcloud(selected_user,df)
        fig, ax = plt.subplots()
        ax.imshow(df_wc)   
        ax.axis("off")      
        st.pyplot(fig)  

        emoji_df = helper.emoji_helper(selected_user, df)
        st.header("Emoji Analysis")

        col1, col2 = st.columns(2)

        with col1:
            st.write("Dataframe of most uesd emojis")
            st.dataframe(emoji_df)

        with col2:
            st.write("Pie chart of 10 top most uesd emojis")
            top_emojis = emoji_df.head(10)

            fig, ax = plt.subplots()
            ax.pie(top_emojis[1], labels=top_emojis[0], autopct="%0.2f")
            st.pyplot(fig)


 
