import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ActivityMap } from '@/types';
import Card from '@/components/ui/Card';

interface ActivityMapChartsProps {
    data: ActivityMap;
}

const ActivityMapCharts: React.FC<ActivityMapChartsProps> = ({ data }) => {
    // Transform object data to array for recharts
    const dayData = Object.entries(data.busy_day).map(([name, value]) => ({ name, value }));
    const monthData = Object.entries(data.busy_month).map(([name, value]) => ({ name, value }));

    // Sort days intentionally if needed, usually passed in order from backend but can enforce order
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    dayData.sort((a, b) => daysOrder.indexOf(a.name) - daysOrder.indexOf(b.name));
    
    // Sort months 
    const monthsOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    monthData.sort((a, b) => monthsOrder.indexOf(a.name) - monthsOrder.indexOf(b.name));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-[350px] flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Busy Days</h3>
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dayData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                tick={{ fill: '#64748b', fontSize: 12 }} 
                                tickLine={false} 
                                axisLine={false}
                                interval={0} 
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                cursor={{ fill: '#f1f5f9' }}
                            />
                            <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card className="h-[350px] flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Busy Months</h3>
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                tick={{ fill: '#64748b', fontSize: 12 }} 
                                tickLine={false} 
                                axisLine={false}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                cursor={{ fill: '#f1f5f9' }}
                            />
                            <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};

export default ActivityMapCharts;
