import React from 'react';

/**
 * Just a random unnecessary component, could develop into something bigger if need is found
 */

type modeType = 'error' | 'loading' | 'notFound'
const modesList = [
    'error',
    'loading',
    'notFound',
]

interface feebBackComponentProps {
    mode: modeType;
}

const FeedbackBlock: React.FC<feebBackComponentProps> = ({
                                                             mode = 'loading'
}) => {

    if (!modesList.includes(mode)) return;

    const loading = () => {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-pulse text-xl">Loading post content...</div>
            </div>
        )
    }

    const error = () => {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-500 text-xl">{'Error: Unspecified because I got this block outta the main component'}</div>
            </div>
        )
    }

    const notFound = () => {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">Post Not Found</div>
            </div>
        )
    }

    const sendType = (mode: 'error' | 'loading' | 'notFound') => {
        const modes_list = {
            'error': error,
            'loading': loading,
            'notFound': notFound
        }
        return modes_list[mode]();
    }

    return sendType(mode);
};

export default FeedbackBlock;