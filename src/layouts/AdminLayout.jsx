import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { adminAuthService } from '../services/api';

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isAuthenticated = adminAuthService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex font-inter text-[var(--ink)]">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        setIsCollapsed={setSidebarCollapsed}
        isMobileOpen={mobileSidebarOpen}
        setIsMobileOpen={setMobileSidebarOpen}
      />
      
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${sidebarCollapsed ? 'lg:ml-[64px]' : 'lg:ml-[240px]'}`}>
        <Header 
          toggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[var(--bg)] relative p-6 max-w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
