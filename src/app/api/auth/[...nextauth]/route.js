import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import connectMongoDB from "@/lib/mongodb";
import User from "@/models/user";

export const authOptions = {
  secret: "SECRET",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "password", type: "password" },
      },

      authorize: async (credentials) => {
        await connectMongoDB();

        const user = await User.findOne({ email: credentials.email }).lean();

        if (!user) {
          return null;
        }

        // const match = await user.comparePassword(password);
        // if (!match) return NextResponse.json({ message: "Password not match" });

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      if (user) token.user = user;
      if (trigger === "update" && session.user) token.user = session.user;

      return token;
    },
    session: async ({ session, token, newSession, trigger }) => {
      session.user = token.user;
      if (trigger === "update" && newSession.user) session.user = newSession.user;

      return session;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
