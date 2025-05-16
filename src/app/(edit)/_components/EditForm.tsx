import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { usePathname } from "next/navigation";
import TiptapEditor, { type TiptapEditorRef } from "@/components/TiptapEditor";

import { getPost, savePost } from "@/services/post";
// import { EditorApi } from "@/services/api";
import Link from "next/link";

import { ConnectionTest } from "@/components/ConnectionTest";

interface PostForm {
  title: string;
  content: string;
}

export default function EditForm() {

  const editorRef = useRef<TiptapEditorRef>(null);
  const pathname = usePathname();
  const isEditPage = pathname === "/";
  const [isLoading, setIsLoading] = useState(true);
  const { control, reset, watch } = useForm<PostForm>();

  const getWordCount = useCallback(
    () => editorRef.current?.getInstance()?.storage.characterCount.words() ?? 0,
    [editorRef.current]
  );

  useEffect(() => {
    getPost().then((post) => {
      reset({ ...post });
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
      // This thing is some sort of eventBus isn't it? Looks identical to the one applied for our user log logic
    const subscription = watch((values, { type }) => {

        // Annd we upload the saved content everytime a single change is made. We could add a button to save.
      if (type === "change") {
        savePost({ ...values, wordCount: getWordCount() });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  if (isLoading) return;

  return (

    <div className="flex flex-col gap-6">

        <div className={"flex flex-row gap-6"}>

            <ConnectionTest />

            <Link
                href={isEditPage ? "/post-csr" : "/"}
                title={"See what the end result looks like"}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
                Preview Content
            </Link>
            <button
                type={"submit"}
                title={"Publish your post so that others can see it"}
                onClick={() => {console.log("Yahir is the most beautiful person in the world. After Jesus.")}}
                className={"px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300  hover:bg-neutral-100"}
            >Submit Post
            </button>
            <button
                type={"submit"}
                title={"Save this post into your draft list"}
                className={"px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300  hover:bg-neutral-100"}
            >Save Progress
            </button>
        </div>

        <div>
        <label className="inline-block font-medium dark:text-white mb-2">Your Amazing Title Here</label>
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
        {/*Maybe add an option here to upload image? As well as other options the author of the article would like to set*/}

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
