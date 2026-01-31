import React from 'react';
import { ChatStats } from '@/types';
import Card from '@/components/ui/Card';
import { MessageCircle, Type, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

interface StatsCardsProps {
    stats: ChatStats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
    const items = [
        {
            label: 'Total Messages',
            value: stats.num_messages,
            icon: MessageCircle,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-100'
        },
        {
            label: 'Total Words',
            value: stats.num_words,
            icon: Type,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            border: 'border-purple-100'
        },
        {
            label: 'Media Shared',
            value: stats.num_media,
            icon: ImageIcon,
            color: 'text-pink-600',
            bg: 'bg-pink-50',
            border: 'border-pink-100'
        },
        {
            label: 'Links Shared',
            value: stats.num_links,
            icon: LinkIcon,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, index) => (
                <Card key={index} className="relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex items-center gap-5">
                        <div className={`p-4 rounded-2xl ${item.bg} ${item.border} border shadow-sm group-hover:shadow-md transition-shadow`}>
                            <item.icon className={`w-7 h-7 ${item.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 mb-0.5">{item.label}</p>
                            <h4 className="text-3xl font-bold text-slate-800">{item.value.toLocaleString()}</h4>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default StatsCards;
