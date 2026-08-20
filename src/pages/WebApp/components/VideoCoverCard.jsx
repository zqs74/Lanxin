import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Upload, CalendarDays, Clock, Trophy, Share2, Eye } from 'lucide-react';
import StatusPill from './StatusPill.jsx';

export default function VideoCoverCard({ videoBasic, coverUrl, onCoverChange }) {
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onCoverChange(file);
    }
  };

  return (
    <div className='card-base card-solid p-4 space-y-4'>
      <div className='relative aspect-[16/9] rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface-muted)] shadow-inner'>
        <button
          type='button'
          role='button'
          tabIndex={0}
          onClick={handleUploadClick}
          onKeyDown={handleUploadKeyDown}
          aria-label='上传赛事视频封面'
          className='btn btn-accent absolute top-3 right-3 gap-2 inline-flex items-center px-3 py-1.5 rounded-xl text-xs shadow-lg z-10'
        >
          <Upload size={14} aria-hidden='true' />
          上传封面
        </button>

        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          onChange={handleFileChange}
          style={{ display: 'none' }}
          aria-hidden='true'
        />

        {/* 固定封面优先级：上传 > defaultCover > 占位 */}
        {coverUrl ? (
          <img src={coverUrl} alt='视频封面' className='w-full h-full object-cover' />
        ) : videoBasic?.defaultCover ? (
          <img src={videoBasic.defaultCover} alt='视频封面' className='w-full h-full object-cover rounded-2xl' />
        ) : (
          <div className='w-full h-full bg-gradient-to-br from-[var(--surface-muted)] via-[var(--surface)] to-[var(--surface-muted)] flex flex-col items-center justify-center'>
            <span className='text-6xl' style={{ color: 'var(--brand)' }}>🏀</span>
            <p className='text-sm text-[var(--text-muted)] mt-3'>上传赛事视频封面 · 推荐 16:9</p>
            <p className='text-xs text-[var(--text-muted)] mt-1'>支持 JPG / PNG 本地预览，不发送服务器</p>
          </div>
        )}
      </div>

      <h3 className='text-xl font-bold text-[var(--text-primary)] leading-tight'>
        {videoBasic.title}
      </h3>

      <div className='grid grid-cols-2 md:grid-cols-5 gap-3 text-sm'>
        <div className='flex flex-col gap-1'>
          <CalendarDays size={16} style={{ color: 'var(--text-muted)' }} aria-hidden='true' />
          <span className='text-xs text-[var(--text-muted)]'>发布时间</span>
          <span className='text-sm font-semibold text-[var(--text-primary)]'>{videoBasic.publishTime}</span>
        </div>

        <div className='flex flex-col gap-1'>
          <Clock size={16} style={{ color: 'var(--text-muted)' }} aria-hidden='true' />
          <span className='text-xs text-[var(--text-muted)]'>时长</span>
          <span className='text-sm font-semibold text-[var(--text-primary)]'>{videoBasic.duration}</span>
        </div>

        <div className='flex flex-col gap-1'>
          <Trophy size={16} style={{ color: 'var(--text-muted)' }} aria-hidden='true' />
          <span className='text-xs text-[var(--text-muted)]'>赛事</span>
          <span className='text-sm font-semibold text-[var(--text-primary)]'>{videoBasic.tournament}</span>
        </div>

        <div className='flex flex-col gap-1'>
          <Share2 size={16} style={{ color: 'var(--text-muted)' }} aria-hidden='true' />
          <span className='text-xs text-[var(--text-muted)]'>渠道</span>
          <div className='flex flex-wrap'>
            {videoBasic.channels?.map((channel, idx) => (
              <span
                key={idx}
                className='bg-[var(--surface-muted)] rounded px-2 py-0.5 text-xs inline-flex mr-1 mb-1'
              >
                {channel}
              </span>
            ))}
          </div>
        </div>

        <div className='flex flex-col gap-1'>
          <Eye size={16} style={{ color: 'var(--text-muted)' }} aria-hidden='true' />
          <span className='text-xs text-[var(--text-muted)]'>状态</span>
          <div className='flex flex-wrap gap-1'>
            <StatusPill variant='info'>公开</StatusPill>
            <StatusPill variant='ok'>已发布</StatusPill>
          </div>
        </div>
      </div>

      <div className='flex flex-wrap gap-2'>
        <StatusPill variant='info'>公开</StatusPill>
        <StatusPill variant='ok'>已发布</StatusPill>
        <StatusPill variant='brand'>
          完播率 {videoBasic.completionRate}% · 互动率 {videoBasic.interactionRate}%
        </StatusPill>
      </div>
    </div>
  );
}

VideoCoverCard.propTypes = {
  videoBasic: PropTypes.object,
  coverUrl: PropTypes.string,
  onCoverChange: PropTypes.func
};
