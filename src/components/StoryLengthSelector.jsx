import React from 'react';

const lengths = [
    { label: 'Short Story', emoji: '📄', desc: '~150 words' },
    { label: 'Medium Story', emoji: '📃', desc: '~400 words' },
    { label: 'Long Story', emoji: '📜', desc: '~800 words' },
];

const StoryLengthSelector = ({ storyLength, setStoryLength }) => {
    return (
        <div className="bg-white/70 backdrop-blur rounded-2xl shadow-md p-6 mb-6 border border-blue-100">
            <h2 className="text-xl font-black text-blue-700 mb-4 flex items-center gap-2">
                📏 Story Length
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {lengths.map(({ label, emoji, desc }) => {
                    const isSelected = storyLength === label;
                    return (
                        <button
                            key={label}
                            onClick={() => setStoryLength(label)}
                            className={`
                flex flex-col items-center gap-1 px-5 py-4 rounded-2xl border-2 font-bold
                transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer
                ${isSelected
                                    ? 'bg-blue-500 border-blue-600 text-white shadow-lg scale-105'
                                    : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                                }
              `}
                        >
                            <span className="text-3xl">{emoji}</span>
                            <span className="text-base">{label}</span>
                            <span className={`text-xs font-medium ${isSelected ? 'text-blue-100' : 'text-blue-400'}`}>
                                {desc}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default StoryLengthSelector;
