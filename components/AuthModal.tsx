import React, { useState } from 'react';
import { XCircleIcon } from './icons/XCircleIcon';
import { UserIcon } from './icons/UserIcon';
import { LockIcon } from './icons/LockIcon';

interface AuthModalProps {
  initialMode: 'login' | 'signup';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialMode, onClose }) => {
  const [mode, setMode] = useState(initialMode);
  const isLogin = mode === 'login';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // User will add their own backend logic here.
    console.log('Form submitted. Backend implementation pending.');
    // In a real app, you might close the modal on success:
    // onClose(); 
  };
  
  const title = isLogin ? 'Welcome Back' : 'Create an Account';

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md border border-gray-700 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <XCircleIcon />
        </button>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-gray-400 mb-6">{isLogin ? 'Sign in to continue.' : 'Get started with a free account.'}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <UserIcon className="text-gray-500" />
              </span>
              <input type="email" id="email" className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 pl-10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required placeholder="you@example.com" />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <div className="relative">
               <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <LockIcon className="text-gray-500" />
              </span>
              <input type="password" id="password" className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 pl-10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required placeholder="••••••••" />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
              <div className="relative">
                 <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockIcon className="text-gray-500" />
                </span>
                <input type="password" id="confirmPassword" className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 pl-10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required placeholder="••••••••" />
              </div>
            </div>
          )}
          
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md transition-colors mt-2">
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button onClick={() => setMode(isLogin ? 'signup' : 'login')} className="font-semibold text-indigo-400 hover:text-indigo-300 ml-1 focus:outline-none">
              {isLogin ? 'Sign up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};