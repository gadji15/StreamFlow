import { auth, db, storage } from "./config";
import { formatUser, verifyAdminRole } from "./auth";
import * as adminsService from "./firestore/admins";
import * as moviesService from "./firestore/movies";
import * as seriesService from "./firestore/series";
import * as usersService from "./firestore/users";
import * as commentsService from "./firestore/comments";
import * as activityLogsService from "./firestore/activity-logs";
import * as statisticsService from "./firestore/statistics";

// Export everything
export {
  auth,
  db,
  storage,
  formatUser,
  verifyAdminRole,
  adminsService,
  moviesService,
  seriesService,
  usersService,
  commentsService,
  activityLogsService,
  statisticsService
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
  series: seriesService,
  users: usersService,
  comments: commentsService,
  activityLogs: activityLogsService,
  statistics: statisticsService
};

export default firebaseServices;