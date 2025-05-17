import { useEffect, useState } from 'react';
import { parentBridge } from '@/services/parent-bridge';

export function ConnectionTest() {
    const [status, setStatus] = useState('Waiting for parent app...');
    const [userData, setUserData] = useState<any>(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        console.log('Setting up userData listener...');

        // Check if we're in an iframe
        const isInIframe = window !== window.parent;
        if (!isInIframe) {
            setStatus('Not running in an iframe');
            return;
        }

        // Listen for user data
        const unsubscribe = parentBridge.on('userData', (data: any) => {
            console.log('userData callback triggered!', data);
            setStatus('Connected!');
            setUserData(data);
        });

        // If we don't receive data within 3 seconds, retry sending ready message
        const timeoutId = setTimeout(() => {
            if (!userData && retryCount < 3) {
                console.log(`Retry #${retryCount + 1}: Sending ready message again`);
                setRetryCount(prev => prev + 1);

                // Resend ready message
                parentBridge.sendToParent(
                    window.location.pathname.includes('post-csr') ? 'VIEWER_READY' : 'EDITOR_READY',
                    { retryCount: retryCount + 1 }
                );
            }
        }, 3000);

        return () => {
            unsubscribe();
            clearTimeout(timeoutId);
        };
    }, [retryCount, userData]);

    return (
        <div style={{ padding: '1rem', background: '#f0f0f0', margin: '1rem 0', borderRadius: '0.5rem' }}>
            <h3>Connection Status: {status}</h3>
            {userData ? (
                <div>
                    <p><strong>User:</strong> {userData.name}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                    <p><strong>Role:</strong> {userData.role}</p>
                    <p><strong>Color:</strong> {userData.preferredColor}</p>  {/*Trust me bro, this is the name*/}
                    <p><strong>Auth Status:</strong> Connected</p>

                </div>
            ) : (
                <p>Waiting for user data... (Try count: {retryCount + 1})</p>
            )}
        </div>
    );
}