import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        await connectDB();

        const student = await Student.findOne({ email: credentials.email });

        if (!student) {
          throw new Error('No user found');
        }

        const isValid = await bcrypt.compare(credentials.password, student.password);

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: student._id.toString(),
          name: student.name,
          email: student.email,
          studentId: student.studentId,
          role: student.role,
          campusId: student.campusId,
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
        token.studentId = (user as any).studentId;
        token.role = (user as any).role;
        token.campusId = (user as any).campusId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).studentId = token.studentId;
        (session.user as any).role = token.role;
        (session.user as any).campusId = token.campusId;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/',
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
