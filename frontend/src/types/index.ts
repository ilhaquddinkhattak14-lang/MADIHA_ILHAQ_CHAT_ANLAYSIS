export interface User {
    username: string;
    email: string;
    id?: number;
}

export interface Token {
    access_token: string;
    token_type: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export interface ChatStats {
    num_messages: number;
    num_words: number;
    num_media: number;
    num_links: number;
}

export interface UserPercentage {
    name: string;
    percent: number;
    count?: number;
}

export interface TimelineData {
    time: string;
    message: number;
}

export interface DailyActivity {
    day_name: string;
    count: number;
}

export interface MonthlyActivity {
    month: string;
    count: number;
}

export interface EmojiData {
    emoji: string;
    count: number;
}

export interface BusiestUsers {
    top_users: Record<string, number>;
    percentages: UserPercentage[];
}

export interface ActivityMap {
    busy_day: Record<string, number>;
    busy_month: Record<string, number>;
}

export interface SentimentData {
    counts: Record<string, number>;
    samples: {
        user: string;
        message: string;
        sentiment: string;
        sentiment_score: number;
    }[];
}

export interface UserDetailedStat {
    User: string;
    Messages: number;
    Words: number;
    Emojis: number;
    Media: number;
}

export interface ExtraStats {
    deleted_messages: number;
    empty_messages: number;
    avg_msg_length: number;
    max_msg_length: number;
    avg_word_count: number;
    max_word_count: number;
}

export interface AnalysisResults {
    stats: ChatStats;
    busiest_users: BusiestUsers;
    wordcloud: string; // Base64 string
    emojis: EmojiData[];
    timeline: TimelineData[];
    daily_timeline: DailyActivity[];
    activity_map: ActivityMap;
    activity_heatmap: Record<string, Record<string, number>>;
    sentiment: SentimentData;
    user_detailed_stats: UserDetailedStat[];
    extra_stats: ExtraStats;
}
