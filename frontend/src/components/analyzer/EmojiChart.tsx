import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { EmojiData } from '@/types';
import Card from '@/components/ui/Card';

interface EmojiChartProps {
    data: EmojiData[];
}

const EmojiChart: React.FC<EmojiChartProps> = ({ data }) => {
    // Take top 5 for better visualization in Pie
    const chartData = data.slice(0, 5);
    const COLORS = ['#6366f1', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

    return (
        <Card className="h-[420px] flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Top 5 Emojis</h3>
            <div className="flex-1 w-full min-h-0">
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
                            dataKey="count"
                            nameKey="emoji"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                             contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                             formatter={(value: any, name: any) => [`${value} times`, name]}
                        />
                        <Legend 
                            verticalAlign="bottom" 
                            align="center"
                            iconType="circle"
                            formatter={(value) => <span style={{ color: '#475569', fontSize: '14px', marginLeft: '5px', fontWeight: 500 }}>{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            {/* List view for more than 5 */}
            {data.length > 5 && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center text-sm text-slate-500">
                    <span className="text-xs uppercase tracking-wider font-semibold self-center">Also popular:</span>
                    {data.slice(5, 10).map((item, idx) => (
                        <span key={idx} className="bg-slate-100 px-2 py-1 rounded-lg text-slate-700 font-medium">{item.emoji}</span>
                    ))}
                </div>
            )}
        </Card>
    );
};

export default EmojiChart;
