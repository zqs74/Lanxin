import { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Clock } from 'lucide-react';
import StatusPill from './StatusPill.jsx';

/**
 * 单场比赛横条卡片
 * @param {Object} props
 * @param {Object} props.match - scheduleMock.MATCHES[i]
 * @param {Object[]} props.teams - TEAMS
 * @param {Object[]} props.venues - VENUES
 * @param {string|null} props.highlightTeamId - 高亮某球队名（点击球队名时联动）
 * @param {string|null} props.highlightVenueId - 高亮某场馆
 * @param {(teamId:string)=>void} props.onTeamClick - 球队名点击回调
 * @param {(venueId:string)=>void} props.onVenueClick - 场馆名点击回调
 */
export default function MatchCard({
  match,
  teams,
  venues,
  highlightTeamId,
  highlightVenueId,
  onTeamClick,
  onVenueClick
}) {
  const [expanded, setExpanded] = useState(false);

  const homeTeam = teams.find((t) => t.id === match.homeId);
  const awayTeam = teams.find((t) => t.id === match.awayId);
  const venue = venues.find((v) => v.id === match.venueId);

  const homeName = homeTeam?.name || '未知';
  const awayName = awayTeam?.name || '未知';
  const homeLogo = homeTeam?.logo || '?';
  const awayLogo = awayTeam?.logo || '?';
  const homeColor = homeTeam?.color || '#888888';
  const awayColor = awayTeam?.color || '#888888';
  const venueName = venue?.name || '未知场馆';

  const homeWin = match.status === 'done' && match.homeScore > match.awayScore;
  const awayWin = match.status === 'done' && match.awayScore > match.homeScore;

  const generateQuarters = (matchId) => {
    let hash = 0;
    for (let i = 0; i < matchId.length; i++) {
      hash = (hash * 31 + matchId.charCodeAt(i)) >>> 0;
    }
    const q = [];
    for (let i = 0; i < 4; i++) {
      hash = (hash * 1103515245 + 12345) >>> 0;
      const h = 8 + (hash % 21);
      hash = (hash * 1103515245 + 12345) >>> 0;
      const a = 8 + (hash % 21);
      q.push({ home: h, away: a });
    }
    return q;
  };

  const quarters =
    match.status === 'done' || match.status === 'ongoing' ? generateQuarters(match.id) : null;

  const statusText = {
    pending: '未开始',
    ongoing: '进行中',
    done: '已结束'
  };

  return (
    <article
      className="card-base p-4 mb-3 rounded-2xl hover:border-[var(--brand)] transition-colors duration-150"
      style={{ borderColor: 'var(--border)' }}
      role="article"
      aria-label={`${homeName} vs ${awayName} Day ${match.date}`}
    >
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                backgroundColor: `color-mix(in srgb, ${homeColor} 20%, transparent)`,
                color: homeColor,
                border: `1.5px solid ${homeColor}`
              }}
            >
              {homeLogo}
            </div>
          </div>

          <div
            className={`text-base font-semibold cursor-pointer transition-all ${
              highlightTeamId === match.homeId ? 'ring-2 rounded px-1 py-0.5' : ''
            }`}
            style={{
              color: homeWin ? 'var(--ok)' : 'var(--text-primary)',
              outlineColor: highlightTeamId === match.homeId ? 'var(--brand)' : undefined,
              ringColor: highlightTeamId === match.homeId ? 'var(--brand)' : undefined,
              boxShadow: highlightTeamId === match.homeId ? '0 0 0 2px var(--brand)' : undefined
            }}
            onClick={() => onTeamClick && onTeamClick(match.homeId)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onTeamClick && onTeamClick(match.homeId);
              }
            }}
            aria-label={`点击筛选球队 ${homeName}`}
          >
            {homeName}
            {homeWin && (
              <span className="ml-1" style={{ color: 'var(--ok)' }}>
                ⭐
              </span>
            )}
          </div>

          <span className="text-muted px-2 text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
            vs
          </span>

          <div
            className={`text-base font-semibold cursor-pointer transition-all ${
              highlightTeamId === match.awayId ? 'ring-2 rounded px-1 py-0.5' : ''
            }`}
            style={{
              color: awayWin ? 'var(--ok)' : 'var(--text-primary)',
              boxShadow: highlightTeamId === match.awayId ? '0 0 0 2px var(--brand)' : undefined
            }}
            onClick={() => onTeamClick && onTeamClick(match.awayId)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onTeamClick && onTeamClick(match.awayId);
              }
            }}
            aria-label={`点击筛选球队 ${awayName}`}
          >
            {awayWin && (
              <span className="mr-1" style={{ color: 'var(--ok)' }}>
                ⭐
              </span>
            )}
            {awayName}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                backgroundColor: `color-mix(in srgb, ${awayColor} 20%, transparent)`,
                color: awayColor,
                border: `1.5px solid ${awayColor}`
              }}
            >
              {awayLogo}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 min-w-[160px] flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
            <span>
              Day {match.date} · {match.time}
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 text-xs cursor-pointer"
            onClick={() => onVenueClick && onVenueClick(match.venueId)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onVenueClick && onVenueClick(match.venueId);
              }
            }}
            aria-label={`点击筛选场馆 ${venueName}`}
          >
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
            <span
              style={{
                color:
                  highlightVenueId === match.venueId ? 'var(--brand)' : 'var(--text-secondary)',
                fontWeight: highlightVenueId === match.venueId ? 600 : 400,
                textDecoration: highlightVenueId === match.venueId ? 'underline' : 'none'
              }}
            >
              {venueName}
            </span>
          </div>
          <div>
            <StatusPill variant={match.status}>{statusText[match.status] || match.status}</StatusPill>
          </div>
        </div>

        <div
          className="flex items-center justify-center min-w-[80px] flex-shrink-0"
          style={{ minHeight: '56px' }}
        >
          {match.status === 'pending' ? (
            <span
              className="font-mono text-xl"
              style={{ color: 'var(--text-muted)' }}
            >
              VS
            </span>
          ) : (
            <div className="flex flex-col items-center font-mono font-bold leading-tight">
              <span className="text-2xl" style={{ color: 'var(--brand)' }}>
                {match.homeScore}
              </span>
              <span className="text-2xl" style={{ color: 'var(--brand)' }}>
                {match.awayScore}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center flex-shrink-0">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            aria-label={expanded ? '收起详情' : '展开详情'}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150"
            style={{
              backgroundColor: 'var(--surface-muted)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--brand)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            详情
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div
          className="mt-4 pt-4"
          style={{ borderTop: '1px dashed var(--border)' }}
        >
          <div className="mb-3">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              裁判组：
            </span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {match.referees &&
                match.referees.map((r, i) => (
                  <span key={i}>
                    {i > 0 && ' · '}
                    <span style={{ fontWeight: 600 }}>
                      {['①', '②', '③'][i] || `${i + 1}.`}
                    </span>
                    {r}
                    {i === 0 && '(主裁)'}
                    {i === 1 && '(第一副裁)'}
                    {i === 2 && '(第二副裁)'}
                  </span>
                ))}
            </span>
          </div>

          {quarters && (
            <div>
              <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                分节比分：
              </div>
              <div className="grid grid-cols-4 gap-2">
                {quarters.map((q, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg p-2.5 text-center"
                    style={{
                      backgroundColor: 'var(--surface-muted)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div
                      className="text-xs font-semibold mb-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Q{idx + 1}
                    </div>
                    <div className="flex items-center justify-center gap-1.5 font-mono font-bold text-sm">
                      <span style={{ color: homeWin ? 'var(--ok)' : 'var(--text-primary)' }}>
                        {q.home}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>-</span>
                      <span style={{ color: awayWin ? 'var(--ok)' : 'var(--text-primary)' }}>
                        {q.away}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
