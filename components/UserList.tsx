import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function UserList() {
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    supabase
      .from('users')
      .select('*')
      .then(({ data }) => setUsers(data ?? []))
  }, [])

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.email}</li>
      ))}
    </ul>
  )
}