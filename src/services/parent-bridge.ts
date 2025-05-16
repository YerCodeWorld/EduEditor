// Connection point with EduPlatform

const allowedOrigins = [
    'https://www.ieduguide.com',
    'https://ieduguide.com',
    'http://localhost:5173',
    'https://edu-text-phi.vercel.app'
];

export class ParentBridge {
    private userData: any = null;
    private callbacks: Map<string, (data: any) => void> = new Map();

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('message', this.handleMessage);
        }
    }

    private handleMessage = (event: MessageEvent) => {
        console.log('Received message from:', event.origin);
        console.log('Message data:', event.data);

        if (!allowedOrigins.includes(event.origin)) {
            console.log('Origin not allowed:', event.origin);
            return;
        }

        // CRUD
        const { type, payload } = event.data;
        console.log('Processing message type:', type);

        switch (type) {
            case 'INIT_DATA':
                console.log('Received INIT_DATA:', payload);
                this.userData = payload;
                this.callbacks.get('initData')?.(payload);
                break;
            case 'USER_DATA':
                this.userData = payload;
                this.callbacks.get('userData')?.(payload);
                break;
            case 'PREFERENCE_UPDATE':
                this.callbacks.get('preferences')?.(payload);
                break;
        }

    };

    on(event: string, callback: (data: any) => void) {
        console.log(`Setting callback for event: ${event}`);
        this.callbacks.set(event, callback);
        console.log('Current callbacks:', this.callbacks);
    }

    getUserData() {
        return this.userData;
    }
}

let parentBridge: ParentBridge;

if (typeof window !== 'undefined') {
    parentBridge = new ParentBridge();
}

export { parentBridge };