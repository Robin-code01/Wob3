import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

// 1. Session 型の拡張
declare module "next-auth" {
  interface Session {
    accessToken?: string | null;
    user: {
      id?: string | null;
    } & DefaultSession["user"];
  }
}

// 2. JWT 型の拡張 (callbacks.jwt や session でエラーが出ないようにする)
declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string | null;
  }
}