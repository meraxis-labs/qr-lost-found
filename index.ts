// QR Tag
export interface Tag {
  id: string;
  ownerId: string;
  label?: string; // e.g. "My Wallet", "Laptop Bag"
  createdAt: string;
  isActive: boolean;
}

// Anonymous message from finder to owner
export interface Message {
  id: string;
  tagId: string;
  finderToken: string; // anonymous session token
  content: string;
  createdAt: string;
  read: boolean;
}

// Owner profile (minimal, privacy-first)
export interface Owner {
  id: string;
  email: string;
  createdAt: string;
  plan: "free" | "premium";
}
