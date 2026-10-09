import { Bell, ShoppingBag, Package, RotateCcw, ShieldAlert, Check, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const mockNotifications = [
  {
    id: 'n1',
    type: 'critical',
    title: 'Stock Critical',
    message: 'Basic Tee - Black (M) is at 0 units.',
    time: '2 mins ago',
    isRead: false
  },
  {
    id: 'n2',
    type: 'order',
    title: 'New Order Placed',
    message: '#VN-109 placed by Aryan Rao (₹4,500).',
    time: '15 mins ago',
    isRead: false
  },
  {
    id: 'n3',
    type: 'return',
    title: 'New Return Requested',
    message: 'Karan Mehra requested a return for #VN-102.',
    time: '1 hour ago',
    isRead: false
  },
  {
    id: 'n4',
    type: 'system',
    title: 'Deployment Complete',
    message: 'Storefront layout changes published live.',
    time: '5 hours ago',
    isRead: true
  },
  {
    id: 'n5',
    type: 'order',
    title: 'Volume Spike',
    message: '10 orders placed in the last minute.',
    time: '1 day ago',
    isRead: true
  }
];

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Unread count
  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getIcon = (type) => {
    switch(type) {
      case 'order': return <ShoppingBag size={14} className="text-[#3395FF]" />;
      case 'critical': return <AlertCircle size={14} className="text-[var(--error)]" />;
      case 'return': return <RotateCcw size={14} className="text-[var(--warning)]" />;
      case 'system': return <ShieldAlert size={14} className="text-[var(--success)]" />;
      default: return <Bell size={14} className="text-[var(--text-muted)]" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* TRIGGER */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-sm text-[var(--text-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-colors focus:outline-none"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-[5px] right-[6px] flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--error)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--error)] border border-[var(--surface)]"></span>
          </span>
        )}
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[340px] bg-[var(--surface)] border border-[var(--border)] shadow-xl z-50 rounded-sm overflow-hidden animate-in fade-in slide-in-from-top-2">
          
          <div className="flex items-center justify-between p-3 border-b border-[var(--border)] bg-[var(--surface-muted)]/30">
            <h3 className="text-[13px] font-bold text-[var(--ink)] tracking-wide">Notifications</h3>
            {unreadCount > 0 && (
              <button className="text-[11px] font-semibold text-[#3395FF] hover:underline flex items-center gap-1">
                <Check size={12} /> Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar bg-[var(--bg)]">
            {mockNotifications.length === 0 ? (
              <div className="p-8 text-center text-[12px] text-[var(--text-muted)] font-medium">
                You're all caught up!
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {mockNotifications.map(notification => (
                  <li 
                    key={notification.id} 
                    className={`p-3 relative flex gap-3 hover:bg-[var(--surface-muted)] cursor-pointer transition-colors ${!notification.isRead ? 'bg-[var(--surface)]' : 'bg-[var(--bg)] opacity-70'}`}
                  >
                    {!notification.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#3395FF]"></div>
                    )}
                    
                    <div className="w-8 h-8 rounded-full border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 pr-4">
                      <p className={`text-[12px] font-bold ${!notification.isRead ? 'text-[var(--ink)]' : 'text-[var(--text-secondary)]'}`}>
                        {notification.title}
                      </p>
                      <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 leading-snug">
                        {notification.message}
                      </p>
                      <p className="text-[10px] uppercase font-semibold tracking-wider text-[var(--text-muted)] mt-1.5">
                        {notification.time}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="p-2 border-t border-[var(--border)] bg-[var(--surface)]">
            <button className="w-full py-1.5 text-[12px] font-semibold text-[var(--text-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-colors rounded-sm">
              View All Logs
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
