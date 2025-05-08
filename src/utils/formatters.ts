/**
 * Format a date to a human-readable string
 */
export const formatDate = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid date';
  }

  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  // Different formats based on how old the date is
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  } else {
    // For older dates, show the full date
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
};

/**
 * Format file size to human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Truncate text to a specified length
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength) + '...';
};

/**
 * Convert markdown to plain text by removing markdown syntax
 */
export const markdownToPlainText = (markdown: string): string => {
  if (!markdown) return '';

  // Replace headers, bold, italic, and other markdown syntax
  return markdown
    .replace(/#{1,6}\s+/g, '') // Headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/\*(.*?)\*/g, '$1') // Italic
    .replace(/~~(.*?)~~/g, '$1') // Strikethrough
    .replace(/`(.*?)`/g, '$1') // Inline code
    .replace(/```[\s\S]*?```/g, '') // Code blocks
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
    .replace(/!\[(.*?)\]\(.*?\)/g, '$1') // Images
    .replace(/<.*?>/g, '') // HTML tags
    .replace(/^\s*[-*+]\s+/gm, '') // List items
    .replace(/^\s*\d+\.\s+/gm, '') // Numbered list items
    .replace(/\n{2,}/g, '\n\n') // Multiple newlines
    .trim();
};

/**
 * Extract a snippet from a longer text
 */
export const extractSnippet = (text: string, query: string, maxLength: number = 150): string => {
  if (!text || !query) return truncateText(text, maxLength);

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Find the position of the query in the text
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) {
    // If query not found, just return the start of the text
    return truncateText(text, maxLength);
  }

  // Calculate the start and end indices for the snippet
  let start = Math.max(0, index - Math.floor(maxLength / 2));
  let end = Math.min(text.length, start + maxLength);

  // Adjust start if end was capped
  if (end === text.length) {
    start = Math.max(0, end - maxLength);
  }

  // Extract the snippet
  let snippet = text.substring(start, end);

  // Add ellipsis if needed
  if (start > 0) {
    snippet = '...' + snippet;
  }

  if (end < text.length) {
    snippet = snippet + '...';
  }

  return snippet;
};
