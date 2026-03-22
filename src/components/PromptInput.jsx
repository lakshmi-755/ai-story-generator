import React, { useRef } from 'react';
import { Mic, Upload } from 'lucide-react';

const PromptInput = ({
    userPrompt, setUserPrompt,
    imageInput, setImageInput,
    voiceInput, setVoiceInput,
}) => {
    const fileRef = useRef(null);
    const mediaRef = useRef(null);

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create a FileReader to convert the image to a Base64 string
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {
            // Save both the file name (for the button text) and the base64 string (for the API)
            setImageInput({
                name: file.name,
                base64: reader.result
            });
        };

        reader.onerror = (error) => {
            console.error('Error reading file:', error);
            alert('Failed to read image file.');
        };
    };


    // 2. Clear old state
    setVoiceInput('🎧 Listening...');

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        // 3. Append to userPrompt or set it
        setUserPrompt(prev => prev ? prev + ' ' + transcript : transcript);
        setVoiceInput('✅ Done!');
        setTimeout(() => setVoiceInput(''), 2000);
    };

    recognition.onerror = (event) => {
        console.error('Speech Recognition Error:', event.error);
        setVoiceInput(`❌ Error: ${event.error}`);
        setTimeout(() => setVoiceInput(''), 3000);
    };

    recognition.onend = () => {
        if (voiceInput === '🎧 Listening...') {
            setVoiceInput('');
        }
    };

    recognition.start();
};

return (
    <div className="bg-white/70 backdrop-blur rounded-2xl shadow-md p-6 mb-6 border border-yellow-100">
        <h2 className="text-xl font-black text-yellow-700 mb-4 flex items-center gap-2">
            ✍️ Your Story Idea
        </h2>

        {/* Main prompt */}
        <textarea
            value={userPrompt}
            onChange={e => setUserPrompt(e.target.value)}
            rows={4}
            placeholder="Example: A curious dragon who wants to learn coding. 🐉💻"
            className="w-full rounded-xl border-2 border-yellow-200 bg-yellow-50/60 focus:outline-none
                   focus:border-yellow-400 focus:bg-white transition p-4 text-gray-700
                   placeholder:text-yellow-400 font-semibold resize-none text-sm leading-relaxed"
        />



        {/* Image & Voice */}
        <div className="mt-4 flex flex-wrap gap-3">
            {/* Image Upload */}
            <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-purple-200
                     bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-sm
                     transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
                <Upload size={16} />
                {imageInput ? imageInput.name : 'Upload Image'}

            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

            {/* Voice Input */}
            <button
                type="button"
                onClick={handleVoiceRecord}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-bold text-sm
                      transition-all hover:scale-105 active:scale-95 cursor-pointer
                      ${voiceInput
                        ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                        : 'border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100'
                    }`}
            >
                <Mic size={16} className={voiceInput ? 'animate-pulse text-red-500' : ''} />
                {voiceInput ? voiceInput : 'Voice Input'}
            </button>
        </div>
    </div>
);
};

export default PromptInput;
