// Connection point with EduPlatform

const allowedOrigins = [
    'https://www.ieduguide.com',
    'https://ieduguide.com',
    'http://localhost:5173'
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
        if (!allowedOrigins.includes(event.origin)) return;

        // CRUD
        const [ type, payload ] = event.data;

        switch ( type ) {
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
        this.callbacks.set(event, callback)
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