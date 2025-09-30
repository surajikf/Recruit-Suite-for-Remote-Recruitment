import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const { signUp, signInWithGoogle, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(name, email, password);
      setSuccess('Signup successful. Your account is awaiting admin approval.');
      setTimeout(() => navigate('/login?msg=awaiting'), 800);
    } catch {}
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-semibold mb-4">Create account</h1>
        {success && (
          <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} required className="input w-full" />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required className="input w-full" />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" required className="input w-full" />
          </div>
          <button disabled={loading} className="btn btn-primary w-full" type="submit">
            {loading ? 'Creating…' : 'Sign Up'}
          </button>
        </form>
        <div className="my-4 text-center text-sm text-gray-500">or</div>
        <button onClick={() => signInWithGoogle()} className="btn w-full border-gray-300">
          Continue with Google
        </button>
        <div className="mt-4 text-sm">
          Already have an account? <Link className="text-blue-600" to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}










