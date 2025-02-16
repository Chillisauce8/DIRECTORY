import { NuxtAuthHandler } from '#auth'
import type { AuthConfig } from '@auth/core'
import CredentialsProvider from '@auth/core/providers/credentials'

export default NuxtAuthHandler({
  secret: process.env.NUXT_AUTH_SECRET,
  pages: {
    signIn: '/auth/login'
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: any) {
        if (credentials.email && credentials.password) {
          return {
            id: '1',
            email: credentials.email,
            name: 'Test User'
          }
        }
        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user
      }
      return token
    },
    async session({ session, token }: any) {
      session.user = token.user
      return session
    }
  }
} as AuthConfig)
