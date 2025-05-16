import { parentBridge } from "@/services/parent-bridge";

class EditorApi {
    // use env variables nigga
    private baseUrl = 'https://api.ieduguide.com/api';

    private async getHeaders() {
        const userData = parentBridge.getUserData();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData?.token}`
        };
    }

    async loadPostBySlug(postSlug: string) {
        try {
            const response = await fetch(`${this.baseUrl}/posts/slug/${postSlug}`, {
                headers: await this.getHeaders()
            });

            if (!response.ok) {
                console.error('Failed to fetch post');
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('Error loading post:', error);
            throw error;
        }
    }

    // Could add loading by author (email) method

    async savePosts(postData: any) {
        try {
            const userData = parentBridge.getUserData();
            const slug = postData.title.toLowerCase()  // I will never understand this regex witchery
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');

            const payload = {  // Make sure the useData is actually sending this in the implementation
                title: postData.title,
                slug: slug,
                summary: postData.summary || postData.title,
                content: postData.content, // HTML string from TipTap
                coverImage: postData.coverImage || null,
                featured: false,
                published: postData.published || false,
                authorEmail: userData.user.email
            }

            const response = await fetch(`${this.baseUrl}/posts`, {  // what up with this route? donesnt seem right
                method: 'POST',
                headers: await this.getHeaders(),
                body: JSON.stringify(payload)
            });

            if (!response.ok) console.error('Failed to save posts');
            const data = await response.json();
            return data;

        } catch (error) {
            console.error('Error saving post:', error);
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
                summary: postData.summary,
                content: postData.content, // HTML string
                coverImage: postData.coverImage,
                published: postData.published,
                featured: postData.featured || false
            };

            const response = await fetch(`${this.baseUrl}/posts/slug/${slug}`, {
                method: 'PUT',
                headers: await this.getHeaders(),
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to update post');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating post:', error);
            throw error;
        }
    }
    // getPosts?
}

export const editorAPI = new EditorApi();