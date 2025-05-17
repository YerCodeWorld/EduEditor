"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import PostHeader from "@/components/shared/PostHeader";
import PostToc from "@/components/shared/PostToc";
import PostContent from "@/components/shared/PostContent";
import PostSharing from "@/components/shared/PostSharing";
import PostReadingProgress from "@/components/shared/PostReadingProgress";
import FeedbackBlock from "@/components/FeedbackBlock";
import TiptapRenderer from "@/components/TiptapRenderer/ClientRenderer";

import { parentBridge } from "@/services/parent-bridge";
import { editorAPI } from "@/services/api";

type colors = '#A47BB9' | "#E08D79" | "#5C9EAD" | "#D46BA3" | "#779ECB" | "#8859A3"

export const pageColorMap = {
    LAVENDER: "#A47BB9",
    CORAL: "#E08D79",
    TEAL: "#5C9EAD",
    WARMPINK: "#D46BA3",
    BLUE: "#779ECB",
    PURPLE: "#8859A3"
};

export function getHexFromPageColor(color: string): string {
    const entries = Object.entries(pageColorMap);
    for (const [key, value] of entries) {
        if (key === color) {
            console.log(key, value);
            return value;
        }
    }
    return "#A47BB9"; // Default
}

export default function PostPage() {

    const [post, setPost] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [color, setColor] = useState<colors>('#E08D79');

    const searchParams = useSearchParams();
    const slug = searchParams.get('slug');

    const readingTime = useMemo(() => {
        if (!post?.content) return 0;
        // Simple word count from HTML content
        const text = post.content.replace(/<[^>]*>/g, '');
        const wordCount = text.split(/\s+/).length;
        return Math.ceil(wordCount / 150);
    }, [post]);

    useEffect(() => {

        const unsubscribe = parentBridge.on('userData', (data: any) => {
            if (data.preferredColor) {
                const color = data.preferredColor;
                setColor(getHexFromPageColor(color) as '#A47BB9' | "#E08D79" | "#5C9EAD" | "#D46BA3" | "#779ECB" | "#8859A3");
            }
        });

        async function loadContent() {
            try {
                setIsLoading(true);

                if (slug) {
                    await loadPostBySlug(slug);
                }

                window.parent.postMessage({
                    type: 'VIEWER_READY',
                    payload: { slug }
                }, '*');

            } catch (error) {
                console.error('Error in loadContent:', error);
                setError('Failed to load post content');
                setIsLoading(false);
            }
        }

        loadContent().then((message) => {console.log('Done')} );

        return () => {
            unsubscribe();
        };

    }, [slug]);

    async function loadPostBySlug(postSlug: string) {
        try {
            const response = await editorAPI.loadPostBySlug(postSlug);
            if (response.data) {
                setPost(response.data);
            } else {
                setError('Post not found');
            }
        } catch (err) {
            setError('Failed to load post');
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return (
            <FeedbackBlock mode='loading'/>
        );
    }

    if (error) {
        return (
            <FeedbackBlock mode='error'/>
        );
    }

    if (!post) {
        return (
            <FeedbackBlock mode='notFound'/>
        );
    }

    return (
        <article className="px-6 flex flex-col items-center">

            <PostReadingProgress color={color}/>

            <PostHeader
                title={post.title}
                author={post.user?.name || post.authorEmail || 'Unknown Author'}
                createdAt={post.createdAt || new Date().toISOString()}
                readingTime={readingTime}
                cover={post.coverImage || 'https://res.cloudinary.com/dmhzdv5kf/image/upload/v1733364957/shk91N6yUj_zkms92.jpg'}
            />

            <div className="grid grid-cols-1 w-full lg:w-auto lg:grid-cols-[minmax(auto,256px)_minmax(720px,1fr)_minmax(auto,256px)] gap-6 lg:gap-8">
                <PostSharing />

                <PostContent>
                    <TiptapRenderer>{post.content}</TiptapRenderer>
                </PostContent>

                <PostToc />
            </div>
        </article>
    );
}