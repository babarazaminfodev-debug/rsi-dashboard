import { Role } from '@prisma/client';
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: Role;
      isApproved: boolean;
    };
  }

  interface User {
      id: string;
      role: Role;
      isApproved: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    isApproved: boolean;
  }
}
