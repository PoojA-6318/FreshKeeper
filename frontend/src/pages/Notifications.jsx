import { useState, useEffect } from 'react';
import { CheckCheck, BellOff } from 'lucide-react';
import { notificationsAPI } from '../services/api';
import { timeAgo } from '../utils/dateUtils';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';
import './Notifications.css';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await notificationsAPI.list();
      setNotifications(res.data || []);
    } catch { toast.error('Could not load notifications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(p => p.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(p => p.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch { toast.error('Failed'); }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getIcon = (msg = '') => {
    if (msg.toLowerCase().includes('expired')) return '🔴';
    if (msg.toLowerCase().includes('tomorrow') || msg.toLowerCase().includes('today')) return '🟠';
    return '🟡';
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">🔔 Notifications</h1>
          <p className="page-subtitle">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-secondary" onClick={markAllRead} id="btn-mark-all-read">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {loading ? <Loading /> : notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><BellOff size={48} opacity={0.3} /></div>
          <h3>No notifications yet</h3>
          <p>We'll alert you when items are about to expire.</p>
        </div>
      ) : (
        <div className="notif-list">
          {notifications.map(n => (
            <div
              key={n.notification_id}
              className={`notif-item ${!n.is_read ? 'notif-item--unread' : ''}`}
              onClick={() => !n.is_read && markRead(n.notification_id)}
            >
              <span className="notif-item-icon">{getIcon(n.message)}</span>
              <div className="notif-item-body">
                <p className="notif-item-message">{n.message}</p>
                <p className="notif-item-time">{timeAgo(n.created_at)}</p>
              </div>
              {!n.is_read && <span className="notif-unread-dot" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
