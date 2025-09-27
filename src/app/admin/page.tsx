import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN' || !session.user.isApproved) {
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <header className="mb-8">
                 <h1 className="text-3xl font-bold">Admin Panel</h1>
                 <p className="text-gray-400">Manage user approvals.</p>
            </header>
            <main>
                <AdminDashboard />
            </main>
        </div>
    )
}
