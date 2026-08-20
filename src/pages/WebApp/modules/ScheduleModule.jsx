import { useState, useMemo } from 'react';
import { useScheduleMock } from '../hooks/useMockApi.js';
import SectionGantt from '../components/SectionGantt.jsx';
import MatchCard from '../components/MatchCard.jsx';
import StatusPill from '../components/StatusPill.jsx';
import { RotateCcw } from 'lucide-react';

/**
 * 赛制与赛程详情页主组件
 * 顶部赛制4Tab → SectionGantt → FilterBar → 日期分组+MatchCard列表
 */
export default function ScheduleModule() {
  const { tournaments, teams, venues, matches } = useScheduleMock();

  const [currentTournamentId, setCurrentTournamentId] = useState('t1');
  const [dateStart, setDateStart] = useState(1);
  const [dateEnd, setDateEnd] = useState(30);
  const [teamId, setTeamId] = useState('all');
  const [venueId, setVenueId] = useState('all');
  const [statusSet, setStatusSet] = useState(new Set(['pending', 'ongoing', 'done']));
  const [highlightTeamId, setHighlightTeamId] = useState(null);
  const [highlightVenueId, setHighlightVenueId] = useState(null);

  const currentTournament = tournaments.find((t) => t.id === currentTournamentId) || tournaments[0];

  const tournamentTabs = [
    { id: 't1', icon: '🥇', label: '单淘汰' },
    { id: 't2', icon: '🎯', label: '双淘汰' },
    { id: 't3', icon: '📊', label: '联赛积分' },
    { id: 't4', icon: '✨', label: '自定义' }
  ];

  const handleTeamClick = (clickedTeamId) => {
    if (highlightTeamId === clickedTeamId) {
      setHighlightTeamId(null);
      setTeamId('all');
    } else {
      setHighlightTeamId(clickedTeamId);
      setTeamId(clickedTeamId);
    }
  };

  const handleVenueClick = (clickedVenueId) => {
    if (highlightVenueId === clickedVenueId) {
      setHighlightVenueId(null);
      setVenueId('all');
    } else {
      setHighlightVenueId(clickedVenueId);
      setVenueId(clickedVenueId);
    }
  };

  const toggleStatus = (status) => {
    setStatusSet((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  };

  const handleReset = () => {
    setDateStart(1);
    setDateEnd(30);
    setTeamId('all');
    setVenueId('all');
    setStatusSet(new Set(['pending', 'ongoing', 'done']));
    setHighlightTeamId(null);
    setHighlightVenueId(null);
  };

  const filteredMatches = useMemo(() => {
    let list = matches.filter((m) => m.tournamentId === currentTournamentId);

    list = list.filter((m) => m.date >= dateStart && m.date <= dateEnd);

    if (teamId !== 'all') {
      list = list.filter((m) => m.homeId === teamId || m.awayId === teamId);
    }

    if (venueId !== 'all') {
      list = list.filter((m) => m.venueId === venueId);
    }

    list = list.filter((m) => statusSet.has(m.status));

    return list;
  }, [matches, currentTournamentId, dateStart, dateEnd, teamId, venueId, statusSet]);

  const stats = useMemo(() => {
    const total = filteredMatches.length;
    const pending = filteredMatches.filter((m) => m.status === 'pending').length;
    const ongoing = filteredMatches.filter((m) => m.status === 'ongoing').length;
    const done = filteredMatches.filter((m) => m.status === 'done').length;
    const venueCount = new Set(filteredMatches.map((m) => m.venueId)).size;
    const teamSet = new Set();
    filteredMatches.forEach((m) => {
      teamSet.add(m.homeId);
      teamSet.add(m.awayId);
    });
    return { total, pending, ongoing, done, venueCount, teamCount: teamSet.size };
  }, [filteredMatches]);

  const groupedMatches = useMemo(() => {
    const groups = {};
    filteredMatches.forEach((m) => {
      if (!groups[m.date]) groups[m.date] = [];
      groups[m.date].push(m);
    });
    return Object.entries(groups)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([date, list]) => ({
        date: Number(date),
        matches: list.sort((a, b) => a.time.localeCompare(b.time))
      }));
  }, [filteredMatches]);

  const getWeekdayLabel = (date) => {
    const baseDate = new Date(2025, 9, 15);
    baseDate.setDate(baseDate.getDate() + (date - 1));
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekdays[baseDate.getDay()];
  };

  const getMonthDayLabel = (date) => {
    const baseDate = new Date(2025, 9, 15);
    baseDate.setDate(baseDate.getDate() + (date - 1));
    return `${baseDate.getMonth() + 1}月${baseDate.getDate()}日`;
  };

  const selectBaseStyle = {
    backgroundColor: 'var(--bg-primary)',
    border: '2px solid var(--border)',
    color: 'var(--text-primary)',
    transition: 'all 0.3s ease'
  };

  const labelStyle = {
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
    fontWeight: 500,
    marginBottom: '0.375rem',
    display: 'block'
  };

  return (
    <div className="px-1">
      <div className="mb-5">
        <h1 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          🏆 赛制与赛程详情
        </h1>
        <div className="flex flex-wrap">
          {tournamentTabs.map((tab) => {
            const t = tournaments.find((tt) => tt.id === tab.id);
            const isActive = currentTournamentId === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setCurrentTournamentId(tab.id);
                }}
                className="inline-flex items-center rounded-full px-3.5 py-1.5 text-sm mr-2 mb-2 border transition-colors duration-150"
                style={
                  isActive
                    ? {
                        backgroundColor: 'var(--brand)',
                        color: '#000000',
                        borderColor: 'var(--brand)',
                        fontWeight: 600
                      }
                    : {
                        backgroundColor: 'var(--surface-muted)',
                        color: 'var(--text-muted)',
                        borderColor: 'var(--border)'
                      }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'var(--brand)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }
                }}
                aria-pressed={isActive}
                aria-label={`切换到${tab.label}赛制：${t?.name || ''}`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <SectionGantt tournament={currentTournament} matches={filteredMatches} />

      <div className="card-base card-solid p-3 mb-4 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="flex items-end gap-2">
            <div className="flex-1 min-w-0">
              <label style={labelStyle}>起始日期</label>
              <select
                value={dateStart}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setDateStart(Math.min(v, dateEnd));
                }}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={selectBaseStyle}
                aria-label="选择起始日期"
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    Day {d}
                  </option>
                ))}
              </select>
            </div>
            <span
              className="pb-2 text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              ~
            </span>
            <div className="flex-1 min-w-0">
              <label style={labelStyle}>结束日期</label>
              <select
                value={dateEnd}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setDateEnd(Math.max(v, dateStart));
                }}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={selectBaseStyle}
                aria-label="选择结束日期"
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    Day {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>球队筛选</label>
            <select
              value={teamId}
              onChange={(e) => {
                const v = e.target.value;
                setTeamId(v);
                setHighlightTeamId(v === 'all' ? null : v);
              }}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={selectBaseStyle}
              aria-label="选择球队筛选"
            >
              <option value="all">全部球队</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>场馆筛选</label>
            <select
              value={venueId}
              onChange={(e) => {
                const v = e.target.value;
                setVenueId(v);
                setHighlightVenueId(v === 'all' ? null : v);
              }}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={selectBaseStyle}
              aria-label="选择场馆筛选"
            >
              <option value="all">全部场馆</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>比赛状态</label>
            <div className="flex items-center gap-3 py-2 flex-wrap">
              {[
                { key: 'pending', label: '未开始' },
                { key: 'ongoing', label: '进行中' },
                { key: 'done', label: '已结束' }
              ].map((s) => (
                <label
                  key={s.key}
                  className="inline-flex items-center gap-1.5 text-sm cursor-pointer"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <input
                    type="checkbox"
                    checked={statusSet.has(s.key)}
                    onChange={() => toggleStatus(s.key)}
                    className="w-4 h-4 rounded"
                    style={{
                      accentColor: 'var(--brand)',
                      cursor: 'pointer'
                    }}
                    aria-label={`${statusSet.has(s.key) ? '取消' : '勾选'}${s.label}`}
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleReset}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
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
              aria-label="重置所有筛选条件"
            >
              <RotateCcw className="w-4 h-4" />
              重置
            </button>
          </div>
        </div>
      </div>

      <div
        className="card-base card-solid p-3 mb-4 rounded-2xl flex items-center gap-3 flex-wrap"
      >
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          共 <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{stats.total}</span> 场
        </span>
        <StatusPill variant="pending">未开始 {stats.pending}</StatusPill>
        <StatusPill variant="ongoing">进行中 {stats.ongoing}</StatusPill>
        <StatusPill variant="done">已结束 {stats.done}</StatusPill>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          场馆 <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{stats.venueCount}</span> 个
        </span>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          球队 <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{stats.teamCount}</span> 支
        </span>
      </div>

      {groupedMatches.length === 0 ? (
        <div
          className="card-base p-10 text-center rounded-2xl"
          style={{ color: 'var(--text-muted)' }}
          role="status"
          aria-live="polite"
        >
          <span className="text-3xl mb-2 block">📭</span>
          <p className="text-sm">当前筛选条件下无比赛，试试重置筛选</p>
        </div>
      ) : (
        <div>
          {groupedMatches.map((group) => (
            <section
              key={group.date}
              aria-label={`Day ${group.date} 比赛列表`}
            >
              <h3
                className="text-sm mb-2 mt-4"
                style={{ color: 'var(--text-muted)' }}
              >
                <span
                  className="font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Day {group.date}
                </span>{' '}
                · {getMonthDayLabel(group.date)}（{getWeekdayLabel(group.date)}）
              </h3>
              <ul>
                {group.matches.map((m) => (
                  <li key={m.id}>
                    <MatchCard
                      match={m}
                      teams={teams}
                      venues={venues}
                      highlightTeamId={highlightTeamId}
                      highlightVenueId={highlightVenueId}
                      onTeamClick={handleTeamClick}
                      onVenueClick={handleVenueClick}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
