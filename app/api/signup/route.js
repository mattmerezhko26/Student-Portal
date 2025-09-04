import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        await dbConnect();
        
        const user = await User.findOne({ email: credentials.email });
        
        if (user && bcrypt.compareSync(credentials.password, user.passwordHash)) {
          return {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }
        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
});

export { handler as GET, handler as POST };