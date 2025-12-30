'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function JoinWorkspaceContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isLoaded } = useUser();

    const token = searchParams.get('token');
    const workspaceId = searchParams.get('workspaceId');

    const [status, setStatus] = useState('loading'); // loading, success, error
    const [errorHeader, setErrorHeader] = useState('Joining failed');
    const [errorMessage, setErrorMessage] = useState('Invalid or expired invitation link.');

    useEffect(() => {
        if (!isLoaded) return;
        if (!user) {
            // Redirect to sign-in or wait for user
            return;
        }

        if (!token || !workspaceId) {
            setStatus('error');
            setErrorHeader('Invalid Link');
            setErrorMessage('The invitation link is missing required information.');
            return;
        }

        const processJoin = async () => {
            try {
                const res = await axios.post(`${API_URL}/workspaces/join`, {
                    workspaceId,
                    userId: user.id,
                    token,
                });

                if (res.data.success) {
                    setStatus('success');
                    setTimeout(() => {
                        router.push('/dashboard/workspace');
                    }, 3000);
                }
            } catch (err) {
                setStatus('error');
                setErrorMessage(err.response?.data?.message || 'Something went wrong while joining the workspace.');
            }
        };

        processJoin();
    }, [isLoaded, user, token, workspaceId, router]);

    if (!isLoaded || (isLoaded && !user)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <Loader2 className="animate-spin mb-4 text-blue-600" size={48} />
                <h1 className="text-2xl font-bold">Please sign in to join the workspace</h1>
                <p className="text-gray-600 mt-2">Redirecting to sign in...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white rounded-2xl shadow-sm border">
            {status === 'loading' && (
                <>
                    <Loader2 className="animate-spin mb-4 text-blue-600" size={48} />
                    <h1 className="text-2xl font-bold">Verifying Invitation...</h1>
                    <p className="text-gray-600 mt-2">One moment while we add you to the workspace.</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <CheckCircle className="mb-4 text-green-500" size={64} />
                    <h1 className="text-2xl font-bold text-green-600">Successfully Joined!</h1>
                    <p className="text-gray-600 mt-2">You are now a member of the workspace.</p>
                    <p className="text-sm text-gray-400 mt-4 italic">Redirecting you to your workspaces...</p>
                </>
            )}

            {status === 'error' && (
                <>
                    <XCircle className="mb-4 text-red-500" size={64} />
                    <h1 className="text-2xl font-bold text-red-600">{errorHeader}</h1>
                    <p className="text-gray-600 mt-2">{errorMessage}</p>
                    <button
                        onClick={() => router.push('/dashboard/workspace')}
                        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium"
                    >
                        Go to My Workspaces
                    </button>
                </>
            )}
        </div>
    );
}

export default function JoinWorkspacePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <JoinWorkspaceContent />
        </Suspense>
    );
}
