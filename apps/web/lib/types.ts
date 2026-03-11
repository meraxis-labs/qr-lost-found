/**
 * Domain and database types for the web app.
 *
 * Domain types (Tag, Message, Owner) are the app-level shape (camelCase).
 * They are re-exported from the monorepo root so UI and API share one contract.
 *
 * Database types (TagRow, MessageRow, Database) match the Supabase/Postgres
 * schema (snake_case) and are used for typed client calls.
 */

import type { Tag, Message } from "@repo/types";

// Re-export domain types from repo root — use these in components and API.
export type { Tag, Message, Owner } from "@repo/types";

// Supabase returns snake_case; these match the migration schema.
export interface TagRow {
  id: string;
  owner_id: string;
  label: string | null;
  created_at: string;
  is_active: boolean;
}

export interface MessageRow {
  id: string;
  tag_id: string;
  finder_token: string | null;
  content: string;
  created_at: string;
  read: boolean;
}

/** Map a DB tag row to the domain Tag type. */
export function tagRowToTag(row: TagRow): Tag {
  return {
    id: row.id,
    ownerId: row.owner_id,
    label: row.label ?? undefined,
    createdAt: row.created_at,
    isActive: row.is_active,
  };
}

/** Map a DB message row to the domain Message type. */
export function messageRowToMessage(row: MessageRow): Message {
  return {
    id: row.id,
    tagId: row.tag_id,
    finderToken: row.finder_token ?? "",
    content: row.content,
    createdAt: row.created_at,
    read: row.read,
  };
}

/** Supabase Database type for typed client (matches migrations). */
export interface Database {
  public: {
    Tables: {
      tags: {
        Row: TagRow;
        Insert: Omit<TagRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<TagRow, "id" | "created_at">>;
      };
      messages: {
        Row: MessageRow;
        Insert: {
          tag_id: string;
          content: string;
          finder_token?: string | null;
          read?: boolean;
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<MessageRow, "id" | "created_at">>;
      };
    };
  };
}
