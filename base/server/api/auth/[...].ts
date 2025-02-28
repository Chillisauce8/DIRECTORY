import type { AuthConfig } from '@auth/core'
import { NuxtAuthHandler } from '#auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// The #auth import gives us access to the local auth config
export default NuxtAuthHandler({
  // A secret string used to sign tokens - make sure nobody can access this secret
  secret: process.env.NUXT_AUTH_SECRET,
  pages: {
    // The login page path - this is where users will be redirected if they visit a protected route
    signIn: '/auth/login',
    signOut: '/auth/login',
    error: '/auth/login'
  },
  callbacks: {
    // This callback is called whenever a JSON Web Token is created or updated
    async jwt({ token, user }) {
      if (user) {
        token.user = user
      }
      return token
    },
    // This callback is called whenever a session is checked
    async session({ session, token }) {
      // Send properties to the client
      if (token.user) {
        session.user = token.user
      }
      return session
    }
  },
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    CredentialsProvider.default({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: any) {
        try {
          if (!credentials?.email || !credentials?.password) return null
          
          const user = await $fetch('/api/query', {
            method: 'POST',
            body: {
              collection: 'users',
              operation: 'findOne',
              query: { email: credentials.email }
            }
          })

          if (!user?.data) return null

          // Temporarily check password without hashing
          const isValid = credentials.password === user.data.password
          if (!isValid) return null

          // Any object returned will be saved in `user` property of the JWT
          return {
            id: user.data._id,
            email: user.data.email,
            name: user.data.name
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ]
} satisfies AuthConfig)
