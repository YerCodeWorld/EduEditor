"use client";

import useProgress from "@/hooks/useProgress";
import React from "react";

type colors = '#A47BB9' | "#E08D79" | "#5C9EAD" | "#D46BA3" | "#779ECB" | "#8859A3"

interface ReadingProgressProps {
  color: colors;
}

// changed to adapt its color dynamically. although i should just be building a global theme system
const PostReadingProgress: React.FC<ReadingProgressProps> = ({
    color = '#A47BB9',
                                                             }) => {

  const { progress, enable } = useProgress(".article-content");

  return enable ? (
    <div
      className={"fixed inset-x-0 h-5 bg-blue-400 dark:bg-blue-500 z-50"}
      style={{ width: `${progress}%`, background: color }}
    />
  ) : null;
};

export default PostReadingProgress;
