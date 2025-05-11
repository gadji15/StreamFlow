// pages/api/admin/verify.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

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
    
    // Nouvelle logique Supabase : vérifier via user_roles_flat ou profiles
    const supabase = createServerSupabaseClient({ req, res });
    // Vérifier dans user_roles_flat
    const { data: roles, error } = await supabase
      .from('user_roles_flat')
      .select('role')
      .eq('user_id', uid)
      .in('role', ['admin', 'super_admin']);
    
    if (error) {
      return res.status(500).json({ message: 'Erreur lors de la vérification Supabase', error: error.message });
    }
    if (roles && roles.length > 0) {
      return res.status(200).json({
        isAdmin: true,
        adminData: { user_id: uid, roles: roles.map(r => r.role) }
      });
    } else {
      return res.status(403).json({
        isAdmin: false,
        message: "L'utilisateur n'est pas administrateur"
      });
    }
  } catch (error) {
    console.error('Error verifying admin:', error);
    return res.status(500).json({ 
      message: 'An error occurred while verifying admin status' 
    });
  }
}