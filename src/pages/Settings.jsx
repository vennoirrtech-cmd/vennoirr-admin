import { useState } from 'react';
import { Save, Store, User, Bell, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [storeData, setStoreData] = useState({
    name: 'VENNOIRR',
    email: 'support@vennoirr.com',
    currency: 'INR'
  });
  const [notifications, setNotifications] = useState({
    orders: true,
    stock: true,
    daily: false
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // API integration point for settings
      await new Promise(r => setTimeout(r, 800)); // simulated latency
      toast.success('Settings saved successfully!', {
        style: {
          background: 'var(--ink)',
          color: 'var(--surface)',
          borderRadius: '0',
          fontSize: '13px'
        }
      });
    } catch (error) {
      toast.error('Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--ink)] tracking-tight">Settings</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">Manage configuration and preferences.</p>
        </div>
        <button 
          className="h-[32px] inline-flex items-center gap-1.5 px-4 text-[13px] font-semibold text-[var(--surface)] bg-[var(--ink)] hover:bg-[var(--text-secondary)] transition-colors rounded-none disabled:opacity-50"
          onClick={handleSave} 
          disabled={loading}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          <span>{loading ? 'Saving' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Store Information */}
          <section className="bg-[var(--surface)] border border-[var(--border)] relative overflow-hidden flex flex-col">
            <div className="px-5 border-b border-[var(--border)] bg-[var(--bg)] h-[40px] flex items-center gap-2">
              <Store size={14} className="text-[var(--text-secondary)]" />
              <h2 className="text-[13px] font-bold text-[var(--ink)] uppercase tracking-[0.04em]">Store Information</h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Store Name</label>
                <input 
                  type="text" 
                  value={storeData.name} 
                  onChange={(e) => setStoreData({...storeData, name: e.target.value})}
                  className="w-full px-3 h-[36px] bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px] text-[var(--ink)] rounded-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Contact Email</label>
                <input 
                  type="email" 
                  value={storeData.email} 
                  onChange={(e) => setStoreData({...storeData, email: e.target.value})}
                  className="w-full px-3 h-[36px] bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px] text-[var(--ink)] rounded-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Currency Format</label>
                <select 
                  value={storeData.currency} 
                  onChange={(e) => setStoreData({...storeData, currency: e.target.value})}
                  className="w-full px-3 h-[36px] bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px] text-[var(--ink)] rounded-none appearance-none"
                >
                  <option value="INR">₹ (INR)</option>
                  <option value="USD">$ (USD)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Account Settings */}
          <section className="bg-[var(--surface)] border border-[var(--border)] relative overflow-hidden flex flex-col">
            <div className="px-5 border-b border-[var(--border)] bg-[var(--bg)] h-[40px] flex items-center gap-2">
              <User size={14} className="text-[var(--text-secondary)]" />
              <h2 className="text-[13px] font-bold text-[var(--ink)] uppercase tracking-[0.04em]">Admin Account</h2>
            </div>
            <div className="p-5 grid grid-cols-1 gap-5">
              <div className="space-y-1.5">
                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Admin Name</label>
                <input 
                  type="text" 
                  defaultValue="Super Admin"
                  className="w-full px-3 h-[36px] bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px] text-[var(--ink)] rounded-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Change Password</label>
                  <input 
                    type="password" 
                    placeholder="New Password"
                    className="w-full px-3 h-[36px] bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px] text-[var(--ink)] rounded-none placeholder:text-[var(--text-muted)]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Confirm Password</label>
                  <input 
                    type="password" 
                    placeholder="Confirm New Password"
                    className="w-full px-3 h-[36px] bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px] text-[var(--ink)] rounded-none placeholder:text-[var(--text-muted)]"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Notifications */}
          <section className="bg-[var(--surface)] border border-[var(--border)] relative overflow-hidden flex flex-col">
            <div className="px-4 border-b border-[var(--border)] bg-[var(--bg)] h-[40px] flex items-center gap-2">
              <Bell size={14} className="text-[var(--text-secondary)]" />
              <h2 className="text-[13px] font-bold text-[var(--ink)] uppercase tracking-[0.04em]">Notifications</h2>
            </div>
            <div className="p-4 space-y-3">
              {[
                { id: 'orders', label: 'Order Confirmations' },
                { id: 'stock', label: 'Low Stock Alerts' },
                { id: 'daily', label: 'Daily Sales Report' }
              ].map((item) => (
                <label key={item.id} className="flex flex-row items-center justify-between cursor-pointer p-3 border border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors group">
                  <span className="text-[13px] font-medium text-[var(--ink)]">{item.label}</span>
                  <div className="relative inline-block w-8 h-4 align-middle select-none transition duration-200 ease-in">
                      <input 
                        type="checkbox" 
                        id={`toggle-${item.id}`} 
                        className="peer absolute block w-4 h-4 bg-white border border-[var(--border)] appearance-none cursor-pointer checked:right-0 p-0 m-0 z-10 transition-all checked:bg-[var(--ink)] checked:border-[var(--ink)]" 
                        checked={notifications[item.id]} 
                        onChange={(e) => setNotifications({...notifications, [item.id]: e.target.checked})} 
                        style={{ right: notifications[item.id] ? '0' : '16px' }}
                      />
                      <label htmlFor={`toggle-${item.id}`} className="block overflow-hidden h-4 bg-[var(--surface-muted)] cursor-pointer border border-[var(--border)] peer-checked:bg-[var(--ink)] peer-checked:border-[var(--ink)] transition-colors"></label>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
