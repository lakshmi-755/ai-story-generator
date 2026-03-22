import { useState } from 'react';
import Header from './components/Header';
import GenreSelector from './components/GenreSelector';
import StoryLengthSelector from './components/StoryLengthSelector';
import StoryFormatSelector from './components/StoryFormatSelector';
import AgeGroupSelector from './components/AgeGroupSelector';
import PromptInput from './components/PromptInput';
import GenerateButton from './components/GenerateButton';
import StoryOutput from './components/StoryOutput';

/* ─── AWS API Gateway URL ───────────────────────────────────── */
const API_URL = 'https://11u1l1nun3.execute-api.us-east-1.amazonaws.com/generate';
const SCENE_API_URL = 'https://3in2oeru47.execute-api.us-east-1.amazonaws.com/scene';
const IMAGE_API_URL = 'https://vbkr23srrd.execute-api.us-east-1.amazonaws.com/image_handler'; // 🖼️ Real AI Image Generation API
const VISION_API_URL = 'https://it14gyee39.execute-api.us-east-1.amazonaws.com/vision'; // 👁️ Vision Lambda API

/* ─── Loading Overlay ───────────────────────────────────────── */
const LoadingOverlay = ({ status }) => (
  <div className="flex flex-col items-center justify-center py-14 animate-fade-in">
    <div className="relative w-20 h-20 mb-5">
      <div className="absolute inset-0 rounded-full border-4 border-purple-200" />
      <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 border-r-pink-400 animate-spin" />
      <div className="absolute inset-3 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-2xl animate-bounce-slow">
        ✨
      </div>
    </div>
    <p className="text-xl font-black text-purple-600 animate-pulse">
      {status === 'vision' ? 'Analyzing uploaded image...' : status === 'scenes' ? 'Visualizing Scenes…' : status === 'images' ? 'Generating Magic Visuals…' : 'Generating your story…'}
    </p>
    <p className="text-sm text-purple-400 font-semibold mt-1 text-center">
      {status === 'vision' ? 'Extracting physical traits 👁️' : status === 'scenes' ? 'Creating magical image prompts 🎨' : status === 'images' ? 'Drawing scenes with AI magic 🖌️' : 'Weaving magic words together 🪄'}
    </p>
  </div>
);

/* ─── Section Card wrapper ──────────────────────────────────── */
/* (Each section is self-contained in its own component, so this is just App.jsx) */

/* ─── App ───────────────────────────────────────────────────── */
function App() {
  const [selectedGenre, setSelectedGenre] = useState('');
  const [storyLength, setStoryLength] = useState('Short Story');
  const [storyFormat, setStoryFormat] = useState('Text Story');
  const [ageGroup, setAgeGroup] = useState('Kids');
  const [userPrompt, setUserPrompt] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [voiceInput, setVoiceInput] = useState('');
  const [storyOutput, setStoryOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('story'); // 'story' or 'scenes'

  const handleGenerate = async () => {
    setLoading(true);
    setLoadingStatus('story');
    setStoryOutput(null);

    try {
      let finalPrompt = userPrompt;

      // 0. Extract Vision Traits if image exists
      if (imageInput && imageInput.base64 && VISION_API_URL && !VISION_API_URL.includes('REPLACE')) {
        setLoadingStatus('vision');
        try {
          const visionRes = await fetch(VISION_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: imageInput.base64 })
          });
          if (visionRes.ok) {
            const visionData = await visionRes.json();
            if (visionData.traits) {
               finalPrompt = `The main character is a ${visionData.traits}. ` + finalPrompt;
            }
          } else {
             console.error('Vision API responded with error', visionRes.status);
          }
        } catch (e) {
          console.error('Vision extraction network failed:', e);
        }
      }

      setLoadingStatus('story');

      // 1. Generate Story Text
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre: selectedGenre,
          storyLength: storyLength,
          ageGroup: ageGroup,
          userPrompt: finalPrompt
        }),


      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.body || `Server error: ${response.status}`);
      }

      const story = await response.json(); // { title: '...', body: '...' }

      // 2. Extract Scenes if format is "Story with Images"
      if (storyFormat === 'Story with Images') {
        setLoadingStatus('scenes');
        try {
          const scenesResponse = await fetch(SCENE_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              storyText: story.body,
              storyLength: storyLength.split(' ')[0].toLowerCase() // "short", "medium", or "long"
            }),
          });

          if (scenesResponse.ok) {
            const scenes = await scenesResponse.json();
            story.scenes = scenes; // Add scenes to the story object

            // 3. Generate Images for each scene (Sequentially to avoid rate limits)
            if (IMAGE_API_URL && !IMAGE_API_URL.includes('REPLACE')) {
              setLoadingStatus('images');
              const generatedImages = [];
              for (const prompt of scenes) {
                try {
                  const imgRes = await fetch(IMAGE_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ scenePrompt: prompt })
                  });
                  if (imgRes.ok) {
                    const imgData = await imgRes.json();
                    generatedImages.push(imgData.image); // base64 string
                  } else {
                    console.error(`Image generation failed with status ${imgRes.status} for prompt:`, prompt);
                    generatedImages.push(null);
                  }
                } catch (e) {
                  console.error('Image generation network error for prompt:', prompt, e);
                  generatedImages.push(null);
                }
              }
              story.images = generatedImages;
            }
          }
        } catch (sceneError) {
          console.error('Scene extraction failed:', sceneError);
          // Don't fail the whole story generation if scenes fail
          story.scenes = [];
        }
      }

      setStoryOutput(story);

    } catch (error) {
      console.error('Story generation error:', error);
      setStoryOutput({
        title: 'Oops! Something went wrong 😕',
        body: 'Could not generate story. Please check your connection and try again.\n\nError: ' + error.message,
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        document.getElementById('story-output')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleClear = () => {
    setStoryOutput(null);
    setUserPrompt('');
    setImageInput('');
    setVoiceInput('');
    setSelectedGenre('');
    setStoryLength('Short Story');
    setStoryFormat('Text Story');
    setAgeGroup('Kids');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Header />

        <GenreSelector
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
        />

        <StoryLengthSelector
          storyLength={storyLength}
          setStoryLength={setStoryLength}
        />

        <StoryFormatSelector
          storyFormat={storyFormat}
          setStoryFormat={setStoryFormat}
        />

        <AgeGroupSelector
          ageGroup={ageGroup}
          setAgeGroup={setAgeGroup}
        />

        <PromptInput
          userPrompt={userPrompt} setUserPrompt={setUserPrompt}
          imageInput={imageInput} setImageInput={setImageInput}
          voiceInput={voiceInput} setVoiceInput={setVoiceInput}
        />

        <GenerateButton onClick={handleGenerate} loading={loading} />

        {loading && <LoadingOverlay status={loadingStatus} />}

        <div id="story-output">
          <StoryOutput
            storyOutput={storyOutput}
            storyFormat={storyFormat}
            onClear={handleClear}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
