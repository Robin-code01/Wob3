import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

const authSecret =
  process.env.AUTH_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  "dev-secret-change-me";

export const authOptions: NextAuthConfig = {
  trustHost: true,
  secret: authSecret,
  providers: [
    Credentials({
      name: "Ethereum",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
        address: { label: "Address", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.message || !credentials?.signature || !credentials?.address) {
          return null;
        }

        try {
          const response = await fetch(
            `${process.env.DJANGO_API_URL}/web3/verify_signature/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                message: credentials.message,
                signature: credentials.signature,
                address: credentials.address,
              }),
            },
          );

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error("Django auth failed:", errData);
            throw new Error("Failed to authenticate");
          }

          const data = await response.json();

          return {
            id: data.address,
            address: data.address,
          };
        } catch (error) {
          console.error("Error authenticating user:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.address = (user as { address: string }).address;
      }
      return token;
    },
    async session({ session, token }) {
      (session as unknown as { address: string }).address = token.address as string;
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
