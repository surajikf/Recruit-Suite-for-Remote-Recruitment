import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/client';
import type { AppUser } from '../types';
import PageHeader from '../components/PageHeader';

export default function AdminDashboard() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['users'], queryFn: usersApi.getAll });
  const users = data?.data || [] as AppUser[];

  const approveMutation = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) => usersApi.approve(id, approved),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] })
  });
  
  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'user' | 'admin' }) => usersApi.updateRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] })
  });

  const stats = [
    { label: 'Total Users', value: users.length, trend: 'up' as const },
    { label: 'Approved Users', value: users.filter(u => u.is_approved).length, trend: 'up' as const },
    { label: 'Pending Approval', value: users.filter(u => !u.is_approved).length, trend: 'neutral' as const },
    { label: 'Admin Users', value: users.filter(u => u.role === 'admin').length, trend: 'neutral' as const },
  ];

  return (
    <div className="container py-6">
      <PageHeader 
        title="Admin Dashboard" 
        subtitle="Manage users, roles, and system settings"
        stats={stats}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Admin' }
        ]}
      />

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage user accounts, roles, and permissions</p>
        </div>
        
        <div className="card-body p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">User</th>
                    <th className="table-header-cell">Email</th>
                    <th className="table-header-cell">Signup Method</th>
                    <th className="table-header-cell">Role</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {users.map(user => (
                    <tr key={user.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name || 'No name'}</p>
                            <p className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="text-gray-900">{user.email}</span>
                      </td>
                      <td className="table-cell">
                        <span className="badge badge-gray">{user.signup_method}</span>
                      </td>
                      <td className="table-cell">
                        <select
                          className="select py-1 px-2 text-sm"
                          value={user.role}
                          onChange={e => roleMutation.mutate({ id: user.id, role: e.target.value as 'user' | 'admin' })}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${user.is_approved ? 'badge-success' : 'badge-warning'}`}>
                          {user.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => approveMutation.mutate({ id: user.id, approved: !user.is_approved })}
                            className={`btn btn-sm ${user.is_approved ? 'btn-warning' : 'btn-success'}`}
                            disabled={approveMutation.isPending}
                          >
                            {user.is_approved ? 'Revoke' : 'Approve'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}










