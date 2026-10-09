import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Tag, Users, MessageSquare, BarChart2, Settings, UserPlus, CreditCard, LogOut, ChevronLeft, ChevronRight, Menu, RotateCcw, Truck } from 'lucide-react';
import { adminAuthService } from '../services/api';

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      adminAuthService.logout();
      navigate('/login');
    }
  };

  const navGroups = [
    {
      label: 'Overview',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
      ]
    },
    {
      label: 'Selling',
      items: [
        { name: 'Orders', path: '/orders', icon: ShoppingBag },
        { name: 'Shipping', path: '/shipping', icon: Truck },
        { name: 'Returns, RMA', path: '/returns', icon: RotateCcw },
        { name: 'Products', path: '/products', icon: Package },
        { name: 'Inventory', path: '/inventory', icon: Package }, // Can refine icon later
        { name: 'Discounts', path: '/discounts', icon: Tag },
      ]
    },
    {
      label: 'Customers',
      items: [
        { name: 'Customers', path: '/customers', icon: Users },
        { name: 'Reviews', path: '/reviews', icon: MessageSquare },
      ]
    },
    {
      label: 'Analytics',
      items: [
        { name: 'Reports', path: '/reports', icon: BarChart2 },
      ]
    },
    {
      label: 'Settings',
      items: [
        { name: 'Storefront', path: '/storefront', icon: LayoutDashboard },
        { name: 'Store Settings', path: '/settings', icon: Settings },
        { name: 'Team', path: '/team', icon: UserPlus },
        { name: 'Payments', path: '/payments', icon: CreditCard },
      ]
    }
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 z-50 h-screen bg-[var(--surface-muted)] border-r border-[var(--border)] transition-all duration-200 ease-out flex flex-col ${
        isMobileOpen ? 'translate-x-0 w-[240px]' : '-translate-x-full lg:translate-x-0'
      } ${isCollapsed && !isMobileOpen ? 'lg:w-[64px]' : 'lg:w-[240px]'}`}
    >
      <div className="h-[64px] flex items-center justify-between px-4 border-b border-[var(--border)]">
        <div className="flex items-center overflow-hidden">
          {(!isCollapsed || isMobileOpen) ? (
            <h2 className="text-sm font-semibold tracking-wide uppercase text-[var(--ink)] truncate transition-opacity duration-200">VENNOIRR</h2>
          ) : (
            <div className="w-8 h-8 bg-[var(--ink)] text-[var(--surface)] font-bold flex items-center justify-center rounded-sm text-sm shrink-0">V</div>
          )}
        </div>
        
        {/* Mobile toggle */}
        <button 
          className="lg:hidden p-1 text-[var(--text-secondary)] hover:text-[var(--ink)] transition-colors"
          onClick={() => setIsMobileOpen(false)}
        >
          <Menu size={20} />
        </button>

        {/* Desktop collapse toggle */}
        <button 
          className="hidden lg:flex p-1 text-[var(--text-secondary)] hover:text-[var(--ink)] transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar">
        {navGroups.map((group, groupIdx) => (
          <div key={group.label} className={groupIdx > 0 ? 'mt-6' : ''}>
            {(!isCollapsed || isMobileOpen) && (
              <p className="px-4 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {group.label}
              </p>
            )}
            <ul className="space-y-[1px]">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                
                return (
                  <li key={item.name}>
                    <Link 
                      to={item.path} 
                      className={`flex items-center h-[44px] relative transition-colors ${
                        isActive 
                          ? 'bg-[var(--surface)] text-[var(--ink)]' 
                          : 'text-[var(--text-secondary)] hover:bg-[var(--surface)]'
                      } ${(!isCollapsed || isMobileOpen) ? 'px-4' : 'justify-center px-0'}`}
                      onClick={() => setIsMobileOpen(false)}
                      title={isCollapsed && !isMobileOpen ? item.name : undefined}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--ink)]"></div>
                      )}
                      <Icon size={20} strokeWidth={isActive ? 2 : 1.5} className="shrink-0" />
                      {(!isCollapsed || isMobileOpen) && (
                        <span className={`ml-3 text-sm transition-opacity duration-200 ${isActive ? 'font-medium' : 'font-normal'}`}>
                          {item.name}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-auto p-4 border-t border-[var(--border)]">
        {(!isCollapsed || isMobileOpen) ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[var(--border)] flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-[var(--ink)]">SA</span>
              </div>
              <div className="truncate">
                <p className="text-[13px] font-medium text-[var(--ink)] truncate">superadmin</p>
                <p className="text-[11px] text-[var(--text-muted)] truncate">System Admin</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface)] rounded transition-colors shrink-0"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--border)] flex items-center justify-center shrink-0" title="superadmin">
              <span className="text-xs font-semibold text-[var(--ink)]">SA</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface)] rounded transition-colors shrink-0"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
