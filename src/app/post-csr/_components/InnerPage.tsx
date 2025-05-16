"use client";

import { Suspense } from "react";
import { useState, useEffect, useMemo } from "react";

import PostHeader from "../../../components/shared/PostHeader";
import PostToc from "../../../components/shared/PostToc";
import PostContent from "../../../components/shared/PostContent";
import PostSharing from "../../../components/shared/PostSharing";
import PostReadingProgress from "../../../components/shared/PostReadingProgress";

import { useSearchParams } from "next/navigation";
import { parentBridge } from "@/services/parent-bridge";
import { editorAPI } from "@/services/api";

import TiptapRenderer from "@/components/TiptapRenderer/ClientRenderer";

import { getPost } from "@/services/post";  // example, do use database instead

export default function PostPage() {

    const [post, setPost] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
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
        // Listen for post data from parent
        parentBridge.on('initData', (data) => {
            if (data.post) {
                setPost(data.post);
                setIsLoading(false);
            }
        });

        // If we have a slug in URL, fetch the post
        if (slug) {
            loadPost(slug);
        }

        // Signal we're ready
        window.parent.postMessage({
            type: 'VIEWER_READY',
            payload: { message: 'Viewer is ready' }
        }, '*');

        if (post === null || post === undefined) {
            getPost().then(setPost);
        }

    }, [slug]);

    /**  We could use this as a fallback maybe?
     *     useEffect(() => {
     *     getPost().then(setPost);
     *     }, []);
     *
     */

    const loadPost = async (postSlug: string) => {
        try {
            setIsLoading(true);
            const response = await editorAPI.loadPostBySlug(postSlug);
            setPost(response.data);
        } catch (error) {
            console.error('Failed to load post:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {  // Please create a loading page in this app also
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (!post) {
        return <div className="flex justify-center items-center min-h-screen">Post Not Found</div>;
    }

    return (  // #IDONTLIKETAILWIND

        <article className=" px-6 flex flex-col items-center ">

            {/*Our fancy progress line*/}
            <PostReadingProgress />

            {/*TITLE*/}
            <PostHeader
                title={post.title}
                author={post.user?.name || post.authorEmail}
                createdAt={post.createdAt}
                readingTime={readingTime}
                cover={post.coverImage}
            />

            <div className="grid grid-cols-1 w-full lg:w-auto lg:grid-cols-[minmax(auto,256px)_minmax(720px,1fr)_minmax(auto,256px)] gap-6 lg:gap-8">

                {/*Social side bar*/}
                <PostSharing />

                <PostContent>
                    <TiptapRenderer>{post.content}</TiptapRenderer>
                </PostContent>

                {/*Table of contents*/}
                <PostToc />
            </div>

            {/*Removed original Doraemon image*/}
        </article>
    );
}
