import { useState } from 'react';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/PageHeader';
import { useLocation } from 'wouter';
import { Eye, EyeOff } from 'lucide-react';

export default function Security() {
  const { logout } = useAuth();
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState({
    current_password: false,
    new_password: false,
    confirm_password: false
  });

  const togglePassword = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  async function handleChangePassword(e) {
    e.preventDefault();
    setError('');
    if (form.new_password !== form.confirm_password) {
      setError('New passwords do not match.');
      return;
    }
    if (form.new_password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await api.put('/auth/me/password', {
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setSuccess('Password changed successfully. Please sign in again.');
      setForm({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => { logout(); navigate('/login'); }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOutAll() {
    try {
      await api.post('/auth/logout', {});
      logout();
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader title="Security Settings" subtitle="Manage your password and sessions" />

      <div className="max-w-lg space-y-6">
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-base font-semibold text-text-primary mb-6">Change Password</h2>

          {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>}
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

          <form onSubmit={handleChangePassword} className="space-y-4">
            {[
              { key: 'current_password', label: 'Current Password' },
              { key: 'new_password', label: 'New Password' },
              { key: 'confirm_password', label: 'Confirm New Password' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">{label} *</label>
                <div className="relative">
                  <input
                    type={showPassword[key] ? "text" : "password"}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    required
                    className="w-full px-3 py-2 pr-10 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword(key)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary focus:outline-none"
                  >
                    {showPassword[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? 'Changing…' : 'Change Password'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-base font-semibold text-text-primary mb-2">Active Sessions</h2>
          <p className="text-sm text-text-secondary mb-4">Sign out from all devices, including this one.</p>
          <button
            onClick={handleSignOutAll}
            className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Sign out all devices
          </button>
        </div>
      </div>
    </div>
  );
}
