/**
 * Core domain types shared across the monorepo.
 *
 * These interfaces model the main entities in the system and should be
 * imported from here by both the web app and (later) the mobile app or
 * any shared backend logic. Keeping them in one place helps avoid
 * divergence between clients when the data model evolves.
 */

// QR Tag associated with a physical item owned by a user.
// One owner can have many tags (wallet, laptop bag, keys, etc.).
export interface Tag {
  id: string;
  ownerId: string;
  label?: string; // e.g. "My Wallet", "Laptop Bag"
  createdAt: string;
  isActive: boolean;
  /** Custom title shown to finders (e.g. "You found something?"). When empty, app uses default. */
  finderTitle?: string;
  /** Custom message shown to finders above the form. When empty, app uses default. */
  finderMessage?: string;
}

// Anonymous message sent by a finder when they scan a QR code.
// The finder is not an authenticated user; we only track them via a token.
export interface Message {
  id: string;
  tagId: string;
  finderToken: string; // anonymous session token
  content: string;
  createdAt: string;
  read: boolean;
}

// Minimal owner profile; we intentionally store only what we need.
// Authentication and password management are delegated to Supabase Auth.
export interface Owner {
  id: string;
  email: string;
  createdAt: string;
  plan: "free" | "premium";
}
