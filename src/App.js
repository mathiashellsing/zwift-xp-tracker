import React, { useState, useMemo, useEffect } from 'react';
import { Trophy, Lock, Unlock, TrendingUp, Eye, X } from 'lucide-react';
import IMAGE_MAP from './imageMap';

const PUBLIC_BASE_URL = process.env.PUBLIC_URL || '';
const STORAGE_KEYS = {
    currentXP: 'zwift-xp-tracker.currentXP',
    filter: 'zwift-xp-tracker.filter',
    viewMode: 'zwift-xp-tracker.viewMode'
};

const readStoredNumber = (key, fallback) => {
    try {
        const raw = window.localStorage.getItem(key);
        if (raw == null) return fallback;
        const value = Number(raw);
        return Number.isFinite(value) ? value : fallback;
    } catch {
        return fallback;
    }
};

const readStoredString = (key, fallback) => {
    try {
        const raw = window.localStorage.getItem(key);
        return raw == null ? fallback : raw;
    } catch {
        return fallback;
    }
};

const UNLOCKABLES = [
    { name: 'Basic Kit 1', xp: 750, category: 'Kit' },
    { name: 'Black Helmet', xp: 1500, category: 'Helmet' },
    { name: 'Zwift Glasses #1', xp: 2500, category: 'Glasses' },
    { name: 'Black Shoes', xp: 3500, category: 'Shoes' },
    { name: 'Gloves', xp: 5000, category: 'Gloves' },
    { name: 'Solid Socks', xp: 6500, category: 'Socks' },
    { name: 'Vintage Kit pack', xp: 8000, category: 'Kit' },
    { name: 'Camo Jersey pack', xp: 9500, category: 'Kit' },
    { name: 'Zwift Glasses #2 (Oakleys)', xp: 11000, category: 'Glasses' },
    { name: 'Digital Camo Jersey pack', xp: 13000, category: 'Kit' },
    { name: 'Basic Kit 2', xp: 15000, category: 'Kit' },
    { name: 'Dot Socks', xp: 17000, category: 'Socks' },
    { name: 'Glove Pack Pattern', xp: 19000, category: 'Gloves' },
    { name: 'Level 15 jersey', xp: 21000, category: 'Kit' },
    { name: 'Glasses Zwift #1', xp: 23500, category: 'Glasses' },
    { name: 'Striped Socks', xp: 26000, category: 'Socks' },
    { name: 'Classy Kits', xp: 28500, category: 'Kit' },
    { name: 'Glasses Zwift #2', xp: 31000, category: 'Glasses' },
    { name: 'Level 20 Jersey', xp: 33500, category: 'Kit' },
    { name: 'Flouro Kits', xp: 36500, category: 'Kit' },
    { name: 'Pattern Socks', xp: 39500, category: 'Socks' },
    { name: 'Glove Pack Solid', xp: 42500, category: 'Gloves' },
    { name: 'Skater/Bowl Helmet', xp: 45500, category: 'Helmet' },
    { name: 'Level 25 Kit', xp: 48500, category: 'Kit' },
    { name: 'Zwift Oversize Glasses', xp: 52000, category: 'Glasses' },
    { name: 'S-Works Shoes', xp: 55500, category: 'Shoes' },
    { name: 'Dots Socks', xp: 59500, category: 'Socks' },
    { name: 'S-Works Evade Helmet', xp: 64000, category: 'Helmet' },
    { name: 'Level 30 Kit', xp: 68500, category: 'Kit' },
    { name: 'Retro 80s Sunglasses (Oakley Eyeshades)', xp: 73000, category: 'Glasses' },
    { name: 'Newsy (Paperboy) Cap', xp: 78500, category: 'Cap' },
    { name: 'Fluoro Gloves + Limar Air Speed White Helmet', xp: 84000, category: 'Combo' },
    { name: 'Monochrome Kit', xp: 89500, category: 'Kit' },
    { name: 'Mavic Shoes', xp: 95000, category: 'Shoes' },
    { name: 'Calories To Burn (Food) Socks', xp: 101500, category: 'Socks' },
    { name: 'Bell Javelin Helmet', xp: 108000, category: 'Helmet' },
    { name: 'Vintage Gloves', xp: 114500, category: 'Gloves' },
    { name: 'Vintage Leather Shoes', xp: 121000, category: 'Shoes' },
    { name: 'Level 40 Kit', xp: 127500, category: 'Kit' },
    { name: 'Zwift Rockstar Glasses', xp: 134500, category: 'Glasses' },
    { name: 'La Z Claire Kit', xp: 142500, category: 'Kit' },
    { name: 'Retro 80s Helmet', xp: 150500, category: 'Helmet' },
    { name: 'Alpine Slopes (Ski) Kits', xp: 158500, category: 'Kit' },
    { name: 'Giro Synthe Helmet', xp: 166500, category: 'Helmet' },
    { name: 'Prism Kits', xp: 175500, category: 'Kit' },
    { name: 'Zwift Vintage Riding Goggles', xp: 184500, category: 'Glasses' },
    { name: 'Bont Shoes', xp: 193500, category: 'Shoes' },
    { name: 'Giro Vanquish Helmet', xp: 202500, category: 'Helmet' },
    { name: 'Level 50 kit + Fire Socks', xp: 212000, category: 'Kit' },
    { name: 'Junk Food Kit Pack', xp: 221500, category: 'Kit' },
    { name: "April Fools 80's Kit", xp: 231000, category: 'Kit' },
    { name: 'Fun Shaped Glasses', xp: 240500, category: 'Glasses' },
    { name: 'April Fools 80s Paint Job', xp: 250000, category: 'Kit' },
    { name: 'Rear View Mirror Glasses', xp: 260000, category: 'Glasses' },
    { name: 'Animal Print Pack', xp: 270000, category: 'Kit' },
    { name: 'Cute Socks', xp: 280000, category: 'Socks' },
    { name: 'April Fools 80s Socks', xp: 290000, category: 'Socks' },
    { name: 'Backwards Hat', xp: 300000, category: 'Cap' },
    { name: 'Level 60 Kit', xp: 310500, category: 'Kit' },
    { name: 'Cool Tone Gloves', xp: 321000, category: 'Gloves' },
    { name: 'Bike Packer Socks', xp: 331500, category: 'Socks' },
    { name: 'London Tube Kit', xp: 342000, category: 'Kit' },
    { name: 'Pop Art Shoes', xp: 352500, category: 'Shoes' },
    { name: 'Tortoise & The Hare Sock Pack', xp: 363500, category: 'Socks' },
    { name: 'Bike Packer Kit', xp: 374500, category: 'Kit' },
    { name: 'Giro Aries Spherical Helmet', xp: 385500, category: 'Helmet' },
    { name: 'Alpe du Knit Kit Pack', xp: 396500, category: 'Kit' },
    { name: 'Bike Packer Cap', xp: 407500, category: 'Cap' },
    { name: 'Level 70 Kit', xp: 418500, category: 'Kit' },
    { name: 'Scotty Squirrel Cap', xp: 429500, category: 'Cap' },
    { name: 'Makuri Blossoms Kit', xp: 441000, category: 'Kit' },
    { name: 'Dino Power Cap & Socks', xp: 452500, category: 'Combo' },
    { name: 'Outfield Kit', xp: 464000, category: 'Kit' },
    { name: 'Rapha Pro Team Shoes', xp: 475500, category: 'Shoes' },
    { name: 'Dino Power Kit', xp: 487000, category: 'Kit' },
    { name: 'Scotty Squirrel Socks', xp: 498500, category: 'Socks' },
    { name: 'Island Time Kit Pack', xp: 510000, category: 'Kit' },
    { name: 'Dino Power Shoes', xp: 522000, category: 'Shoes' },
    { name: 'Level 80 Kit', xp: 534000, category: 'Kit' },
    { name: 'Light Aero Helmet', xp: 546000, category: 'Helmet' },
    { name: 'Wolf Power Kit', xp: 558000, category: 'Kit' },
    { name: 'Rapha Pro Team Full Frame Sunglasses', xp: 570000, category: 'Glasses' },
    { name: 'Solid Color Kit Pack', xp: 582000, category: 'Kit' },
    { name: 'Nimbl Feat Ultimate Shoes', xp: 594000, category: 'Shoes' },
    { name: 'Kask Elemento Helmet', xp: 606500, category: 'Helmet' },
    { name: 'Gravel Party Kit', xp: 619000, category: 'Kit' },
    { name: 'Party Sock Pack', xp: 631500, category: 'Socks' },
    { name: 'Giro Imperial Shoes', xp: 644000, category: 'Shoes' },
    { name: 'Level 90 Kit', xp: 657000, category: 'Kit' },
    { name: 'Modern Kit', xp: 670000, category: 'Kit' },
    { name: 'Mirage Socks', xp: 683500, category: 'Socks' },
    { name: 'Out of This World Kit', xp: 697000, category: 'Kit' },
    { name: 'Mirage Cap', xp: 711000, category: 'Cap' },
    { name: 'Mirage Kit', xp: 725000, category: 'Kit' },
    { name: 'S-Works Evade 3 Helmet', xp: 740000, category: 'Helmet' },
    { name: 'Out of This World Socks', xp: 755000, category: 'Socks' },
    { name: 'Mirage Shoes', xp: 771000, category: 'Shoes' },
    { name: 'Mirage Helmet', xp: 787000, category: 'Helmet' },
    { name: 'Level 100 Kit + Confetti Socks', xp: 807000, category: 'Kit' }
];

