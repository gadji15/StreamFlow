import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdmin } from '@/lib/firebase/firestore/admins';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { uid } = req.query;

    if (!uid || typeof uid !== 'string') {
      return res.status(400).json({ message: 'Missing or invalid uid parameter' });
    }

    // Verify if the user is an admin
    const adminStatus = await verifyAdmin(uid);
    
    // Return the admin status
    return res.status(200).json(adminStatus);
  } catch (error) {
    console.error('Error verifying admin:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}