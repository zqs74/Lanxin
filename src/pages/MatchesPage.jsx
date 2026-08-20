import { useState, useRef, useEffect } from 'react';
import Footer from '../components/Footer';

function CustomSelect({ label, value, onChange, options, placeholder = '请选择' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label className="text-sm font-medium" style={{ color: 'var(--page-accent)' }}>{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2.5 rounded-xl font-medium focus:outline-none transition-all duration-300 flex items-center justify-between hover:shadow-lg group"
          style={{
            background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
            border: '2px solid var(--border)',
            color: value ? 'var(--text-primary)' : 'var(--text-tertiary)'
          }}
        >
          <span>{value || placeholder}</span>
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            style={{ color: 'var(--page-accent)' }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 border-2 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2"
            style={{
              background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
              borderColor: 'var(--border)',
              boxShadow: '0 8px 32px var(--shadow)'
            }}
          >
            <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索选项..."
                className="input-base w-full px-3 py-2 rounded-lg text-sm"
              />
            </div>
            <div className="max-h-60 overflow-y-auto scrollbar-custom">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-all duration-200 flex items-center justify-between group ${
                      value === option ? '' : 'hover:bg-[var(--bg-card-hover)]'
                    }`}
                    style={{
                      backgroundColor: value === option ? 'var(--page-accent)' : 'transparent',
                      color: value === option ? '#ffffff' : 'var(--text-secondary)'
                    }}
                  >
                    <span>{option}</span>
                    {value === option && (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>无匹配结果</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MatchesPage() {
  const [selectedLeague, setSelectedLeague] = useState('全部');
  const [selectedSeason, setSelectedSeason] = useState('全部');
  const [selectedGender, setSelectedGender] = useState('全部');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const matchesData = [
    { name: 'CBA', logo: '/images/Matches/1.jpg', league: '男 | 1995-2026', color: 'from-red-500 to-red-600' },
    { name: 'WCBA', logo: '/images/Matches/2.png', league: '女 | 2021-2026', color: 'from-pink-500 to-pink-600' },
    { name: '青运会', logo: '/images/Matches/3.png', league: '男 | 2009-2024', color: 'from-green-500 to-green-600' },
    { name: '亚洲杯', logo: '/images/Matches/5.png', league: '女 | 2019-2025', color: 'from-yellow-500 to-yellow-600' },
    { name: '奥运会', logo: '/images/Matches/6.jpg', league: '男 | 2020-2024', color: 'from-indigo-500 to-indigo-600' },
    { name: 'CUBAL一级联赛', logo: '/images/Matches/7.png', league: '男 | 2022-2025', color: 'from-orange-500 to-orange-600' },
    { name: 'CUBAL二级联赛', logo: '/images/Matches/8.png', league: '男 | 2022-2027', color: 'from-teal-500 to-teal-600' },
    { name: '全运会', logo: '/images/Matches/9.png', league: '女 | 2021-2025', color: 'from-cyan-500 to-cyan-600' },
    { name: 'U22全运会', logo: '/images/Matches/10.png', league: '男 | 2021-2025', color: 'from-emerald-500 to-emerald-600' },
    { name: 'U19全运会', logo: '/images/Matches/11.png', league: '男 | 2021-2025', color: 'from-lime-500 to-lime-600' },
    { name: 'U18全运会', logo: '/images/Matches/12.png', league: '男 | 2025-2028', color: 'from-green-400 to-green-500' },
    { name: 'U16全运会', logo: '/images/Matches/13.png', league: '男 | 2025-2028', color: 'from-sky-500 to-sky-600' },
    { name: '全运会三人篮球', logo: '/images/Matches/14.png', league: '男 | 2025-2025', color: 'from-violet-500 to-violet-600' },
    { name: '大运会', logo: '/images/Matches/15.jpg', league: '男 | 2023-2025', color: 'from-blue-400 to-blue-500' }
  ];

  return (
    <div className="page-matches min-h-screen pt-20 theme-transition" style={{ background: 'var(--page-bg)' }}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
            赛事<span style={{ color: 'var(--page-accent)' }}>中心</span>
          </h1>
          <p style={{ color: 'var(--text-tertiary)' }}>浏览各大篮球联赛和赛事信息</p>
        </div>

        {/* Filters */}
        <div className="card-base rounded-2xl p-6 mb-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="min-w-0">
              <CustomSelect label="赛事类型" value={selectedLeague} onChange={setSelectedLeague} options={['全部', '职业联赛', '国际赛事', '青年赛事']} />
            </div>
            <div className="min-w-0">
              <CustomSelect label="赛季" value={selectedSeason} onChange={setSelectedSeason} options={['全部', '2024-2025', '2023-2024']} />
            </div>
            <div className="min-w-0">
              <CustomSelect label="性别" value={selectedGender} onChange={setSelectedGender} options={['全部', '男子', '女子']} />
            </div>
            <div className="md:col-span-3 mt-2">
              <label className="text-sm font-medium block mb-2" style={{ color: 'var(--page-accent)' }}>搜索</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索赛事/球队/联赛"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-base w-full px-4 py-2.5 pl-11 rounded-xl"
                />
                <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--page-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: '总赛事', value: '18', color: 'var(--page-accent)' },
            { label: '进行中', value: '6', color: '#22c55e' },
            { label: '男子联赛', value: '12', color: '#3b82f6' },
            { label: '女子联赛', value: '6', color: '#ec4899' }
          ].map((stat, i) => (
            <div key={i} className="card-base rounded-xl p-4 text-center">
              <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {matchesData.map((match, index) => (
            <div key={index} className="card-base rounded-2xl p-6 cursor-pointer group hover:border-[var(--border-hover)] hover:shadow-xl transition-all duration-300"
              style={{ boxShadow: 'var(--shadow) 0px 4px 16px' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${match.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform overflow-hidden`}>
                  <img src={match.logo} alt={`${match.name} logo`} className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>进行中</span>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2 transition-colors" style={{ color: 'var(--text-primary)' }}>{match.name}</h3>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{match.league}</p>
              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
                  查看详情 →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="card-base rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-medium transition-all duration-300 ${
                    currentPage === page ? 'text-white shadow-lg' : 'hover:bg-[var(--bg-card-hover)]'
                  }`}
                  style={currentPage === page ? {
                    background: `linear-gradient(135deg, var(--page-accent), ${'#dc2626'})`,
                    boxShadow: '0 4px 12px var(--accent-muted)'
                  } : {
                    color: 'var(--text-secondary)'
                  }}
                >
                  {page}
                </button>
              ))}
              <span className="px-2" style={{ color: 'var(--text-tertiary)' }}>...</span>
              <button className="px-3 h-9 rounded-lg transition-all" style={{ color: 'var(--text-secondary)' }}>17</button>
              <button className="px-3 h-9 rounded-lg transition-all" style={{ color: 'var(--text-secondary)' }}>&gt;</button>
            </div>
            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
              <span>20条/页</span>
              <select className="input-base rounded-lg px-2 py-1 text-sm">
                <option>跳至</option>
              </select>
              <span>共3513条</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
