// components/MarkdownRenderer.js
import ReactMarkdown from 'react-markdown';

const MarkdownComponents = {
  h1: ({ node, ...props }) => <h1 className="text-2xl font-normal mt-6 mb-1 pb-1 border-b border-gray-200" {...props} />,
  h2: ({ node, ...props }) => <h2 className="text-xl font-normal mt-6 mb-1 pb-1 border-b border-gray-200" {...props} />,
  h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-1" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2" {...props} />,
  li: ({ node, ...props }) => <li className="mb-1" {...props} />,
  p: ({ node, ...props }) => <p className="my-2" {...props} />,
  a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
  em: ({ node, ...props }) => <em className="italic" {...props} />,
  blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-300 pl-4 my-2 text-gray-600" {...props} />,
  code: ({ node, inline, ...props }) => 
    inline ? (
      <code className="bg-gray-100 border border-gray-200 rounded px-1" {...props} />
    ) : (
      <pre className="bg-gray-100 border border-gray-200 p-4 my-4 whitespace-pre-wrap">
        <code {...props} />
      </pre>
    ),
  table: ({ node, ...props }) => <table className="border-collapse my-4 w-full" {...props} />,
  th: ({ node, ...props }) => <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-bold" {...props} />,
  td: ({ node, ...props }) => <td className="border border-gray-300 px-4 py-2" {...props} />,
};

export default function MarkdownRenderer({ content }) {
  return (
    <div className="prose max-w-none dark:prose-invert">
      <ReactMarkdown components={MarkdownComponents}>{content}</ReactMarkdown>
    </div>
  );
}