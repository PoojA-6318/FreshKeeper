import { useState, useEffect } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { shoppingAPI } from '../services/api';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';
import './ShoppingList.css';

export default function ShoppingList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState('');
  const [adding, setAdding] = useState(false);

  const load = async () => {
    try {
      const res = await shoppingAPI.list();
      setItems(res.data || []);
    } catch { toast.error('Could not load shopping list'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setAdding(true);
    try {
      await shoppingAPI.create({ name: newItem.trim() });
      setNewItem('');
      load();
    } catch { toast.error('Failed to add item'); }
    finally { setAdding(false); }
  };

  const togglePurchased = async (item) => {
    try {
      await shoppingAPI.markPurchased(item.shopping_id);
      setItems(p => p.map(i => i.shopping_id === item.shopping_id ? { ...i, is_purchased: !i.is_purchased } : i));
    } catch {}
  };

  const deleteItem = async (id) => {
    try {
      await shoppingAPI.delete(id);
      setItems(p => p.filter(i => i.shopping_id !== id));
    } catch { toast.error('Failed to remove item'); }
  };

  const pending = items.filter(i => !i.is_purchased);
  const bought = items.filter(i => i.is_purchased);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">🛒 Shopping List</h1>
          <p className="page-subtitle">Shared with your household · {pending.length} item{pending.length !== 1 ? 's' : ''} remaining</p>
        </div>
      </div>

      {/* Add item form */}
      <form onSubmit={addItem} className="shopping-add-form" id="form-add-shopping">
        <input
          id="input-shopping-item"
          type="text"
          className="form-input"
          placeholder="Add item to shopping list..."
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={adding} id="btn-add-shopping-item">
          <Plus size={16} /> Add
        </button>
      </form>

      {loading ? <Loading /> : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <h3>Shopping list is empty</h3>
          <p>Add items above to get started.</p>
        </div>
      ) : (
        <div className="shopping-list-container">
          {/* Pending */}
          {pending.length > 0 && (
            <div className="shopping-section">
              <h3 className="shopping-section-title">To Buy</h3>
              <div className="shopping-items">
                {pending.map(item => (
                  <div key={item.shopping_id} className="shopping-item">
                    <button
                      className="shopping-check"
                      onClick={() => togglePurchased(item)}
                      id={`btn-check-${item.shopping_id}`}
                    />
                    <span className="shopping-item-name">{item.name}</span>
                    <button
                      className="btn btn-ghost btn-icon btn-sm shopping-delete"
                      onClick={() => deleteItem(item.shopping_id)}
                      id={`btn-del-shopping-${item.shopping_id}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bought */}
          {bought.length > 0 && (
            <div className="shopping-section">
              <h3 className="shopping-section-title" style={{ color: 'var(--muted)' }}>
                ✅ Purchased ({bought.length})
              </h3>
              <div className="shopping-items">
                {bought.map(item => (
                  <div key={item.shopping_id} className="shopping-item shopping-item--done">
                    <button
                      className="shopping-check shopping-check--done"
                      onClick={() => togglePurchased(item)}
                      id={`btn-uncheck-${item.shopping_id}`}
                    >
                      <Check size={12} />
                    </button>
                    <span className="shopping-item-name shopping-item-name--done">{item.name}</span>
                    <button
                      className="btn btn-ghost btn-icon btn-sm shopping-delete"
                      onClick={() => deleteItem(item.shopping_id)}
                      id={`btn-del-bought-${item.shopping_id}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
