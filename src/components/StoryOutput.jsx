import React, { useRef } from "react";
import { Copy, Download, Trash2, Volume2, Pause, Play } from "lucide-react";
import { useState, useEffect } from "react";

/* ---------- helpers ---------- */

const splitIntoParagraphs = (text) =>
    text
        .split(/\n+/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

/* ---------- component ---------- */

const StoryOutput = ({ storyOutput, storyFormat, onClear }) => {
    const storyRef = useRef(null);
    const activeWordRef = useRef(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentCharIndex, setCurrentCharIndex] = useState(-1);

    /* ---- Speech Logic ---- */

    const handleSpeak = () => {
        if (!window.speechSynthesis) return;

        // Cancel any existing speech
        window.speechSynthesis.cancel();
        setProgress(0);

        const cleanBodyText = (storyOutput.body || "")
            .replace(/\\n/g, "\n")
            .replace(/```json|```/g, "")
            .trim();

        const fullText = `${storyOutput.title}. ${cleanBodyText}`;
        const utterance = new SpeechSynthesisUtterance(fullText);

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            setProgress(0);
            setCurrentCharIndex(-1);
        };
        utterance.onerror = () => {
            setIsSpeaking(false);
            setProgress(0);
            setCurrentCharIndex(-1);
        };

        // Track progress and word highlighting
        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                const percentage = (event.charIndex / fullText.length) * 100;
                setProgress(percentage);

                // Adjust index for title + dot + space prefix
                const offset = storyOutput.title.length + 2;
                if (event.charIndex >= offset) {
                    setCurrentCharIndex(event.charIndex - offset);
                } else {
                    setCurrentCharIndex(-1);
                }
            }
        };

        window.speechSynthesis.speak(utterance);
    };

    const handleStop = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setProgress(0);
            setCurrentCharIndex(-1);
        }
    };

    // Auto-scroll to active word
    useEffect(() => {
        if (isSpeaking && activeWordRef.current) {
            activeWordRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [currentCharIndex, isSpeaking]);

    // Auto-play when format is Audio Story
    useEffect(() => {
        if (storyOutput && storyFormat === "Audio Story") {
            // Short delay to ensure UI is ready
            const timer = setTimeout(() => {
                handleSpeak();
            }, 500);
            return () => {
                clearTimeout(timer);
                window.speechSynthesis?.cancel();
            };
        }
        return () => window.speechSynthesis?.cancel();
    }, [storyOutput, storyFormat]);

    if (!storyOutput) return null;

    const { title, body } = storyOutput;

    /* ---- Clean AI Output ---- */

    const cleanBody = (body || "")
        .replace(/\\n/g, "\n")
        .replace(/```json|```/g, "")
        .trim();

    const paragraphs = splitIntoParagraphs(cleanBody);

    const withImages = storyFormat === "Story with Images";
    const withAudio = storyFormat === "Audio Story";

    /* ---- actions ---- */

    const handleCopy = () => {
        navigator.clipboard.writeText(`${title}\n\n${cleanBody}`);
        alert("📋 Story copied to clipboard!");
    };

    const handleDownload = () => {
        const blob = new Blob([`${title}\n\n${cleanBody}`], {
            type: "text/plain"
        });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${title.replace(/\s+/g, "_")}.txt`;

        a.click();

        URL.revokeObjectURL(url);
    };

    return (
        <div className="animate-slide-up bg-white/80 backdrop-blur rounded-2xl shadow-xl p-6 mb-6 border border-purple-100">

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">

                <h2 className="text-3xl font-bold text-purple-700 flex items-center gap-2">
                    📖 {title}
                </h2>

                <div className="flex gap-2">

                    <button
                        onClick={handleCopy}
                        title="Copy Story"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold text-sm transition-all hover:scale-105 active:scale-95"
                    >
                        <Copy size={15} /> Copy
                    </button>

                    <button
                        onClick={handleDownload}
                        title="Download Story"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-100 hover:bg-green-200 text-green-700 font-bold text-sm transition-all hover:scale-105 active:scale-95"
                    >
                        <Download size={15} /> Download
                    </button>

                    <button
                        onClick={onClear}
                        title="Clear Story"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-bold text-sm transition-all hover:scale-105 active:scale-95"
                    >
                        <Trash2 size={15} /> Clear
                    </button>

                </div>
            </div>

            {/* Story Body */}

            <div
                ref={storyRef}
                className="space-y-6 pt-4 border-t border-purple-50"
            >

                {(() => {
                    let cumulativeCharCount = 0;
                    return paragraphs.map((para, paraIdx) => {
                        const words = para.split(/(\s+)/); // Keep whitespace
                        const paraStartOffset = cumulativeCharCount;
                        cumulativeCharCount += para.length + 1; // +1 for the \n break conceptually

                        return (
                            <React.Fragment key={paraIdx}>
                                <p className="text-gray-700 leading-relaxed text-lg font-medium">
                                    {(() => {
                                        let currentParaCharOffset = 0;
                                        return words.map((word, wordIdx) => {
                                            const globalStart = paraStartOffset + currentParaCharOffset;
                                            const globalEnd = globalStart + word.length;
                                            const isHighlighted = isSpeaking &&
                                                currentCharIndex >= globalStart &&
                                                currentCharIndex < globalEnd &&
                                                word.trim().length > 0;

                                            currentParaCharOffset += word.length;

                                            return (
                                                <span
                                                    key={wordIdx}
                                                    ref={isHighlighted ? activeWordRef : null}
                                                    className={`transition-colors duration-200 rounded px-0.5 ${isHighlighted
                                                        ? 'bg-yellow-300 text-purple-900 shadow-sm'
                                                        : ''
                                                        }`}
                                                >
                                                    {word}
                                                </span>
                                            );
                                        });
                                    })()}
                                </p>

                                {withImages && (paraIdx + 1) % 2 === 0 && paraIdx !== paragraphs.length - 1 && (
                                    <div className="my-6 animate-fade-in">
                                        {storyOutput.images && storyOutput.images[Math.floor(paraIdx / 2)] && (
                                            <div className="relative group overflow-hidden rounded-2xl shadow-lg border-2 border-purple-100">
                                                <img
                                                    src={storyOutput.images[Math.floor(paraIdx / 2)]}
                                                    alt={`Scene ${Math.floor(paraIdx / 2) + 1}`}
                                                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <p className="text-white text-xs font-medium italic">
                                                        {storyOutput.scenes?.[Math.floor(paraIdx / 2)]}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    });
                })()}
            </div>

            {/* Audio UI */}

            {withAudio && (
                <div className="mt-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-5 border border-purple-200 animate-fade-in">

                    <div className="flex items-center gap-3 mb-3">
                        <Volume2 className="text-purple-500" size={22} />
                        <span className="font-black text-purple-700">
                            🎧 Audio Narration
                        </span>
                    </div>

                    <div className="w-full bg-white rounded-xl p-3 shadow-inner">

                        <p className="text-xs text-gray-400 font-semibold mb-2 text-center">
                            Audio narration powered by Web Speech API
                        </p>

                        <div className="flex justify-center mb-4">
                            {isSpeaking ? (
                                <button
                                    onClick={handleStop}
                                    className="p-4 rounded-full bg-purple-500 text-white shadow-lg hover:bg-purple-600 transition-all hover:scale-110 active:scale-95"
                                >
                                    <Pause size={24} fill="currentColor" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSpeak}
                                    className="p-4 rounded-full bg-purple-500 text-white shadow-lg hover:bg-purple-600 transition-all hover:scale-110 active:scale-95"
                                >
                                    <Play size={24} fill="currentColor" className="ml-1" />
                                </button>
                            )}
                        </div>

                        {/* Equalizer */}

                        <div className="flex items-end justify-center gap-1 h-10">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-2 bg-gradient-to-t from-purple-400 to-pink-400 rounded-full ${isSpeaking ? 'animate-pulse' : 'h-2 opacity-30'}`}
                                    style={{
                                        height: isSpeaking ? `${20 + Math.sin(i * 0.8) * 16}px` : '8px'
                                    }}
                                />
                            ))}
                        </div>

                        {/* Seek bar */}

                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 font-semibold px-2">

                            <div className="flex-1 h-2 bg-purple-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default StoryOutput;