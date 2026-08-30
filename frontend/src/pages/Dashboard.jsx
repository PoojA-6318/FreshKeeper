import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, AlertTriangle, CheckCircle2, Plus, TrendingDown,
  UtensilsCrossed, PackageX, Refrigerator
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { inventoryAPI, refrigeratorsAPI, notificationsAPI } from '../services/api';
import { getExpiryStatus, formatDate } from '../utils/dateUtils';
import { CATEGORIES, EXPIRY_STATUS } from '../utils/constants';
import ExpiryBadge from '../components/ExpiryBadge';
import Loading from '../components/Loading';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [fridges, setFridges] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [invRes, fridgeRes, notifRes] = await Promise.allSettled([
          inventoryAPI.list(),
          refrigeratorsAPI.list(),
          notificationsAPI.list(),
        ]);
        if (invRes.status === 'fulfilled') setInventory(invRes.value.data || []);
        if (fridgeRes.status === 'fulfilled') setFridges(fridgeRes.value.data || []);
        if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data || []);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const stats = {
    total: inventory.length,
    expiringSoon: inventory.filter(i => getExpiryStatus(i.expiry_date) === 'soon').length,
    expiringToday: inventory.filter(i => getExpiryStatus(i.expiry_date) === 'today').length,
    expired: inventory.filter(i => getExpiryStatus(i.expiry_date) === 'expired').length,
    normal: inventory.filter(i => getExpiryStatus(i.expiry_date) === 'normal').length,
  };

  const urgentItems = inventory
    .filter(i => ['soon', 'today', 'expired'].includes(getExpiryStatus(i.expiry_date)))
    .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date))
    .slice(0, 6);

  const recentItems = [...inventory]
    .sort((a, b) => new Date(b.date_added) - new Date(a.date_added))
    .slice(0, 5);

  const getHour = () => new Date().getHours();
  const greeting = getHour() < 12 ? 'Good morning' : getHour() < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return <Loading message="Loading your dashboard..." />;

  return (
    <div className="page-wrapper">
      {/* Greeting */}
      <div className="dashboard-greeting">
        <div>
          <h1 className="dashboard-greeting-title">
            {greeting}, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="dashboard-greeting-sub">
            {stats.expired > 0
              ? `⚠️ You have ${stats.expired} expired item${stats.expired > 1 ? 's' : ''} that need attention.`
              : stats.expiringSoon + stats.expiringToday > 0
              ? `🟡 ${stats.expiringSoon + stats.expiringToday} item${stats.expiringSoon + stats.expiringToday > 1 ? 's are' : ' is'} expiring soon.`
              : '✅ All your food is fresh! Great job.'}
          </p>
        </div>
        <Link to="/inventory/add" className="btn btn-primary" id="btn-dashboard-add-food">
          <Plus size={16} /> Add Food
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
            <Package size={22} />
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}>
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-value">{stats.normal}</div>
          <div className="stat-label">Fresh Items</div>
        </div>
        <div className="stat-card stat-card--warn">
          <div className="stat-icon" style={{ background: '#FEF9C3', color: '#CA8A04' }}>
            <AlertTriangle size={22} />
          </div>
          <div className="stat-value">{stats.expiringSoon + stats.expiringToday}</div>
          <div className="stat-label">Expiring Soon</div>
        </div>
        <div className="stat-card stat-card--danger">
          <div className="stat-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}>
            <TrendingDown size={22} />
          </div>
          <div className="stat-value">{stats.expired}</div>
          <div className="stat-label">Expired</div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="dashboard-grid">
        {/* Urgent items */}
        <div className="card card-padding">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display" style={{ color: 'var(--charcoal)' }}>⚠️ Needs Attention</h3>
            <Link to="/inventory?filter=urgent" className="text-sm text-orange font-semibold" id="link-view-urgent">
              View all →
            </Link>
          </div>
          {urgentItems.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <div className="empty-state-icon">✅</div>
              <h3>All fresh!</h3>
              <p>No items expiring soon.</p>
            </div>
          ) : (
            <div className="urgent-list">
              {urgentItems.map(item => {
                const cat = CATEGORIES.find(c => c.label === item.item_type?.name);
                return (
                  <div key={item.inventory_id} className="urgent-item">
                    <span className="urgent-item-emoji">{cat?.emoji || '📦'}</span>
                    <div className="urgent-item-info">
                      <p className="urgent-item-name">{item.name}</p>
                      <p className="urgent-item-location">{item.refrigerator?.name}</p>
                    </div>
                    <ExpiryBadge expiryDate={item.expiry_date} size="xs" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Fridges overview */}
        <div className="card card-padding">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display" style={{ color: 'var(--charcoal)' }}>🧊 My Storage</h3>
            <Link to="/refrigerators" className="text-sm text-orange font-semibold" id="link-view-fridges">
              Manage →
            </Link>
          </div>
          {fridges.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <div className="empty-state-icon">🧊</div>
              <h3>No refrigerators yet</h3>
              <Link to="/refrigerators" className="btn btn-primary btn-sm mt-2" id="btn-add-first-fridge">
                <Plus size={13} /> Add Refrigerator
              </Link>
            </div>
          ) : (
            <div className="fridge-list">
              {fridges.map(fridge => {
                const count = inventory.filter(i => i.refrigerator?.refrigerator_id === fridge.refrigerator_id).length;
                const expired = inventory.filter(i =>
                  i.refrigerator?.refrigerator_id === fridge.refrigerator_id &&
                  getExpiryStatus(i.expiry_date) === 'expired'
                ).length;
                return (
                  <div key={fridge.refrigerator_id} className="fridge-card">
                    <div className="fridge-card-icon">
                      <Refrigerator size={20} />
                    </div>
                    <div className="fridge-card-info">
                      <p className="fridge-card-name">{fridge.name}</p>
                      <p className="fridge-card-count">{count} item{count !== 1 ? 's' : ''}</p>
                    </div>
                    {expired > 0 && (
                      <span className="badge badge-expired">{expired} expired</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recently added */}
        <div className="card card-padding">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display" style={{ color: 'var(--charcoal)' }}>🕐 Recently Added</h3>
            <Link to="/inventory" className="text-sm text-orange font-semibold" id="link-view-inventory">
              All items →
            </Link>
          </div>
          {recentItems.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <div className="empty-state-icon">📦</div>
              <h3>No items yet</h3>
              <Link to="/inventory/add" className="btn btn-primary btn-sm mt-2" id="btn-add-food-recent">
                <Plus size={13} /> Add Food
              </Link>
            </div>
          ) : (
            <div className="recent-list">
              {recentItems.map(item => {
                const cat = CATEGORIES.find(c => c.label === item.item_type?.name);
                return (
                  <div key={item.inventory_id} className="recent-item">
                    <span style={{ fontSize: '1.25rem' }}>{cat?.emoji || '📦'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--charcoal)', marginBottom: 0 }}>{item.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                        {item.quantity} {item.unit} · {formatDate(item.date_added)}
                      </p>
                    </div>
                    <ExpiryBadge expiryDate={item.expiry_date} size="xs" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications preview */}
        <div className="card card-padding">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display" style={{ color: 'var(--charcoal)' }}>🔔 Notifications</h3>
            <Link to="/notifications" className="text-sm text-orange font-semibold" id="link-view-notifications">
              See all →
            </Link>
          </div>
          {notifications.slice(0, 5).length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <div className="empty-state-icon">🔔</div>
              <h3>No notifications</h3>
              <p>You're all caught up!</p>
            </div>
          ) : (
            <div className="notif-preview-list">
              {notifications.slice(0, 5).map(n => (
                <div key={n.notification_id} className={`notif-preview-item ${!n.is_read ? 'unread' : ''}`}>
                  <span className="notif-preview-dot" />
                  <p className="notif-preview-text">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
