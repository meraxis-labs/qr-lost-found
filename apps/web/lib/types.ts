/**
 * TYPES — Data shapes used across the app
 * ----------------------------------------
 * We have two kinds of types:
 * 1. Domain types (Tag, Message, Owner) — used in React components and API
 *    logic. They use camelCase (ownerId, createdAt). Re-exported from the
 *    monorepo so the whole repo shares one contract.
 * 2. Database row types (TagRow, MessageRow) — the exact shape returned by
 *    Supabase/Postgres, with snake_case column names (owner_id, created_at).
 * We convert rows to domain types with tagRowToTag and messageRowToMessage so
 * the UI always works with camelCase. The Database interface describes the
 * full schema for the Supabase client so .insert() and .update() are typed.
 */

import type { Tag, Message } from "@repo/types";

export type { Tag, Message, Owner } from "@repo/types";

/**
 * One row from the "tags" table. Column names match the database exactly
 * (snake_case). We never use these directly in the UI; we convert with
 * tagRowToTag() so components receive Tag (camelCase).
 */
export interface TagRow {
  id: string;
  owner_id: string;
  label: string | null;
  created_at: string;
  is_active: boolean;
  finder_title?: string | null;
  finder_message?: string | null;
}

/**
 * One row from the "messages" table. Same idea: this is the raw DB shape.
 */
export interface MessageRow {
  id: string;
  tag_id: string;
  finder_token: string | null;
  content: string;
  created_at: string;
  read: boolean;
}

/**
 * Converts a tag row (snake_case) from the database into the domain Tag type
 * (camelCase). We use ?? undefined so null in the DB becomes undefined in
 * the app where we often prefer optional fields.
 */
export function tagRowToTag(row: TagRow): Tag {
  return {
    id: row.id,
    ownerId: row.owner_id,
    label: row.label ?? undefined,
    createdAt: row.created_at,
    isActive: row.is_active,
    finderTitle: row.finder_title ?? undefined,
    finderMessage: row.finder_message ?? undefined,
  };
}

/**
 * Converts a message row (snake_case) to the domain Message type (camelCase).
 */
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
 * Full Supabase Database type. It mirrors our Postgres schema (tables, columns).
 * We pass this to createClient<Database>() so that when we call
 * supabase.from("tags").insert({ ... }), TypeScript knows which columns exist
 * and which are required. Row = shape when reading; Insert = shape when
 * inserting (id and created_at are optional because the DB can generate them);
 * Update = partial shape for updates.
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
