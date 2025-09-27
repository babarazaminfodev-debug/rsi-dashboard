import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Dashboard } from "@/components/Dashboard";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    // In a real app, you might render a landing page here.
    // For now, the login/signup is handled by the header and modals triggered from it.
    // The Dashboard component itself will handle the unauthenticated state view.
  }

  return (
    <div>
        {session?.user?.role === 'ADMIN' && (
             <div className="bg-yellow-500 text-black text-center p-2 text-sm">
                <Link href="/admin" className="font-bold hover:underline">
                    Admin Panel
                </Link>
            </div>
        )}
      <Dashboard session={session} />
    </div>
  );
}
