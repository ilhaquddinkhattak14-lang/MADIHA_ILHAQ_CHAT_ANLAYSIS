import React from 'react';
import Card from '@/components/ui/Card';

interface UserStatsProps {
    data: Array<{
        User: string;
        Messages: number;
        Words: number;
        Emojis: number;
        Media: number;
    }>;
}

export default function UserDetailedStatsTable({ data }: UserStatsProps) {
    if (!data || data.length === 0) return null;

    return (
        <Card className="p-6 mb-8 overflow-hidden">
            <h3 className="text-xl font-bold text-slate-800 mb-6">User Detailed Statistics</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-4 rounded-l-lg">User</th>
                            <th scope="col" className="px-6 py-4">Messages</th>
                            <th scope="col" className="px-6 py-4">Words</th>
                            <th scope="col" className="px-6 py-4">Emojis</th>
                            <th scope="col" className="px-6 py-4 rounded-r-lg">Media</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((user, index) => (
                            <tr key={index} className="bg-white border-b hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                    {user.User}
                                </td>
                                <td className="px-6 py-4">{user.Messages}</td>
                                <td className="px-6 py-4">{user.Words}</td>
                                <td className="px-6 py-4">{user.Emojis}</td>
                                <td className="px-6 py-4">{user.Media}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
