import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import accountingApi from "../../accounting_api";

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
        try {
          let { ok, token, user } = await accountingApi.post(`/signin`, {
            email: credentials.email,
            password: credentials.password,
          })
          if (!ok) {
            return null
          }

          user = { ...user, token } // add token to user
          return user
        } catch (error) {
          return error
        }
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
