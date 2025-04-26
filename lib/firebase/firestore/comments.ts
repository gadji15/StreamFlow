import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    DocumentData,
    QueryDocumentSnapshot,
    serverTimestamp,
    Timestamp
  } from "firebase/firestore";
  import { db } from "../config";
  import { logActivity } from "./activity-logs";
  
  // Collection name
  const COMMENTS_COLLECTION = "comments";
  
  // Comment interface
  export interface Comment {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    contentId: string;
    contentType: "movie" | "series" | "episode";
    contentTitle?: string;
    text: string;
    rating: number;
    status: "approved" | "pending" | "rejected";
    reportCount: number;
    reports?: {
      userId: string;
      reason: string;
      timestamp: Date | Timestamp;
    }[];
    createdAt: Date | Timestamp;
    updatedAt?: Date | Timestamp;
  }
  
  // Get all comments
  export const getAllComments = async (): Promise<Comment[]> => {
    try {
      const commentsSnapshot = await getDocs(collection(db, COMMENTS_COLLECTION));
      const comments: Comment[] = [];
      
      commentsSnapshot.forEach((doc) => {
        const data = doc.data();
        comments.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
          reports: data.reports ? data.reports.map((report: any) => ({
            ...report,
            timestamp: report.timestamp?.toDate() || new Date(),
          })) : [],
        } as Comment);
      });
      
      return comments;
    } catch (error) {
      console.error("Error getting comments:", error);
      throw error;
    }
  };
  
  // Get paginated comments
  export const getPaginatedComments = async (
    lastVisible: QueryDocumentSnapshot<DocumentData> | null = null,
    itemsPerPage: number = 10,
    filters: {
      status?: "approved" | "pending" | "rejected";
      contentType?: "movie" | "series" | "episode";
      contentId?: string;
      userId?: string;
      search?: string;
      minRating?: number;
      hasReports?: boolean;
    } = {}
  ): Promise<{
    comments: Comment[];
    lastVisible: QueryDocumentSnapshot<DocumentData> | null;
    hasMore: boolean;
  }> => {
    try {
      let commentsRef = collection(db, COMMENTS_COLLECTION);
      let constraints: any[] = [];
      
      // Add filters
      if (filters.status) {
        constraints.push(where("status", "==", filters.status));
      }
      
      if (filters.contentType) {
        constraints.push(where("contentType", "==", filters.contentType));
      }
      
      if (filters.contentId) {
        constraints.push(where("contentId", "==", filters.contentId));
      }
      
      if (filters.userId) {
        constraints.push(where("userId", "==", filters.userId));
      }
      
      if (filters.minRating) {
        constraints.push(where("rating", ">=", filters.minRating));
      }
      
      if (filters.hasReports) {
        constraints.push(where("reportCount", ">", 0));
      }
      
      // Add orderBy and pagination
      constraints.push(orderBy("createdAt", "desc"));
      
      if (lastVisible) {
        constraints.push(startAfter(lastVisible));
      }
      
      constraints.push(limit(itemsPerPage + 1)); // Get one extra to check if there are more
      
      const q = query(commentsRef, ...constraints);
      const commentsSnapshot = await getDocs(q);
      
      const comments: Comment[] = [];
      let newLastVisible: QueryDocumentSnapshot<DocumentData> | null = null;
      let hasMore = false;
      
      // Process results
      if (!commentsSnapshot.empty) {
        const docs = commentsSnapshot.docs;
        
        // Check if we have more results
        if (docs.length > itemsPerPage) {
          hasMore = true;
          docs.pop(); // Remove the extra item
        }
        
        // Get the last visible item for pagination
        newLastVisible = docs[docs.length - 1] || null;
        
        // Map documents to Comment objects
        docs.forEach((doc) => {
          const data = doc.data();
          
          // If there's a search filter, apply it client-side
          if (filters.search && 
              !data.text.toLowerCase().includes(filters.search.toLowerCase()) &&
              !data.userName.toLowerCase().includes(filters.search.toLowerCase())) {
            return;
          }
          
          comments.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate(),
            reports: data.reports ? data.reports.map((report: any) => ({
              ...report,
              timestamp: report.timestamp?.toDate() || new Date(),
            })) : [],
          } as Comment);
        });
      }
      
      return {
        comments,
        lastVisible: newLastVisible,
        hasMore,
      };
    } catch (error) {
      console.error("Error getting paginated comments:", error);
      throw error;
    }
  };
  
  // Get a comment by ID
  export const getCommentById = async (id: string): Promise<Comment | null> => {
    try {
      const commentDoc = await getDoc(doc(db, COMMENTS_COLLECTION, id));
      
      if (!commentDoc.exists()) {
        return null;
      }
      
      const data = commentDoc.data();
      return {
        id: commentDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
        reports: data.reports ? data.reports.map((report: any) => ({
          ...report,
          timestamp: report.timestamp?.toDate() || new Date(),
        })) : [],
      } as Comment;
    } catch (error) {
      console.error(`Error getting comment with ID ${id}:`, error);
      throw error;
    }
  };
  
  // Create a new comment
  export const createComment = async (
    comment: Omit<Comment, "id" | "createdAt" | "updatedAt" | "reportCount" | "reports" | "status">
  ): Promise<Comment> => {
    try {
      // Prepare comment data for Firestore
      const commentData = {
        ...comment,
        reportCount: 0,
        reports: [],
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      // Add comment to Firestore
      const commentRef = await addDoc(collection(db, COMMENTS_COLLECTION), commentData);
      
      // Get the created comment
      const createdCommentSnap = await getDoc(commentRef);
      const createdCommentData = createdCommentSnap.data();
      
      return {
        id: commentRef.id,
        ...createdCommentData,
        createdAt: createdCommentData?.createdAt?.toDate() || new Date(),
        updatedAt: createdCommentData?.updatedAt?.toDate(),
        reports: createdCommentData?.reports ? createdCommentData.reports.map((report: any) => ({
          ...report,
          timestamp: report.timestamp?.toDate() || new Date(),
        })) : [],
      } as Comment;
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  };
  
  // Update a comment
  export const updateComment = async (
    id: string,
    commentUpdates: Partial<Comment>,
    adminId?: string,
    adminName?: string
  ): Promise<Comment> => {
    try {
      // Get current comment data for comparison
      const currentCommentSnap = await getDoc(doc(db, COMMENTS_COLLECTION, id));
      
      if (!currentCommentSnap.exists()) {
        throw new Error(`Comment with ID ${id} not found`);
      }
      
      const currentComment = currentCommentSnap.data() as Comment;
      
      // Prepare update data
      const updateData = {
        ...commentUpdates,
        updatedAt: serverTimestamp(),
      };
      
      // Update comment in Firestore
      await updateDoc(doc(db, COMMENTS_COLLECTION, id), updateData);
      
      // Log activity if admin is updating the comment
      if (adminId && adminName) {
        await logActivity({
          adminId,
          adminName,
          action: "UPDATE",
          entityType: "COMMENT",
          entityId: id,
          entityName: `Comment by ${currentComment.userName}`,
          timestamp: new Date(),
          details: {
            before: {
              ...currentComment,
              createdAt: currentComment.createdAt instanceof Date ?
                currentComment.createdAt.toISOString() : currentComment.createdAt,
            },
            after: {
              ...currentComment,
              ...updateData,
              createdAt: currentComment.createdAt instanceof Date ?
                currentComment.createdAt.toISOString() : currentComment.createdAt,
            },
            contentTitle: currentComment.contentTitle
          }
        });
      }
      
      // Get the updated comment
      const updatedCommentSnap = await getDoc(doc(db, COMMENTS_COLLECTION, id));
      const updatedCommentData = updatedCommentSnap.data();
      
      return {
        id,
        ...updatedCommentData,
        createdAt: updatedCommentData?.createdAt?.toDate() || new Date(),
        updatedAt: updatedCommentData?.updatedAt?.toDate(),
        reports: updatedCommentData?.reports ? updatedCommentData.reports.map((report: any) => ({
          ...report,
          timestamp: report.timestamp?.toDate() || new Date(),
        })) : [],
      } as Comment;
    } catch (error) {
      console.error(`Error updating comment with ID ${id}:`, error);
      throw error;
    }
  };
  
  // Delete a comment
  export const deleteComment = async (
    id: string,
    adminId?: string,
    adminName?: string
  ): Promise<void> => {
    try {
      // Get comment data for logging
      const commentSnap = await getDoc(doc(db, COMMENTS_COLLECTION, id));
      
      if (!commentSnap.exists()) {
        throw new Error(`Comment with ID ${id} not found`);
      }
      
      const commentData = commentSnap.data() as Comment;
      
      // Delete comment from Firestore
      await deleteDoc(doc(db, COMMENTS_COLLECTION, id));
      
      // Log activity if admin is deleting the comment
      if (adminId && adminName) {
        await logActivity({
          adminId,
          adminName,
          action: "DELETE",
          entityType: "COMMENT",
          entityId: id,
          entityName: `Comment by ${commentData.userName}`,
          timestamp: new Date(),
          details: { 
            deletedComment: {
              ...commentData,
              createdAt: commentData.createdAt instanceof Date ?
                commentData.createdAt.toISOString() : commentData.createdAt,
            },
            contentTitle: commentData.contentTitle
          }
        });
      }
    } catch (error) {
      console.error(`Error deleting comment with ID ${id}:`, error);
      throw error;
    }
  };
  
  // Report a comment
  export const reportComment = async (
    id: string,
    report: {
      userId: string;
      reason: string;
    }
  ): Promise<Comment> => {
    try {
      // Get current comment data
      const commentDoc = await getDoc(doc(db, COMMENTS_COLLECTION, id));
      
      if (!commentDoc.exists()) {
        throw new Error(`Comment with ID ${id} not found`);
      }
      
      const commentData = commentDoc.data() as Comment;
      
      // Check if user has already reported this comment
      if (commentData.reports && commentData.reports.some(r => r.userId === report.userId)) {
        throw new Error("You have already reported this comment");
      }
      
      // Add report
      const newReport = {
        ...report,
        timestamp: serverTimestamp(),
      };
      
      const reports = commentData.reports || [];
      const updatedReports = [...reports, newReport];
      
      // Update comment with new report
      await updateDoc(doc(db, COMMENTS_COLLECTION, id), {
        reports: updatedReports,
        reportCount: updatedReports.length,
        updatedAt: serverTimestamp(),
      });
      
      // Get the updated comment
      const updatedCommentSnap = await getDoc(doc(db, COMMENTS_COLLECTION, id));
      const updatedCommentData = updatedCommentSnap.data();
      
      return {
        id,
        ...updatedCommentData,
        createdAt: updatedCommentData?.createdAt?.toDate() || new Date(),
        updatedAt: updatedCommentData?.updatedAt?.toDate(),
        reports: updatedCommentData?.reports ? updatedCommentData.reports.map((report: any) => ({
          ...report,
          timestamp: report.timestamp?.toDate() || new Date(),
        })) : [],
      } as Comment;
    } catch (error) {
      console.error(`Error reporting comment with ID ${id}:`, error);
      throw error;
    }
  };
  
  // Moderate a comment (approve, reject)
  export const moderateComment = async (
    id: string,
    status: "approved" | "rejected",
    adminId: string,
    adminName: string
  ): Promise<Comment> => {
    try {
      // Get current comment data
      const commentDoc = await getDoc(doc(db, COMMENTS_COLLECTION, id));
      
      if (!commentDoc.exists()) {
        throw new Error(`Comment with ID ${id} not found`);
      }
      
      const commentData = commentDoc.data() as Comment;
      
      // Update comment status
      await updateDoc(doc(db, COMMENTS_COLLECTION, id), {
        status,
        updatedAt: serverTimestamp(),
      });
      
      // Log activity
      await logActivity({
        adminId,
        adminName,
        action: "UPDATE",
        entityType: "COMMENT",
        entityId: id,
        entityName: `Comment by ${commentData.userName}`,
        timestamp: new Date(),
        details: { 
          action: "moderate_comment",
          oldStatus: commentData.status,
          newStatus: status,
          contentTitle: commentData.contentTitle
        }
      });
      
      // Get the updated comment
      const updatedCommentSnap = await getDoc(doc(db, COMMENTS_COLLECTION, id));
      const updatedCommentData = updatedCommentSnap.data();
      
      return {
        id,
        ...updatedCommentData,
        createdAt: updatedCommentData?.createdAt?.toDate() || new Date(),
        updatedAt: updatedCommentData?.updatedAt?.toDate(),
        reports: updatedCommentData?.reports ? updatedCommentData.reports.map((report: any) => ({
          ...report,
          timestamp: report.timestamp?.toDate() || new Date(),
        })) : [],
      } as Comment;
    } catch (error) {
      console.error(`Error moderating comment with ID ${id}:`, error);
      throw error;
    }
  };
  
  // Get comments statistics
  export const getCommentsStatistics = async (): Promise<{
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    reported: number;
  }> => {
    try {
      const commentsSnapshot = await getDocs(collection(db, COMMENTS_COLLECTION));
      
      let total = 0;
      let approved = 0;
      let pending = 0;
      let rejected = 0;
      let reported = 0;
      
      commentsSnapshot.forEach((doc) => {
        const data = doc.data();
        total++;
        
        if (data.status === "approved") {
          approved++;
        } else if (data.status === "pending") {
          pending++;
        } else if (data.status === "rejected") {
          rejected++;
        }
        
        if (data.reportCount > 0) {
          reported++;
        }
      });
      
      return {
        total,
        approved,
        pending,
        rejected,
        reported,
      };
    } catch (error) {
      console.error("Error getting comments statistics:", error);
      throw error;
    }
  };