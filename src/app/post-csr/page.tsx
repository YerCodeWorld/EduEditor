"use client";

import { useState, useEffect, useMemo } from "react";

import PostHeader from "../../components/shared/PostHeader";
import PostToc from "../../components/shared/PostToc";
import PostContent from "../../components/shared/PostContent";
import PostSharing from "../../components/shared/PostSharing";
import PostReadingProgress from "../../components/shared/PostReadingProgress";


import TiptapRenderer from "@/components/TiptapRenderer/ClientRenderer";

// Content to display
import { getPost } from "@/services/post";

export default function PostPage() {
  const [post, setPost] = useState<any>(null);

  const readingTime = useMemo(() => {
    const wpm = 150;
    return Math.ceil(post?.wordCount / wpm);
  }, [post]);

  useEffect(() => {
    getPost().then(setPost);
  }, []);

  if (!post) return null;

  return (  // #IDONTLIKETAILWIND
    <article className=" px-6 flex flex-col items-center ">

        {/*Our fancy progress line*/}
      <PostReadingProgress />

        {/*TITLE*/}
      <PostHeader
        title={post.title}
        author={post.author}
        createdAt={post.createdAt}
        readingTime={readingTime}
        cover={post.cover}
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
