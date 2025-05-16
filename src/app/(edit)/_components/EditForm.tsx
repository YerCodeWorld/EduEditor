// src/app/(edit)/_components/EditForm.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import TiptapEditor, { type TiptapEditorRef } from "@/components/TiptapEditor";
import { getPost, savePost } from "@/services/post";
import { parentBridge } from "@/services/parent-bridge";
import { editorAPI } from "@/services/api"; // Import the API service
import { ConnectionTest } from "@/components/ConnectionTest";

interface PostForm {
    title: string;
    content: string;
    // Add other fields as needed
}

export default function EditForm() {
    const editorRef = useRef<TiptapEditorRef>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editorMode, setEditorMode] = useState<'new' | 'edit' | 'view'>('new');
    const [postData, setPostData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const { control, reset, watch } = useForm<PostForm>();

    const getWordCount = useCallback(
        () => editorRef.current?.getInstance()?.storage.characterCount.words() ?? 0,
        [editorRef.current]
    );

    // Function to fetch post data by slug
    const fetchPostData = async (slug: string) => {
        try {
            setIsLoading(true);

            const response = await editorAPI.loadPostBySlug(slug);

            if (response.data) {
                console.log('Post data loaded successfully:', response.data);
                setPostData(response.data);
                reset({
                    title: response.data.title || '',
                    content: response.data.content || ''
                });
            } else {
                setError('Failed to load post data');
            }
        } catch (err) {
            setError('Error loading post data');
        } finally {
            setIsLoading(false);
        }
    };

    // Use this effect to handle URL parameters and set initial state
    useEffect(() => {
        console.log("EditForm initializing...");

        // Check URL for mode and slug parameters
        const urlParams = new URLSearchParams(window.location.search);
        const urlMode = urlParams.get('mode');
        const urlSlug = urlParams.get('slug');

        console.log(`URL params: mode=${urlMode}, slug=${urlSlug}`);

        if (urlMode === 'edit' && urlSlug) {
            console.log(`Setting editor mode to edit for slug: ${urlSlug}`);
            setEditorMode('edit');

            // Fetch the post data directly using the slug
            fetchPostData(urlSlug);
        } else if (urlMode === 'new') {
            console.log('New post mode, no fetch needed');
            setEditorMode('new');
            reset({ title: '', content: '' });
            setIsLoading(false);
        }

        // Listen for messages from parent (this should run only once)
        const handleInitData = (data: any) => {
            console.log('Received init data in EditForm:', data);

            if (data.mode === 'edit' && data.post) {
                console.log('Setting editor to edit mode with post from parent data:', data.post);
                setEditorMode('edit');
                setPostData(data.post);
                reset({
                    title: data.post.title || '',
                    content: data.post.content || ''
                });
                setIsLoading(false);
            } else if (data.mode === 'edit' && data.post === null && urlSlug) {
                // If we have a slug but no post data from parent, fetch it directly
                console.log('No post data in parent message, fetching directly');
                fetchPostData(urlSlug);
            } else if (data.mode === 'new') {
                console.log('Setting editor to new mode from parent data');
                setEditorMode('new');
                reset({ title: '', content: '' });
                setIsLoading(false);
            } else {
                // Default case - make sure we exit loading state
                console.log('Unknown mode or missing post data, using defaults');
                setIsLoading(false);
            }
        };

        // Register listener for parent bridge
        if (parentBridge) {
            parentBridge.on('initData', handleInitData);
        }

        // Fallback - load mock data if we don't get data from parent in 3 seconds
        const fallbackTimer = setTimeout(() => {
            if (isLoading) {
                console.log("Fallback: Still loading after timeout, using default content");

                if (urlMode === 'edit' && urlSlug) {
                    // Try one more time to fetch directly
                    console.log("Fallback: Attempting direct fetch one more time");
                    fetchPostData(urlSlug);
                } else {
                    // Just use mock data for new posts
                    getPost().then((post) => {
                        reset({ ...post });
                        setIsLoading(false);
                    });
                }
            }
        }, 3000);

        return () => {
            // Clean up
            clearTimeout(fallbackTimer);
        };
    }, []); // Empty dependency array to run only once

    useEffect(() => {
        // Only set up the watch effect when we have the form data loaded
        if (!isLoading) {
            const subscription = watch((values, { type }) => {
                if (type === "change") {
                    savePost({
                        ...values,
                        wordCount: getWordCount(),
                        ...(postData?.id && { id: postData.id })
                    });
                }
            });

            return () => subscription.unsubscribe();
        }
    }, [watch, postData, isLoading]);

    if (isLoading) {
        return (
            <div className="loading-container" style={{ textAlign: 'center', padding: '50px' }}>
                <p>Loading editor...</p>
                <div className="spinner" style={{
                    width: '40px',
                    height: '40px',
                    margin: '20px auto',
                    border: '4px solid rgba(0, 0, 0, 0.1)',
                    borderLeft: '4px solid #3498db',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container" style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
                <p>Error: {error}</p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="px-4 py-2 mt-4 bg-red-100 rounded"
                >
                    Return to Home
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-row gap-6 items-center">
                <ConnectionTest />

                <div className="px-4 py-2 bg-blue-100 rounded">
                    Editor Mode: {editorMode}
                </div>

                {editorMode === 'edit' && (
                    <div className="px-4 py-2 bg-green-100 rounded">
                        Editing: {postData?.title || 'Unknown post'}
                    </div>
                )}

                <button
                    onClick={() => {
                        console.log('Debug button clicked');
                        console.log('Current state:', {
                            isLoading,
                            editorMode,
                            postData,
                            urlParams: new URLSearchParams(window.location.search).toString()
                        });

                        // Force fetch if in edit mode with slug
                        const urlSlug = new URLSearchParams(window.location.search).get('slug');
                        if (editorMode === 'edit' && urlSlug && !postData) {
                            console.log('Forcing fetch for slug:', urlSlug);
                            fetchPostData(urlSlug);
                        }
                    }}
                    className="px-4 py-2 bg-gray-200 rounded"
                >
                    Debug
                </button>
            </div>

            <div>
                <label className="inline-block font-medium dark:text-white mb-2">Post Title</label>
                <Controller
                    control={control}
                    name="title"
                    render={({ field }) => (
                        <input
                            {...field}
                            type="text"
                            className="w-full px-4 py-2.5 shadow border border-[#d1d9e0] rounded-md bg-white dark:bg-[#0d1017] dark:text-white dark:border-[#3d444d] outline-none"
                            placeholder="Enter post title..."
                        />
                    )}
                />
            </div>

            <div>
                <label className="inline-block font-medium dark:text-white mb-2">Content</label>
                <Controller
                    control={control}
                    name="content"
                    render={({ field }) => (
                        <TiptapEditor
                            ref={editorRef}
                            ssr={true}
                            output="html"
                            placeholder={{
                                paragraph: "Type your content here...",
                                imageCaption: "Type caption for image (optional)",
                            }}
                            contentMinHeight={256}
                            contentMaxHeight={640}
                            onContentChange={field.onChange}
                            initialContent={field.value}
                        />
                    )}
                />
            </div>
        </div>
    );
}