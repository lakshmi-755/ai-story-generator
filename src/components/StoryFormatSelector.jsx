import React from 'react';

const formats = [
    { label: 'Text Story', emoji: '📝', desc: 'Pure written story' },
    { label: 'Story with Images', emoji: '🖼️', desc: 'Story + image placeholders' },
    { label: 'Audio Story', emoji: '🎧', desc: 'Story with audio player' },
];

const StoryFormatSelector = ({ storyFormat, setStoryFormat }) => {
    return (
        <div className="bg-white/70 backdrop-blur rounded-2xl shadow-md p-6 mb-6 border border-green-100">
            <h2 className="text-xl font-black text-green-700 mb-4 flex items-center gap-2">
                🎨 Story Format
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {formats.map(({ label, emoji, desc }) => {
                    const isSelected = storyFormat === label;
                    return (
                        <button
                            key={label}
                            onClick={() => setStoryFormat(label)}
                            className={`
                flex flex-col items-center gap-1 px-5 py-4 rounded-2xl border-2 font-bold
                transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer
                ${isSelected
                                    ? 'bg-green-500 border-green-600 text-white shadow-lg scale-105'
                                    : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                                }
              `}
                        >
                            <span className="text-3xl">{emoji}</span>
                            <span className="text-base">{label}</span>
                            <span className={`text-xs font-medium ${isSelected ? 'text-green-100' : 'text-green-400'}`}>
                                {desc}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default StoryFormatSelector;
