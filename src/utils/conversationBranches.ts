import { ChatMessage, Sender } from './types';

export interface ConversationBranch {
  id: string;
  name: string;
  messages: ChatMessage[];
  parentBranchId: string | null;
  branchPoint: number | null; // Index in the parent branch where this branch splits off
}

/**
 * Detect potential conversation branches by analyzing message timestamps and sequence
 */
export const detectConversationBranches = (messages: ChatMessage[]): ConversationBranch[] => {
  // Sort messages by created_at timestamp
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  if (sortedMessages.length <= 1) {
    return [
      {
        id: 'main',
        name: 'Main Conversation',
        messages: sortedMessages,
        parentBranchId: null,
        branchPoint: null,
      },
    ];
  }

  // Track human-assistant pairs (one turn of conversation)
  const conversationTurns: { human: ChatMessage; assistant: ChatMessage | null }[] = [];

  // Group messages into conversation turns
  let currentHuman: ChatMessage | null = null;

  for (const message of sortedMessages) {
    if (message.sender === Sender.Human) {
      // If we have a pending human message without assistant response, it's a potential branch point
      if (currentHuman) {
        conversationTurns.push({ human: currentHuman, assistant: null });
      }
      currentHuman = message;
    } else if (message.sender === Sender.Assistant && currentHuman) {
      // Complete the conversation turn
      conversationTurns.push({ human: currentHuman, assistant: message });
      currentHuman = null;
    }
  }

  // Add the last human message if it doesn't have an assistant response
  if (currentHuman) {
    conversationTurns.push({ human: currentHuman, assistant: null });
  }

  // Now detect branches by looking for similarities in human messages
  const branches: ConversationBranch[] = [];
  const processedHumanMsgIds = new Set<string>();

  // Start with the first turn as the main branch
  const mainBranchTurns: { human: ChatMessage; assistant: ChatMessage | null }[] = [];

  // First pass: identify the main branch
  for (let i = 0; i < conversationTurns.length; i++) {
    const turn = conversationTurns[i];

    // If this human message is unique (not similar to any previous one)
    // or if all turns have been processed, add to main branch
    if (
      !isDuplicateMessage(
        turn.human,
        conversationTurns.slice(0, i).map(t => t.human)
      )
    ) {
      mainBranchTurns.push(turn);
      processedHumanMsgIds.add(turn.human.uuid);
    }
  }

  // Add the main branch
  branches.push({
    id: 'main',
    name: 'Main Conversation',
    messages: mainBranchTurns.flatMap(turn =>
      turn.assistant ? [turn.human, turn.assistant] : [turn.human]
    ),
    parentBranchId: null,
    branchPoint: null,
  });

  // Second pass: identify branches
  let branchCount = 0;

  for (let i = 0; i < conversationTurns.length; i++) {
    const turn = conversationTurns[i];

    // Skip messages already in the main branch
    if (processedHumanMsgIds.has(turn.human.uuid)) {
      continue;
    }

    // Find which message this might be a branch from
    const { similarMessage, similarityIndex } = findSimilarMessage(
      turn.human,
      mainBranchTurns.map(t => t.human)
    );

    if (similarMessage) {
      // Start a new branch
      branchCount++;
      const branchTurns: { human: ChatMessage; assistant: ChatMessage | null }[] = [];
      branchTurns.push(turn);
      processedHumanMsgIds.add(turn.human.uuid);

      // Find subsequent messages that should be part of this branch
      for (let j = i + 1; j < conversationTurns.length; j++) {
        if (!processedHumanMsgIds.has(conversationTurns[j].human.uuid)) {
          branchTurns.push(conversationTurns[j]);
          processedHumanMsgIds.add(conversationTurns[j].human.uuid);
        }
      }

      // Add the branch
      branches.push({
        id: `branch-${branchCount}`,
        name: `Branch ${branchCount}`,
        messages: branchTurns.flatMap(turn =>
          turn.assistant ? [turn.human, turn.assistant] : [turn.human]
        ),
        parentBranchId: 'main',
        branchPoint: similarityIndex,
      });
    }
  }

  return branches;
};

/**
 * Check if a message is a duplicate/edited version of any previous message
 */
const isDuplicateMessage = (message: ChatMessage, previousMessages: ChatMessage[]): boolean => {
  return previousMessages.some(prev => isSimilarMessage(message, prev));
};

/**
 * Find the most similar previous message
 */
const findSimilarMessage = (
  message: ChatMessage,
  previousMessages: ChatMessage[]
): { similarMessage: ChatMessage | null; similarityIndex: number } => {
  for (let i = 0; i < previousMessages.length; i++) {
    if (isSimilarMessage(message, previousMessages[i])) {
      return { similarMessage: previousMessages[i], similarityIndex: i };
    }
  }

  return { similarMessage: null, similarityIndex: -1 };
};

/**
 * Check if two messages are similar (likely edited versions of each other)
 */
const isSimilarMessage = (message1: ChatMessage, message2: ChatMessage): boolean => {
  if (message1.uuid === message2.uuid) return true;

  // Get message texts
  const text1 = getMessageText(message1).toLowerCase();
  const text2 = getMessageText(message2).toLowerCase();

  // Simple similarity check - could be improved with more sophisticated approaches
  const similarity = calculateSimilarity(text1, text2);

  // If more than 70% similar, consider them related
  return similarity > 0.7;
};

/**
 * Get the main text content of a message
 */
const getMessageText = (message: ChatMessage): string => {
  if (message.content && message.content.length > 0) {
    const textContent = message.content.find(c => c.type === 'text');
    if (textContent && textContent.text) {
      return textContent.text;
    }
  }

  return message.text || '';
};

/**
 * Calculate text similarity using Jaccard index on word sets
 */
const calculateSimilarity = (text1: string, text2: string): number => {
  const words1 = new Set(text1.split(/\s+/).filter(w => w.length > 0));
  const words2 = new Set(text2.split(/\s+/).filter(w => w.length > 0));

  // Handle empty texts
  if (words1.size === 0 && words2.size === 0) return 1;
  if (words1.size === 0 || words2.size === 0) return 0;

  // Calculate intersection
  const intersection = new Set([...words1].filter(x => words2.has(x)));

  // Calculate union
  const union = new Set([...words1, ...words2]);

  // Jaccard index
  return intersection.size / union.size;
};
