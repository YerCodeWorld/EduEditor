// src/services/api.ts - Enhanced API service

import { parentBridge } from "@/services/parent-bridge";

class EditorApi {
    private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.ieduguide.com/api';
    private authToken: string | null = null;

    constructor() {
        // Try to get token from parent bridge
        const userData = parentBridge?.getUserData();
        if (userData?.token) {
            this.authToken = userData.token;
        }

        // Listen for auth changes
        parentBridge?.on('userData', (data: any) => {
            if (data?.token) {
                this.authToken = data.token;
            }
        });

        // Listen for init data which might contain token
        parentBridge?.on('initData', (data: any) => {
            if (data?.token) {
                this.authToken = data.token;
            }
        });
    }

    private async getHeaders() {
        // Use token from constructor or from localStorage as fallback
        const token = this.authToken ||
            (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);

        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    async loadPostBySlug(postSlug: string) {
        try {
            // First check if we already have this post from parent app
            const userData = parentBridge?.getUserData();
            if (userData?.post?.slug === postSlug) {
                return { data: userData.post, status: 200 };
            }

            const response = await fetch(`${this.baseUrl}/posts/slug/${postSlug}`, {
                headers: await this.getHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error(`HTTP error ${response.status}: ${response.statusText}`, errorData);
                return {
                    error: errorData || { message: `Failed to load post (${response.status})` },
                    status: response.status
                };
            }

            const data = await response.json();
            return { data: data.data || data, status: response.status };

        } catch (error) {
            console.error('Error loading post:', error);
            return {
                error: { message: error instanceof Error ? error.message : 'Unknown error loading post' },
                status: 500
            };
        }
    }

    async savePost(postData: any) {
        try {
            // Get user info from parent bridge or from post data
            const userData = parentBridge?.getUserData();
            const authorEmail = userData?.user?.email || postData.authorEmail;

            if (!authorEmail) {
                console.error('User email not available');
                return {
                    error: { message: 'User authentication required' },
                    status: 401
                };
            }

            // Create slug from title
            const slug = postData.title.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();

            const payload = {
                title: postData.title,
                slug: slug,
                summary: postData.summary || postData.title.substring(0, 120),
                content: postData.content,
                coverImage: postData.coverImage || null,
                featured: postData.featured || false,
                published: postData.published || false,
                authorEmail: authorEmail
            };

            console.log('Saving post data:', { ...payload, content: '(content truncated)' });

            // Also notify parent app
            parentBridge?.sendToParent('SAVE_CONTENT', payload);

            // Determine if this is an update or a new post
            const isUpdate = postData.id || (userData?.post?.id);
            const url = isUpdate
                ? `${this.baseUrl}/posts/${isUpdate}`
                : `${this.baseUrl}/posts`;

            const method = isUpdate ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: await this.getHeaders(),
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `HTTP error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return { data: data.data || data, status: response.status };

        } catch (error) {
            console.error('Error saving post:', error);
            return {
                error: { message: error instanceof Error ? error.message : 'Unknown error saving post' },
                status: 500
            };
        }
    }

    async updatePost(slug: string, postData: any) {
        try {
            if (!slug) {
                return {
                    error: { message: 'Slug is required for updating a post' },
                    status: 400
                };
            }

            // Generate the new slug but DON'T include it in the payload
            // This is because your API is already finding the post by the URL slug
            // and including it in the payload might cause confusion
            const updatedSlug = postData.title.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();

            // Make sure ALL fields are explicitly included to prevent undefined values
            const payload = {
                title: postData.title || '',
                summary: postData.summary || postData.title?.substring(0, 120) || '',
                content: postData.content || '',
                coverImage: postData.coverImage || null,
                published: !!postData.published, // Convert to boolean
                featured: !!postData.featured    // Convert to boolean
            };

            console.log(`Updating post with slug: ${updatedSlug}`, {
                ...payload,
                content: payload.content.substring(0, 100) + '...' // Log truncated content
            });

            // Notify parent app
            parentBridge?.sendToParent('CONTENT_UPDATE', payload);

            // Your API endpoint is now correctly defined as /posts/:slug
            const updateEndpoint = `${this.baseUrl}/posts/${slug}`;
            console.log(`Using update endpoint: ${updateEndpoint}`);

            const response = await fetch(updateEndpoint, {
                method: 'PUT',
                headers: await this.getHeaders(),
                body: JSON.stringify(payload),
                // Add credentials to ensure cookies are sent if needed
                credentials: 'include'
            });

            // Log the raw response for debugging
            console.log(`Update response status: ${response.status}`);

            if (!response.ok) {
                let errorMessage;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData?.message || `HTTP error ${response.status}`;
                    console.error('Error response body:', errorData);
                } catch (parseError) {
                    errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
                    console.error('Could not parse error response:', parseError);
                }
                throw new Error(errorMessage);
            }

            let data;
            try {
                data = await response.json();
                console.log('Update successful, response data:', data);
            } catch (parseError) {
                console.error('Error parsing response JSON:', parseError);
                throw new Error('Invalid response format from server');
            }

            return { data: data.data || data, status: response.status };
        } catch (error) {
            console.error('Error updating post:', error);
            return {
                error: { message: error instanceof Error ? error.message : 'Unknown error updating post' },
                status: 500
            };
        }
    }
}

export const editorAPI = new EditorApi();