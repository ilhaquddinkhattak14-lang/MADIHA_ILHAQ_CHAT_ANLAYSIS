import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import Card from '@/components/ui/Card';

interface SentimentChartProps {
    data: {
        counts: { [key: string]: number };
        samples: Array<{
            user: string;
            message: string;
            sentiment: string;
            sentiment_score: number;
        }>;
    };
}

const COLORS = {
    Positive: '#22c55e', // Green
    Neutral: '#94a3b8',  // Slate
    Negative: '#ef4444'  // Red
};

export default function SentimentChart({ data }: SentimentChartProps) {
    const chartData = Object.keys(data.counts).map(key => ({
        name: key,
        value: data.counts[key]
    }));

    return (
        <Card className="p-6 mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Sentiment Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Pie Chart */}
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Sample Messages */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    <h4 className="font-semibold text-slate-700">Sample Messages</h4>
                    {data.samples.slice(0, 5).map((sample, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-slate-700">{sample.user}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    sample.sentiment === 'Positive' ? 'bg-green-100 text-green-700' :
                                    sample.sentiment === 'Negative' ? 'bg-red-100 text-red-700' :
                                    'bg-slate-200 text-slate-600'
                                }`}>
                                    {sample.sentiment} ({sample.sentiment_score.toFixed(2)})
                                </span>
                            </div>
                            <p className="text-slate-600 line-clamp-3">{sample.message}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}
