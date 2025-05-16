// Communication bridge with parent application (EduPlatform)

// Define allowed parent origins (enhance security)
const ALLOWED_ORIGINS = [
    'https://www.ieduguide.com',
    'https://ieduguide.com',
    'https://eduguiders.com',
    'https://www.eduguiders.com',
    'http://localhost:5173',  // Local dev
    'http://127.0.0.1:5173'   // Also local dev
];

// Message types for type safety
export type MessageType =
    'INIT_DATA' |
    'USER_DATA' |
    'PREFERENCE_UPDATE' |
    'CONTENT_UPDATE' |
    'SAVE_CONTENT';

export class ParentBridge {
    private userData: any = null;
    private callbacks: Map<string, Set<(data: any) => void>> = new Map();
    private isReady = false;

    constructor() {
        this.setupMessageListener();
        this.sendReadyMessage();
    }

    private setupMessageListener() {
        if (typeof window !== 'undefined') {
            window.addEventListener('message', this.handleMessage);
        }
    }

    private handleMessage = (event: MessageEvent) => {
        console.log('Child received message from:', event.origin);

        // Security check - only accept messages from allowed origins
        if (!ALLOWED_ORIGINS.includes(event.origin)) {
            console.warn('Origin not allowed:', event.origin);
            return;
        }

        // Extract message data
        const { type, payload } = event.data || {};
        if (!type) return;

        console.log('Processing message type:', type, payload);

        // Process different message types
        switch (type) {
            case 'INIT_DATA':
                this.userData = payload;
                this.notifyCallbacks('initData', payload);
                this.notifyCallbacks('userData', payload.user);
                break;

            case 'PREFERENCE_UPDATE':
                this.notifyCallbacks('preferences', payload);
                break;

            case 'CONTENT_UPDATE':
                this.notifyCallbacks('contentUpdate', payload);
                break;
        }
    };

    private sendReadyMessage() {
        if (typeof window !== 'undefined' && window.parent !== window) {
            // Determine if we're in edit mode or view mode based on URL
            const url = new URL(window.location.href);
            const isViewMode = window.location.pathname.includes('post-csr');
            const editorMode = url.searchParams.get('mode') || 'new'; // Can be 'edit', 'new', etc.

            const readyMessage = {
                type: isViewMode ? 'VIEWER_READY' : 'EDITOR_READY',
                payload: {
                    url: window.location.href,
                    mode: isViewMode ? 'view' : editorMode
                }
            };

            console.log('Sending ready message to parent:', readyMessage);

            // Function to send the ready message
            const sendMessage = () => {
                window.parent.postMessage(readyMessage, '*');
                this.isReady = true;
            };

            // Send immediately and also after a delay to ensure it's received
            sendMessage();

            // Also send when document is fully loaded
            if (document.readyState === 'complete') {
                sendMessage();
            } else {
                window.addEventListener('load', sendMessage);
            }

            // Try again after a short delay
            setTimeout(sendMessage, 1000);
        }
    }

    on(event: string, callback: (data: any) => void) {
        console.log(`Registering callback for event: ${event}`);

        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, new Set());
        }

        this.callbacks.get(event)!.add(callback);

        // If we already have user data and this is a userData event,
        // immediately call the callback
        if (event === 'userData' && this.userData) {
            callback(this.userData.user);
        }

        // Return unsubscribe function
        return () => {
            const callbacks = this.callbacks.get(event);
            if (callbacks) {
                callbacks.delete(callback);
            }
        };
    }

    private notifyCallbacks(event: string, data: any) {
        const callbacks = this.callbacks.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} callback:`, error);
                }
            });
        }
    }

    sendToParent(type: MessageType, payload: any) {
        if (typeof window !== 'undefined' && window.parent !== window) {
            window.parent.postMessage({ type, payload }, '*');
        }
    }

    getUserData() {
        return this.userData;
    }

    isConnected() {
        return this.isReady;
    }

    cleanup() {
        if (typeof window !== 'undefined') {
            window.removeEventListener('message', this.handleMessage);
        }
        this.callbacks.clear();
    }
}

// Create and export singleton instance
export const parentBridge = (typeof window !== 'undefined')
    ? new ParentBridge()
    : null as any; // null for SSR, cast to any to avoid TS errors