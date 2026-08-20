// @deprecated 2026-07-30 旧 standalone AI 视频分析页，已由 modules/AIAnalystPlatform.jsx 新的比赛分析师页替代
// 保留用于回溯，代码不再被 WebApp/index.jsx 调用
import React, { useState, useEffect, useRef } from 'react';
import { Upload, Play, Square, Download, Activity, CheckCircle, AlertCircle, Video, Settings, Info, RefreshCw, Github, Database, Sun, Clock, X, RotateCcw, Save, Filter, User, BarChart3, Film, ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react';
import Footer from '../../../components/Footer';

const API_URL = 'http://localhost:8000';

const DEFAULT_THRESHOLDS = {
  0: 0.6,
  1: 0.25,
  2: 0.7,
  3: 0.7,
  4: 0.77
};

const LABELS = {
  0: "Ball (Orange)",
  1: "Ball in Basket (Gold)",
  2: "Player (Green)",
  3: "Basket (Red)",
  4: "Player Shooting (Blue)"
};

export default function AIVideoAnalysis() {
  const [file, setFile] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ shots: 0, baskets: 0, accuracy: 0 });

  const [testMode, setTestMode] = useState(false);
  const [processingMode, setProcessingMode] = useState('full_tracking');

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);

  const [errorMsg, setErrorMsg] = useState('');
  const statusInterval = useRef(null);

  useEffect(() => {
    if (status === 'processing') {
      statusInterval.current = setInterval(checkStatus, 1000);
    } else {
      clearInterval(statusInterval.current);
    }
    return () => clearInterval(statusInterval.current);
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setProgress(0);
      setStats({ shots: 0, baskets: 0, accuracy: 0 });
      setErrorMsg('');
    }
  };

  const resetApp = () => {
    setFile(null);
    setFileId(null);
    setStatus('idle');
    setProgress(0);
    setStats({ shots: 0, baskets: 0, accuracy: 0 });
    setErrorMsg('');
    setTestMode(false);
  };

  const resetThresholds = () => {
    setThresholds(DEFAULT_THRESHOLDS);
  };

  const updateThreshold = (key, value) => {
    setThresholds(prev => ({
      ...prev,
      [key]: parseFloat(value)
    }));
  };

  const uploadAndStart = async () => {
    if (!file) return;

    try {
      setStatus('uploading');
      setErrorMsg('');
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
      if (!uploadRes.ok) throw new Error("Upload failed. Check connection or file size.");
      const uploadData = await uploadRes.json();
      const fid = uploadData.file_id;
      setFileId(fid);

      const thresholdParam = encodeURIComponent(JSON.stringify(thresholds));

      const processRes = await fetch(
        `${API_URL}/process/${fid}?test_mode=${testMode}&mode=${processingMode}&thresholds=${thresholdParam}`,
        { method: 'POST' }
      );

      if (!processRes.ok) throw new Error("Processing start failed");
      setStatus('processing');

    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message);
    }
  };


  const checkStatus = async () => {
    if (!fileId) return;
    try {
      const res = await fetch(`${API_URL}/status/${fileId}`);
      const data = await res.json();

      if (data.status === 'processing') {
        setProgress(data.percentage);
        setStats(data.stats);
      } else if (data.status === 'completed') {
        setStatus('completed');
        setProgress(100);
        setStats(data.stats);
      } else if (data.status === 'error') {
        setStatus('error');
        setErrorMsg(data.message);
      } else if (data.status === 'stopped') {
        setStatus('stopped');
      }
    } catch (err) {
      console.error("Status check failed", err);
    }
  };

  const stopProcessing = async () => {
    if (!fileId) return;
    try {
      await fetch(`${API_URL}/stop/${fileId}`, { method: 'POST' });
      setStatus('stopped');
    } catch (err) {
      console.error(err);
    }
  };

  const downloadVideo = () => {
    window.open(`${API_URL}/download/${fileId}`, '_blank');
  };


  const [analysisResults, _setAnalysisResults] = useState({
    timeline: [
      { time: '12:00', team: '红队', action: '红队换人 (#23, #11, #5, #34, #45)', score: '0-0' },
      { time: '12:00', team: '红队', action: '第一节开始', score: '0-0' },
      { time: '11:45', team: '红队', action: '#23 中距离跳投命中 (#11 助攻)', score: '2-0' },
      { time: '11:30', team: '蓝队', action: '#10 突破上篮不中', score: '2-0' },
      { time: '11:28', team: '红队', action: '#34 防守篮板', score: '2-0' },
      { time: '11:20', team: '红队', action: '#5 三分跳投不中', score: '2-0' },
      { time: '11:18', team: '蓝队', action: '#12 防守篮板', score: '2-0' },
      { time: '11:05', team: '蓝队', action: '#10 接球投篮三分命中 (#12 助攻)', score: '2-3' },
      { time: '10:50', team: '红队', action: '#23 突破上篮得分 (#34 助攻)', score: '4-3' },
      { time: '10:35', team: '蓝队', action: '#10 个人犯规 (#23 造犯规)', score: '4-3' },
      { time: '10:35', team: '红队', action: '#23 第一罚命中', score: '5-3' },
      { time: '10:35', team: '红队', action: '#23 第二罚命中', score: '6-3' },
      { time: '10:20', team: '蓝队', action: '#12 三分跳投不中', score: '6-3' },
      { time: '10:18', team: '红队', action: '#45 防守篮板', score: '6-3' },
      { time: '10:05', team: '红队', action: '#11 三分线外投篮命中 (#23 助攻)', score: '9-3' },
      { time: '09:50', team: '蓝队', action: '#10 突破上篮得分 (#15 助攻)', score: '9-5' },
      { time: '09:35', team: '红队', action: '#5 三分跳投不中', score: '9-5' },
      { time: '09:33', team: '红队', action: '#23 进攻篮板', score: '9-5' },
      { time: '09:30', team: '红队', action: '#23 补篮得分', score: '11-5' },
      { time: '09:15', team: '蓝队', action: '#15 急停跳投', score: '11-7' },
      { time: '09:00', team: '红队', action: '#45 篮下勾手得分 (#34 助攻)', score: '13-7' },
      { time: '08:45', team: '蓝队', action: '#12 防守篮板', score: '13-7' },
      { time: '08:30', team: '蓝队', action: '#10 三分命中 (#15 助攻)', score: '13-10' },
      { time: '08:15', team: '红队', action: '#11 失误 (传球失误)，#10 抢断', score: '13-10' },
      { time: '08:00', team: '蓝队', action: '#12 快攻上篮得分 (#10 助攻)', score: '13-12' },
      { time: '07:45', team: '红队', action: '#23 三分跳投命中', score: '16-12' },
      { time: '07:30', team: '蓝队', action: '#15 防守篮板', score: '16-12' },
      { time: '07:15', team: '蓝队', action: '#10 三分跳投不中', score: '16-12' },
      { time: '07:13', team: '红队', action: '#34 防守篮板', score: '16-12' },
      { time: '07:00', team: '红队', action: '#5 三分跳投命中 (#11 助攻)', score: '19-12' },
      { time: '06:45', team: '蓝队', action: '#12 三分跳投不中', score: '19-12' },
      { time: '06:43', team: '蓝队', action: '#15 进攻篮板', score: '19-12' },
      { time: '06:40', team: '蓝队', action: '#15 补篮得分', score: '19-14' },
      { time: '06:25', team: '红队', action: '#23 中距离跳投命中', score: '21-14' },
      { time: '06:10', team: '蓝队', action: '#10 个人犯规 (#23 造犯规)', score: '21-14' },
      { time: '06:10', team: '红队', action: '#23 第一罚命中', score: '22-14' },
      { time: '06:10', team: '红队', action: '#23 第二罚不中', score: '22-14' },
      { time: '06:08', team: '蓝队', action: '#15 防守篮板', score: '22-14' },
      { time: '05:55', team: '蓝队', action: '#12 三分命中 (#10 助攻)', score: '22-17' },
      { time: '05:40', team: '红队', action: '#45 篮下勾手得分 (#23 助攻)', score: '24-17' },
      { time: '05:25', team: '蓝队', action: '#10 三分跳投不中', score: '24-17' },
      { time: '05:23', team: '红队', action: '#34 防守篮板', score: '24-17' },
      { time: '05:10', team: '红队', action: '#11 三分跳投命中 (#5 助攻)', score: '27-17' },
      { time: '04:55', team: '蓝队', action: '#15 突破上篮得分 (#12 助攻)', score: '27-19' },
      { time: '04:40', team: '红队', action: '#23 三分跳投命中', score: '30-19' },
      { time: '04:25', team: '蓝队', action: '#10 三分命中 (#15 助攻)', score: '30-22' },
      { time: '04:10', team: '红队', action: '#34 防守篮板', score: '30-22' },
      { time: '03:55', team: '红队', action: '#45 篮下勾手得分 (#23 助攻)', score: '32-22' },
      { time: '03:40', team: '蓝队', action: '#12 防守篮板', score: '32-22' },
      { time: '03:25', team: '蓝队', action: '#10 三分跳投不中', score: '32-22' },
      { time: '03:23', team: '红队', action: '#23 防守篮板', score: '32-22' },
      { time: '03:10', team: '红队', action: '#23 中距离跳投命中', score: '34-22' },
      { time: '02:55', team: '蓝队', action: '#15 个人犯规 (#23 造犯规)', score: '34-22' },
      { time: '02:55', team: '红队', action: '#23 第一罚命中', score: '35-22' },
      { time: '02:55', team: '红队', action: '#23 第二罚命中', score: '36-22' },
      { time: '02:40', team: '蓝队', action: '#10 突破上篮得分 (#12 助攻)', score: '36-24' },
      { time: '02:25', team: '红队', action: '#11 三分跳投不中', score: '36-24' },
      { time: '02:23', team: '蓝队', action: '#15 防守篮板', score: '36-24' },
      { time: '02:10', team: '蓝队', action: '#10 三分命中 (#15 助攻)', score: '36-27' },
      { time: '01:55', team: '红队', action: '#23 中距离跳投命中', score: '38-27' },
      { time: '01:40', team: '蓝队', action: '#12 防守篮板', score: '38-27' },
      { time: '01:25', team: '蓝队', action: '#10 三分跳投不中', score: '38-27' },
      { time: '01:23', team: '红队', action: '#34 防守篮板', score: '38-27' },
      { time: '01:10', team: '红队', action: '#5 三分跳投命中 (#11 助攻)', score: '41-27' },
      { time: '00:55', team: '蓝队', action: '#15 突破上篮得分', score: '41-29' },
      { time: '00:40', team: '红队', action: '#23 中距离跳投命中', score: '43-29' },
      { time: '00:25', team: '蓝队', action: '#10 三分跳投不中', score: '43-29' },
      { time: '00:23', team: '红队', action: '#45 防守篮板', score: '43-29' },
      { time: '00:00', team: '红队', action: '第一节结束', score: '43-29' },
    ],
    players: [
      {
        id: 1,
        name: '张伟',
        number: '23',
        position: 'SF',
        positionName: '小前锋',
        gender: '男',
        team: '红队',
        height: '198cm',
        weight: '95kg',
        stats: {
          points: 28,
          rebounds: 10,
          assists: 6,
          steals: 3,
          blocks: 2,
          fgPercentage: '55.6%',
          threePercentage: '50%',
          ftPercentage: '80%',
          minutes: '32:15',
          efficiency: 25.8,
          plusMinus: '+18',
          offensiveRebounds: 3,
          defensiveRebounds: 7,
          turnovers: 2,
          fouls: 3
        }
      },
      {
        id: 2,
        name: '李明',
        number: '11',
        position: 'PG',
        positionName: '控球后卫',
        gender: '男',
        team: '红队',
        height: '185cm',
        weight: '82kg',
        stats: {
          points: 18,
          rebounds: 4,
          assists: 8,
          steals: 2,
          blocks: 0,
          fgPercentage: '48.2%',
          threePercentage: '40%',
          ftPercentage: '75%',
          minutes: '28:45',
          efficiency: 18.5,
          plusMinus: '+12',
          offensiveRebounds: 1,
          defensiveRebounds: 3,
          turnovers: 3,
          fouls: 2
        }
      },
      {
        id: 3,
        name: '王芳',
        number: '5',
        position: 'SG',
        positionName: '得分后卫',
        gender: '女',
        team: '红队',
        height: '178cm',
        weight: '68kg',
        stats: {
          points: 15,
          rebounds: 3,
          assists: 4,
          steals: 1,
          blocks: 0,
          fgPercentage: '45.0%',
          threePercentage: '35%',
          ftPercentage: '85%',
          minutes: '25:30',
          efficiency: 14.2,
          plusMinus: '+8',
          offensiveRebounds: 0,
          defensiveRebounds: 3,
          turnovers: 1,
          fouls: 1
        }
      },
      {
        id: 4,
        name: '陈强',
        number: '34',
        position: 'PF',
        positionName: '大前锋',
        gender: '男',
        team: '红队',
        height: '203cm',
        weight: '105kg',
        stats: {
          points: 12,
          rebounds: 8,
          assists: 2,
          steals: 0,
          blocks: 3,
          fgPercentage: '52.0%',
          threePercentage: '25%',
          ftPercentage: '65%',
          minutes: '22:15',
          efficiency: 16.7,
          plusMinus: '+6',
          offensiveRebounds: 4,
          defensiveRebounds: 4,
          turnovers: 2,
          fouls: 4
        }
      },
      {
        id: 5,
        name: '刘洋',
        number: '45',
        position: 'C',
        positionName: '中锋',
        gender: '男',
        team: '红队',
        height: '210cm',
        weight: '115kg',
        stats: {
          points: 8,
          rebounds: 12,
          assists: 1,
          steals: 0,
          blocks: 4,
          fgPercentage: '58.0%',
          threePercentage: '0%',
          ftPercentage: '60%',
          minutes: '20:45',
          efficiency: 18.9,
          plusMinus: '+4',
          offensiveRebounds: 5,
          defensiveRebounds: 7,
          turnovers: 3,
          fouls: 5
        }
      },
      {
        id: 6,
        name: '赵丽',
        number: '7',
        position: 'SG',
        positionName: '得分后卫',
        gender: '女',
        team: '红队',
        height: '175cm',
        weight: '65kg',
        stats: {
          points: 10,
          rebounds: 2,
          assists: 5,
          steals: 2,
          blocks: 0,
          fgPercentage: '40.0%',
          threePercentage: '30%',
          ftPercentage: '70%',
          minutes: '18:30',
          efficiency: 12.3,
          plusMinus: '+2',
          offensiveRebounds: 0,
          defensiveRebounds: 2,
          turnovers: 2,
          fouls: 2
        }
      },
      {
        id: 7,
        name: '孙明',
        number: '10',
        position: 'PG',
        positionName: '控球后卫',
        gender: '男',
        team: '蓝队',
        height: '183cm',
        weight: '78kg',
        stats: {
          points: 22,
          rebounds: 3,
          assists: 7,
          steals: 4,
          blocks: 0,
          fgPercentage: '47.0%',
          threePercentage: '42%',
          ftPercentage: '85%',
          minutes: '30:15',
          efficiency: 20.5,
          plusMinus: '-12',
          offensiveRebounds: 0,
          defensiveRebounds: 3,
          turnovers: 2,
          fouls: 4
        }
      },
      {
        id: 8,
        name: '周杰',
        number: '12',
        position: 'SG',
        positionName: '得分后卫',
        gender: '男',
        team: '蓝队',
        height: '190cm',
        weight: '85kg',
        stats: {
          points: 15,
          rebounds: 4,
          assists: 5,
          steals: 2,
          blocks: 0,
          fgPercentage: '42.0%',
          threePercentage: '38%',
          ftPercentage: '75%',
          minutes: '28:30',
          efficiency: 15.8,
          plusMinus: '-10',
          offensiveRebounds: 1,
          defensiveRebounds: 3,
          turnovers: 3,
          fouls: 3
        }
      },
      {
        id: 9,
        name: '吴磊',
        number: '15',
        position: 'PF',
        positionName: '大前锋',
        gender: '男',
        team: '蓝队',
        height: '200cm',
        weight: '100kg',
        stats: {
          points: 12,
          rebounds: 6,
          assists: 3,
          steals: 1,
          blocks: 2,
          fgPercentage: '50.0%',
          threePercentage: '20%',
          ftPercentage: '65%',
          minutes: '25:45',
          efficiency: 14.2,
          plusMinus: '-8',
          offensiveRebounds: 2,
          defensiveRebounds: 4,
          turnovers: 1,
          fouls: 3
        }
      }
    ],
    teams: {
      '红队': {
        score: 43,
        players: [1, 2, 3, 4, 5, 6],
        stats: {
          points: 43,
          rebounds: 37,
          assists: 21,
          steals: 6,
          blocks: 9,
          fgPercentage: '49.5%',
          threePercentage: '41.2%',
          ftPercentage: '72.7%'
        }
      },
      '蓝队': {
        score: 29,
        players: [7, 8, 9],
        stats: {
          points: 29,
          rebounds: 21,
          assists: 15,
          steals: 1,
          blocks: 0,
          fgPercentage: '43.8%',
          threePercentage: '36.4%',
          ftPercentage: '0%'
        }
      }
    }
  });

  const [filters, setFilters] = useState({
    playerNumber: '',
    gender: '',
    position: '',
    event: '',
    team: ''
  });

  const [selectedPlayer, setSelectedPlayer] = useState('23');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [viewMode, setViewMode] = useState('team');

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePlayerSelect = (number) => {
    setSelectedPlayer(number);
  };

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    setViewMode('player');
  };

  const handleBackToTeam = () => {
    setSelectedTeam(null);
    setViewMode('team');
  };

  const handlePreviewVideo = () => {
    window.open(`${API_URL}/download/${fileId}`, '_blank');
  };

  const filteredTimeline = analysisResults.timeline.filter(item => {
    if (!item.action) return true;

    if (filters.playerNumber) {
      const hasPlayerNumber = item.action.includes(`#${filters.playerNumber}`);
      if (!hasPlayerNumber) return false;
    }

    if (filters.event && !item.action.includes(filters.event)) return false;

    if (filters.team && item.team !== filters.team) return false;

    return true;
  });

  const _filteredPlayers = analysisResults.players.filter(player => {
    if (filters.playerNumber && player.number !== filters.playerNumber) return false;
    if (filters.gender && player.gender !== filters.gender) return false;
    if (filters.position && player.position !== filters.position) return false;
    if (selectedTeam && player.team !== selectedTeam) return false;

    return true;
  });

  const currentPlayer = analysisResults.players.find(p => p.number === selectedPlayer) || analysisResults.players[0];

  const selectedTeamPlayers = selectedTeam
    ? analysisResults.players.filter(p => p.team === selectedTeam)
    : [];

  return (
    <div className="page-web min-h-screen font-sans flex flex-col pt-20 theme-transition" style={{ background: 'var(--page-bg)', color: 'var(--text-primary)' }}>

      {showAdvancedSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="card-base rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-[var(--accent-hover)]">
                <Settings size={24} />
                <h2 className="text-xl font-bold">高级模型设置</h2>
              </div>
                <button
                  onClick={() => setShowAdvancedSettings(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
            </div>

            <div className="mb-6 bg-yellow-500/10 border border-[var(--border)] p-4 rounded-lg">
              <p className="text-sm text-[var(--accent-hover)]">
                <span className="font-bold">警告:</span> 更改这些值会影响AI准确性。
                <br/>• <strong>较低</strong> 的值会检测更多对象，但可能导致误报。
                <br/>• <strong>较高</strong> 的值更严格，但可能漏检。
                <br/>推荐使用默认值。
              </p>
            </div>

            <div className="space-y-6">
              {Object.keys(DEFAULT_THRESHOLDS).map((key) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-300">{LABELS[key]}</span>
                    <span className="font-mono text-[var(--accent-hover)]">{thresholds[key]}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.95"
                    step="0.01"
                    value={thresholds[key]}
                    onChange={(e) => updateThreshold(key, e.target.value)}
                    className="w-full h-2 bg-[var(--bg-primary)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)] hover:accent-[var(--accent-hover)]"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t border-[var(--border)]">
              <button
                onClick={resetThresholds}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-[var(--accent-light)] rounded-lg transition-colors"
              >
                <RotateCcw size={16} /> 重置默认
              </button>
              <div className="flex-1"></div>
              <button
                onClick={() => setShowAdvancedSettings(false)}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] hover:from-[var(--accent-hover)] hover:to-[var(--accent)] text-black font-bold rounded-lg shadow-lg shadow-[var(--accent-muted)] transition-all"
              >
                <Save size={18} /> 保存并关闭
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="py-6 px-8 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto flex justify-center">
          <div className="flex items-center gap-4">
            <div className="p-1 rounded-2xl shadow-lg" style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
              boxShadow: '0 4px 20px var(--accent-muted)'
            }}>
              <img src="/logo.png" alt="LANXIN Logo" className="w-24 h-24 rounded-xl object-cover" />
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight" style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                篮芯 AI 分析平台
              </h1>
              <p style={{ color: 'var(--text-tertiary)' }}>用AI技术分析你的篮球表现</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-[95vw] mx-auto space-y-8">
          <div className="card-base rounded-xl p-6">
             <div className="flex items-center gap-2 mb-4 text-[var(--accent)]">
               <Info size={20} />
               <h3 className="font-bold text-sm uppercase tracking-wide">为获得最佳效果</h3>
             </div>
             <div className="grid md:grid-cols-3 gap-6">
               <div className="flex items-start gap-3">
                 <div className="bg-[var(--bg-primary)] p-2 rounded-lg text-[var(--accent-hover)]"><Sun size={20} /></div>
                 <div>
                   <p className="font-bold text-sm">良好的照明</p>
                   <p className="text-xs text-gray-400 mt-1">确保球场照明充足，避免强背光。</p>
                 </div>
               </div>
               <div className="flex items-start gap-3">
                 <div className="bg-[var(--bg-primary)] p-2 rounded-lg text-green-400"><Video size={20} /></div>
                 <div>
                   <p className="font-bold text-sm">清晰视野</p>
                   <p className="text-xs text-gray-400 mt-1">摄像机必须清晰地看到篮筐和射手。</p>
                 </div>
               </div>
               <div className="flex items-start gap-3">
                 <div className="bg-[var(--bg-primary)] p-2 rounded-lg text-red-400"><Clock size={20} /></div>
                 <div>
                   <p className="font-bold text-sm">最大持续时间</p>
                   <p className="text-xs text-gray-400 mt-1">视频时长限制在3分钟（180秒）以实现最佳处理。</p>
                 </div>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card-base rounded-2xl p-6 shadow-xl flex flex-col" style={{minHeight: '500px'}}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Upload size={20} className="text-[var(--accent)]" />
                视频上传
              </h2>

              {!file && (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] rounded-xl p-10 transition-all hover:border-[var(--accent)]/60 hover:bg-[var(--accent-light)] group flex-1">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="video-upload"
                    disabled={status === 'processing'}
                  />
                  <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="w-24 h-24 bg-[var(--bg-primary)] group-hover:bg-[var(--accent-light)] rounded-full flex items-center justify-center text-[var(--accent)] transition-colors">
                        <Upload size={40} />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-2xl font-bold">点击上传视频</p>
                        <p className="text-base text-gray-500">支持 MP4, MOV, AVI</p>
                      </div>
                    </div>
                  </label>
                </div>
              )}

              {file && (
                <div className="mt-2 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 flex-1 justify-center">

                  <div className="flex items-center justify-between bg-[var(--bg-primary)]/50 p-4 rounded-xl border border-[var(--border)]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[var(--accent-muted)] rounded-lg flex items-center justify-center text-[var(--accent)]">
                        <Video size={20} />
                      </div>
                      <div>
                         <p className="font-medium text-white truncate max-w-[200px]">{file.name}</p>
                         <p className="text-xs text-gray-400">准备处理</p>
                      </div>
                    </div>
                    {status !== 'processing' && status !== 'completed' && (
                       <div className="flex gap-3">
                         <button onClick={() => setShowAdvancedSettings(true)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
                            <Settings size={14} /> 高级
                         </button>
                         <button onClick={resetApp} className="text-xs text-gray-400 hover:text-white underline">更换文件</button>
                       </div>
                    )}
                  </div>

                  {status === 'idle' && (
                    <div className="flex flex-wrap items-center justify-center gap-4 bg-[var(--bg-primary)]/30 p-4 rounded-xl border border-[var(--border)]">

                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-2">
                          <Settings size={14} /> 处理模式
                        </label>
                        <select
                          value={processingMode}
                          onChange={(e) => setProcessingMode(e.target.value)}
                          className="bg-[var(--bg-primary)] text-white border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                        >
                          <option value="full_tracking">完整跟踪 (框 + 效果)</option>
                          <option value="stats_effects">统计 & 效果 (清晰)</option>
                          <option value="stats_only">仅统计 (最小化)</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-3 pt-4">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={testMode}
                            onChange={(e) => setTestMode(e.target.checked)}
                            className="w-5 h-5 accent-[#D4AF37] rounded focus:ring-[var(--accent)] focus:ring-2"
                          />
                          <span className="text-sm group-hover:text-white transition-colors">测试模式 (15秒)</span>
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center">
                    {status === 'processing' || status === 'uploading' ? (
                      <div className="flex flex-col items-center gap-4 w-full">
                         {status === 'uploading' && <span className="text-[var(--accent)] animate-pulse font-bold">正在上传视频... 请稍候</span>}
                         {status === 'processing' && (
                          <button
                            onClick={stopProcessing}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-red-500/20"
                          >
                            <Square size={18} /> 停止分析
                          </button>
                         )}
                      </div>
                    ) : status === 'completed' ? (
                      <div className="flex flex-wrap gap-3 justify-center w-full">
                          <button
                            onClick={downloadVideo}
                            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-green-500/20 transform hover:scale-105"
                          >
                            <Download size={18} /> 下载结果
                          </button>
                          <button
                            onClick={resetApp}
                            className="flex items-center gap-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg border border-[var(--border)]"
                          >
                            <RefreshCw size={18} /> 处理其他视频
                          </button>
                      </div>
                    ) : (
                      <button
                        onClick={uploadAndStart}
                        disabled={status === 'error'}
                        className="flex items-center gap-2 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] hover:from-[var(--accent-hover)] hover:to-[var(--accent)] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[var(--accent-muted)] disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                      >
                        <Play size={20} /> 开始分析
                      </button>
                    )}
                  </div>

                  {status !== 'idle' && (
                    <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium text-gray-400">
                          <span className="capitalize flex items-center gap-2">
                            <Activity size={16} className={status === 'processing' || status === 'uploading' ? 'animate-pulse text-[var(--accent)]' : ''} />
                            {status === 'uploading' ? '上传中...' : status === 'processing' ? '分析中...' : status}
                          </span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-3 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ease-out ${status === 'error' ? 'bg-red-500' : 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)]'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {status === 'error' && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl flex items-center gap-3 animate-in shake">
                          <AlertCircle size={24} className="text-red-500 flex-shrink-0" />
                          <div>
                            <h4 className="font-bold text-red-400 text-sm">出错了！</h4>
                            <p className="text-xs">{errorMsg || "发生了未知错误。请尝试使用不同的视频。"}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="card-base rounded-2xl p-6 shadow-xl flex flex-col" style={{minHeight: '500px'}}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Film size={20} className="text-[var(--accent)]" />
                分析结果预览
              </h2>

              {status === 'completed' ? (
                <div className="flex flex-col flex-1 space-y-4">
                  <div className="aspect-video bg-[var(--bg-primary)] rounded-xl flex items-center justify-center border border-[var(--border)] flex-1">
                    <button
                      onClick={handlePreviewVideo}
                      className="flex flex-col items-center gap-3 p-8 bg-[var(--bg-secondary)]/50 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      <div className="w-16 h-16 bg-[var(--accent-muted)] rounded-full flex items-center justify-center text-[var(--accent)]">
                        <Play size={32} />
                      </div>
                      <p className="font-medium">点击预览分析后的视频</p>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[var(--bg-primary)]/50 p-3 rounded-xl text-center border border-[var(--border)]">
                      <p className="text-gray-400 text-xs uppercase tracking-wider">投篮</p>
                      <p className="text-2xl font-bold text-white mt-1">{stats.shots}</p>
                    </div>
                    <div className="bg-[var(--bg-primary)]/50 p-3 rounded-xl text-center border border-[var(--border)]">
                      <p className="text-gray-400 text-xs uppercase tracking-wider">命中</p>
                      <p className="text-2xl font-bold text-green-400 mt-1">{stats.baskets}</p>
                    </div>
                    <div className="bg-[var(--bg-primary)]/50 p-3 rounded-xl text-center border border-[var(--border)]">
                      <p className="text-gray-400 text-xs uppercase tracking-wider">准确率</p>
                      <p className="text-2xl font-bold text-[var(--accent-hover)] mt-1">
                        {typeof stats.accuracy === 'number' ? stats.accuracy.toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-[var(--bg-primary)] rounded-xl flex items-center justify-center border border-[var(--border)] flex-1">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-[var(--bg-primary)] rounded-full flex items-center justify-center text-gray-500 mx-auto mb-3">
                      <Film size={24} />
                    </div>
                    <p className="text-gray-400">分析完成后将显示视频预览</p>
                  </div>
                </div>
              )}
            </div>

            <div className="card-base rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Filter size={20} className="text-[var(--accent)]" />
                筛选
              </h2>

              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="搜索球员..."
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">号码</label>
                  <div className="flex flex-wrap gap-2">
                    {['11', '23', '34', '45', '5', '7'].map((number) => (
                      <button
                        key={number}
                        onClick={() => handleFilterChange('playerNumber', filters.playerNumber === number ? '' : number)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filters.playerNumber === number ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-black' : 'bg-[var(--bg-primary)] text-gray-300 hover:bg-[var(--accent-muted)]'}`}
                      >
                        #{number}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">性别</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFilterChange('gender', filters.gender === '男' ? '' : '男')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filters.gender === '男' ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-black' : 'bg-[var(--bg-primary)] text-gray-300 hover:bg-[var(--accent-muted)]'}`}
                    >
                      男
                    </button>
                    <button
                      onClick={() => handleFilterChange('gender', filters.gender === '女' ? '' : '女')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filters.gender === '女' ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-black' : 'bg-[var(--bg-primary)] text-gray-300 hover:bg-[var(--accent-muted)]'}`}
                    >
                      女
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">位置</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'SF', label: '小前锋' },
                      { value: 'PG', label: '控球后卫' },
                      { value: 'SG', label: '得分后卫' },
                      { value: 'PF', label: '大前锋' },
                      { value: 'C', label: '中锋' }
                    ].map((position) => (
                      <button
                        key={position.value}
                        onClick={() => handleFilterChange('position', filters.position === position.value ? '' : position.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filters.position === position.value ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-black' : 'bg-[var(--bg-primary)] text-gray-300 hover:bg-[var(--accent-muted)]'}`}
                      >
                        {position.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">球队</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFilterChange('team', filters.team === '红队' ? '' : '红队')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filters.team === '红队' ? 'bg-red-500 text-white' : 'bg-[var(--bg-primary)] text-gray-300 hover:bg-[var(--accent-muted)]'}`}
                    >
                      红队
                    </button>
                    <button
                      onClick={() => handleFilterChange('team', filters.team === '蓝队' ? '' : '蓝队')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filters.team === '蓝队' ? 'bg-blue-500 text-white' : 'bg-[var(--bg-primary)] text-gray-300 hover:bg-[var(--accent-muted)]'}`}
                    >
                      蓝队
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">事件</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: '两分', label: '两分' },
                      { value: '三分', label: '三分' },
                      { value: '罚球', label: '罚球' },
                      { value: '助攻', label: '助攻' },
                      { value: '抢断', label: '抢断' },
                      { value: '盖帽', label: '盖帽' },
                      { value: '进攻篮板', label: '进攻篮板' },
                      { value: '防守篮板', label: '防守篮板' },
                      { value: '失误', label: '失误' }
                    ].map((event) => (
                      <button
                        key={event.value}
                        onClick={() => handleFilterChange('event', filters.event === event.value ? '' : event.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filters.event === event.value ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-black' : 'bg-[var(--bg-primary)] text-gray-300 hover:bg-[var(--accent-muted)]'}`}
                      >
                        {event.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-base rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BarChart3 size={20} className="text-[var(--accent)]" />
                  赛事分析
                </h2>
                <span className="text-sm text-gray-400">{filteredTimeline.length} 条</span>
              </div>

              <div className="flex gap-3 mb-4 overflow-x-auto pb-2 scrollbar-custom">
                <button
                  className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
                  style={{
                    backgroundColor: !filters.playerNumber ? 'var(--accent)' : 'var(--bg-primary)',
                    color: !filters.playerNumber ? 'var(--text-primary)' : 'var(--text-tertiary)'
                  }}
                  onClick={() => handleFilterChange('playerNumber', '')}
                >
                  全部
                </button>
                {analysisResults.players.map((player) => (
                  <button
                    key={player.number}
                    className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
                    style={{
                      backgroundColor: filters.playerNumber === player.number ? 'var(--accent)' : 'var(--bg-primary)',
                      color: filters.playerNumber === player.number ? 'var(--text-primary)' : 'var(--text-tertiary)'
                    }}
                    onClick={() => handleFilterChange('playerNumber', filters.playerNumber === player.number ? '' : player.number)}
                  >
                    #{player.number} {player.name}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-custom">
                {filteredTimeline.length > 0 ? (
                  <table className="w-full">
                    <thead className="sticky top-0 bg-gradient-to-b from-[var(--bg-secondary)] to-transparent">
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--accent)]">时间</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--accent)]">球队</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--accent)]">事件</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-[var(--accent)]">红队-蓝队</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTimeline.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-[var(--border)] hover:bg-[var(--accent-light)] transition-colors"
                        >
                          <td className="py-3 px-4 text-sm font-mono text-gray-300">{item.time}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                item.team === '红队'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}
                            >
                              {item.team}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">{item.action}</td>
                          <td className="py-3 px-4 text-sm font-bold font-mono">{item.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-[var(--bg-primary)] rounded-full flex items-center justify-center text-gray-500 mx-auto mb-3">
                      <BarChart3 size={24} />
                    </div>
                    <p className="text-gray-400">无分析数据</p>
                  </div>
                )}
              </div>
            </div>

            <div className="card-base rounded-2xl p-6 shadow-xl flex flex-col" style={{maxHeight: '800px'}}>
              {viewMode === 'team' ? (
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <User size={20} className="text-[var(--accent)]" />
                      球队比分
                    </h2>
                    <span className="text-sm text-gray-400">2 支球队</span>
                  </div>

                  <div className="flex items-center justify-center gap-6 flex-1">
                    {Object.entries(analysisResults.teams).map(([teamName, teamData], index) => (
                      <React.Fragment key={teamName}>
                        <div
                          className="flex-1 max-w-md bg-[var(--bg-primary)]/50 p-8 rounded-lg border border-[var(--border)] cursor-pointer hover:border-[var(--accent)] transition-colors flex flex-col justify-center"
                          onClick={() => handleTeamSelect(teamName)}
                        >
                          <div className="text-center mb-6">
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white font-black text-3xl mx-auto mb-4 ${
                              teamName === '红队' ? 'bg-red-500 shadow-lg shadow-red-500/30' : 'bg-blue-500 shadow-lg shadow-blue-500/30'
                            }`}>
                              {teamName}
                            </div>
                            <h3 className="text-2xl font-bold">{teamName}</h3>
                            <p className="text-base text-gray-400 mt-1">{teamData.players.length} 名球员</p>
                          </div>

                          <div className="text-7xl font-black text-center mb-6">{teamData.score}</div>

                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-[var(--bg-secondary)]/50 p-4 rounded-lg">
                              <p className="text-sm text-gray-400">得分</p>
                              <p className="font-bold text-white text-xl">{teamData.stats.points}</p>
                            </div>
                            <div className="bg-[var(--bg-secondary)]/50 p-4 rounded-lg">
                              <p className="text-sm text-gray-400">篮板</p>
                              <p className="font-bold text-cyan-400 text-xl">{teamData.stats.rebounds}</p>
                            </div>
                            <div className="bg-[var(--bg-secondary)]/50 p-4 rounded-lg">
                              <p className="text-sm text-gray-400">助攻</p>
                              <p className="font-bold text-purple-400 text-xl">{teamData.stats.assists}</p>
                            </div>
                            <div className="bg-[var(--bg-secondary)]/50 p-4 rounded-lg">
                              <p className="text-sm text-gray-400">命中率</p>
                              <p className="font-bold text-green-400 text-xl">{teamData.stats.fgPercentage}</p>
                            </div>
                          </div>

                          <div className="mt-6 text-center">
                            <button
                              className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-base font-medium flex items-center gap-1 justify-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTeamSelect(teamName);
                              }}
                            >
                              查看球员详情 →
                            </button>
                          </div>
                        </div>

                        {index === 0 && (
                          <div className="flex-shrink-0">
                            <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] rounded-full p-6 shadow-lg shadow-[var(--accent-muted)]">
                              <span className="text-black font-black text-3xl tracking-wider">VS</span>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <button
                    onClick={handleBackToTeam}
                    className="flex items-center gap-2 text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] mb-4 transition-colors flex-shrink-0"
                  >
                    <RotateCcw size={16} />
                    返回球队比分
                  </button>

                  <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <User size={20} className="text-[var(--accent)]" />
                      {selectedTeam} 球员详情
                    </h2>
                    <span className="text-sm text-gray-400">{selectedTeamPlayers.length} 名球员</span>
                  </div>

                  <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-custom flex-shrink-0">
                    {selectedTeamPlayers.map((player) => (
                      <button
                        key={player.number}
                        onClick={() => handlePlayerSelect(player.number)}
                        className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors flex-shrink-0"
                        style={{
                          backgroundColor: player.number === selectedPlayer ? 'var(--accent)' : 'var(--bg-primary)',
                          color: player.number === selectedPlayer ? 'var(--text-primary)' : 'var(--text-tertiary)'
                        }}
                      >
                        <span className="text-lg font-bold">{player.number}</span>
                        <span className="text-xs font-medium">{player.name}</span>
                        <span className="text-xs">{player.gender}</span>
                      </button>
                    ))}
                  </div>

                  {currentPlayer && (
                    <div className="space-y-6 overflow-y-auto scrollbar-custom flex-1">
                      <div className="bg-[var(--bg-primary)]/50 p-4 rounded-lg border border-[var(--border)]">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-[var(--accent)] rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                            #{currentPlayer.number}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold">{currentPlayer.name}</h3>
                            <p className="text-sm text-gray-400">{currentPlayer.team} · {currentPlayer.positionName} · {currentPlayer.height} · {currentPlayer.weight}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-[var(--bg-primary)]/50 p-4 rounded-lg border border-[var(--border)]">
                          <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                            <BarChart3 size={16} />
                            得分
                          </h4>
                          <p className="text-3xl font-bold text-white">{currentPlayer.stats.points}</p>
                        </div>
                        <div className="bg-[var(--bg-primary)]/50 p-4 rounded-lg border border-[var(--border)]">
                          <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                            <BarChart3 size={16} />
                            篮板
                          </h4>
                          <p className="text-3xl font-bold text-cyan-400">{currentPlayer.stats.rebounds}</p>
                        </div>
                        <div className="bg-[var(--bg-primary)]/50 p-4 rounded-lg border border-[var(--border)]">
                          <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                            <BarChart3 size={16} />
                            助攻
                          </h4>
                          <p className="text-3xl font-bold text-purple-400">{currentPlayer.stats.assists}</p>
                        </div>
                        <div className="bg-[var(--bg-primary)]/50 p-4 rounded-lg border border-[var(--border)]">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                              <BarChart3 size={16} />
                              效率
                            </h4>
                            <div className="relative group">
                              <HelpCircle size={16} className="text-gray-400 hover:text-white cursor-help" />
                              <div className="absolute right-0 bottom-full mb-2 w-64 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-3 text-xs text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                <p className="font-medium mb-1">效率计算公式：</p>
                                <p>效率 = (得分 + 篮板 + 助攻 + 抢断 + 盖帽) - (投篮打铁 + 罚球打铁 + 失误)</p>
                              </div>
                            </div>
                          </div>
                          <p className="text-3xl font-bold text-green-400">{currentPlayer.stats.efficiency}</p>
                        </div>
                        <div className="bg-[var(--bg-primary)]/50 p-4 rounded-lg border border-[var(--border)]">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                              <BarChart3 size={16} />
                              正负值
                            </h4>
                            <div className="relative group">
                              <HelpCircle size={16} className="text-gray-400 hover:text-white cursor-help" />
                              <div className="absolute right-0 bottom-full mb-2 w-64 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-3 text-xs text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                <p className="font-medium mb-1">正负值计算公式：</p>
                                <p>正负值 = 球员在场时球队得分 - 球员在场时对方球队得分</p>
                              </div>
                            </div>
                          </div>
                          <p className="text-3xl font-bold text-white">{currentPlayer.stats.plusMinus}</p>
                        </div>
                        <div className="bg-[var(--bg-primary)]/50 p-4 rounded-lg border border-[var(--border)]">
                          <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                            <BarChart3 size={16} />
                            上场时间
                          </h4>
                          <p className="text-3xl font-bold text-white">{currentPlayer.stats.minutes}</p>
                        </div>
                      </div>

                      <div className="bg-[var(--bg-primary)]/50 p-4 rounded-lg border border-[var(--border)]">
                        <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                          <BarChart3 size={16} />
                          投篮数据
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center">
                            <p className="text-xs text-gray-400">投篮命中率</p>
                            <p className="font-bold text-white">{currentPlayer.stats.fgPercentage}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-400">三分 (4/8)</p>
                            <p className="font-bold text-white">{currentPlayer.stats.threePercentage}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-400">罚球 (4/5)</p>
                            <p className="font-bold text-white">{currentPlayer.stats.ftPercentage}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[var(--bg-primary)]/50 p-4 rounded-lg border border-[var(--border)]">
                        <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                          <BarChart3 size={16} />
                          篮板球
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center">
                            <p className="text-xs text-gray-400">总篮板</p>
                            <p className="font-bold text-white">{currentPlayer.stats.rebounds}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-400">进攻</p>
                            <p className="font-bold text-white">{currentPlayer.stats.offensiveRebounds}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-400">防守</p>
                            <p className="font-bold text-white">{currentPlayer.stats.defensiveRebounds}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[var(--bg-primary)]/50 p-4 rounded-lg border border-[var(--border)]">
                        <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                          <BarChart3 size={16} />
                          防守 & 其他
                        </h4>
                        <div className="grid grid-cols-4 gap-3">
                          <div className="text-center">
                            <p className="text-xs text-gray-400">抢断</p>
                            <p className="font-bold text-purple-400">{currentPlayer.stats.steals}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-400">盖帽</p>
                            <p className="font-bold text-purple-400">{currentPlayer.stats.blocks}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-400">失误</p>
                            <p className="font-bold text-red-400">{currentPlayer.stats.turnovers}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-400">犯规</p>
                            <p className="font-bold text-red-400">{currentPlayer.stats.fouls}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer variant="minimal" />
    </div>
  );
}
