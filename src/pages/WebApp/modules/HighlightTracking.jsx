import React, { useState } from 'react';
import { Construction } from 'lucide-react';
import HighlightEvaluation from '../components/HighlightEvaluation.jsx';
import ShortLinkGenerator from '../components/ShortLinkGenerator.jsx';
import SourceTracking from '../components/SourceTracking.jsx';
import DataCollection from '../components/DataCollection.jsx';
import { EVALUATION_DATA, HIGHLIGHTS, GENERATED_LINKS, SOURCE_DATA, COLLECTION_DATA } from '../data/trackingMock.js';

/**
 * 集锦追踪与评估主模块
 * 步骤导航条（5 步可点击切换）+ 按步骤渲染 5 个子页面
 */
const STEPS = [
  { key: 'evaluate', label: '集锦价值评估' },
  { key: 'shortlink', label: '短链生成' },
  { key: 'source', label: '来源追踪' },
  { key: 'collection', label: '数据采集' },
  { key: 'analysis', label: '数据关联分析' }
];

function StepPlaceholder({ step }) {
  return (
    <div className="card-base card-solid p-16 text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[var(--surface-muted)] flex items-center justify-center">
        <Construction size={24} className="text-[var(--brand)]" aria-hidden="true" />
      </div>
      <p className="text-base font-semibold text-[var(--text-primary)]">「{step.label}」页面开发中</p>
      <p className="text-sm text-[var(--text-muted)] mt-1">后续步骤将在此接入</p>
    </div>
  );
}

export default function HighlightTracking() {
  const [step, setStep] = useState('evaluate');

  const renderStep = () => {
    switch (step) {
      case 'evaluate':
        return <HighlightEvaluation data={EVALUATION_DATA} step={step} onStepChange={setStep} />;
      case 'shortlink':
        return <ShortLinkGenerator highlights={HIGHLIGHTS} generatedLinks={GENERATED_LINKS} step={step} onStepChange={setStep} />;
      case 'source':
        return <SourceTracking data={SOURCE_DATA} step={step} onStepChange={setStep} />;
      case 'collection':
        return <DataCollection data={COLLECTION_DATA} step={step} onStepChange={setStep} />;
      default: {
        const meta = STEPS.find((s) => s.key === step);
        return <StepPlaceholder step={meta || STEPS[2]} />;
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* 步骤导航条 */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] w-full shadow-sm">
        {STEPS.map((s, i) => {
          const active = step === s.key;
          const dotLabel = ['🎯', '①', '②', '③', '④'][i];
          return (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setStep(s.key)}
              className={[
                'btn !text-sm !py-2 !px-3.5 whitespace-nowrap transition-all',
                active ? 'btn-accent shadow-md translate-y-[-1px]' : 'btn-ghost text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              ].join(' ')}
            >
              <span className="mr-1.5">{dotLabel}</span>
              {s.label}
            </button>
          );
        })}
      </div>

      <section key={step}>{renderStep()}</section>
    </div>
  );
}
