import { ChatMessage, Sender } from './types';

export interface MessageNode {
  message: ChatMessage;
  children: MessageNode[];
  isEditedMessage: boolean;
  branchId: string;
}

export interface ConversationTree {
  rootNodes: MessageNode[];
  branchCount: number;
  branches: Map<string, MessageNode[]>;
}

/**
 * Builds a tree structure from a flat list of messages
 * This approach uses timestamps and sender patterns to detect branches
 */
export const buildConversationTree = (messages: ChatMessage[]): ConversationTree => {
  // First, sort messages by timestamp
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  if (sortedMessages.length === 0) {
    return { rootNodes: [], branchCount: 0, branches: new Map() };
  }

  // We'll track nodes by their UUID
  const messageMap = new Map<string, MessageNode>();

  // Keep track of the most recent message of each type
  let lastHumanMessage: MessageNode | null = null;
  let lastAssistantMessage: MessageNode | null = null;

  // Track branches
  let branchCount = 0;
  const branches = new Map<string, MessageNode[]>();
  const mainBranch: MessageNode[] = [];
  let currentBranchId = 'main';

  // For each message, determine its parent and build the tree
  for (const message of sortedMessages) {
    // Create a message node
    const node: MessageNode = {
      message,
      children: [],
      isEditedMessage: false,
      branchId: currentBranchId,
    };

    // Add to our map
    messageMap.set(message.uuid, node);

    // Determine if this is a new branch by looking at timestamps
    if (message.sender === Sender.Human && lastAssistantMessage && lastHumanMessage) {
      // If a human message follows an assistant message, but its timestamp
      // is very close to a previous human message, it might be a branch
      const lastHumanTime = new Date(lastHumanMessage.message.created_at).getTime();
      const currentTime = new Date(message.created_at).getTime();
      const timeDifference = currentTime - lastHumanTime;

      // If there's a human message closely following another human message,
      // this may indicate an edit or branch
      if (timeDifference < 300000) {
        // Within 5 minutes
        // This looks like a branch - the human edited their message
        branchCount++;
        currentBranchId = `branch-${branchCount}`;
        node.branchId = currentBranchId;
        node.isEditedMessage = true;

        // Start tracking this branch
        branches.set(currentBranchId, [node]);
      }
    } else if (currentBranchId !== 'main') {
      // Continue adding messages to the current branch
      const branch = branches.get(currentBranchId) || [];
      branch.push(node);
      branches.set(currentBranchId, branch);
    }

    // Add to the main list if this is the main branch
    if (currentBranchId === 'main') {
      mainBranch.push(node);
    }

    // Update last message references
    if (message.sender === Sender.Human) {
      lastHumanMessage = node;
    } else {
      lastAssistantMessage = node;
    }
  }

  // Add the main branch to our branches map
  branches.set('main', mainBranch);

  // Find root nodes - messages without parents
  // For simplicity, we'll assume the first message in each branch is a root
  const rootNodes: MessageNode[] = [];

  branches.forEach(branchMessages => {
    if (branchMessages.length > 0) {
      rootNodes.push(branchMessages[0]);
    }
  });

  return {
    rootNodes,
    branchCount,
    branches,
  };
};

/**
 * Detects conversation branches at a higher level - looking for logical branches
 * rather than just edits, by analyzing conversation flow and timing
 */
export const detectLogicalBranches = (messages: ChatMessage[]): MessageNode[][] => {
  // Sort messages by timestamp
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  if (sortedMessages.length <= 1) {
    return [
      sortedMessages.map(msg => ({
        message: msg,
        children: [],
        isEditedMessage: false,
        branchId: 'main',
      })),
    ];
  }

  // We'll use a different approach - looking for gaps in timeline
  // that indicate the conversation was continued at a later time

  const branches: MessageNode[][] = [];
  let currentBranch: MessageNode[] = [];
  let previousTimestamp: number | null = null;
  let branchCount = 0;

  for (let i = 0; i < sortedMessages.length; i++) {
    const message = sortedMessages[i];
    const currentTimestamp = new Date(message.created_at).getTime();

    // Create a node for this message
    const node: MessageNode = {
      message,
      children: [],
      isEditedMessage: false,
      branchId: `branch-${branchCount}`,
    };

    // Check if there's a significant time gap (more than 1 hour)
    // that might indicate a new logical branch
    if (
      previousTimestamp &&
      currentTimestamp - previousTimestamp > 3600000 && // 1 hour
      currentBranch.length > 0
    ) {
      // This is a significant gap, start a new branch
      branches.push([...currentBranch]);
      currentBranch = [];
      branchCount++;
      node.branchId = `branch-${branchCount}`;
    }

    // Look for turn-taking anomalies (same sender twice in a row)
    // which might indicate edits or branches
    if (currentBranch.length > 0) {
      const previousNode = currentBranch[currentBranch.length - 1];
      if (previousNode.message.sender === message.sender) {
        // Same sender twice in a row - this might be an edit
        // or the start of a new branch

        // Check the time difference
        const prevTime = new Date(previousNode.message.created_at).getTime();
        const timeGap = currentTimestamp - prevTime;

        if (timeGap > 300000) {
          // More than 5 minutes
          // Likely a new branch
          branches.push([...currentBranch]);
          currentBranch = [];
          branchCount++;
          node.branchId = `branch-${branchCount}`;
        } else {
          // Possibly an edit or clarification
          node.isEditedMessage = true;
        }
      }
    }

    // Add to current branch
    currentBranch.push(node);
    previousTimestamp = currentTimestamp;
  }

  // Add the final branch
  if (currentBranch.length > 0) {
    branches.push(currentBranch);
  }

  return branches;
};

/**
 * Extract the different branches from a conversation by examining
 * patterns in message sequence, timing, and content
 */
export const extractConversationBranches = (
  messages: ChatMessage[]
): {
  mainConversation: ChatMessage[];
  branches: { id: string; messages: ChatMessage[] }[];
} => {
  // First detect logical branches
  const logicalBranches = detectLogicalBranches(messages);

  // The first branch is our main conversation
  const mainConversation = logicalBranches[0]?.map(node => node.message) || [];

  // The rest are branches
  const branches = logicalBranches.slice(1).map((branch, index) => ({
    id: `branch-${index + 1}`,
    messages: branch.map(node => node.message),
  }));

  return {
    mainConversation,
    branches,
  };
};
