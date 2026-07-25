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
        address: { label: "Address", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.message || !credentials?.signature || !credentials?.address) {
          console.error("❌ [NextAuth Authorize] Missing credentials fields");
          return null;
        }

        const normalizedAddress = (credentials.address as string).toLowerCase();

        try {
          console.log("➡️ [NextAuth Server] Posting signature verification to Django:", normalizedAddress);

          const response = await fetch("https://wob3.onrender.com/web3/verify_signature/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
            body: JSON.stringify({
              message: credentials.message,
              signature: credentials.signature,
              address: normalizedAddress,
            }),
          });

          const responseText = await response.text();
          console.log(`📡 [Django Status]: ${response.status}`);
          console.log(`📡 [Django Body]:`, responseText);

          if (!response.ok) {
            console.error(`❌ [Django Error ${response.status}]:`, responseText);
            return null;
          }

          let data: Record<string, any> = {};
          try {
            data = JSON.parse(responseText);
          } catch {
            console.warn("⚠️ Could not parse Django response as JSON, raw text stored.");
          }

          // Support SimpleJWT ('access'), dj-rest-auth ('access_token' or 'key'), or Knox ('token')
          const accessToken =
            data.access_token ||
            data.access ||
            data.token ||
            data.key ||
            data.jwt ||
            null;

          return {
            id: normalizedAddress,
            accessToken,
          };
        } catch (error) {
          console.error("❌ [NextAuth Server] Error fetching from Django:", error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as { accessToken: string }).accessToken;
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session as unknown as { accessToken: string }).accessToken =
          token.accessToken as string;
        if (session.user) {
          session.user.id = token.sub as string;
        }
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);