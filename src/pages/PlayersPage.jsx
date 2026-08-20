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
          <span className={value ? '' : ''}>
            {value || placeholder}
          </span>
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            style={{ color: 'var(--page-accent)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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
                      value === option
                        ? 'text-white'
                        : 'hover:bg-[var(--bg-card-hover)]'
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
                <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  无匹配结果
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlayersPage() {
  const [selectedLeague, setSelectedLeague] = useState('中国');
  const [selectedSeason, setSelectedSeason] = useState('所有');
  const [selectedGender, setSelectedGender] = useState('所有');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const _itemsPerPage = 10;

  const playersData = [
    { name: '刘文博', country: '中国/北京', birthday: '1972-10-04', age: 54, height: 201, weight: 105, team: '新疆', position: '前锋' },
    { name: '阿不都沙拉木·阿不都热西提', country: '中国', birthday: '2017-07-31', age: 14, height: 185, weight: 82, team: '巴勒斯坦', position: '大前锋' },
    { name: '周琦', country: '中国', birthday: '1996-01-16', age: 29, height: 216, weight: 95, team: '上海大鲨鱼', position: '中锋' },
    { name: '郭艾伦', country: '中国', birthday: '1993-11-14', age: 32, height: 188, weight: 82, team: '辽宁本钢', position: '控球后卫' },
    { name: '易建联', country: '中国', birthday: '1987-10-27', age: 38, height: 213, weight: 116, team: '广东东莞银行', position: '大前锋' },
    { name: '王哲林', country: '中国', birthday: '1994-01-20', age: 32, height: 214, weight: 120, team: '福建浔兴', position: '中锋' },
    { name: '赵继伟', country: '中国', birthday: '1995-08-25', age: 30, height: 183, weight: 79, team: '辽宁本钢', position: '控球后卫' },
    { name: '丁彦雨航', country: '中国', birthday: '1993-08-20', age: 32, height: 200, weight: 93, team: '山东高速', position: '小前锋' },
    { name: '孙铭徽', country: '中国', birthday: '1996-04-26', age: 29, height: 186, team: '浙江广厦', position: '得分后卫' },
    { name: '胡明轩', country: '中国', birthday: '1998-03-10', age: 27, height: 191, weight: 82, team: '广东东莞银行', position: '得分后卫' }
  ];

  return (
    <div className="page-players min-h-screen pt-20 theme-transition" style={{ background: 'var(--page-bg)' }}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
            球员<span style={{ color: 'var(--page-accent)' }}>数据库</span>
          </h1>
          <p style={{ color: 'var(--text-tertiary)' }}>浏览、搜索和筛选海量篮球运动员数据</p>
        </div>

        {/* Filters */}
        <div className="card-base rounded-2xl p-6 mb-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="min-w-0">
              <CustomSelect
                label="国家/地区"
                value={selectedLeague}
                onChange={setSelectedLeague}
                options={['中国', '美国', '欧洲']}
              />
            </div>
            <div className="min-w-0">
              <CustomSelect
                label="赛季"
                value={selectedSeason}
                onChange={setSelectedSeason}
                options={['所有', '2024-2025', '2023-2024']}
              />
            </div>
            <div className="min-w-0">
              <CustomSelect
                label="性别"
                value={selectedGender}
                onChange={setSelectedGender}
                options={['所有', '男', '女']}
              />
            </div>
            <div className="md:col-span-3 mt-2">
              <label className="text-sm font-medium block mb-2" style={{ color: 'var(--page-accent)' }}>搜索</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索球员/球队/联赛"
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

        {/* Players Table */}
        <div className="card-base rounded-2xl overflow-hidden mb-6 shadow-xl border-[var(--border)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: 'linear-gradient(135deg, var(--page-accent)15, transparent)' }}>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  {['球员', '国家/地区', '生日', '年龄', '身高', '体重', '球队', '位置'].map((h, i) => (
                    <th key={i} className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--page-accent)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {playersData.map((player, index) => (
                  <tr key={index} className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                      <span className="font-medium transition-colors" style={{ color: 'var(--page-accent)' }}>{player.name}</span>
                    </td>
                    <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>{player.country}</td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>{player.birthday}</td>
                    <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>{player.age}</td>
                    <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>{player.height}</td>
                    <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>{player.weight}</td>
                    <td className="px-6 py-4">
                      <span className="cursor-pointer transition-colors" style={{ color: 'var(--page-accent)' }}>{player.team}</span>
                    </td>
                    <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>{player.position}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="card-base rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-medium transition-all duration-300 ${
                    currentPage === page
                      ? 'text-black shadow-lg'
                      : 'hover:bg-[var(--bg-card-hover)]'
                  }`}
                  style={currentPage === page ? {
                    background: `linear-gradient(135deg, var(--page-accent), ${'var(--accent-hover)'})`,
                    boxShadow: '0 4px 12px var(--accent-muted)',
                    color: '#ffffff'
                  } : {
                    color: 'var(--text-secondary)'
                  }}
                >
                  {page}
                </button>
              ))}
              <span className="px-2" style={{ color: 'var(--text-tertiary)' }}>...</span>
              <button className="px-3 h-9 rounded-lg transition-all" style={{ color: 'var(--text-secondary)' }}>9977</button>
              <button className="px-3 h-9 rounded-lg transition-all" style={{ color: 'var(--text-secondary)' }}>&gt;</button>
            </div>
            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
              <span>10条/页</span>
              <select className="input-base rounded-lg px-2 py-1 text-sm">
                <option>跳至</option>
              </select>
              <span>共30661条</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
