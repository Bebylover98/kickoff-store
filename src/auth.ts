import NextAuth from 'next-auth';
import { getServerSession } from 'next-auth/next';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';


type SessionUser = {
  id?: string;
  role?: string;
};

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@kickoffstore.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Kickoff123!';

const providers: Array<any> = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
  Credentials({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      const email = String(credentials?.email ?? '').toLowerCase();
      const password = String(credentials?.password ?? '');

      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        return {
          id: 'admin',
          name: 'Store Admin',
          email: ADMIN_EMAIL,
          role: 'admin',
        };
      }

      const customer = await prisma.customer.findUnique({ where: { email } });
      if (!customer || !customer.passwordHash) {
        return null;
      }

      if (!(await verifyPassword(password, customer.passwordHash))) {
        return null;
      }

      return {
        id: customer.id,
        name: customer.name ?? customer.email,
        email: customer.email,
        role: 'customer',
      };
    },
  }),
];

export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET ?? 'development-secret',
  providers,
  pages: {
    signIn: '/login',
  },
  callbacks: {
  async signIn({ user, account }: any) {
      if (account?.provider === 'google' && user.email) {
        const dbCustomer = await prisma.customer.upsert({
          where: { email: user.email },
          update: {
            name: user.name ?? undefined,
            image: user.image ?? undefined,
            provider: 'google',
          },
          create: {
            email: user.email,
            name: user.name ?? 'Customer',
            image: user.image ?? undefined,
            provider: 'google',
          },
        });
        // Overwrite the Google account id with our real Customer.id
        // so downstream jwt/session callbacks use the correct database id.
        user.id = dbCustomer.id;
      }
      return true;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.role = 'role' in user ? String(user.role) : 'customer';
        token.customerId = 'id' in user ? String(user.id) : token.sub;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as SessionUser).id = token.customerId as string | undefined;
        (session.user as SessionUser).role = token.role as string;
      }
      return session;
    },
  },
};

const authHandler = NextAuth(authConfig);

export const auth = async () => getServerSession(authConfig);
export const signIn = authHandler.signIn;
export const signOut = authHandler.signOut;

export default authHandler;