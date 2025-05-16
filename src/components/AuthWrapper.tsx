// In EduEditor: src/components/AuthWrapper.tsx
import React, { useEffect, useState } from 'react';
import { parentBridge } from '@/services/parent-bridge';

interface AuthWrapperProps {
    children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Listen for user data from parent
        parentBridge.on('userData', (data: any) => {
            setIsAuthenticated(data.isAuthenticated);
            setIsLoading(false);

            // Update styles based on user preferences
            if (data.user?.preferredColor) {

                console.log('We got the preferred color from the child app! It is: ', data.user.preferredColor);
                // skipping for the moment
                // Apply color theme
                /**
                 *                 const colorMap = {
                 *                     LAVENDER: '#A47BB9',
                 *                     CORAL: '#E08D79',
                 *                     WARMPINK: "#D46BA3",
                 *                     BLUE: "#779ECB",
                 *                     PURPLE: "#8859A3"
                 *                     // ... rest of colors
                 *                 };
                 *                 document.documentElement.style.setProperty('--primary', colorMap[data.user.preferredColor]);
                 */
            }
        });

        // Listen for preference updates
        parentBridge.on('preferences', (data: any) => {
            // Update color theme dynamically
            if (data.preferredColor) {
                // Update CSS variables
            }
        });
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <div>Please log in to use the editor</div>;
    }

    return <>{children}</>;
}