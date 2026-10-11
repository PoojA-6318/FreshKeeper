import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { inventoryAPI, refrigeratorsAPI } from '../services/api';
import { CATEGORIES, UNITS, STORAGE_TYPES } from '../utils/constants';
import toast from 'react-hot-toast';
import './AddFood.css';

const today = () => new Date().toISOString().split('T')[0];

export default function AddFood({ editMode = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    name: '', item_type_id: '', quantity: '', unit: 'pcs',
    refrigerator_id: '', date_added: today(), expiry_date: '',
    storage_information: '', notes: '', is_homemade: false,
    cooked_date: '', shelf_life_days: '',
  });
  const [fridges, setFridges] = useState([]);
  const [itemTypes, setItemTypes] = useState(CATEGORIES);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(editMode);

  useEffect(() => {
    const init = async () => {
      try {
        const fridgeRes = await refrigeratorsAPI.list();

        if (fridgeRes.status === 200) {
          setFridges(fridgeRes.data || []);
        }

        setItemTypes(CATEGORIES);

        if (editMode && id) {
          const res = await inventoryAPI.get(id);
          const item = res.data;

          setForm({
            name: item.item_name || '',
            item_type_id: item.category || '',
            quantity: item.quantity || '',
            unit: item.unit || 'pcs',
            refrigerator_id: item.refrigerator_id || '',
            date_added: item.date_added?.split('T')[0] || today(),
            expiry_date: item.expiry_date?.split('T')[0] || '',
            storage_information: item.storage_information || '',
            notes: item.notes || '',
            is_homemade: item.is_homemade || false,
            cooked_date: item.cooked_date?.split('T')[0] || '',
            shelf_life_days: item.shelf_life_days || '',
          });
        }
      } catch (err) {
        console.error('Failed to load Add Food data:', err);
      } finally {
        setPageLoading(false);
      }
    };
    init();
  }, [editMode, id]);

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Item name is required';
    if (!form.item_type_id) errs.item_type_id = 'Category is required';
    if (!form.quantity || isNaN(form.quantity) || Number(form.quantity) <= 0) errs.quantity = 'Enter a valid quantity';
    if (!form.refrigerator_id) errs.refrigerator_id = 'Select a refrigerator';
    if (!form.expiry_date && !form.is_homemade) errs.expiry_date = 'Expiry date is required';
    if (form.is_homemade) {
      if (!form.cooked_date) errs.cooked_date = 'Cooked date is required';
      if (!form.shelf_life_days || Number(form.shelf_life_days) <= 0) errs.shelf_life_days = 'Enter shelf life in days';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    let expiryDate = form.expiry_date;

    // Calculate expiry for homemade meals
    if (form.is_homemade && form.cooked_date && form.shelf_life_days) {
      const cooked = new Date(form.cooked_date);
      cooked.setDate(cooked.getDate() + Number(form.shelf_life_days));
      expiryDate = cooked.toISOString().split('T')[0];
    }

    // Find the selected category from the frontend category list
    const selectedCategory = CATEGORIES.find(
      category => String(category.id) === String(form.item_type_id)
    );

    const payload = {
      refrigerator_id: Number(form.refrigerator_id),
      item_name: form.name.trim(),
      // Keep the backend fields consistent
      item_type: selectedCategory?.label || form.item_type_id,
      category: selectedCategory?.label || form.item_type_id,
      unit: form.unit,
      quantity: Number(form.quantity),
      date_added: form.date_added,
      expiry_date: expiryDate || null,
      is_homemade: form.is_homemade,
      cooked_date: form.is_homemade
        ? form.cooked_date || null
        : null,

      shelf_life_days: form.is_homemade
        ? Number(form.shelf_life_days)
        : null,

      storage_information: form.storage_information.trim() || null,
      notes: form.notes.trim() || null,
    };

    console.log('Inventory payload:', payload);

    try {
      if (editMode) {
        await inventoryAPI.update(id, payload);
        toast.success('Food item updated! ✏️');
      } else {
        await inventoryAPI.create(payload);
        toast.success('Food item added! 🥗');
      }

      navigate('/inventory');

    } catch (err) {
      console.error('Inventory save error:', err.response?.data || err);
      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        const message = detail
          .map(error => {
            const field = Array.isArray(error.loc)
              ? error.loc[error.loc.length - 1]
              : 'field';

            return `${field}: ${error.msg}`;
          })
          .join('\n');

        toast.error(message);
      } else {
        toast.error(
          detail || 'Failed to save item'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <div className="page-wrapper"><div className="loading-spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button className="btn btn-ghost btn-icon" onClick={() => navigate(-1)} id="btn-back">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-title">{editMode ? 'Edit Food Item' : 'Add Food Item'}</h1>
            <p className="page-subtitle">{editMode ? 'Update item details' : 'Add a new item to your inventory'}</p>
          </div>
        </div>
      </div>

      <div className="add-food-layout">
        <form onSubmit={handleSubmit} id="form-add-food" noValidate>
          <div className="add-food-section">
            <h3 className="add-food-section-title">Basic Information</h3>
            <div className="add-food-grid">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" htmlFor="food-name">Food Name *</label>
                <input
                  id="food-name"
                  type="text"
                  className={`form-input ${errors.name ? 'input-error' : ''}`}
                  placeholder="e.g. Full Cream Milk"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                />
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="food-category">Category *</label>
                <select
                  id="food-category"
                  className={`form-input form-select ${errors.item_type_id ? 'input-error' : ''}`}
                  value={form.item_type_id}
                  onChange={(e) => set('item_type_id', e.target.value)}
                >
                  <option value="">Select category</option>

                  {CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.emoji} {category.label}
                    </option>
                  ))}
                </select>
                {errors.item_type_id && <p className="form-error">{errors.item_type_id}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="food-refrigerator">Storage Location *</label>
                <select
                  id="food-refrigerator"
                  className={`form-input form-select ${errors.refrigerator_id ? 'input-error' : ''}`}
                  value={form.refrigerator_id}
                  onChange={e => set('refrigerator_id', e.target.value)}
                >
                  <option value="">Select refrigerator</option>
                  {fridges.map(f => (
                    <option key={f.refrigerator_id} value={f.refrigerator_id}>{f.refrigerator_name || f.name}</option>
                  ))}
                </select>
                {errors.refrigerator_id && <p className="form-error">{errors.refrigerator_id}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="food-quantity">Quantity *</label>
                <input
                  id="food-quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  className={`form-input ${errors.quantity ? 'input-error' : ''}`}
                  placeholder="e.g. 1"
                  value={form.quantity}
                  onChange={e => set('quantity', e.target.value)}
                />
                {errors.quantity && <p className="form-error">{errors.quantity}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="food-unit">Unit *</label>
                <select
                  id="food-unit"
                  className="form-input form-select"
                  value={form.unit}
                  onChange={e => set('unit', e.target.value)}
                >
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="add-food-section">
            <h3 className="add-food-section-title">Dates</h3>

            {/* Homemade toggle */}
            <div className="homemade-toggle">
              <label className="homemade-toggle-label" htmlFor="food-homemade">
                <div className="homemade-toggle-info">
                  <span className="homemade-toggle-title">🍲 Homemade Meal</span>
                  <span className="homemade-toggle-desc">Auto-calculates expiry from cooked date + shelf life</span>
                </div>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="food-homemade"
                    checked={form.is_homemade}
                    onChange={e => set('is_homemade', e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </div>
              </label>
            </div>

            <div className="add-food-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="food-date-added">Date Added</label>
                <input
                  id="food-date-added"
                  type="date"
                  className="form-input"
                  value={form.date_added}
                  onChange={e => set('date_added', e.target.value)}
                />
              </div>

              {form.is_homemade ? (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="food-cooked-date">Cooked Date *</label>
                    <input
                      id="food-cooked-date"
                      type="date"
                      className={`form-input ${errors.cooked_date ? 'input-error' : ''}`}
                      value={form.cooked_date}
                      onChange={e => set('cooked_date', e.target.value)}
                    />
                    {errors.cooked_date && <p className="form-error">{errors.cooked_date}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="food-shelf-life">Shelf Life (days) *</label>
                    <input
                      id="food-shelf-life"
                      type="number"
                      min="1"
                      className={`form-input ${errors.shelf_life_days ? 'input-error' : ''}`}
                      placeholder="e.g. 3"
                      value={form.shelf_life_days}
                      onChange={e => set('shelf_life_days', e.target.value)}
                    />
                    {errors.shelf_life_days && <p className="form-error">{errors.shelf_life_days}</p>}
                  </div>
                  {form.cooked_date && form.shelf_life_days && (
                    <div className="form-group">
                      <label className="form-label">Calculated Expiry</label>
                      <div className="calculated-expiry">
                        {(() => {
                          const d = new Date(form.cooked_date);
                          d.setDate(d.getDate() + Number(form.shelf_life_days));
                          return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                        })()}
                        <span className="badge badge-soon" style={{ marginLeft: '0.5rem' }}>Auto</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="form-group">
                  <label className="form-label" htmlFor="food-expiry">Expiry Date *</label>
                  <input
                    id="food-expiry"
                    type="date"
                    className={`form-input ${errors.expiry_date ? 'input-error' : ''}`}
                    value={form.expiry_date}
                    onChange={e => set('expiry_date', e.target.value)}
                    min={today()}
                  />
                  {errors.expiry_date && <p className="form-error">{errors.expiry_date}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Optional */}
          <div className="add-food-section">
            <h3 className="add-food-section-title">Additional Details <span style={{fontWeight:400,color:'var(--muted)',fontSize:'0.875rem'}}>(optional)</span></h3>
            <div className="form-group mb-4">
              <label className="form-label" htmlFor="food-storage-info">Storage Instructions</label>
              <input
                id="food-storage-info"
                type="text"
                className="form-input"
                placeholder="e.g. Keep refrigerated, open within 3 days"
                value={form.storage_information}
                onChange={e => set('storage_information', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="food-notes">Notes</label>
              <textarea
                id="food-notes"
                className="form-input"
                rows="3"
                placeholder="Any extra notes about this item..."
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="add-food-actions">
            <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate(-1)} id="btn-cancel-add-food">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} id="btn-submit-food">
              <Save size={16} />
              {loading ? 'Saving...' : editMode ? 'Update Item' : 'Add to Inventory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
