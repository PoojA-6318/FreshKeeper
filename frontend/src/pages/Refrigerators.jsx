import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { refrigeratorsAPI, inventoryAPI } from '../services/api';
import { getExpiryStatus } from '../utils/dateUtils';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';
import './Refrigerators.css';

const STORAGE_TYPES = [
  { value: 'refrigerator', label: '🧊 Refrigerator' },
  { value: 'freezer', label: '❄️ Freezer' },
  { value: 'secondary', label: '🗄️ Secondary Fridge' },
];

const EMPTY_FORM = { name: '', storage_type: 'refrigerator' };

export default function Refrigerators() {
  const [fridges, setFridges] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const load = async () => {
    try {
      const [fridgeRes, invRes] = await Promise.allSettled([
        refrigeratorsAPI.list(),
        inventoryAPI.list(),
      ]);
      if (fridgeRes.status === 'fulfilled') setFridges(fridgeRes.value.data || []);
      if (invRes.status === 'fulfilled') setInventory(invRes.value.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditTarget(null); setForm(EMPTY_FORM); setErrors({}); setShowModal(true); };
  const openEdit = (fridge) => { setEditTarget(fridge); setForm({ name: fridge.name, storage_type: fridge.storage_type }); setErrors({}); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    return errs;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (editTarget) {
        await refrigeratorsAPI.update(editTarget.refrigerator_id, form);
        toast.success('Refrigerator updated!');
      } else {
        await refrigeratorsAPI.create(form);
        toast.success('Refrigerator added! 🧊');
      }
      closeModal();
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this refrigerator? All inventory items in it will also be removed.')) return;
    try {
      await refrigeratorsAPI.delete(id);
      toast.success('Refrigerator deleted.');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const fridgeStats = (fridgeId) => {
    const items = inventory.filter(i => i.refrigerator?.refrigerator_id === fridgeId);
    return {
      total: items.length,
      expired: items.filter(i => getExpiryStatus(i.expiry_date) === 'expired').length,
      soon: items.filter(i => ['soon', 'today'].includes(getExpiryStatus(i.expiry_date))).length,
      fresh: items.filter(i => getExpiryStatus(i.expiry_date) === 'normal').length,
    };
  };

  const getTypeEmoji = (type) => {
    if (type === 'freezer') return '❄️';
    if (type === 'secondary') return '🗄️';
    return '🧊';
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Refrigerators</h1>
          <p className="page-subtitle">Manage your storage units</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd} id="btn-add-fridge">
          <Plus size={16} /> Add Refrigerator
        </button>
      </div>

      {loading ? <Loading /> : fridges.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🧊</div>
          <h3>No refrigerators added</h3>
          <p>Add your refrigerators and freezers to start tracking food.</p>
          <button className="btn btn-primary mt-4" onClick={openAdd} id="btn-empty-add-fridge">
            <Plus size={16} /> Add First Refrigerator
          </button>
        </div>
      ) : (
        <div className="fridge-grid">
          {fridges.map(fridge => {
            const stats = fridgeStats(fridge.refrigerator_id);
            return (
              <div key={fridge.refrigerator_id} className="fridge-detail-card">
                <div className="fridge-detail-header">
                  <div className="fridge-detail-icon">{getTypeEmoji(fridge.storage_type)}</div>
                  <div className="fridge-detail-meta">
                    <h3 className="fridge-detail-name">{fridge.name}</h3>
                    <p className="fridge-detail-type">
                      {STORAGE_TYPES.find(t => t.value === fridge.storage_type)?.label.split(' ').slice(1).join(' ') || 'Refrigerator'}
                    </p>
                  </div>
                  <div className="fridge-detail-actions">
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => openEdit(fridge)}
                      id={`btn-edit-fridge-${fridge.refrigerator_id}`}
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => handleDelete(fridge.refrigerator_id)}
                      id={`btn-delete-fridge-${fridge.refrigerator_id}`}
                      title="Delete"
                      style={{ color: 'var(--muted)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="fridge-stats-row">
                  <div className="fridge-stat-chip" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                    <Package size={13} />
                    <span>{stats.total} items</span>
                  </div>
                  <div className="fridge-stat-chip" style={{ background: '#DCFCE7', color: '#16A34A' }}>
                    <span>🟢 {stats.fresh} fresh</span>
                  </div>
                  {stats.soon > 0 && (
                    <div className="fridge-stat-chip" style={{ background: '#FEF9C3', color: '#CA8A04' }}>
                      <span>🟡 {stats.soon} soon</span>
                    </div>
                  )}
                  {stats.expired > 0 && (
                    <div className="fridge-stat-chip" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                      <span>🔴 {stats.expired} expired</span>
                    </div>
                  )}
                </div>

                {/* Mini inventory bar */}
                {stats.total > 0 && (
                  <div className="fridge-bar">
                    {stats.fresh > 0 && (
                      <div className="fridge-bar-segment" style={{ flex: stats.fresh, background: '#16A34A' }} title={`${stats.fresh} fresh`} />
                    )}
                    {stats.soon > 0 && (
                      <div className="fridge-bar-segment" style={{ flex: stats.soon, background: '#CA8A04' }} title={`${stats.soon} expiring soon`} />
                    )}
                    {stats.expired > 0 && (
                      <div className="fridge-bar-segment" style={{ flex: stats.expired, background: '#DC2626' }} title={`${stats.expired} expired`} />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>
              {editTarget ? '✏️ Edit Refrigerator' : '🧊 Add Refrigerator'}
            </h3>
            <form onSubmit={handleSave} id="form-fridge" noValidate>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" htmlFor="fridge-name">Name *</label>
                <input
                  id="fridge-name"
                  type="text"
                  className={`form-input ${errors.name ? 'input-error' : ''}`}
                  placeholder="e.g. Main Refrigerator"
                  value={form.name}
                  onChange={e => { setForm(p => ({...p, name: e.target.value})); setErrors(p => ({...p, name: ''})); }}
                  autoFocus
                />
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Storage Type</label>
                <div className="fridge-type-options">
                  {STORAGE_TYPES.map(t => (
                    <label key={t.value} className={`fridge-type-option ${form.storage_type === t.value ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="storage_type"
                        value={t.value}
                        checked={form.storage_type === t.value}
                        onChange={() => setForm(p => ({...p, storage_type: t.value}))}
                        style={{ display: 'none' }}
                      />
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-between">
                <button type="button" className="btn btn-secondary" onClick={closeModal} id="btn-cancel-fridge">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving} id="btn-save-fridge">
                  {saving ? 'Saving...' : editTarget ? 'Update' : 'Add Refrigerator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
