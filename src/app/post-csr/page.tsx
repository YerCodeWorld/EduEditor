"use client";
import { Suspense } from "react";
import PostPageInner from "./_components/InnerPage"; // We'll create this in a second

export default function PostPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading post...</div>}>
            <PostPageInner />
        </Suspense>
    );
}
