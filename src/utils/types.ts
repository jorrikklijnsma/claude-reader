// User types
export interface User {
  uuid: string;
  full_name: string;
  email_address: string;
  verified_phone_number: string;
}

export type Users = User[];

// Project types
export interface Projects {
  uuid: string;
  name: string;
  description: string;
  is_private: boolean;
  is_starter_project: boolean;
  prompt_template: string;
  created_at: Date;
  updated_at: Date;
  creator: Creator;
  docs: Doc[];
}

export interface Creator {
  uuid: string;
  full_name: string;
}

export interface Doc {
  uuid: string;
  filename: string;
  content: string;
  created_at: Date;
}

// Conversation types
export interface Conversation {
  uuid: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  account: Account;
  chat_messages: ChatMessage[];
}

export type Conversations = Conversation[];

export interface Account {
  uuid: string;
}

export interface ChatMessage {
  uuid: string;
  text: string;
  content: ChatMessageContent[];
  sender: Sender;
  created_at: Date;
  updated_at: Date;
  attachments: Attachment[];
  files: File[];
}

export interface Attachment {
  file_name: string;
  file_size: number;
  file_type: string;
  extracted_content: string;
}

export interface File {
  file_name: string;
}

export interface ChatMessageContent {
  start_timestamp: Date | null;
  stop_timestamp: Date | null;
  type: ContentType;
  text?: string;
  citations?: any[];
  name?: string;
  input?: Input;
  message?: string | null;
  integration_name?: null;
  integration_icon_url?: null;
  context?: null;
  display_content?: null;
  content?: ContentContent[];
  is_error?: boolean;
}

export interface ContentContent {
  type: ContentType;
  text: string;
  uuid: string;
}

export enum ContentType {
  Text = 'text',
  ToolResult = 'tool_result',
  ToolUse = 'tool_use',
}

export interface Input {
  id?: string;
  type?: string;
  title?: string;
  command?: string;
  content?: string;
  language?: string;
  version_uuid?: string;
  new_str?: string;
  old_str?: string;
  code?: string;
}

export enum Sender {
  Assistant = 'assistant',
  Human = 'human',
}

// Application state type
export interface AppData {
  users: Users | null;
  projects: Projects[] | null;
  conversations: Conversations | null;
  isLoading: boolean;
  selectedConversation: Conversation | null;
}
