import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authOptions: NextAuthConfig = {
  providers: [
    Credentials({
      name: "Ethereum",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.message || !credentials?.signature) {
          return null;
        }

        try {
          const response = await fetch(
            `${process.env.DJANGO_API_URL}/api/auth/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                message: credentials.message,
                signature: credentials.signature,
              }),
            },
          );

          if (!response.ok) {
            throw new Error("Failed to authenticate");
          }

          const data = await response.json();

          return {
            id: data.address,
            accessToken: data.access_token,
          };
        } catch (error) {
          console.error("Error authenticating user:", error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
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
