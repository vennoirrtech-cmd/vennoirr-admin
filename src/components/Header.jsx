import { Search, User, Menu, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import NotificationCenter from './NotificationCenter';

const Header = ({ toggleMobileSidebar }) => {
  const location = useLocation();
  
  // Basic breadcrumb logic for demonstration
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/orders')) return 'Orders';
    if (path.startsWith('/products')) return 'Products';
    if (path.startsWith('/inventory')) return 'Inventory';
    if (path.startsWith('/customers')) return 'Customers';
    if (path.startsWith('/settings')) return 'Settings';
    return 'Admin';
  };

  return (
    <header className="sticky top-0 z-30 flex h-[64px] items-center justify-between bg-[var(--surface)] px-6 border-b border-[var(--border)]">
      <div className="flex items-center gap-4 flex-1">
        <button 
          className="lg:hidden p-1.5 -ml-2 text-[var(--text-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-muted)] rounded transition-colors"
          onClick={toggleMobileSidebar}
        >
          <Menu size={20} />
        </button>
        
        {/* Breadcrumb / Title */}
        <div className="flex items-center text-sm font-semibold text-[var(--ink)]">
          <span className="capitalize">{getPageTitle()}</span>
          {/* Example of deeper breadcrumb if needed
          <ChevronRight size={16} className="mx-1 text-[var(--text-muted)]" />
          <span className="text-[var(--text-secondary)] font-normal">#VN-10234</span>
          */}
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* Search Command Palette Trigger */}
        <button className="hidden sm:flex items-center gap-2 h-[32px] px-3 bg-[var(--surface-muted)] text-[var(--text-secondary)] rounded outline-none hover:bg-[#e6e6e5] transition-colors border border-transparent focus-visible:border-[var(--ink)]">
          <Search size={14} />
          <span className="text-[13px] mr-4">Search...</span>
          <div className="flex items-center gap-0.5 opacity-60">
            <kbd className="font-sans text-[11px] bg-[var(--surface)] px-1.5 py-0.5 rounded shadow-sm border border-[var(--border)]">⌘</kbd>
            <kbd className="font-sans text-[11px] bg-[var(--surface)] px-1.5 py-0.5 rounded shadow-sm border border-[var(--border)]">K</kbd>
          </div>
        </button>

        {/* Search Icon Mobile */}
        <button className="sm:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--ink)] transition-colors">
          <Search size={18} />
        </button>

        {/* Notifications */}
        <NotificationCenter />

        <div className="h-5 w-px bg-[var(--border)] mx-1 hidden sm:block"></div>
        
        {/* Avatar Dropdown Trigger */}
        <button className="flex items-center gap-2 p-1 rounded hover:bg-[var(--surface-muted)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--border)]">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[var(--border)] text-[var(--ink)] shadow-sm">
            <span className="text-[11px] font-semibold">SA</span>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
