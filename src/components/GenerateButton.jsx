import React from 'react';
import { Sparkles } from 'lucide-react';

const GenerateButton = ({ onClick, loading }) => {
    return (
        <div className="flex justify-center my-8">
            <button
                onClick={onClick}
                disabled={loading}
                className={`
          relative flex items-center gap-3 px-10 py-5 rounded-2xl text-xl font-black
          shadow-2xl transition-all duration-300 cursor-pointer
          ${loading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed scale-95'
                        : 'bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 text-white hover:scale-110 active:scale-95 hover:shadow-pink-300/60'
                    }
        `}
                style={loading ? {} : { boxShadow: '0 8px 32px rgba(180,100,255,0.4)' }}
            >
                {loading ? (
                    <>
                        <svg className="animate-spin h-6 w-6 text-gray-500" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Generating…
                    </>
                ) : (
                    <>
                        <Sparkles className="animate-pulse" size={26} />
                        ✨ Generate Story
                        <Sparkles className="animate-pulse" size={26} />
                    </>
                )}
            </button>
        </div>
    );
};

export default GenerateButton;
