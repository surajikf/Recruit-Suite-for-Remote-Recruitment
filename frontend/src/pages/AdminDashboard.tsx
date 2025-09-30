import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/client';
import type { AppUser } from '../types';

export default function AdminDashboard() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['users'], queryFn: usersApi.getAll });
  const users = data?.data || [] as AppUser[];

  const approveMutation = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) => usersApi.approve(id, approved),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] })
  });
  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'user' | 'admin' }) => usersApi.updateRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] })
  });

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>
      <div className="card p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Email</th>
              <th className="py-2">Name</th>
              <th className="py-2">Signup</th>
              <th className="py-2">Role</th>
              <th className="py-2">Approved</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b">
                <td className="py-2">{u.email}</td>
                <td className="py-2">{u.name || '-'}</td>
                <td className="py-2">{u.signup_method}</td>
                <td className="py-2">
                  <select
                    className="input py-1 px-2"
                    value={u.role}
                    onChange={e => roleMutation.mutate({ id: u.id, role: e.target.value as 'user' | 'admin' })}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="py-2">{u.is_approved ? 'Yes' : 'No'}</td>
                <td className="py-2">
                  <button
                    className={`btn btn-sm ${u.is_approved ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => approveMutation.mutate({ id: u.id, approved: !u.is_approved })}
                  >
                    {u.is_approved ? 'Revoke' : 'Approve'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}










