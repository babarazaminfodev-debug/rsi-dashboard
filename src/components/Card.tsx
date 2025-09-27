
import React from 'react';

interface CardProps {
  title: string;
  count: number;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, count, children }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg shadow-lg flex flex-col">
      <div className="p-4 border-b border-gray-700/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <span className="bg-gray-700 text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded-full">{count}</span>
      </div>
      <div className="p-4 flex-grow">
        {children}
      </div>
    </div>
  );
};
