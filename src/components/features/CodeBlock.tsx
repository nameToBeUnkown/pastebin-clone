"use client";

import { useEffect, useRef } from "react";
import hljs from "highlight.js";

interface CodeBlockProps {
  content: string;
  language: string;
}

export function CodeBlock({ content, language }: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [content, language]);

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800/50">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {language}
        </span>
        <CopyButton text={content} />
      </div>
      <pre className="overflow-x-auto p-4">
        <code ref={codeRef} className={`language-${language} text-sm`}>
          {content}
        </code>
      </pre>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  function handleCopy() {
    navigator.clipboard.writeText(text);
  }

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="rounded-md px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-700"
    >
      Copy
    </button>
  );
}
