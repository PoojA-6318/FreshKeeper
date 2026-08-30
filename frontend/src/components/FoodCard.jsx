import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, UtensilsCrossed, PackageX } from 'lucide-react';
import ExpiryBadge from './ExpiryBadge';
import { formatDate, getExpiryLabel, getExpiryStatus } from '../utils/dateUtils';
import { CATEGORIES } from '../utils/constants';
import './FoodCard.css';

export default function FoodCard({ item, onConsume, onDiscard, onDelete }) {
  const [confirmType, setConfirmType] = useState(null); // 'consume' | 'discard' | 'delete'
  const navigate = useNavigate();

  const category = CATEGORIES.find(c => c.id === item.item_type?.id || c.label === item.item_type?.name);
  const emoji = category?.emoji || '📦';
  const expiryStatus = getExpiryStatus(item.expiry_date);
  const isExpired = expiryStatus === 'expired';
  const isUrgent = expiryStatus === 'today' || expiryStatus === 'soon';

  const handleConfirm = () => {
    if (confirmType === 'consume') onConsume?.(item.inventory_id);
    if (confirmType === 'discard') onDiscard?.(item.inventory_id);
    if (confirmType === 'delete') onDelete?.(item.inventory_id);
    setConfirmType(null);
  };

  return (
    <div className={`food-card ${isExpired ? 'food-card--expired' : ''} ${isUrgent ? 'food-card--urgent' : ''}`}>
      {/* Header */}
      <div className="food-card__header">
        <div className="food-card__emoji">{emoji}</div>
        <div className="food-card__meta">
          <h4 className="food-card__name">{item.name}</h4>
          <p className="food-card__location">
            📍 {item.refrigerator?.name || 'Unknown Storage'}
          </p>
        </div>
        <button
          className="btn btn-ghost btn-icon btn-sm"
          onClick={() => navigate(`/inventory/edit/${item.inventory_id}`)}
          id={`btn-edit-food-${item.inventory_id}`}
          title="Edit"
        >
          <Pencil size={14} />
        </button>
      </div>

      {/* Details */}
      <div className="food-card__details">
        <div className="food-card__detail">
          <span className="food-card__detail-label">Quantity</span>
          <span className="food-card__detail-value">{item.quantity} {item.unit}</span>
        </div>
        <div className="food-card__detail">
          <span className="food-card__detail-label">Category</span>
          <span className="food-card__detail-value">{category?.label || item.item_type?.name || '—'}</span>
        </div>
      </div>

      {/* Expiry */}
      <div className="food-card__expiry">
        <div>
          <p className="food-card__expiry-date">{formatDate(item.expiry_date)}</p>
          <p className="food-card__expiry-label">{getExpiryLabel(item.expiry_date)}</p>
        </div>
        <ExpiryBadge expiryDate={item.expiry_date} size="xs" />
      </div>

      {/* Actions */}
      {confirmType ? (
        <div className="food-card__confirm">
          <p className="food-card__confirm-text">
            {confirmType === 'consume' && '✅ Mark as consumed?'}
            {confirmType === 'discard' && '🗑️ Discard this item?'}
            {confirmType === 'delete' && '⚠️ Delete permanently?'}
          </p>
          <div className="flex gap-2">
            <button className="btn btn-sm btn-secondary" onClick={() => setConfirmType(null)} id={`btn-cancel-confirm-${item.inventory_id}`}>
              Cancel
            </button>
            <button className="btn btn-sm btn-primary" onClick={handleConfirm} id={`btn-confirm-action-${item.inventory_id}`}>
              Yes, confirm
            </button>
          </div>
        </div>
      ) : (
        <div className="food-card__actions">
          <button
            className="btn btn-sm btn-green"
            onClick={() => setConfirmType('consume')}
            id={`btn-consume-${item.inventory_id}`}
          >
            <UtensilsCrossed size={13} /> Consume
          </button>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setConfirmType('discard')}
            id={`btn-discard-${item.inventory_id}`}
          >
            <PackageX size={13} /> Discard
          </button>
          <button
            className="btn btn-sm btn-danger btn-icon"
            onClick={() => setConfirmType('delete')}
            id={`btn-delete-${item.inventory_id}`}
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
