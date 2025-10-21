import { ReactNode, Dispatch, SetStateAction, RefObject } from "react";

export type Role = "user" | "assistant";
interface MessageType {
  _id: string;
  role: Role;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messageCount: number;
  preview: string;
  pinned: boolean;
  messages: MessageType[];
}

interface Folder {
  id: string;
  name: string;
  conversations: Conversation[];
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
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  searchRef: RefObject<HTMLInputElement | null>;
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
  showMeta?: boolean;
}

interface FolderRowProps {
  name: string;
  conversations: Conversation[];
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
}
interface SettingsPopoverProps {
  children: ReactNode;
}

interface ChatPaneProps {
  isThinking?: boolean;
  onPauseThinking?: () => void;
}

interface ChatPaneHandle {
  insertTemplate: (templateContent: string) => void;
}

interface ActionItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  action: () => void;
  badge?: string;
}
export interface ComposerHandle {
  insertTemplate: (templateContent: string) => void;
  focus: () => void;
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
  // HeaderProps,
  Chatbot,
  ActionItem,
  ComposerActionsPopoverProps,
  MessageProps,
  GhostIconButtonProps,
  ChatPaneProps,
  ChatPaneHandle,
};
