import React from 'react';
import { Check } from 'lucide-react';

/**
 * 步骤流程迷你指示器（资源智能匹配 3 步流程通用）
 * 三态圆点：已完成(done=低于当前步, 绿+Check) / 当前(金) / 未到(灰)
 * @param {Object} props
 * @param {Array<{key:string,label:string}>} props.steps       - 步骤列表
 * @param {string} props.current                              - 当前步骤 key
 * @param {Function} [props.onStepChange]                     - 步骤切换回调（提供时可点击）
 */
export default function StepFlowIndicator({ steps, current, onStepChange }) {
  const currentIdx = steps.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center py-1.5 px-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]">
      {steps.map((s, i) => {
        const isDone = currentIdx !== -1 && i < currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <React.Fragment key={s.key}>
            {i > 0 && <div className="w-5 h-px bg-[var(--border)] mx-1" />}
            <button
              type="button"
              onClick={onStepChange ? () => onStepChange(s.key) : undefined}
              disabled={!onStepChange}
              className={['group flex flex-col items-center gap-0.5', onStepChange ? 'cursor-pointer' : ''].join(' ')}
              aria-label={onStepChange ? `跳转到${s.label}页面` : s.label}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${
                  isDone
                    ? 'bg-[var(--ok)] text-white'
                    : isCurrent
                      ? 'bg-[var(--brand)] text-black'
                      : 'bg-[var(--surface-muted)] group-hover:bg-[var(--brand)]/60'
                }`}
              >
                {isDone && <Check size={10} aria-hidden="true" />}
              </div>
              <span
                className={`text-[10px] whitespace-nowrap transition-colors ${
                  isCurrent
                    ? 'text-[var(--brand)] font-semibold'
                    : isDone
                      ? 'text-[var(--ok)]'
                      : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
                }`}
              >
                {s.label}
              </span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}