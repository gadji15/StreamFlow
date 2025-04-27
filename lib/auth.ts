// Fichier temporaire jusqu'à l'installation de next-auth

// Simuler la structure authOptions
export const authOptions = {
  providers: [],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVIP = user.isVIP;
        token.vipExpiry = user.vipExpiry;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isVIP = token.isVIP;
        session.user.vipExpiry = token.vipExpiry;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// Ajouter un commentaire explicatif en haut du fichier
/* 
IMPORTANT: Ce fichier est une version temporaire jusqu'à l'installation complète de next-auth.
Pour activer l'authentification complète, installez next-auth:
  npm install next-auth@latest
puis décommentez le code complet.
*/