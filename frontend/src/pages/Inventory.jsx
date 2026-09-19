import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { inventoryAPI } from '../services/api';
import { getExpiryStatus } from '../utils/dateUtils';
import { CATEGORIES } from '../utils/constants';
import FoodCard from '../components/FoodCard';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';
import './Inventory.css';

const EXPIRY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'normal', label: '🟢 Fresh' },
  { id: 'soon', label: '🟡 Expiring Soon' },
  { id: 'today', label: '🟠 Today' },
  { id: 'expired', label: '🔴 Expired' },
];

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expiryFilter, setExpiryFilter] = useState('all');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('filter') === 'urgent') setExpiryFilter('soon');
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await inventoryAPI.list();
      setInventory(res.data || []);
    } catch {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInventory(); }, []);

  const handleConsume = async (id) => {
    try {
      await inventoryAPI.consume(id, { action: 'consumed' });
      toast.success('Marked as consumed! 🍽️');
      loadInventory();
    } catch { toast.error('Failed to update item'); }
  };

  const handleDiscard = async (id) => {
    try {
      await inventoryAPI.discard(id, { action: 'discarded' });
      toast.success('Item discarded.');
      loadInventory();
    } catch { toast.error('Failed to update item'); }
  };

  const handleDelete = async (id) => {
    try {
      await inventoryAPI.delete(id);
      toast.success('Item removed.');
      loadInventory();
    } catch { toast.error('Failed to delete item'); }
  };

  const filtered = useMemo(() => {
    return inventory.filter(item => {
      const matchSearch = item.item_name?.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'all' ||
        CATEGORIES.find(c => c.id === categoryFilter)?.label === item.item_type?.item_name;
      const matchExpiry = expiryFilter === 'all' || getExpiryStatus(item.expiry_date) === expiryFilter;
      return matchSearch && matchCategory && matchExpiry;
    });
  }, [inventory, search, categoryFilter, expiryFilter]);

  const counts = useMemo(() => ({
    normal: inventory.filter(i => getExpiryStatus(i.expiry_date) === 'normal').length,
    soon: inventory.filter(i => getExpiryStatus(i.expiry_date) === 'soon').length,
    today: inventory.filter(i => getExpiryStatus(i.expiry_date) === 'today').length,
    expired: inventory.filter(i => getExpiryStatus(i.expiry_date) === 'expired').length,
  }), [inventory]);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">{inventory.length} total items across all storage</p>
        </div>
        <Link to="/inventory/add" className="btn btn-primary" id="btn-add-food">
          <Plus size={16} /> Add Food
        </Link>
      </div>

      {/* Summary bar */}
      <div className="inventory-summary">
        {[
          { label: 'Fresh', value: counts.normal, color: '#16A34A', bg: '#DCFCE7' },
          { label: 'Expiring Soon', value: counts.soon, color: '#CA8A04', bg: '#FEF9C3' },
          { label: 'Today', value: counts.today, color: '#EA580C', bg: '#FFEDD5' },
          { label: 'Expired', value: counts.expired, color: '#DC2626', bg: '#FEE2E2' },
        ].map(s => (
          <div key={s.label} className="inventory-summary-item" style={{ background: s.bg, color: s.color }}>
            <span className="inventory-summary-value">{s.value}</span>
            <span className="inventory-summary-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="inventory-filters">
        {/* Search */}
        <div className="search-bar" style={{ flex: 1, maxWidth: 360 }}>
          <Search size={16} className="search-icon" />
          <input
            id="inventory-search"
            type="text"
            className="form-input"
            placeholder="Search food items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Expiry filter */}
        <div className="filter-pills">
          {EXPIRY_FILTERS.map(f => (
            <button
              key={f.id}
              className={`pill ${expiryFilter === f.id ? 'active' : ''}`}
              onClick={() => setExpiryFilter(f.id)}
              id={`filter-expiry-${f.id}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="filter-pills mb-6" style={{ overflowX: 'auto', paddingBottom: '0.25rem' }}>
        <button
          className={`pill ${categoryFilter === 'all' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('all')}
          id="filter-cat-all"
        >
          All Categories
        </button>
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            className={`pill ${categoryFilter === c.id ? 'active' : ''}`}
            onClick={() => setCategoryFilter(c.id)}
            id={`filter-cat-${c.id}`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <Loading message="Loading inventory..." />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>{inventory.length === 0 ? 'No food items yet' : 'No items match your filters'}</h3>
          <p>
            {inventory.length === 0
              ? 'Start by adding your first food item to track.'
              : 'Try adjusting your search or filters.'}
          </p>
          {inventory.length === 0 && (
            <Link to="/inventory/add" className="btn btn-primary mt-4" id="btn-empty-add-food">
              <Plus size={16} /> Add First Item
            </Link>
          )}
        </div>
      ) : (
        <div className="inventory-grid">
          {filtered.map(item => (
            <FoodCard
              key={item.item_id}
              item={item}
              onConsume={handleConsume}
              onDiscard={handleDiscard}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
