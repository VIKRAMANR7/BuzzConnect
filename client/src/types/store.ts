import type { ChatMessage } from "../types/message";
import type { DisplayUser } from "../types/user";

export interface UserState {
  value: DisplayUser | null;
}

export interface ConnectionsState {
  connections: DisplayUser[];
  pendingConnections: DisplayUser[];
  followers: DisplayUser[];
  following: DisplayUser[];
}

export interface MessagesState {
  messages: ChatMessage[];
}

export interface RootState {
  user: UserState;
  connections: ConnectionsState;
  messages: MessagesState;
}
