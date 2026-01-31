import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import Card from '@/components/ui/Card';

import { DailyActivity } from '@/types';

interface DailyTimelineProps {
    data: DailyActivity[];
}

export default function DailyTimeline({ data }: DailyTimelineProps) {
    return (
        <Card className="p-6 mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Daily Activity Timeline</h3>
            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                            dataKey="date" 
                            stroke="#64748b"
                            fontSize={12}
                            tick={{fill: '#64748b'}}
                        />
                        <YAxis 
                            stroke="#64748b"
                            fontSize={12}
                            tick={{fill: '#64748b'}}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="message" 
                            stroke="#8b5cf6" 
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
