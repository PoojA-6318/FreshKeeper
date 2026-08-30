import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Package, BellRing, BarChart3,
  ShoppingCart, Home, Refrigerator, LogOut, Leaf
} from 'lucide-react';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/household', icon: Home, label: 'Household' },
  { to: '/refrigerators', icon: Refrigerator, label: 'Refrigerators' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/notifications', icon: BellRing, label: 'Notifications' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/shopping-list', icon: ShoppingCart, label: 'Shopping List' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'FK';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Leaf size={20} strokeWidth={2.5} />
        </div>
        <span className="sidebar-logo-text">FreshKeeper</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <p className="sidebar-section-label">Menu</p>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }>
            <Icon size={18} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.name || 'User'}</p>
            <p className="sidebar-user-email">{user?.email || ''}</p>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-icon sidebar-logout"
          onClick={handleLogout}
          title="Logout"
          id="btn-logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
