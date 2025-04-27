declare namespace NodeJS {
  interface ProcessEnv {
    // Firebase
    NEXT_PUBLIC_FIREBASE_API_KEY: string;
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
    NEXT_PUBLIC_FIREBASE_APP_ID: string;
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: string;
    
    // Firebase Admin
    FIREBASE_ADMIN_CLIENT_EMAIL: string;
    FIREBASE_ADMIN_PRIVATE_KEY: string;
    FIREBASE_ADMIN_PROJECT_ID: string;
    
    // Next Auth
    NEXTAUTH_SECRET: string;
    NEXTAUTH_URL: string;
    
    // OAuth
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    
    // Cloudinary
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: string;
    NEXT_PUBLIC_CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
    
    // TMDB
    NEXT_PUBLIC_TMDB_API_KEY: string;
    TMDB_API_KEY: string;
    
    // Application
    NEXT_PUBLIC_APP_URL: string;
    NODE_ENV: 'development' | 'production' | 'test';
    
    // Sécurité API
    ALLOWED_ORIGINS?: string;
    API_RATE_LIMIT?: string;
    API_RATE_LIMIT_WINDOW_MS?: string;
    AUTH_WEBHOOK_SECRET?: string;
    PASSWORD_RESET_TOKEN_EXPIRY?: string;
  }
}