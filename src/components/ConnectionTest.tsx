// In EduEditor: src/components/ConnectionTest.tsx
import { useEffect, useState } from 'react';
import { parentBridge } from '@/services/parent-bridge';

export function ConnectionTest() {
    const [status, setStatus] = useState('Waiting for parent app...');
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        console.log('Setting up userData listener first...');

        parentBridge.on('userData', (data) => {
            console.log('userData callback triggered!', data);
            setStatus('Connected!');
            setUserData(data);

        });

        // Tell parent we're ready to receive messages
        if (typeof window !== 'undefined') {
            window.parent.postMessage({
                type: 'EDITOR_READY',
                payload: { message: 'Editor is ready' }
            }, '*');
        }

    }, []);

    return (
        <div style={{ padding: '1rem', background: '#f0f0f0', margin: '1rem 0' }}>
            <h3>Connection Status: {status}</h3>
            {userData && (
                <div>
                    <p>User: {userData.user?.name}</p>
                    <p>Email: {userData.user?.email}</p>
                    <p>Authenticated: {userData.isAuthenticated ? 'Yes' : 'No'}</p>
                    <p>Post?: {userData.post !== null ? 'Yes' : 'No'}</p>
                </div>
            )}
        </div>
    );
}