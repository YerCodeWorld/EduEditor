// src/services/parent-bridge.ts - Add height reporting functionality

// Modified ParentBridge class with height reporting
export class ParentBridge {
    private userData: any = null;
    private callbacks: Map<string, Set<(data: any) => void>> = new Map();
    private isReady = false;
    private resizeObserver: ResizeObserver | null = null;
    private contentElement: HTMLElement | null = null;

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
        // Security check - only accept messages from allowed origins
        if (!this.isOriginAllowed(event.origin)) {
            console.warn('Origin not allowed:', event.origin);
            return;
        }

        const { type, payload } = event.data || {};
        if (!type) return;

        console.log('Child received message:', type);

        // Process different message types
        switch (type) {
            case 'INIT_DATA':
                this.userData = payload;
                this.notifyCallbacks('initData', payload);
                this.notifyCallbacks('userData', payload.user);
                break;

                // Preference update handling removed to simplify integration
                break;

            case 'CONTENT_UPDATE':
                this.notifyCallbacks('contentUpdate', payload);
                break;

            case 'REQUEST_CONTENT_HEIGHT':
                this.reportContentHeight();
                break;
        }
    };

    private isOriginAllowed(origin: string): boolean {
        // Define allowed parent origins
        const ALLOWED_ORIGINS = [
            'https://www.ieduguide.com',
            'https://ieduguide.com',
            'https://eduguiders.com',
            'https://www.eduguiders.com',
            'http://localhost:5173',  // Local dev
            'http://127.0.0.1:5173'   // Also local dev
        ];

        return ALLOWED_ORIGINS.includes(origin);
    }

    private sendReadyMessage() {
        if (typeof window !== 'undefined' && window.parent !== window) {
            // Determine if we're in edit mode or view mode based on URL
            const url = new URL(window.location.href);
            const isViewMode = window.location.pathname.includes('post-csr');
            const editorMode = url.searchParams.get('mode') || 'new';

            const readyMessage = {
                type: isViewMode ? 'VIEWER_READY' : 'EDITOR_READY',
                payload: {
                    url: window.location.href,
                    mode: isViewMode ? 'view' : editorMode
                }
            };

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

    // Set up content height reporting
    setupHeightReporting(contentSelector: string) {
        if (typeof window === 'undefined' || !window.ResizeObserver) return;

        this.contentElement = document.querySelector(contentSelector);
        if (!this.contentElement) {
            console.warn(`Element not found: ${contentSelector}`);
            return;
        }

        // Initialize ResizeObserver to monitor content size changes
        this.resizeObserver = new ResizeObserver(this.reportContentHeight);
        this.resizeObserver.observe(this.contentElement);

        // Also send height on load and any time DOM changes
        window.addEventListener('load', this.reportContentHeight);
        document.addEventListener('DOMContentLoaded', this.reportContentHeight);

        // Initial report
        setTimeout(this.reportContentHeight, 500);
    }

    private reportContentHeight = () => {
        if (!this.contentElement) {
            // If no specific element is being monitored, report document height
            const height = Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.offsetHeight
            );

            this.sendToParent('RESIZE_IFRAME', { height });
            return;
        }

        // Get height of monitored element
        const height = this.contentElement.scrollHeight;
        this.sendToParent('RESIZE_IFRAME', { height });
    }

    on(event: string, callback: (data: any) => void) {
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

    sendToParent(type: string, payload: any) {
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
            window.removeEventListener('load', this.reportContentHeight);
            document.removeEventListener('DOMContentLoaded', this.reportContentHeight);

            if (this.resizeObserver && this.contentElement) {
                this.resizeObserver.unobserve(this.contentElement);
                this.resizeObserver.disconnect();
            }
        }

        this.callbacks.clear();
    }
}

// Create and export singleton instance
export const parentBridge = (typeof window !== 'undefined')
    ? new ParentBridge()
    : null as any; // null for SSR, cast to any to avoid TS errors