import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { XCircleIcon } from './icons/XCircleIcon';
import { UserIcon } from './icons/UserIcon';
import { LockIcon } from './icons/LockIcon';

interface AuthModalProps {
  initialMode: 'login' | 'signup';
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialMode, onClose, onSuccess }) => {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();
  
  const isLogin = mode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
      }
      
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
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
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserIcon className="text-gray-500" />
                </span>
                <input 
                  type="text" 
                  id="fullName" 
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 pl-10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  placeholder="John Doe" 
                />
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <UserIcon className="text-gray-500" />
              </span>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 pl-10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                required 
                placeholder="you@example.com" 
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <div className="relative">
               <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <LockIcon className="text-gray-500" />
              </span>
              <input 
                type="password" 
                id="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 pl-10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required placeholder="••••••••" />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
              <div className="relative">
                 <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockIcon className="text-gray-500" />
                </span>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 pl-10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required placeholder="••••••••" />
              </div>
            </div>
          )}
          
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-colors mt-2">
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
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