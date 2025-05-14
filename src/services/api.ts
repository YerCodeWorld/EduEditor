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

    async loadPost(postId: string) {
        const response = await fetch(`${this.baseUrl}/posts/${postId}`, {
            headers: await this.getHeaders()
        });
        return response.json();
    }

    async savePosts(postData: any ) {
        const userData = parentBridge.getUserData();
        const payload = {
            ...postData,
            authorEmail: userData.user.email,
            published: false // Draft by default
        }

        const response = await fetch(`${this.baseUrl}/posts`, {
            method: 'POST',
            headers: await this.getHeaders(),
            body: JSON.stringify(payload)
        })
    }

    // skipping updatePost
    // getPosts?

}