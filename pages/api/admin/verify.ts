// pages/api/admin/verify.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdmin } from '@/lib/firebase/firestore/admins';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({ message: 'UID is required' });
    }
    
    const result = await verifyAdmin(uid);
    
    if (result.isAdmin) {
      return res.status(200).json({ 
        isAdmin: true, 
        adminData: result.adminData 
      });
    } else {
      return res.status(403).json({ 
        isAdmin: false, 
        message: result.message 
      });
    }
  } catch (error) {
    console.error('Error verifying admin:', error);
    return res.status(500).json({ 
      message: 'An error occurred while verifying admin status' 
    });
  }
}