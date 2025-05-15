import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db/connect";
import User from "@/models/user.model";
import { UserRole } from "@/types";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          throw new Error("Invalid credentials");
        }

        try {
          console.log("Connecting to database...");
          await dbConnect();
          console.log("Connected to database successfully");

          console.log(`Looking for user with email: ${credentials.email}`);
          const user = await User.findOne({ email: credentials.email }).exec();

          if (!user) {
            console.log(`No user found with email: ${credentials.email}`);
            throw new Error("Invalid credentials");
          }

          console.log("User found, comparing passwords...");
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log(`Password validation result: ${isPasswordValid}`);

          if (!isPasswordValid) {
            console.log("Password validation failed");
            throw new Error("Invalid credentials");
          }

          console.log("Authentication successful");
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw new Error("Invalid credentials");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as UserRole;
        session.user.image = token.picture as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// Extend the next-auth session types
declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    image?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      image?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
