"use client";

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { analyzerApi } from '@/lib/api';
import { AnalysisResults } from '@/types';
import Button from '@/components/ui/Button';
import FileUpload from '@/components/analyzer/FileUpload';
import StatsCards from '@/components/analyzer/StatsCards';
import BusiestUsersChart from '@/components/analyzer/BusiestUsersChart';
import TimelineChart from '@/components/analyzer/TimelineChart';
import ActivityMapCharts from '@/components/analyzer/ActivityMapCharts';
import EmojiChart from '@/components/analyzer/EmojiChart';
import WordCloudDisplay from '@/components/analyzer/WordCloudDisplay';
import DailyTimeline from '@/components/analyzer/DailyTimeline';
import ActivityHeatmap from '@/components/analyzer/ActivityHeatmap';
import SentimentChart from '@/components/analyzer/SentimentChart';
import UserDetailedStatsTable from '@/components/analyzer/UserDetailedStatsTable';
import ExtraStats from '@/components/analyzer/ExtraStats';
import { LogOut, Filter, MessageSquareText } from 'lucide-react';

export default function AnalyzerPage() {
    const { logout } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<AnalysisResults | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [selectedUser, setSelectedUser] = useState<string>('Overall');
    const [usersList, setUsersList] = useState<string[]>([]);

    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async (file: File) => {
        setIsLoading(true);
        setError(null);
        setUploadedFile(file);
        try {
            const data = await analyzerApi.analyze(file, 'Overall');
            setResults(data);
            
            // Extract users for the dropdown
            const users = data.busiest_users.percentages.map((u: any) => u.name);
            setUsersList(['Overall', ...users]);
            setSelectedUser('Overall');
        } catch (error: any) {
            console.error('Error analyzing file:', error);
            setError(error.response?.data?.message || 'Failed to analyze chat. Please try again or check the file format.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const user = e.target.value;
        setSelectedUser(user);
        
        if (uploadedFile) {
            setIsLoading(true);
            try {
                const data = await analyzerApi.analyze(uploadedFile, user);
                setResults(data);
            } catch (error) {
                console.error('Error analyzing for user:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen pb-20 bg-slate-50/50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <MessageSquareText className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                            Chat<span className="text-indigo-600">Analyzer</span>
                        </h1>
                    </div>
                    
                    <Button variant="ghost" onClick={logout} className="text-sm font-medium hover:bg-slate-100/80">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Upload Section */}
                {!results && (
                    <div className="max-w-2xl mx-auto mt-20 fade-in-up">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                                Unlock insights from your <br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">WhatsApp Chats</span>
                            </h2>
                            <p className="text-slate-500 text-lg max-w-lg mx-auto leading-relaxed">
                                Upload your exported chat file to visualize activity, trends, and statistics in seconds.
                            </p>
                        </div>
                        {error && (
                            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center font-medium animate-in fade-in slide-in-from-top-2 shadow-sm">
                                {error}
                            </div>
                        )}
                        <FileUpload onFileSelect={handleAnalyze} isLoading={isLoading} />
                    </div>
                )}

                {/* Dashboard */}
                {results && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                        {/* Controls */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className="font-semibold text-slate-500 uppercase text-xs tracking-wider">Analysis for</span>
                                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold border border-indigo-100">
                                    {uploadedFile?.name}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <Filter className="w-4 h-4 text-slate-400" />
                                <div className="relative">
                                    <select 
                                        value={selectedUser}
                                        onChange={handleUserChange}
                                        className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 block w-full sm:w-64 p-2.5 pr-8 transition-all cursor-pointer outline-none"
                                        disabled={isLoading}
                                    >
                                        {usersList.map((user, idx) => (
                                            <option key={idx} value={user}>{user}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Components Grid */}
                        <StatsCards stats={results.stats} />
                        
                        <div className="grid grid-cols-1 gap-6 animate-in slide-in-from-bottom-4 duration-700">
                    <ExtraStats stats={results.extra_stats} />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <BusiestUsersChart 
                            data={results.busiest_users.percentages}
                        />
                        <EmojiChart data={results.emojis} />
                    </div>

                    <TimelineChart data={results.timeline} />
                    <DailyTimeline data={results.daily_timeline} />

                    <ActivityMapCharts data={results.activity_map} />
                    
                    <ActivityHeatmap data={results.activity_heatmap} />
                    
                    <SentimentChart data={results.sentiment} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <WordCloudDisplay imageSrc={results.wordcloud} />
                        {/* You could put another chart here or leave WordCloud full width if preferred */}
                    </div>
                    
                    <UserDetailedStatsTable data={results.user_detailed_stats} />
                </div>
                    </div>
                )}
            </main>
        </div>
    );
}
