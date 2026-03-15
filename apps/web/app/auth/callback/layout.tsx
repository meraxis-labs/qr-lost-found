/**
 * Force dynamic rendering for the auth callback route.
 * Prerendering would fail because this page relies on URL hash and client-only auth.
 */
export const dynamic = "force-dynamic";

export default function AuthCallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
