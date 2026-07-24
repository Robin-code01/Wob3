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
          const response = await fetch("https://wob3.onrender.com/web3/verify_signature/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: credentials.message,
              signature: credentials.signature,
              address: credentials.address,
            }),
          });

          if (!response.ok) {
            console.error("Backend verification failed:", await response.text());
            return null;
          }

          const data = await response.json();

          return {
            id: credentials.address as string,
            accessToken: data.access_token || data.token || null,
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
        token.accessToken = (user as { accessToken: string }).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      (session as unknown as { accessToken: string }).accessToken =
        token.accessToken as string;
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);