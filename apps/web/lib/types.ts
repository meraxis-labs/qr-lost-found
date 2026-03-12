/**
 * TYPES — Data shapes used across the app
 * ----------------------------------------
 * This file defines:
 * 1. Domain types (Tag, Message, Owner) — re-exported from the monorepo so
 *    the UI and any APIs share the same idea of "a tag" or "a message".
 * 2. Database row types (TagRow, MessageRow) — the exact shape Supabase
 *    returns (snake_case columns like owner_id, created_at).
 * 3. Mapper functions — turn a row from the DB into a domain object (camelCase).
 * 4. Database — the full Supabase schema type so we get autocomplete and
 *    type safety when inserting/updating (e.g. .insert({ tag_id, content })).
 */

import type { Tag, Message } from "@repo/types";

// Use these in React components and API routes. They use camelCase (e.g. ownerId).
export type { Tag, Message, Owner } from "@repo/types";

/**
 * One row from the "tags" table. Column names match the database (snake_case).
 * We convert these to Tag (camelCase) using tagRowToTag().
 */
export interface TagRow {
  id: string;
  owner_id: string;
  label: string | null;
  created_at: string;
  is_active: boolean;
}

/**
 * One row from the "messages" table. Same idea: DB shape, then we map to Message.
 */
export interface MessageRow {
  id: string;
  tag_id: string;
  finder_token: string | null;
  content: string;
  created_at: string;
  read: boolean;
}

/** Convert a tag row from the database into the app's Tag type (camelCase). */
export function tagRowToTag(row: TagRow): Tag {
  return {
    id: row.id,
    ownerId: row.owner_id,
    label: row.label ?? undefined,
    createdAt: row.created_at,
    isActive: row.is_active,
  };
}

/** Convert a message row from the database into the app's Message type (camelCase). */
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

/**
 * Full Supabase Database type. Matches the schema from our migrations.
 * Used when creating the Supabase client so .from("tags") and .from("messages")
 * know the exact Insert/Update/Row shapes (e.g. Insert requires tag_id and content).
 */
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
