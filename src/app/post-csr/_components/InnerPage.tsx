"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import PostHeader from "@/components/shared/PostHeader";
import PostToc from "@/components/shared/PostToc";
import PostContent from "@/components/shared/PostContent";
import PostSharing from "@/components/shared/PostSharing";
import PostReadingProgress from "@/components/shared/PostReadingProgress";
import TiptapRenderer from "@/components/TiptapRenderer/ClientRenderer";

import { parentBridge } from "@/services/parent-bridge";
import { editorAPI } from "@/services/api";
import { getPost } from "@/services/post";  // Fallback mock data

export default function PostPage() {

    const [post, setPost] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

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
        async function loadContent() {
            try {
                setIsLoading(true);

                // First check for post data from parent iframe communication
                const handleInitData = (data: any) => {
                    if (data?.post) {
                        console.log('Setting post from parent data', data.post);
                        setPost(data.post);
                        setIsLoading(false);
                    } else if (slug) {
                        // If no post in parent data but we have slug, fetch it from API
                        loadPostBySlug(slug);
                    } else {
                        const post = 'POST NOT FOUND';
                        setPost(post);
                        setIsLoading(false);
                    }
                };

                // Register listener for parent data
                const unsubscribe = parentBridge.on('initData', handleInitData);

                // If we already have a slug in the URL, try loading the post
                if (slug) {
                    await loadPostBySlug(slug);
                }

                // Signal to parent we're ready to receive data
                window.parent.postMessage({
                    type: 'VIEWER_READY',
                    payload: { slug }
                }, '*');

                return () => {
                    unsubscribe();
                };
            } catch (error) {
                console.error('Error in loadContent:', error);
                setError('Failed to load post content');
                setIsLoading(false);
            }
        }

        loadContent().then((message) => {console.log('Done')} );
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
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-pulse text-xl">Loading post content...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-500 text-xl">{error}</div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">Post Not Found</div>
            </div>
        );
    }

    return (
        <article className="px-6 flex flex-col items-center">
            <PostReadingProgress />

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