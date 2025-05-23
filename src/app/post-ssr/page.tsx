import PostHeader from "../../components/shared/PostHeader";
import PostToc from "../../components/shared/PostToc";
import PostContent from "../../components/shared/PostContent";
import PostSharing from "../../components/shared/PostSharing";
import PostReadingProgress from "../../components/shared/PostReadingProgress";
import TiptapRenderer from "@/components/TiptapRenderer/ServerRenderer";

// Content to display
import { getPost } from "@/services/post";
import { notFound } from "next/navigation";  // Needed as we are going to do a request

export default async function PostPage() {
  const post = await getPost();

  if (!post) return notFound();

  const readingTime = Math.ceil(post.wordCount / 150);

  return (  // #IDONTLIKETAILWIND
    <article className="py-10 px-6 flex flex-col items-center ">

        {/*Our fancy progress line*/}
      <PostReadingProgress color={'#A47BB9'}/>

        {/*TITLE*/}
      <PostHeader
        title={post.title}
        author={post.author}
        createdAt={post.createdAt}
        readingTime={readingTime}
        cover={post.cover}
      />

      <div className="grid grid-cols-1 w-full lg:w-auto lg:grid-cols-[minmax(auto,256px)_minmax(720px,1fr)_minmax(auto,256px)] gap-6 lg:gap-12">

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
