import React from 'react';
import { BookOpenText, Sparkles } from 'lucide-react';

const Header = () => {
    return (
        <header className="relative overflow-hidden bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-300 rounded-3xl shadow-xl p-8 mb-8 text-center">
            {/* Floating decorative bubbles */}
            <div className="absolute top-3 left-6 w-10 h-10 bg-white/20 rounded-full animate-bounce-slow" />
            <div className="absolute top-6 right-12 w-6 h-6 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-4 left-1/4 w-8 h-8 bg-white/20 rounded-full animate-bounce-slow" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-3 right-1/3 w-5 h-5 bg-white/20 rounded-full animate-bounce" />

            <div className="relative flex items-center justify-center gap-3 mb-2">
                <BookOpenText className="text-white drop-shadow" size={40} />
                <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg tracking-tight">
                    AI Story Generator
                </h1>
                <Sparkles className="text-yellow-100 drop-shadow animate-pulse" size={36} />
            </div>

            <p className="text-white/90 text-lg md:text-xl font-semibold mt-1 drop-shadow">
                ✨ Create magical stories instantly ✨
            </p>

            <div className="flex justify-center gap-4 mt-4 text-2xl">
                {['🧙‍♂️', '🐉', '🚀', '🌈', '📖', '⭐'].map((emoji, i) => (
                    <span
                        key={i}
                        className="animate-bounce-slow"
                        style={{ animationDelay: `${i * 0.2}s` }}
                    >
                        {emoji}
                    </span>
                ))}
            </div>
        </header>
    );
};

export default Header;
