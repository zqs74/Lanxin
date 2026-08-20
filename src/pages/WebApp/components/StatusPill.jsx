import React from 'react';

/**
 * @typedef {'pending'|'ongoing'|'done'|'busy'|'free'|'reserved'|'high'|'medium'|'low'|'ok'|'warn'|'danger'|'info'|'purple'|'brand'} StatusPillVariant
 */

/**
 * 状态胶囊组件
 * @param {Object} props
 * @param {StatusPillVariant} [props.variant='info'] - 状态变体
 * @param {React.ReactNode} props.children - 胶囊内显示的文字
 */
export default function StatusPill({ variant = 'info', children }) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'pending':
      case 'free':
      case 'low':
        return {
          className: 'bg-[var(--surface-muted)] border-[var(--border)] text-[var(--text-muted)]'
        };
      case 'ongoing':
      case 'busy':
        return {
          className: 'bg-[var(--brand)]/15 border-[var(--brand)] text-[var(--brand)]'
        };
      case 'done':
      case 'ok':
      case 'reserved':
        return {
          className: 'bg-[var(--ok)]/15 border-[var(--ok)] text-[var(--ok)]'
        };
      case 'medium':
      case 'warn':
        return {
          className: 'bg-[var(--warn)]/15 border-[var(--warn)] text-[var(--warn)]'
        };
      case 'high':
      case 'danger':
        return {
          className: 'bg-[var(--danger)]/15 border-[var(--danger)] text-[var(--danger)]'
        };
      case 'info':
        return {
          className: 'bg-[var(--info)]/15 border-[var(--info)] text-[var(--info)]'
        };
      case 'purple':
        return {
          className: 'bg-[var(--purple)]/15 border-[var(--purple)] text-[var(--purple)]'
        };
      case 'brand':
        return {
          className: 'bg-[var(--brand)]/15 border-[var(--brand)] text-[var(--brand)]'
        };
      default:
        return {
          className: 'bg-[var(--info)]/15 border-[var(--info)] text-[var(--info)]'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <span
      aria-label={typeof children === 'string' ? children : undefined}
      className={`inline-flex items-center px-2 py-[2px] text-[11px] font-medium rounded-md border whitespace-nowrap ${styles.className}`}
    >
      {children}
    </span>
  );
}
