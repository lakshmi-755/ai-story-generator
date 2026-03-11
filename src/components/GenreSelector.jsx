import React from 'react';

const genres = [
    { label: 'Fairy Tales', emoji: '🧚' },
    { label: 'Adventure', emoji: '🗺️' },
    { label: 'Funny', emoji: '😂' },
    { label: 'Moral Values', emoji: '💎' },
    { label: 'Parenting Stories', emoji: '👨‍👩‍👧' },
    { label: 'Fantasy', emoji: '🐉' },
    { label: 'Sci-Fi', emoji: '🚀' },
    { label: 'Mystery', emoji: '🔍' },
    { label: 'Horror', emoji: '👻' },
    { label: 'Bedtime Stories', emoji: '🌙' },
    { label: 'Motivational', emoji: '🌟' },
];

const colorMap = [
    'bg-pink-100   hover:bg-pink-200   border-pink-300   text-pink-700',
    'bg-yellow-100 hover:bg-yellow-200 border-yellow-300 text-yellow-700',
    'bg-green-100  hover:bg-green-200  border-green-300  text-green-700',
    'bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-700',
    'bg-blue-100   hover:bg-blue-200   border-blue-300   text-blue-700',
    'bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-700',
    'bg-indigo-100 hover:bg-indigo-200 border-indigo-300 text-indigo-700',
    'bg-teal-100   hover:bg-teal-200   border-teal-300   text-teal-700',
    'bg-red-100    hover:bg-red-200    border-red-300    text-red-700',
    'bg-sky-100    hover:bg-sky-200    border-sky-300    text-sky-700',
    'bg-lime-100   hover:bg-lime-200   border-lime-300   text-lime-700',
];

const GenreSelector = ({ selectedGenre, setSelectedGenre }) => {
    return (
        <div className="bg-white/70 backdrop-blur rounded-2xl shadow-md p-6 mb-6 border border-purple-100">
            <h2 className="text-xl font-black text-purple-700 mb-4 flex items-center gap-2">
                📚 Choose a Genre
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {genres.map((genre, i) => {
                    const isSelected = selectedGenre === genre.label;
                    return (
                        <button
                            key={genre.label}
                            onClick={() => setSelectedGenre(isSelected ? '' : genre.label)}
                            className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-bold text-sm
                transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer
                ${colorMap[i % colorMap.length]}
                ${isSelected
                                    ? 'ring-3 ring-purple-400 ring-offset-1 shadow-lg scale-105 brightness-95'
                                    : 'shadow-sm'
                                }
              `}
                        >
                            <span className="text-lg">{genre.emoji}</span>
                            <span>{genre.label}</span>
                            {isSelected && <span className="ml-auto text-xs">✓</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default GenreSelector;
