import React, { useState, useMemo } from 'react';
import { BookOpen, Atom, FlaskConical, Dna, Globe, Filter, Calendar, Tag, Search, Monitor, ArrowUp, ArrowDown, X, User, Menu } from 'lucide-react';
import rawData from './data.json';

const ScienceTimeline = () => {
    // 狀態管理
    const [selectedSubject, setSelectedSubject] = useState('全部');
    const [selectedTags, setSelectedTags] = useState(new Set());
    const [selectedScientist, setSelectedScientist] = useState('全部');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('asc'); // asc (舊到新) or desc (新到舊)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // 取得所有唯一的標籤
    const allTags = useMemo(() => {
        const tags = new Set();
        rawData.forEach(item => item.tags.forEach(tag => tags.add(tag)));
        return Array.from(tags).sort();
    }, []);

    // 取得所有唯一的科學家
    const allScientists = useMemo(() => {
        const scientists = new Set();
        rawData.forEach(item => scientists.add(item.scientist));
        return Array.from(scientists).sort();
    }, []);

    // 科目顏色映射
    const subjectConfig = {
        "全部": { color: "bg-gray-600", icon: <BookOpen className="w-5 h-5" />, lightColor: "bg-gray-100", textColor: "text-gray-600" },
        "物理": { color: "bg-blue-600", icon: <Atom className="w-5 h-5" />, lightColor: "bg-blue-50", textColor: "text-blue-600" },
        "化學": { color: "bg-green-600", icon: <FlaskConical className="w-5 h-5" />, lightColor: "bg-green-50", textColor: "text-green-600" },
        "生物": { color: "bg-rose-500", icon: <Dna className="w-5 h-5" />, lightColor: "bg-rose-50", textColor: "text-rose-500" },
        "地科": { color: "bg-amber-600", icon: <Globe className="w-5 h-5" />, lightColor: "bg-amber-50", textColor: "text-amber-600" },
    };

    // 處理標籤點擊
    const toggleTag = (tag) => {
        setSelectedTags(prev => {
            const newTags = new Set(prev);
            if (newTags.has(tag)) {
                newTags.delete(tag);
            } else {
                newTags.add(tag);
            }
            return newTags;
        });
    };

    // 篩選與排序邏輯
    const filteredData = useMemo(() => {
        let result = rawData.filter(item => {
            // 科目篩選
            const subjectMatch = selectedSubject === '全部' || item.subject === selectedSubject;

            // 標籤篩選 (OR 邏輯：只要符合其中一個選中的標籤即可，若無選中則顯示全部)
            const tagMatch = selectedTags.size === 0 || item.tags.some(tag => selectedTags.has(tag));

            // 科學家篩選
            const scientistMatch = selectedScientist === '全部' || item.scientist === selectedScientist;

            // 搜尋篩選
            const searchLower = searchQuery.toLowerCase();
            const searchMatch = searchQuery === '' ||
                item.title.toLowerCase().includes(searchLower) ||
                item.description.toLowerCase().includes(searchLower) ||
                item.scientist.toLowerCase().includes(searchLower) ||
                item.tags.some(tag => tag.toLowerCase().includes(searchLower));

            return subjectMatch && tagMatch && scientistMatch && searchMatch;
        });

        return result.sort((a, b) => {
            const yearA = a.year;
            const yearB = b.year;

            if (sortOrder === 'asc') {
                return yearA - yearB;
            } else {
                return yearB - yearA;
            }
        });
    }, [selectedSubject, selectedTags, selectedScientist, searchQuery, sortOrder]);

    // 格式化年份顯示
    const formatYear = (year) => {
        if (year < 0) return `西元前 ${Math.abs(year)}`;
        return `${year}`;
    };

    // 檢查是否所有選定的「地科」項目都有標記 ChN
    const isGeoscienceContext = selectedSubject === '地科';

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
                                    <Globe className="w-6 h-6 md:w-8 md:h-8 text-amber-600" />
                                    高中科學史時間軸
                                </h1>
                            </div>
                            {/* Mobile Sidebar Toggle */}
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md"
                            >
                                {isSidebarOpen ? <X className="w-6 h-6" /> : <Filter className="w-6 h-6" />}
                            </button>
                        </div>

                        {/* Subject Filter (Always visible in header) */}
                        <div className="overflow-x-auto pb-1 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                            <div className="flex gap-2">
                                {Object.keys(subjectConfig).map(subject => (
                                    <button
                                        key={subject}
                                        onClick={() => setSelectedSubject(subject)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${selectedSubject === subject ? `${subjectConfig[subject].color} text-white shadow-sm` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    >
                                        {subjectConfig[subject].icon}
                                        {subject}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 max-w-7xl mx-auto w-full flex relative">
                {/* Sidebar (Filters) */}
                <aside className={`
                    fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
                    md:relative md:translate-x-0 md:block md:w-80 md:h-auto md:z-0
                    ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
                    pt-20 md:pt-6 pb-6 px-4 overflow-y-auto
                `}>
                    <div className="space-y-8">
                        {/* Mobile Close Button (Overlay context handled by z-index but button good for UX) */}
                        <div className="md:hidden flex justify-end mb-4">
                            <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Search */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">搜尋</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors"
                                    placeholder="關鍵字搜尋..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Scientist Filter */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">科學家</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-4 w-4 text-slate-400" />
                                </div>
                                <select
                                    value={selectedScientist}
                                    onChange={(e) => setSelectedScientist(e.target.value)}
                                    className="block w-full pl-9 pr-8 py-2 text-sm border-slate-300 bg-slate-50 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                                >
                                    <option value="全部">所有科學家</option>
                                    {allScientists.map(scientist => (
                                        <option key={scientist} value={scientist}>{scientist}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                    <ArrowDown className="w-3 h-3" />
                                </div>
                            </div>
                        </div>

                        {/* Sort Order */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">排序</label>
                            <button
                                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                className="w-full flex items-center justify-between px-4 py-2 text-sm bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                            >
                                <span className="flex items-center gap-2">
                                    {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4 text-indigo-500" /> : <ArrowDown className="w-4 h-4 text-indigo-500" />}
                                    {sortOrder === 'asc' ? '年份：由舊到新' : '年份：由新到舊'}
                                </span>
                            </button>
                        </div>

                        {/* Tag Filter */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">標籤篩選</label>
                                {selectedTags.size > 0 && (
                                    <button
                                        onClick={() => setSelectedTags(new Set())}
                                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                    >
                                        清除
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {allTags.map(tag => {
                                    const isSelected = selectedTags.has(tag);
                                    return (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTag(tag)}
                                            className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${isSelected
                                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold shadow-sm'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Reset All */}
                        <div className="pt-4 border-t border-slate-100">
                            <button
                                onClick={() => {
                                    setSelectedSubject('全部');
                                    setSelectedTags(new Set());
                                    setSelectedScientist('全部');
                                    setSearchQuery('');
                                }}
                                className="w-full py-2 text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                重置所有篩選
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Overlay for mobile sidebar */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    ></div>
                )}

                {/* Main Content */}
                <main className="flex-1 px-4 py-8 md:px-8 md:py-12 bg-slate-50 overflow-x-hidden">

                    {filteredData.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-slate-300">
                            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900">找不到相關資料</h3>
                            <p className="text-slate-500">請嘗試更改篩選條件或搜尋關鍵字</p>
                            <button
                                onClick={() => {
                                    setSelectedSubject('全部');
                                    setSelectedTags(new Set());
                                    setSelectedScientist('全部');
                                    setSearchQuery('');
                                }}
                                className="mt-4 text-amber-600 hover:text-amber-800 font-medium"
                            >
                                重置所有篩選條件
                            </button>
                        </div>
                    ) : (
                        <div className="relative max-w-4xl mx-auto">
                            {/* Timeline Line */}
                            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 transform md:-translate-x-1/2"></div>

                            <div className="space-y-12">
                                {filteredData.map((item, index) => {
                                    const isEven = index % 2 === 0;
                                    const config = subjectConfig[item.subject] || subjectConfig["全部"];

                                    return (
                                        <div key={item.id} className={`relative flex items-start md:items-center ${isEven ? 'md:flex-row-reverse' : ''}`}>
                                            {/* Date Bubble */}
                                            <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center">
                                                <div className={`w-8 h-8 rounded-full border-4 border-slate-50 shadow-md ${config.color} flex items-center justify-center z-10`}>
                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                </div>
                                            </div>

                                            {/* Content Spacer */}
                                            <div className="hidden md:block md:w-1/2"></div>

                                            {/* Card Content */}
                                            <div className="flex-1 ml-16 md:ml-0 md:px-10 w-full">
                                                <div className="bg-white p-5 md:p-6 rounded-xl shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 relative group">
                                                    {/* Decorative Line */}
                                                    <div className={`absolute top-0 left-0 bottom-0 w-1.5 rounded-l-xl ${config.color}`}></div>

                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${config.lightColor} ${config.textColor} border border-opacity-20`}>{item.subject}</span>
                                                            <span className="flex items-center text-sm font-semibold text-slate-400">
                                                                <Calendar className="w-3.5 h-3.5 mr-1" />
                                                                {formatYear(item.year)} 年
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1 justify-end">
                                                            {item.tags.map(tag => (
                                                                <span key={tag} className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${selectedTags.has(tag) ? 'bg-indigo-100 text-indigo-800 font-medium' : 'text-slate-500 bg-slate-100'}`}>
                                                                    {tag.startsWith('Ch') || tag.startsWith('PCh') || tag.startsWith('CCh') || tag.startsWith('ECh') || tag.startsWith('BCh') ? `📘 ${tag}` : `#${tag}`}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2 flex flex-col md:flex-row md:items-center md:gap-2">
                                                        <span className={`${config.textColor}`}>{item.scientist}</span>
                                                        <span className="hidden md:inline text-slate-300 mx-1">/</span>
                                                        <span className="text-base md:text-lg text-slate-700">{item.title}</span>
                                                    </h3>

                                                    <p className="text-slate-600 leading-relaxed text-sm">{item.description}</p>

                                                    {/* Mobile connector line */}
                                                    <div className="md:hidden absolute top-6 -left-8 w-8 h-px bg-slate-200"></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* End Node */}
                            <div className="relative mt-12 mb-4">
                                <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-3 h-3 bg-slate-300 rounded-full"></div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <footer className="bg-white border-t border-slate-200 text-slate-400 py-6 text-center text-sm">
                <p>Made with ❤️ by <a href="https://github.com/ycy-0510" target="_blank" rel="noopener noreferrer">YCY</p>
                <p>AI generated data may not be accurate, please double check. If you find any error, please report it to <a href="https://github.com/ycy-0510/sci-timeline/issues" target="_blank" rel="noopener noreferrer">GitHub</a></p>
            </footer>
        </div>
    );
};

export default ScienceTimeline;
