import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
    return (
        <div 
            className={`
                bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl p-6 shadow-sm
                ${hover ? 'transition-all duration-300 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1' : ''}
                ${className}
            `}
        >
            {children}
        </div>
    );
};

export default Card;
