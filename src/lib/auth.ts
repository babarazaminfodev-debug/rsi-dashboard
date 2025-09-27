import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    throw new Error('Please enter an email and password');
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user) {
                    throw new Error('No user found with this email');
                }

                if (!user.isApproved) {
                    throw new Error('Your account is pending approval by an administrator.');
                }
                
                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    throw new Error('Incorrect password');
                }
                
                return {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    isApproved: user.isApproved,
                };
            }
        })
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.isApproved = (user as any).isApproved;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as any;
                session.user.isApproved = token.isApproved as boolean;
            }
            return session;
        }
    },
    pages: {
        signIn: '/', // Redirect users to homepage for login
        error: '/',   // Redirect users to homepage on error
    },
    secret: process.env.AUTH_SECRET,
};
