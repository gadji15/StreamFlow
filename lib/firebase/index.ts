import { auth, db, storage } from "./config";
import { formatUser, verifyAdminRole } from "./auth";
import * as adminsService from "./firestore/admins";
import * as moviesService from "./firestore/movies";
import * as activityLogsService from "./firestore/activity-logs";

// Export everything
export {
  auth,
  db,
  storage,
  formatUser,
  verifyAdminRole,
  adminsService,
  moviesService,
  activityLogsService
};

// Export a default object for easier imports
const firebaseServices = {
  auth,
  db,
  storage,
  formatUser,
  verifyAdminRole,
  admins: adminsService,
  movies: moviesService,
  activityLogs: activityLogsService
};

export default firebaseServices;