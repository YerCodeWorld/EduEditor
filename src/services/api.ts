import { parentBridge } from "@/services/parent-bridge";

class EditorApi {
    // use env variables nigga
    private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.ieduguide.com/api';

    private async getHeaders() {
        const userData = parentBridge.getUserData();
        const token = userData?.token || '';

        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    async loadPostBySlug(postSlug: string) {
        try {
            const userData = parentBridge.getUserData();
            if (userData?.post?.slug === postSlug) {
                return { data: userData.post };
            }

            const response = await fetch(`${this.baseUrl}/posts/slug/${postSlug}`, {
                headers: await this.getHeaders()
            });

            if (!response.ok) {
                console.error(`HTTP error ${response.status}: ${response.statusText}`);
                return;
            }

            const data = await response.json();
            console.log('Fetched post data:', data);
            return data;

        } catch (error) {
            console.error('Error loading post:', error);
            throw error;
        }
    }

    async savePost(postData: any) {
        try {
            const userData = parentBridge.getUserData();
            if (!userData?.user?.email) {
                console.error('User is not authenticated');
                return;
            }

            const slug = postData.title.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');

            const payload = {
                title: postData.title,
                slug: slug,
                summary: postData.summary || postData.title,
                content: postData.content,
                coverImage: postData.coverImage || null,
                featured: postData.featured || false,
                published: postData.published || false,
                authorEmail: userData.user.email
            };

            console.log('Saving post data:', payload);

            // Also notify parent app
            parentBridge.sendToParent('SAVE_CONTENT', payload);

            const isUpdate = postData.id || (userData.post?.id);
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
                throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Save response:', data);
            return data;

        } catch (error) {
            console.error('Error saving post:', error);
            throw error;
        }
    }

    async updatePost(slug: string, postData: any) {
        try {
            const updatedSlug = postData.title.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');

            const payload = {
                title: postData.title,
                slug: updatedSlug,
                summary: postData.summary || postData.title,
                content: postData.content,
                coverImage: postData.coverImage || null,
                published: postData.published || false,
                featured: postData.featured || false
            };

            console.log(`Updating post with slug: ${slug}`, payload);

            // Notify parent app
            parentBridge.sendToParent('CONTENT_UPDATE', payload);

            const response = await fetch(`${this.baseUrl}/posts/slug/${slug}`, {
                method: 'PUT',
                headers: await this.getHeaders(),
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Update response:', data);
            return data;
        } catch (error) {
            console.error('Error updating post:', error);
            throw error;
        }
    }

}

export const editorAPI = new EditorApi();