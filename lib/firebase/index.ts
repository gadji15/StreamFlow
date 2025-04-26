// Configuration Firebase
export * from './config';

// Services d'authentification
export * from './auth';

// Services Firestore
export * from './firestore/movies';
export * from './firestore/series';
export * from './firestore/activity-logs';
export * from './firestore/statistics';

// Types
export type { AdminUser } from './auth';
export type { ActivityLog } from './firestore/activity-logs';
export type { Movie } from './firestore/movies';
export type { Series, Episode } from './firestore/series';
export type { Statistics } from './firestore/statistics';