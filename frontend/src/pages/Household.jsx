import { useState, useEffect } from 'react';
import { Plus, UserPlus, Crown, UserRound, Trash2 } from 'lucide-react';
import { householdsAPI } from '../services/api';
import {  } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';
import './Household.css';

export default function Household() {
  const { user } = useAuth();
  const [household, setHousehold] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [createForm, setCreateForm] = useState({ household_name: '' });
  const [inviteEmail, setInviteEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await householdsAPI.list();
      const households = res.data || [];
      setHousehold(households[0] || null);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const createHousehold = async (e) => {
    e.preventDefault();
    if (!createForm.household_name.trim()) return;
    setSaving(true);
    try {
      await householdsAPI.create(createForm);
      toast.success('Household created! 🏠');
      setShowCreateModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create household');
    } finally { setSaving(false); }
  };

  const inviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !household) return;
    setSaving(true);
    try {
      await householdsAPI.addMember(household.household_id, { email: inviteEmail });
      toast.success(`Invitation sent to ${inviteEmail}!`);
      setInviteEmail('');
      setShowInviteModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to invite member');
    } finally { setSaving(false); }
  };

  const removeMember = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from the household?`)) return;
    try {
      await householdsAPI.removeMember(household.household_id, memberId);
      toast.success('Member removed.');
      load();
    } catch { toast.error('Failed to remove member'); }
  };

  if (loading) return <Loading />;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">🏠 Household</h1>
          <p className="page-subtitle">Manage your shared household and members</p>
        </div>
        {!household && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} id="btn-create-household">
            <Plus size={16} /> Create Household
          </button>
        )}
        {household && (
          <button className="btn btn-secondary" onClick={() => setShowInviteModal(true)} id="btn-invite-member">
            <UserPlus size={16} /> Invite Member
          </button>
        )}
      </div>

      {!household ? (
        <div className="household-empty">
          <div className="household-empty-visual">🏠</div>
          <h2>No household yet</h2>
          <p>Create a household to share your food inventory with family members.</p>
          <button className="btn btn-primary btn-lg" onClick={() => setShowCreateModal(true)} id="btn-create-household-empty">
            <Plus size={18} /> Create My Household
          </button>
        </div>
      ) : (
        <div className="household-layout">
          {/* Household info card */}
          <div className="card card-padding household-info-card">
            <div className="household-banner">
              <div className="household-banner-icon">🏠</div>
              <div>
                <h2 className="household-name">{household.household_name}</h2>
                <p className="text-muted text-sm">
                  Created {new Date(household.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="divider" />

            <div className="household-meta-row">
              <div className="household-meta-item">
                <span className="household-meta-label">Members</span>
                <span className="household-meta-value">{household.members?.length || 1}</span>
              </div>
              <div className="household-meta-item">
                <span className="household-meta-label">Your Role</span>
                <span className={`badge ${household.my_role === 'OWNER' ? 'badge-normal' : 'badge-soon'}`}>
                  {household.my_role === 'OWNER' ? '👑 Owner' : '👤 Member'}
                </span>
              </div>
            </div>
          </div>

          {/* Members list */}
          <div className="card card-padding">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display" style={{ color: 'var(--charcoal)', fontSize: '1.0625rem', fontWeight: 700 }}>
                Members
              </h3>
              <span className="badge badge-normal">{household.members?.length || 1} member{(household.members?.length || 1) !== 1 ? 's' : ''}</span>
            </div>

            <div className="members-list">
              {(household.members || []).map(member => (
                <div key={member.membership_id} className="member-item">
                  <div className="member-avatar">
                    {member.user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                  </div>
                  <div className="member-info">
                    <p className="member-name">
                      {member.user?.full_name || 'Unknown'}
                      {member.user?.user_id === user?.user_id && <span className="member-you-tag">You</span>}
                    </p>
                    <p className="member-email">{member.user?.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${member.role === 'OWNER' ? 'badge-normal' : ''}`}
                      style={member.role !== 'OWNER' ? { background: 'var(--cream)', color: 'var(--muted)' } : {}}>
                      {member.role === 'OWNER' ? <Crown size={12} /> : <UserRound size={12} />}
                      {member.role === 'OWNER' ? 'Owner' : 'Member'}
                    </span>
                    {household.my_role === 'OWNER' && member.role !== 'OWNER' && (
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => removeMember(member.membership_id, member.user?.full_name)}
                        id={`btn-remove-member-${member.membership_id}`}
                        title="Remove member"
                      >
                        <Trash2 size={13} style={{ color: 'var(--muted)' }} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Household Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreateModal(false)}>
          <div className="modal">
            <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>🏠 Create Household</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              You'll be assigned as the Owner.
            </p>
            <form onSubmit={createHousehold} id="form-create-household">
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" htmlFor="household-name">Household Name *</label>
                <input
                  id="household-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. The Sharma Family"
                  value={createForm.household_name}
                  onChange={e => setCreateForm(p => ({...p, household_name: e.target.value}))}
                  autoFocus
                />
              </div>
              <div className="flex gap-3 justify-between">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)} id="btn-cancel-create">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving} id="btn-submit-create-household">
                  {saving ? 'Creating...' : 'Create Household'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowInviteModal(false)}>
          <div className="modal">
            <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>👤 Invite Member</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Enter the email of a registered FreshKeeper user.
            </p>
            <form onSubmit={inviteMember} id="form-invite-member">
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" htmlFor="invite-email">Email Address *</label>
                <input
                  id="invite-email"
                  type="email"
                  className="form-input"
                  placeholder="member@example.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex gap-3 justify-between">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInviteModal(false)} id="btn-cancel-invite">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving} id="btn-submit-invite">
                  {saving ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
