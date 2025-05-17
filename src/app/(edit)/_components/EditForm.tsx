// src/app/(edit)/_components/EditForm.tsx - Update save functionality

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import TiptapEditor, { type TiptapEditorRef } from "@/components/TiptapEditor";
import { savePost } from "@/services/post"; // Local storage fallback
import { parentBridge } from "@/services/parent-bridge";
import { editorAPI } from "@/services/api";
import { ConnectionTest } from "@/components/ConnectionTest";

interface PostForm {
    title: string;
    content: string;
    published?: boolean;
    coverImage?: string;
}

export default function EditForm() {
    const editorRef = useRef<TiptapEditorRef>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<{
        message: string;
        type: 'success' | 'error' | 'info' | null;
    }>({ message: '', type: null });
    const [editorMode, setEditorMode] = useState<'new' | 'edit' | 'view'>('new');
    const [postData, setPostData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const { control, reset, watch, handleSubmit, formState } = useForm<PostForm>();
    const formValues = watch();

    const getWordCount = useCallback(
        () => editorRef.current?.getInstance()?.storage.characterCount.words() ?? 0,
        [editorRef.current]
    );

    // Function to fetch post data by slug
    const fetchPostData = async (slug: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await editorAPI.loadPostBySlug(slug);

            if (response.data) {
                console.log('Post data loaded successfully');
                setPostData(response.data);
                reset({
                    title: response.data.title || '',
                    content: response.data.content || '',
                    published: response.data.published,
                    coverImage: response.data.coverImage
                });
            } else if (response.error) {
                setError(`Failed to load post: ${response.error.message}`);
            } else {
                setError('Failed to load post data');
            }
        } catch (err) {
            setError('Error loading post data');
            console.error('Error loading post:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form submission (manual save)
    const onSubmit = async (data: PostForm) => {
        try {
            setIsSaving(true);
            setSaveStatus({ message: 'Saving...', type: 'info' });

            // Add word count to the data
            const submissionData = {
                ...postData, // Include any existing data like ID
                ...data,
                wordCount: getWordCount()
            };

            console.log('Submitting data:', { ...submissionData, content: '(content truncated)' });

            let response;
            if (editorMode === 'edit' && postData?.slug) {
                // Update using the slug endpoint
                response = await editorAPI.updatePost(postData.slug, submissionData);
            } else {
                // Create new post
                response = await editorAPI.savePost(submissionData);
            }

            console.log('API response:', response);

            if (response.error) {
                setSaveStatus({
                    message: `Save failed: ${response.error.message}`,
                    type: 'error'
                });
            } else {
                // Update local data with server response
                if (response.data) {
                    setPostData(response.data);

                    // If this was a new post that's now saved, switch to edit mode
                    if (editorMode === 'new') {
                        setEditorMode('edit');
                        // Update URL to reflect the edit mode without page reload
                        const newUrl = `${window.location.pathname}?mode=edit&slug=${response.data.slug}`;
                        window.history.pushState({ path: newUrl }, '', newUrl);
                    }
                }

                // Also save to local storage as fallback
                savePost({
                    ...data,
                    wordCount: getWordCount()
                });

                setSaveStatus({ message: 'Saved successfully', type: 'success' });
            }
        } catch (err) {
            console.error('Error saving post:', err);
            setSaveStatus({
                message: 'Save failed: ' + (err instanceof Error ? err.message : 'Unknown error'),
                type: 'error'
            });

            // Fallback to local storage save
            savePost({
                ...formValues,
                wordCount: getWordCount(),
            });
            setSaveStatus({
                message: 'Saved locally only (API unavailable)',
                type: 'info'
            });
        } finally {
            setIsSaving(false);

            // Clear success status after a delay
            if (saveStatus.type === 'success') {
                setTimeout(() => {
                    setSaveStatus({ message: '', type: null });
                }, 3000);
            }
        }
    };

    // Auto-save functionality
    useEffect(() => {
        // Debounce to avoid too frequent saves
        const autoSaveTimeout = setTimeout(async () => {
            if (!isLoading && formValues.title && formValues.content) {
                try {
                    // Don't show status for auto-saves to avoid distracting the user
                    // But still save in the background
                    const autoSaveData = {
                        ...postData,
                        ...formValues,
                        wordCount: getWordCount()
                    };

                    // Save to API
                    let apiResult = false;
                    if (editorMode === 'edit' && postData?.slug) {
                        // Update existing post using the slug
                        const result = await editorAPI.updatePost(postData.slug, autoSaveData);
                        apiResult = !result.error;
                    } else if (formValues.title.length > 5) {
                        // Only auto-save new posts with substantial titles
                        const result = await editorAPI.savePost(autoSaveData);
                        apiResult = !result.error;

                        // If new post was saved successfully via API, update to edit mode
                        if (apiResult && result.data && editorMode === 'new') {
                            console.log('Auto-save created new post, updating to edit mode');
                            setPostData(result.data);
                            setEditorMode('edit');

                            // Update URL if we have a slug
                            if (result.data.slug) {
                                const newUrl = `${window.location.pathname}?mode=edit&slug=${result.data.slug}`;
                                window.history.pushState({ path: newUrl }, '', newUrl);
                            }
                        }
                    }

                    if (!apiResult) {
                        console.log('API auto-save failed, using local storage fallback');
                    }

                    // Always save to local storage as fallback
                    savePost({
                        ...formValues,
                        wordCount: getWordCount(),
                    });
                } catch (err) {
                    console.error('Auto-save error:', err);

                    // Save to local storage on error
                    savePost({
                        ...formValues,
                        wordCount: getWordCount(),
                    });
                }
            }
        }, 5000); // 5 second debounce

        return () => clearTimeout(autoSaveTimeout);
    }, [formValues, postData, isLoading, editorMode, getWordCount]);

    // Initialize based on URL parameters
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

        // Listen for messages from parent
        const handleInitData = (data: any) => {
            console.log('Received init data in EditForm:', data);

            if (data.mode === 'edit' && data.post) {
                console.log('Setting editor to edit mode with post from parent data:', data.post);
                setEditorMode('edit');
                setPostData(data.post);
                reset({
                    title: data.post.title || '',
                    content: data.post.content || '',
                    published: data.post.published,
                    coverImage: data.post.coverImage
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
                console.log("Fallback: Still loading after timeout");

                if (urlMode === 'edit' && urlSlug) {
                    // Try one more time to fetch directly
                    console.log("Fallback: Attempting direct fetch one more time");
                    fetchPostData(urlSlug);
                } else {
                    // Just end loading state
                    setIsLoading(false);
                }
            }
        }, 3000);

        return () => {
            clearTimeout(fallbackTimer);
        };
    }, []); // Empty dependency array to run only once

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
        <div className="editor-container flex flex-col gap-6">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-row gap-4 items-center mb-4">
                    <div className="px-4 py-2 bg-blue-100 rounded">
                        Editor Mode: {editorMode}
                    </div>

                    {editorMode === 'edit' && (
                        <div className="px-4 py-2 bg-green-100 rounded">
                            Editing: {postData?.title || 'Unknown post'}
                        </div>
                    )}

                    {saveStatus.message && (
                        <div className={`px-4 py-2 rounded ${
                            saveStatus.type === 'success' ? 'bg-green-100' :
                                saveStatus.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                            {saveStatus.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSaving || !formState.isDirty}
                        className={`ml-auto px-4 py-2 rounded ${
                            isSaving
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>

                <div className="mb-4">
                    <label className="inline-block font-medium dark:text-white mb-2">Your Amazing Title Here</label>
                    <Controller
                        control={control}
                        name="title"
                        rules={{ required: "Title is required" }}
                        render={({ field, fieldState }) => (
                            <div>
                                <input
                                    {...field}
                                    type="text"
                                    className={`w-full px-4 py-2.5 shadow border ${
                                        fieldState.error ? 'border-red-500' : 'border-[#d1d9e0]'
                                    } rounded-md bg-white dark:bg-[#0d1017] dark:text-white dark:border-[#3d444d] outline-none`}
                                    placeholder="Enter post title..."
                                />
                                {fieldState.error && (
                                    <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                                )}
                            </div>
                        )}
                    />
                </div>

                <div className="mb-4">
                    <label className="inline-block font-medium dark:text-white mb-2">Write A Summary</label>

                    <textarea

                        className={`w-full h-32 shadow border ${
                            'border-[#d1d9e0]'
                        } rounded-md bg-white dark:bg-[#0d1017] dark:text-white dark:border-[#3d444d] outline-none`}
                        placeholder="Write your summary..."
                    />
                </div>

                <div className="mt-4">
                    <Controller
                        control={control}
                        name="published"
                        render={({ field }) => (
                            <label className="flex items-center gap-2 cursor-pointer m-2">
                                <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={(e) => field.onChange(e.target.checked)}
                                    className="h-4 w-4"
                                />
                                <span className="dark:text-white">Publish this post</span>
                            </label>
                        )}
                    />
                </div>

                <div>
                    <label className="inline-block font-medium dark:text-white mb-2">Content</label>
                    <Controller
                        control={control}
                        name="content"
                        rules={{ required: "Content is required" }}
                        render={({ field, fieldState }) => (
                            <div>
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
                                {fieldState.error && (
                                    <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                                )}
                            </div>
                        )}
                    />
                </div>

            </form>
        </div>
    );
}