import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Check if this is the first user, if so, make them an approved admin
        const userCount = await prisma.user.count();
        const isFirstUser = userCount === 0;

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: isFirstUser ? 'ADMIN' : 'USER',
                isApproved: isFirstUser, // First user is auto-approved
            }
        });

        return NextResponse.json({ message: 'User created successfully. Your account is pending administrator approval.' }, { status: 201 });

    } catch (error) {
        console.error('SIGNUP_ERROR', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
