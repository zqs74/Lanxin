import React, { useEffect, useRef, useState } from 'react';

/**
 * 数字滚动计数组件（营销报表路演 · 幕1 数据冲击）
 * 从 0 滚动到目标值，支持小数位、前缀/后缀、千分位
 * @param {Object} props
 * @param {number} props.value   目标值
 * @param {number} [props.decimals] 小数位，默认自动
 * @param {string} [props.prefix] 前缀
 * @param {string} [props.suffix] 后缀
 * @param {number} [props.duration] 动画时长 ms
 * @param {number} [props.delay] 延迟启动 ms
 * @param {boolean} [props.run] 是否开始计数
 * @param {string} [props.className] 附加类名
 * @param {Object} [props.style] 附加样式
 */
export default function AnimatedNumber({
  value,
  decimals,
  prefix = '',
  suffix = '',
  duration = 1200,
  delay = 0,
  run = true,
  className = '',
  style
}) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!run) return;
    const target = Number(value) || 0;
    const begin = () => {
      const from = 0;
      const startTime = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(from + (target - from) * eased);
        if (p < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setDisplay(target);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    };
    if (delay) {
      const t = setTimeout(begin, delay);
      return () => {
        clearTimeout(t);
        cancelAnimationFrame(rafRef.current);
      };
    }
    begin();
    return () => cancelAnimationFrame(rafRef.current);
  }, [run, value, decimals, duration, delay]);

  const text = display.toLocaleString('en-US', {
    minimumFractionDigits: decimals !== undefined ? decimals : (Number(value) % 1 !== 0 ? 2 : 0),
    maximumFractionDigits: decimals !== undefined ? decimals : (Number(value) % 1 !== 0 ? 2 : 0)
  });

  return (
    <span className={className} style={{ fontVariantNumeric: 'tabular-nums', ...style }}>
      {prefix}{text}{suffix}
    </span>
  );
}
