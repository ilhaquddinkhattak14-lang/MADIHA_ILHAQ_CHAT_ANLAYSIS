import React from 'react';
import Card from '@/components/ui/Card';
import { Trash2, MessageSquare, AlignLeft, Maximize2, Type, FileText } from 'lucide-react';

interface ExtraStatsProps {
    stats: {
        deleted_messages: number;
        empty_messages: number;
        avg_msg_length: number;
        max_msg_length: number;
        avg_word_count: number;
        max_word_count: number;
    };
}

export default function ExtraStats({ stats }: ExtraStatsProps) {
    const items = [
        {
            label: "Deleted Messages",
            value: stats.deleted_messages,
            icon: Trash2,
            color: "text-red-500",
            bg: "bg-red-50"
        },
        {
            label: "Empty/Blank",
            value: stats.empty_messages,
            icon: MessageSquare,
            color: "text-gray-400",
            bg: "bg-gray-50"
        },
        {
            label: "Avg Msg Length (Chars)",
            value: stats.avg_msg_length,
            icon: AlignLeft,
            color: "text-blue-500",
            bg: "bg-blue-50"
        },
        {
            label: "Max Msg Length (Chars)",
            value: stats.max_msg_length,
            icon: Maximize2,
            color: "text-indigo-500",
            bg: "bg-indigo-50"
        },
        {
            label: "Avg Word Count",
            value: stats.avg_word_count,
            icon: Type,
            color: "text-green-500",
            bg: "bg-green-50"
        },
        {
            label: "Max Word Count",
            value: stats.max_word_count,
            icon: FileText,
            color: "text-emerald-500",
            bg: "bg-emerald-50"
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {items.map((item, index) => (
                <Card key={index} className="p-4 flex items-center space-x-4 hover:shadow-md transition-shadow">
                    <div className={`p-3 rounded-xl ${item.bg}`}>
                        <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">{item.label}</p>
                        <p className="text-2xl font-bold text-slate-800">{item.value}</p>
                    </div>
                </Card>
            ))}
        </div>
    );
}
