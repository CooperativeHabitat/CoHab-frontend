export interface ChatResponse {
  familyId: string
  memberId: string
  messageId: string
  content: string
  reactions: Reaction[] | null
  reads: MessageRead[] | null
  operationType: ChatOperationType | null
  sentAt: string
  updatedAt: string
}

export enum ChatOperationType {
  NEW_MESSAGE = 'NEW_MESSAGE',
  EDIT_MESSAGE = 'EDIT_MESSAGE',
  DELETE_MESSAGE = 'DELETE_MESSAGE',
  REACTION_ON_MESSAGE = 'REACTION_ON_MESSAGE',
  VIEWED_MESSAGE = 'VIEWED_MESSAGE'
}

export interface MessageDto {
  memberId: string,
  messageId: string
  content: string
  replyToId: string | null
  reactions: Reaction[] | null
  reads: MessageRead[] | null
  sentAt: string
  updatedAt: string
}

export interface MessageRequest {
  page: number
  size: number
  startDate: string | null
  endDate: string | null
}

export interface CreateMessageRequest {
  content: string
  replyToId: string | null
  familyId: string
}

export interface DeleteMessageRequest {
  familyId: string
  messageId: string
}

export interface EditMessageRequest {
  messageId: string
  content: string
  familyId: string
}

export interface ReactMessageRequest {
  messageId: string
  reaction: string
  familyId: string
}

export interface ViewMessageRequest {
  familyId: string
  messageId: string
}

export interface Reaction {
  emoji?: string
  memberId?: string
}

export interface MessageRead {
  memberId?: string
  readAt?: string
}