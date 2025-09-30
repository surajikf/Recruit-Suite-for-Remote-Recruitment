import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === 'true';
  const { signIn, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const awaiting = searchParams.get('msg') === 'awaiting';

  useEffect(() => {
    if (BYPASS_AUTH) {
      // If bypassing auth, jump to dashboard
      navigate('/');
    }
  }, [BYPASS_AUTH, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/');
    } catch {}
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-semibold mb-4">Sign in</h1>
        {awaiting && (
          <div className="mb-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
            Your account is awaiting admin approval
          </div>
        )}
        {error && (
          <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required className="input w-full" />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" required className="input w-full" />
          </div>
          <button disabled={loading} className="btn btn-primary w-full" type="submit">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <div className="mt-4 text-sm">
          No account? <Link className="text-blue-600" to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}



