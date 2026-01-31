import React from 'react';
import Card from '@/components/ui/Card';

interface ActivityHeatmapProps {
    data: {
        [day: string]: {
            [period: string]: number;
        };
    };
}

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
    // Extract unique periods (hours/time slots) and days
    const days = Object.keys(data);
    
    // We need to collect all possible periods across all days to form columns
    const allPeriodsSet = new Set<string>();
    days.forEach(day => {
        Object.keys(data[day]).forEach(period => allPeriodsSet.add(period));
    });
    
    // Sort periods (assuming format might be "HH-HH" or similar, logical sort needed)
    // If format is "10-11", "00-01", etc., string sort usually works for 24h format
    const periods = Array.from(allPeriodsSet).sort();

    // Determine max value for color scaling
    let maxVal = 0;
    days.forEach(day => {
        Object.values(data[day]).forEach(val => {
            if (val > maxVal) maxVal = val;
        });
    });

    const getColor = (value: number) => {
        if (value === 0) return 'bg-slate-50';
        const intensity = Math.min(Math.ceil((value / maxVal) * 5), 5); // 1-5 scale
        
        switch(intensity) {
            case 1: return 'bg-indigo-100';
            case 2: return 'bg-indigo-200';
            case 3: return 'bg-indigo-300';
            case 4: return 'bg-indigo-500';
            case 5: return 'bg-indigo-600';
            default: return 'bg-slate-50';
        }
    };

    return (
        <Card className="p-6 mb-8 overflow-hidden">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Activity Heatmap</h3>
            <div className="overflow-x-auto pb-4">
                <div className="min-w-[800px]">
                    <div className="grid grid-cols-[100px_repeat(auto-fit,minmax(40px,1fr))] gap-1">
                        {/* Header Row */}
                        <div className="h-10"></div> {/* Empty corner */}
                        {periods.map(period => (
                            <div key={period} className="h-10 flex items-center justify-center text-xs font-semibold text-slate-500 rotate-90 sm:rotate-0 whitespace-nowrap">
                                {period}
                            </div>
                        ))}

                        {/* Data Rows */}
                        {days.map(day => (
                            <React.Fragment key={day}>
                                <div className="h-10 flex items-center text-sm font-bold text-slate-700 pl-2">
                                    {day}
                                </div>
                                {periods.map(period => {
                                    const value = data[day]?.[period] || 0;
                                    return (
                                        <div 
                                            key={`${day}-${period}`}
                                            className={`h-10 w-full rounded-sm ${getColor(value)} transition-colors hover:opacity-80 relative group`}
                                            title={`${day} ${period}: ${value} messages`}
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <span className="text-[10px] font-bold text-slate-900 bg-white/80 px-1 rounded shadow-sm">
                                                    {value}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
}
