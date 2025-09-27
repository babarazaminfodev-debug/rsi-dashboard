'use client';

import { User } from '@prisma/client';
import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPendingUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/users/pending');
            if (!res.ok) throw new Error("Failed to fetch users");
            const data = await res.json();
            setPendingUsers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const handleApprove = async (userId: string) => {
        try {
            const res = await fetch('/api/users/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to approve user");
            }
            
            // Refresh list after approval
            setPendingUsers(prev => prev.filter(user => user.id !== userId));

        } catch (err) {
             alert(err instanceof Error ? err.message : "An unknown error occurred");
        }
    };

    if (loading) return <p>Loading pending users...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;

    return (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg shadow-lg">
            <div className="p-4 border-b border-gray-700/50">
                <h2 className="text-lg font-semibold">Users Pending Approval ({pendingUsers.length})</h2>
            </div>
            <div className="p-4">
                {pendingUsers.length > 0 ? (
                    <ul className="space-y-3">
                        {pendingUsers.map(user => (
                            <li key={user.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-md">
                                <div>
                                    <p className="font-medium">{user.email}</p>
                                    <p className="text-xs text-gray-400">
                                        Signed up on: {new Date(user.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleApprove(user.id)}
                                    className="px-4 py-2 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                                >
                                    Approve
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400 text-center py-8">No users are currently pending approval.</p>
                )}
            </div>
        </div>
    );
}
