"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { usePathname } from "next/navigation";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export function MarkdownRenderer({ body }) {
  const pathname = usePathname();

  const isEditor = pathname.startsWith("/editor");

  const theme = {
    text: isEditor ? "text-gray-300" : "text-gray-900",
    heading: isEditor ? "text-gray-100" : "text-gray-900",
    tableText: isEditor ? "text-gray-300" : "text-gray-900",
    tableHead: isEditor ? "text-gray-100" : "text-gray-900",
    list: isEditor ? "text-gray-300" : "text-gray-900",
    border: "border-[#262628]",
    theadBg: "bg-[#202023]",
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        table: ({ children }) => (
          <div className="overflow-x-auto my-6">
            <table
              className={`w-full border-collapse border ${theme.border} text-sm text-left ${theme.tableText}`}
            >
              {children}
            </table>
          </div>
        ),

        thead: ({ children }) => (
          <thead className={theme.theadBg}>{children}</thead>
        ),

        th: ({ children }) => (
          <th
            className={`border ${theme.border} px-4 py-2 font-semibold ${theme.tableHead}`}
          >
            {children}
          </th>
        ),

        td: ({ children }) => (
          <td
            className={`border ${theme.border} px-4 py-2 ${theme.tableText}`}
          >
            {children}
          </td>
        ),

        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            {children}
          </a>
        ),

        h1: ({ children }) => (
          <h1
            className={`text-4xl font-bold mb-6 mt-2 border-b ${theme.border} pb-3 ${theme.heading}`}
          >
            {children}
          </h1>
        ),

        h2: ({ children }) => (
          <h2
            className={`text-2xl font-semibold mb-4 mt-6 border-b ${theme.border} pb-2 ${theme.heading}`}
          >
            {children}
          </h2>
        ),

        h3: ({ children }) => (
          <h3 className={`text-xl font-semibold mb-3 mt-5 ${theme.heading}`}>
            {children}
          </h3>
        ),

        hr: () => (
          <hr className={`my-8 ${theme.border} border-t-2`} />
        ),

        ul: ({ children }) => (
          <ul
            className={`list-disc list-outside ml-6 mb-4 space-y-2 ${theme.list}`}
          >
            {children}
          </ul>
        ),

        ol: ({ children }) => (
          <ol
            className={`list-decimal list-outside ml-6 mb-4 space-y-2 ${theme.list}`}
          >
            {children}
          </ol>
        ),

        li: ({ children }) => (
          <li className={theme.list}>{children}</li>
        ),

        p: ({ children }) => (
          <p className={`${theme.text} mb-4 leading-relaxed`}>
            {children}
          </p>
        ),

        blockquote: ({ children }) => (
          <blockquote
            className={`border-l-4 ${theme.border} pl-4 italic my-4 ${theme.text}`}
          >
            {children}
          </blockquote>
        ),

        strong: ({ children }) => (
          <strong className={theme.heading}>{children}</strong>
        ),

        em: ({ children }) => (
          <em className={theme.text}>{children}</em>
        ),

        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");

          return !inline && match ? (
            <div className={`my-4 rounded-lg overflow-hidden border ${theme.border}`}>
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code
              className="bg-[#262628] px-1.5 py-0.5 rounded text-orange-400 font-mono"
              {...props}
            >
              {children}
            </code>
          );
        },
      }}
    >
      {body}
    </ReactMarkdown>
  );
}