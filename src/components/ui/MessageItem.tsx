import React, { useState } from 'react';
import { ChatMessage, Sender, ContentType } from '../../utils/types';
import { formatDate } from '../../utils/formatters';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  IoCopyOutline,
  IoCheckmarkOutline,
  IoExpandOutline,
  IoContractOutline,
} from 'react-icons/io5';

interface MessageItemProps {
  message: ChatMessage;
}

// Helper to determine if content is code
const isCodeBlock = (text: string): { isCode: boolean; language: string } => {
  const codeBlockRegex = /^```([a-zA-Z0-9_-]*)?\s*[\s\S]+```$/;
  const match = text.match(codeBlockRegex);

  if (match) {
    return {
      isCode: true,
      language: match[1] || 'text',
    };
  }

  return {
    isCode: false,
    language: '',
  };
};

// Helper to extract code from markdown code blocks
const extractCodeFromMarkdown = (text: string): { code: string; language: string } => {
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)?\s*([\s\S]+?)```/;
  const match = text.match(codeBlockRegex);

  if (match) {
    return {
      language: match[1] || 'text',
      code: match[2].trim(),
    };
  }

  return {
    language: '',
    code: text,
  };
};

// Function to parse artifact content
const parseArtifactContent = (content: string, language: string | undefined) => {
  if (!content) return null;

  // If it's a code artifact, return syntax highlighted code
  if (language && language !== 'markdown' && language !== '') {
    return (
      <SyntaxHighlighter language={language} style={vscDarkPlus}>
        {content}
      </SyntaxHighlighter>
    );
  }

  // For markdown content
  if (language === 'markdown' || !language) {
    return <ReactMarkdown>{content}</ReactMarkdown>;
  }

  // Default fallback
  return <div className="whitespace-pre-wrap">{content}</div>;
};

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Get avatar based on sender
  const getAvatar = () => {
    if (message.sender === Sender.Assistant) {
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
          C
        </div>
      );
    } else {
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
          H
        </div>
      );
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Function to render text content
  const renderTextContent = (text: string) => {
    const { isCode } = isCodeBlock(text);

    if (isCode) {
      const { code, language: extractedLang } = extractCodeFromMarkdown(text);
      return (
        <div className="relative">
          <div className="absolute top-2 right-2 flex space-x-2">
            <button
              onClick={() => copyToClipboard(code)}
              className="rounded p-1 text-gray-300 hover:bg-gray-700"
              title="Copy code"
            >
              {copied ? <IoCheckmarkOutline /> : <IoCopyOutline />}
            </button>
          </div>
          <SyntaxHighlighter language={extractedLang} style={vscDarkPlus}>
            {code}
          </SyntaxHighlighter>
        </div>
      );
    }

    return <ReactMarkdown>{text}</ReactMarkdown>;
  };

  // Function to render tool use content
  const renderToolUseContent = (content: any) => {
    if (!content.input) return null;

    // Handle artifacts tool
    if (content.name === 'artifacts') {
      const { type, title, language, content: artifactContent } = content.input;

      return (
        <div className="my-2 rounded-md bg-gray-800 p-4 text-white">
          <div className="mb-2 flex items-center justify-between">
            <div className="font-mono text-sm text-gray-400">
              Artifact: {title || 'Untitled'} ({type})
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="rounded p-1 text-gray-300 hover:bg-gray-700"
                title={expanded ? 'Collapse' : 'Expand'}
              >
                {expanded ? <IoContractOutline /> : <IoExpandOutline />}
              </button>
              <button
                onClick={() => copyToClipboard(artifactContent || '')}
                className="rounded p-1 text-gray-300 hover:bg-gray-700"
                title="Copy content"
              >
                {copied ? <IoCheckmarkOutline /> : <IoCopyOutline />}
              </button>
            </div>
          </div>

          <div className={`overflow-auto ${expanded ? 'max-h-full' : 'max-h-96'}`}>
            {parseArtifactContent(artifactContent || '', language)}
          </div>
        </div>
      );
    }

    // Handle REPL/analysis tool
    if (content.name === 'repl') {
      return (
        <div className="my-2 rounded-md bg-gray-800 p-4 text-white">
          <div className="mb-2 flex items-center justify-between">
            <div className="font-mono text-sm text-gray-400">Analysis Tool</div>
            <div className="flex space-x-2">
              <button
                onClick={() => copyToClipboard(content.input.code || '')}
                className="rounded p-1 text-gray-300 hover:bg-gray-700"
                title="Copy code"
              >
                {copied ? <IoCheckmarkOutline /> : <IoCopyOutline />}
              </button>
            </div>
          </div>

          <SyntaxHighlighter language="javascript" style={vscDarkPlus}>
            {content.input.code || ''}
          </SyntaxHighlighter>
        </div>
      );
    }

    // Default fallback for unknown tool
    return (
      <div className="my-2 rounded bg-gray-100 p-3">
        <div className="mb-1 font-mono text-sm text-gray-500">
          Tool: {content.name || 'Unknown'}
        </div>
        <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(content.input, null, 2)}</pre>
      </div>
    );
  };

  // Function to render tool result content
  const renderToolResultContent = (content: any) => {
    return (
      <div className="my-2 rounded bg-gray-100 p-3">
        <div className="mb-1 font-mono text-sm text-gray-500">
          Tool Result: {content.name || 'Unknown'}
        </div>
        {content.message && <div className="text-sm whitespace-pre-wrap">{content.message}</div>}
      </div>
    );
  };

  // Render chat message content
  const renderMessageContent = () => {
    if (!message.content || message.content.length === 0) {
      return <div className="whitespace-pre-wrap">{message.text || 'No content'}</div>;
    }

    return message.content.map((contentItem, index) => {
      if (contentItem.type === ContentType.Text && contentItem.text) {
        return (
          <div key={index} className="mb-4">
            {renderTextContent(contentItem.text)}
          </div>
        );
      } else if (contentItem.type === ContentType.ToolUse) {
        return (
          <div key={index} className="mb-4">
            {renderToolUseContent(contentItem)}
          </div>
        );
      } else if (contentItem.type === ContentType.ToolResult) {
        return (
          <div key={index} className="mb-4">
            {renderToolResultContent(contentItem)}
          </div>
        );
      }

      return null;
    });
  };

  // Display attachments if any
  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) {
      return null;
    }

    return (
      <div className="mt-2">
        <div className="mb-1 text-sm font-medium text-gray-700">Attachments:</div>
        <div className="flex flex-wrap gap-2">
          {message.attachments.map((attachment, index) => (
            <div
              key={index}
              className="flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm"
            >
              {attachment.file_name}
              <span className="ml-1 text-xs text-gray-500">
                ({Math.round(attachment.file_size / 1024)} KB)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`mb-4 rounded-lg p-4 ${
        message.sender === Sender.Human ? 'bg-blue-50' : 'border border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start space-x-3">
        {getAvatar()}

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between">
            <div className="font-medium">{message.sender === Sender.Human ? 'You' : 'Claude'}</div>
            <div className="text-xs text-gray-500">{formatDate(message.created_at)}</div>
          </div>

          <div className="prose prose-sm max-w-none">{renderMessageContent()}</div>

          {renderAttachments()}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
