import { useState } from 'react';
import { Save, Store, User, Bell } from 'lucide-react';
import { toast } from 'react-hot-toast';
import './Settings.css';

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
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted">Manage your store preferences and admin configurations.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
          <Save size={18} />
          <span>{loading ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="settings-grid">
        {/* Store Information */}
        <section className="settings-section glass">
          <div className="section-header">
            <Store size={20} className="section-icon" />
            <h2>Store Information</h2>
          </div>
          <div className="section-content">
            <div className="form-group">
              <label>Store Name</label>
              <input type="text" value={storeData.name} onChange={(e) => setStoreData({...storeData, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Contact Email</label>
              <input type="email" value={storeData.email} onChange={(e) => setStoreData({...storeData, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Currency Format</label>
              <select value={storeData.currency} onChange={(e) => setStoreData({...storeData, currency: e.target.value})}>
                <option value="INR">₹ (INR)</option>
                <option value="USD">$ (USD)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Account Settings */}
        <section className="settings-section glass">
          <div className="section-header">
            <User size={20} className="section-icon" />
            <h2>Admin Account</h2>
          </div>
          <div className="section-content">
            <div className="form-group">
              <label>Admin Name</label>
              <input type="text" defaultValue="Super Admin" />
            </div>
            <div className="form-group">
              <label>Change Password</label>
              <input type="password" placeholder="New Password" />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" placeholder="Confirm New Password" />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="settings-section glass">
          <div className="section-header">
            <Bell size={20} className="section-icon" />
            <h2>Notifications</h2>
          </div>
          <div className="section-content">
            <label className="toggle-label">
              <span>Order Confirmations</span>
              <input type="checkbox" checked={notifications.orders} onChange={(e) => setNotifications({...notifications, orders: e.target.checked})} className="toggle" />
            </label>
            <label className="toggle-label">
              <span>Low Stock Alerts</span>
              <input type="checkbox" checked={notifications.stock} onChange={(e) => setNotifications({...notifications, stock: e.target.checked})} className="toggle" />
            </label>
            <label className="toggle-label">
              <span>Daily Sales Report</span>
              <input type="checkbox" checked={notifications.daily} onChange={(e) => setNotifications({...notifications, daily: e.target.checked})} className="toggle" />
            </label>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
