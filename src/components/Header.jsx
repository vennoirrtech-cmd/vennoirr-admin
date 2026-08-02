import { Bell, Search, User, Menu } from 'lucide-react';
import './Header.css';

const Header = ({ toggleSidebar }) => {
  return (
    <header className="header glass">
      <div className="header-left">
        <button className="mobile-toggle" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="header-search">
        <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search products, orders..." />
        </div>
      </div>

      <div className="header-actions">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        <div className="profile-menu">
          <div className="avatar">
            <User size={20} />
          </div>
          <div className="profile-info">
            <span className="name">Super Admin</span>
            <span className="role">super_admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
