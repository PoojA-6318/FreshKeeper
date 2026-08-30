import { getExpiryStatus } from '../utils/dateUtils';
import { EXPIRY_STATUS } from '../utils/constants';

export default function ExpiryBadge({ expiryDate, size = 'sm' }) {
  const status = getExpiryStatus(expiryDate);
  const config = EXPIRY_STATUS[status] || EXPIRY_STATUS.normal;

  return (
    <span
      className={`badge ${config.class}`}
      style={{ fontSize: size === 'xs' ? '0.7rem' : undefined }}
    >
      {config.emoji} {config.label}
    </span>
  );
}
