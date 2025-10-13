import { ReactNode, Dispatch, SetStateAction, RefObject } from "react";

export type Role = "user" | "assistant";
interface MessageType {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
  editedAt?: string;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messageCount: number;
  preview: string;
  pinned: boolean;
  folder: string;
  messages: MessageType[];
}

interface Folder {
  id: string;
  name: string;
}

interface Template {
  id: string;
  name: string;
  content: string;
  snippet?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CollapsedState {
  pinned: boolean;
  recent: boolean;
  folders: boolean;
  templates: boolean;
}

interface Chatbot {
  name: string;
  icon: ReactNode | string;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  theme: "light" | "dark";
  setTheme: Dispatch<SetStateAction<"light" | "dark">>;
  collapsed: CollapsedState;
  setCollapsed: Dispatch<SetStateAction<CollapsedState>>;
  conversations: Conversation[];
  pinned: Conversation[];
  recent: Conversation[];
  folders: Folder[];
  folderCounts: Record<string, number>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  togglePin: (id: string) => void;
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  searchRef: RefObject<HTMLInputElement | null>;
  createFolder: (folderName: string) => void;
  createNewChat: () => void;
  templates: Template[];
  setTemplates: Dispatch<SetStateAction<Template[]>>;
  onUseTemplate: (template: Template) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: Dispatch<SetStateAction<boolean>>;
}

interface SidebarSectionProps {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  collapsed: boolean;
  onToggle: () => void;
}

interface ConversationRowProps {
  data: Conversation;
  active: boolean;
  onSelect: () => void;
  onTogglePin: () => void;
  showMeta?: boolean;
}

interface FolderRowProps {
  name: string;
  count: number;
  conversations?: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  togglePin: (id: string) => void;
  onDeleteFolder?: (folderName: string) => void;
  onRenameFolder?: (oldName: string, newName: string) => void;
}

interface TemplateRowProps {
  template: Template;
  onUseTemplate?: (template: Template) => void;
  onEditTemplate?: (template: Template) => void;
  onRenameTemplate?: (id: string, newName: string) => void;
  onDeleteTemplate?: (id: string) => void;
}

interface ThemeToggleProps {
  theme: "light" | "dark";
  setTheme: React.Dispatch<React.SetStateAction<"light" | "dark">>;
}

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (folderName: string) => void;
}

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTemplate: (template: Template) => void;
  editingTemplate?: Template | null;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  togglePin?: (id: string) => void;
  createNewChat: () => void;
}
interface SettingsPopoverProps {
  children: ReactNode;
}
interface HeaderProps {
  createNewChat: () => void;
  sidebarCollapsed: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface ChatPaneProps {
  conversation?: Conversation | null;
  onSend?: (text: string) => Promise<void> | void | null;
  onEditMessage?: (id: string, content: string) => void;
  onResendMessage?: (id: string) => void;
  isThinking?: boolean;
  onPauseThinking?: () => void;
}

interface ChatPaneHandle {
  insertTemplate: (templateContent: string) => void;
}

interface ActionItem {
  icon: React.ComponentType<{ className?: string }> | (() => any);
  label: string;
  action: () => void;
  badge?: string;
}

interface ComposerActionsPopoverProps {
  children: ReactNode;
}

interface MessageProps {
  role: "user" | "assistant";
  children: ReactNode;
}
interface GhostIconButtonProps {
  label: string;
  children: ReactNode;
}

export type {
  MessageType,
  Conversation,
  Folder,
  Template,
  CollapsedState,
  SidebarProps,
  SidebarSectionProps,
  ConversationRowProps,
  FolderRowProps,
  TemplateRowProps,
  ThemeToggleProps,
  CreateFolderModalProps,
  CreateTemplateModalProps,
  SearchModalProps,
  SettingsPopoverProps,
  HeaderProps,
  Chatbot,
  ActionItem,
  ComposerActionsPopoverProps,
  MessageProps,
  GhostIconButtonProps,
  ChatPaneProps,
  ChatPaneHandle,
};
