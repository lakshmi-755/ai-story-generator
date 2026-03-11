import React from 'react';

const groups = [
    { label: 'Kids', emoji: '🧒', desc: 'Ages 3 – 10' },
    { label: 'Teens', emoji: '🧑', desc: 'Ages 11 – 17' },
    { label: 'Adults', emoji: '👤', desc: 'Ages 18 +' },
];

const AgeGroupSelector = ({ ageGroup, setAgeGroup }) => {
    return (
        <div className="bg-white/70 backdrop-blur rounded-2xl shadow-md p-6 mb-6 border border-orange-100">
            <h2 className="text-xl font-black text-orange-700 mb-4 flex items-center gap-2">
                👤 Age Group
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {groups.map(({ label, emoji, desc }) => {
                    const isSelected = ageGroup === label;
                    return (
                        <button
                            key={label}
                            onClick={() => setAgeGroup(label)}
                            className={`
                flex flex-col items-center gap-1 px-5 py-4 rounded-2xl border-2 font-bold
                transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer
                ${isSelected
                                    ? 'bg-orange-400 border-orange-500 text-white shadow-lg scale-105'
                                    : 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
                                }
              `}
                        >
                            <span className="text-3xl">{emoji}</span>
                            <span className="text-base">{label}</span>
                            <span className={`text-xs font-medium ${isSelected ? 'text-orange-100' : 'text-orange-400'}`}>
                                {desc}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default AgeGroupSelector;
