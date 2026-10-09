import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAuthService } from '../services/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await adminAuthService.login(email, password);
      if (response.success) {
        toast.success('Successfully logged in');
        navigate('/');
      } else {
        setError(response.message || 'Login failed');
        toast.error(response.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--surface-muted)] relative overflow-hidden font-sans">
      <div className="relative z-10 w-full max-w-[360px] mx-4">
        <div className="bg-[var(--surface)] border border-[var(--border)] shadow-sm p-8 sm:p-10 flex flex-col">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black tracking-tight text-[var(--ink)] mb-2 uppercase" style={{ fontFamily: '"Fraunces", serif' }}>VENNOIRR</h2>
            <div className="h-px w-8 bg-[var(--ink)] mx-auto my-3"></div>
            <p className="text-[10px] font-semibold tracking-[0.1em] text-[var(--text-secondary)] uppercase">Operations Console</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 text-[13px] text-[var(--error)] bg-[var(--error)]/10 border border-[var(--error)]/20 text-center font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5 flex flex-col">
              <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.04em]">Email ID</label>
              <input
                type="email"
                placeholder="admin@vennoirr.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full px-3 h-[36px] bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px] text-[var(--ink)] placeholder:text-[var(--text-muted)] rounded-none disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5 flex flex-col">
              <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.04em]">Passkey</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full px-3 h-[36px] bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px] text-[var(--ink)] placeholder:text-[var(--text-muted)] rounded-none disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[36px] inline-flex items-center justify-center gap-2 px-4 bg-[var(--ink)] text-[var(--surface)] text-[13px] font-semibold hover:bg-[var(--text-secondary)] transition-colors focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed mt-2 rounded-none"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                'Secure Login'
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6 text-[11px] text-[var(--text-muted)] uppercase tracking-wide">
          &copy; {new Date().getFullYear()} VENNOIRR SYSTEMS
        </div>
      </div>
    </div>
  );
};

export default Login;
