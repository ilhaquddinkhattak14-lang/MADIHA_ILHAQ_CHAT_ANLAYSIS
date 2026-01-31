import React from 'react';
import Card from '@/components/ui/Card';

interface WordCloudDisplayProps {
    imageSrc: string;
}

const WordCloudDisplay: React.FC<WordCloudDisplayProps> = ({ imageSrc }) => {
    return (
        <Card className="flex flex-col items-center">
            <h3 className="text-lg font-bold text-slate-800 mb-6 self-start">Word Cloud</h3>
            <div className="w-full relative aspect-video bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center border border-slate-100">
                {imageSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <div className="p-4 w-full h-full flex items-center justify-center">
                        <img 
                            src={imageSrc} 
                            alt="Word Cloud" 
                            className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-500" 
                        />
                    </div>
                ) : (
                    <div className="text-slate-400 font-medium">No data available</div>
                )}
            </div>
        </Card>
    );
};

export default WordCloudDisplay;
