import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { UserPercentage } from '@/types';
import Card from '@/components/ui/Card';

interface BusiestUsersChartProps {
    data: UserPercentage[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xl">
                <p className="font-bold text-slate-800 mb-1">{label}</p>
                <p className="text-indigo-600 font-medium">
                    {payload[0].value.toFixed(2)}% of messages
                </p>
            </div>
        );
    }
    return null;
};

const BusiestUsersChart: React.FC<BusiestUsersChartProps> = ({ data }) => {
    const sortedData = [...data].sort((a, b) => b.percent - a.percent).slice(0, 10);
    const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f472b6', '#fb7185'];

    return (
        <Card className="h-[400px] flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                Most Active Users
            </h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sortedData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={100} 
                            tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} 
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                        <Bar dataKey="percent" radius={[0, 6, 6, 0]} barSize={24}>
                            {sortedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default BusiestUsersChart;
