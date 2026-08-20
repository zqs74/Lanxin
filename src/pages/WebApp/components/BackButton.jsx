import React from 'react';
import { ArrowLeft } from 'lucide-react';

/**
 * 返回按钮组件
 * @param {Object} props
 * @param {() => void} props.onBack - 点击回调函数
 */
export default function BackButton({ onBack }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onBack();
    }
  };

  return (
    <button
      type="button"
      onClick={onBack}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="返回总览"
      className="btn btn-ghost rounded-lg border border-[var(--border)] hover:border-[var(--brand)] transition-colors duration-200 flex items-center gap-2 px-3 py-2 text-[var(--text-primary)]"
    >
      <ArrowLeft size={18} />
      <span className="text-sm font-medium">返回总览</span>
    </button>
  );
}