export default function App() {
    const [currentXP, setCurrentXP] = useState(() => readStoredNumber(STORAGE_KEYS.currentXP, 50000));
    const [inputXP, setInputXP] = useState(() => String(readStoredNumber(STORAGE_KEYS.currentXP, 50000)));
    const [filter, setFilter] = useState(() => readStoredString(STORAGE_KEYS.filter, 'all'));
    const [selectedItem, setSelectedItem] = useState(null);
    const [viewMode, setViewMode] = useState(() => readStoredString(STORAGE_KEYS.viewMode, 'list'));

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEYS.currentXP, String(currentXP));
        } catch {}
    }, [currentXP]);

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEYS.filter, filter);
        } catch {}
    }, [filter]);

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEYS.viewMode, viewMode);
        } catch {}
    }, [viewMode]);

    const getItemImage = (item) => {
        const mapped = IMAGE_MAP[item.name];
        if (mapped) return `${PUBLIC_BASE_URL}${mapped}`;
        if (item.imageUrl) return item.imageUrl;

        const colors = {
            Kit: '#ff6b35',
            Helmet: '#4ecdc4',
            Glasses: '#f7b731',
            Shoes: '#a55eea',
            Gloves: '#fd79a8',
            Socks: '#26de81',
            Cap: '#fc5c65',
            Combo: '#45aaf2'
        };
        const color = colors[item.category] || '#95a5a6';

        const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="${color}"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            font-family="Arial" font-size="20" fill="white">${item.category}</text>
    </svg>`;

        return `data:image/svg+xml;base64,${btoa(svg)}`;
    };

    const stats = useMemo(() => {
        const unlocked = UNLOCKABLES.filter((item) => item.xp <= currentXP);
        const locked = UNLOCKABLES.filter((item) => item.xp > currentXP);
        const nextUnlock = locked.length > 0 ? locked[0] : null;
        const progress = (currentXP / UNLOCKABLES[UNLOCKABLES.length - 1].xp) * 100;

        return { unlocked, locked, nextUnlock, progress };
    }, [currentXP]);

    const handleUpdateXP = () => {
        const xp = parseInt(inputXP) || 0;
        setCurrentXP(xp);
    };

    const filteredItems = useMemo(() => {
        const sortAsc = (a, b) => a.xp - b.xp;
        const sortDesc = (a, b) => b.xp - a.xp;

        if (filter === 'unlocked') return [...stats.unlocked].sort(sortDesc);
        if (filter === 'locked') return [...stats.locked].sort(sortAsc);

        return [...UNLOCKABLES].sort(sortDesc);
    }, [filter, stats]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Trophy className="w-8 h-8 text-orange-600" />
                        <h1 className="text-3xl font-bold text-gray-800">Zwift XP Tracker</h1>
                    </div>

                    {/* XP Input */}
                    <div className="flex gap-3 mb-6">
                        <input
                            type="number"
                            value={inputXP}
                            onChange={(e) => setInputXP(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Enter your XP"
                        />
                        <button
                            onClick={handleUpdateXP}
                            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                        >
                            Update
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">Current XP</div>
                            <div className="text-2xl font-bold text-orange-600">{currentXP.toLocaleString()}</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">Unlocked</div>
                            <div className="text-2xl font-bold text-green-600">{stats.unlocked.length}</div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">Remaining</div>
                            <div className="text-2xl font-bold text-blue-600">{stats.locked.length}</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">Progress</div>
                            <div className="text-2xl font-bold text-purple-600">{stats.progress.toFixed(1)}%</div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                                style={{ width: `${Math.min(stats.progress, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Next Unlock */}
                    {stats.nextUnlock && (
                        <div className="mt-6 bg-gradient-to-r from-yellow-50 via-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl shadow-md p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <TrendingUp className="w-6 h-6 text-orange-600" />
                                <h2 className="text-lg font-bold text-gray-800">Next Unlock</h2>
                                <span className="ml-auto text-sm font-semibold text-orange-700 bg-orange-100 px-3 py-1 rounded-full">
                                    {(stats.nextUnlock.xp - currentXP).toLocaleString()} XP to go
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <img
                                    src={getItemImage(stats.nextUnlock)}
                                    alt={stats.nextUnlock.name}
                                    className="w-20 h-20 rounded-xl object-cover border-2 border-orange-200 shadow-sm"
                                />
                                <div>
                                    <div className="text-xl font-semibold text-gray-800">{stats.nextUnlock.name}</div>
                                    <div className="text-sm text-gray-600">{stats.nextUnlock.category}</div>
                                    <div className="text-sm font-semibold text-gray-700 mt-1">
                                        {stats.nextUnlock.xp.toLocaleString()} XP required
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filter and View Toggle */}
                <div className="bg-white rounded-lg shadow-xl p-4 mb-6">
                    <div className="flex justify-between items-center flex-wrap gap-3">
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    filter === 'all'
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                All ({UNLOCKABLES.length})
                            </button>
                            <button
                                onClick={() => setFilter('unlocked')}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    filter === 'unlocked'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Unlocked ({stats.unlocked.length})
                            </button>
                            <button
                                onClick={() => setFilter('locked')}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    filter === 'locked'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Locked ({stats.locked.length})
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    viewMode === 'list'
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                List
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    viewMode === 'grid'
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Grid
                            </button>
                        </div>
                    </div>
                </div>

                {/* Items Display */}
                <div className="bg-white rounded-lg shadow-xl p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        {filter === 'all' ? 'All Items' : filter === 'unlocked' ? 'Unlocked Items' : 'Locked Items'}
                    </h2>

                    {viewMode === 'list' ? (
                        <div className="space-y-2">
                            {filteredItems.map((item, idx) => {
                                const isUnlocked = item.xp <= currentXP;
                                return (
                                    <div
                                        key={idx}
                                        className={`flex items-center justify-between p-4 rounded-lg transition-all cursor-pointer hover:shadow-md ${
                                            isUnlocked
                                                ? 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200'
                                                : 'bg-gray-50 border border-gray-200'
                                        }`}
                                        onClick={() => setSelectedItem(item)}
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <img
                                                src={getItemImage(item)}
                                                alt={item.name}
                                                className="w-12 h-12 rounded-lg object-cover"
                                            />
                                            {isUnlocked ? (
                                                <Unlock className="w-5 h-5 text-green-600 flex-shrink-0" />
                                            ) : (
                                                <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                            )}
                                            <div className="flex-1">
                                                <div
                                                    className={`font-semibold ${isUnlocked ? 'text-gray-800' : 'text-gray-600'}`}
                                                >
                                                    {item.name}
                                                </div>
                                                <div className="text-sm text-gray-500">{item.category}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <div
                                                    className={`font-bold ${isUnlocked ? 'text-green-600' : 'text-gray-500'}`}
                                                >
                                                    {item.xp.toLocaleString()} XP
                                                </div>
                                                {!isUnlocked && (
                                                    <div className="text-sm text-gray-500">
                                                        {(item.xp - currentXP).toLocaleString()} to go
                                                    </div>
                                                )}
                                            </div>
                                            <Eye className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredItems.map((item, idx) => {
                                const isUnlocked = item.xp <= currentXP;
                                return (
                                    <div
                                        key={idx}
                                        className={`relative p-4 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                                            isUnlocked
                                                ? 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300'
                                                : 'bg-gray-100 border-2 border-gray-300'
                                        }`}
                                        onClick={() => setSelectedItem(item)}
                                    >
                                        <div className="absolute top-2 right-2">
                                            {isUnlocked ? (
                                                <Unlock className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <Lock className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                        <img
                                            src={getItemImage(item)}
                                            alt={item.name}
                                            className="w-full aspect-square rounded-lg object-cover mb-3"
                                        />
                                        <div
                                            className={`font-semibold text-sm mb-1 ${isUnlocked ? 'text-gray-800' : 'text-gray-600'}`}
                                        >
                                            {item.name}
                                        </div>
                                        <div className="text-xs text-gray-500 mb-2">{item.category}</div>
                                        <div
                                            className={`text-sm font-bold ${isUnlocked ? 'text-green-600' : 'text-gray-500'}`}
                                        >
                                            {item.xp.toLocaleString()} XP
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {selectedItem && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedItem(null)}
                >
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-2xl font-bold text-gray-800">{selectedItem.name}</h3>
                            <button onClick={() => setSelectedItem(null)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <img
                            src={getItemImage(selectedItem)}
                            alt={selectedItem.name}
                            className="w-full max-h-96 object-contain rounded-lg mb-4"
                        />
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Category:</span>
                                <span className="font-semibold text-gray-800">{selectedItem.category}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Required XP:</span>
                                <span className="font-semibold text-gray-800">{selectedItem.xp.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Status:</span>
                                <span
                                    className={`font-semibold ${selectedItem.xp <= currentXP ? 'text-green-600' : 'text-gray-500'}`}
                                >
                                    {selectedItem.xp <= currentXP
                                        ? 'Unlocked'
                                        : `Locked (${(selectedItem.xp - currentXP).toLocaleString()} XP to go)`}
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                            <p className="text-blue-900 font-semibold mb-1">📸 About Images</p>
                            <p className="text-blue-800">
                                Currently showing color-coded placeholders. Real Zwift unlock images can be found on the{' '}
                                <a
                                    href="https://zwift.fandom.com/wiki/Cycling_Jerseys"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline"
                                >
                                    Zwift Wiki
                                </a>
                                . To add real images, update each item with an{' '}
                                <code className="bg-blue-100 px-1 rounded">imageUrl</code> property.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
