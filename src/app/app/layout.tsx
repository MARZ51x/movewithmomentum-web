import { redirect } from "next/navigation";
import { Brand } from "@/components/Brand";
import { Avatar } from "@/components/Avatar";
import { RoleBadge } from "@/components/Badges";
import { HubNav } from "@/components/HubNav";
import { getCurrentUser } from "@/lib/session";
import { logoutAction } from "@/app/actions/auth";

export default async function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth gate: the entire /app subtree requires a session.
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex-1 flex flex-col">
      <header className="sticky top-0 z-20 glass border-b divider">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <Brand size="sm" href="/app" />
            <div className="hidden md:block">
              <HubNav role={user.role} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right leading-tight">
              <p className="text-sm font-semibold truncate max-w-[14ch]">
                {user.fullName}
              </p>
              <p className="text-xs text-muted">{user.neighborhood}</p>
            </div>
            <Avatar name={user.fullName} verified={user.isVerifiedAgent} />
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-xs text-on-surface-variant hover:text-error transition px-2 py-1"
                title="Sign out"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
        {/* mobile nav row */}
        <div className="md:hidden border-t divider px-2 py-1 overflow-x-auto">
          <HubNav role={user.role} />
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <div className="mb-5 flex items-center gap-3">
          <RoleBadge role={user.role} />
          {user.isVerifiedAgent && (
            <span className="text-xs text-muted">License #{user.licenseNumber}</span>
          )}
        </div>
        {children}
      </main>
    </div>
  );
}
