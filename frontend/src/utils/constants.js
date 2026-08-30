export const UNITS = [
  'kg', 'g', 'L', 'ml', 'pcs', 'pack', 'bottle', 'can', 'box', 'dozen', 'tbsp', 'tsp', 'cup'
];

export const CATEGORIES = [
  { id: 'fruits', label: 'Fruits', emoji: '🍎' },
  { id: 'vegetables', label: 'Vegetables', emoji: '🥦' },
  { id: 'dairy', label: 'Dairy', emoji: '🥛' },
  { id: 'meat', label: 'Meat', emoji: '🥩' },
  { id: 'seafood', label: 'Seafood', emoji: '🐟' },
  { id: 'frozen', label: 'Frozen Food', emoji: '🧊' },
  { id: 'beverages', label: 'Beverages', emoji: '🧃' },
  { id: 'snacks', label: 'Snacks', emoji: '🍿' },
  { id: 'homemade', label: 'Homemade Meals', emoji: '🍲' },
  { id: 'condiments', label: 'Condiments', emoji: '🫙' },
  { id: 'grains', label: 'Grains & Bread', emoji: '🍞' },
  { id: 'other', label: 'Other', emoji: '📦' },
];

export const STORAGE_TYPES = [
  { value: 'refrigerator', label: 'Refrigerator' },
  { value: 'freezer', label: 'Freezer' },
  { value: 'pantry', label: 'Pantry' },
];

export const EXPIRY_STATUS = {
  normal: { label: 'Fresh', color: '#16A34A', bg: '#DCFCE7', emoji: '🟢', class: 'badge-normal' },
  soon:   { label: 'Expiring Soon', color: '#CA8A04', bg: '#FEF9C3', emoji: '🟡', class: 'badge-soon' },
  today:  { label: 'Expires Today', color: '#EA580C', bg: '#FFEDD5', emoji: '🟠', class: 'badge-today' },
  expired:{ label: 'Expired', color: '#DC2626', bg: '#FEE2E2', emoji: '🔴', class: 'badge-expired' },
};

export const HOUSEHOLD_ROLES = {
  OWNER: 'Owner',
  MEMBER: 'Member',
};
