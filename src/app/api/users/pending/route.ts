import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const pendingUsers = await prisma.user.findMany({
            where: { isApproved: false },
            orderBy: { createdAt: 'asc' }
        });
        return NextResponse.json(pendingUsers);
    } catch (error) {
        return NextResponse.json({ message: "Error fetching pending users" }, { status: 500 });
    }
}
