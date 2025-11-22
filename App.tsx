import React, { useState, useCallback } from 'react';
import { AppStep, ImageData, EditResult } from './types';
import { NavBar } from './components/NavBar';
import { ImageUploader } from './components/ImageUploader';
import { Button } from './components/Button';
import { editImageWithGemini } from './services/gemini';

function App() {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<EditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = useCallback((data: ImageData) => {
    setImageData(data);
    setStep(AppStep.EDIT);
    setError(null);
  }, []);

  const handleGenerate = async () => {
    if (!imageData || !prompt.trim()) return;

    setStep(AppStep.PROCESSING);
    setError(null);

    try {
      const response = await editImageWithGemini(imageData.base64, imageData.mimeType, prompt);
      
      if (response.imageUri) {
        setResult({
          imageUrl: response.imageUri,
          text: response.text
        });
        setStep(AppStep.RESULT);
      } else {
        // Fallback if no image returned but maybe text explanation
        setError(response.text || "Failed to generate an image. Please try again.");
        setStep(AppStep.EDIT);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong connecting to Gemini. Please check your API key or try again later.");
      setStep(AppStep.EDIT);
    }
  };

  const handleReset = () => {
    setStep(AppStep.UPLOAD);
    setImageData(null);
    setResult(null);
    setPrompt('');
    setError(null);
  };

  const handleEditAgain = () => {
    setStep(AppStep.EDIT);
    setResult(null);
    setError(null);
  };

  const downloadImage = () => {
    if (!result?.imageUrl) return;
    const link = document.createElement('a');
    link.href = result.imageUrl;
    link.download = 'ex-photo-edited.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
      <NavBar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        {/* Header Text */}
        {step === AppStep.UPLOAD && (
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
              Remove the <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">unwanted</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Upload a portrait and use AI to seamlessly remove people or objects. 
              Just type what you want gone, and watch the magic happen.
            </p>
          </div>
        )}

        {/* Step: UPLOAD */}
        {step === AppStep.UPLOAD && (
          <div className="w-full animate-fade-in-up">
            <ImageUploader onImageSelected={handleImageSelected} />
          </div>
        )}

        {/* Step: EDIT & PROCESSING */}
        {(step === AppStep.EDIT || step === AppStep.PROCESSING) && imageData && (
          <div className="w-full max-w-4xl bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700 p-6 sm:p-8 shadow-2xl animate-fade-in">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Image Preview */}
              <div className="w-full md:w-1/2">
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 group">
                   <img 
                    src={imageData.previewUrl} 
                    alt="Original" 
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white">
                    Original
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="w-full md:w-1/2 flex flex-col h-full justify-center space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Magic Eraser</h2>
                  <p className="text-slate-400 text-sm">Describe what or who you want to remove from the photo.</p>
                </div>

                <div className="space-y-4">
                  <label htmlFor="prompt" className="block text-sm font-medium text-slate-300">
                    Instruction
                  </label>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Remove the person on the left, make the background empty..."
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none resize-none h-32 transition-all"
                    disabled={step === AppStep.PROCESSING}
                  />
                </div>
                
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button 
                    onClick={handleGenerate} 
                    disabled={!prompt.trim()} 
                    isLoading={step === AppStep.PROCESSING}
                    className="flex-1"
                  >
                    Generate Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                    disabled={step === AppStep.PROCESSING}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step: RESULT */}
        {step === AppStep.RESULT && result && imageData && (
          <div className="w-full max-w-6xl animate-fade-in">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700 p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col items-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Edit Complete!</h2>
                <p className="text-slate-400">Here is your edited photo.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                 {/* Original (Small comparison) */}
                 <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Original</span>
                    <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900/50 border border-slate-700/50 aspect-[3/4]">
                      <img 
                        src={imageData.previewUrl} 
                        alt="Original" 
                        className="w-full h-full object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
                      />
                    </div>
                 </div>

                 {/* Result (Main) */}
                 <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-violet-400 uppercase tracking-wider">Edited Result</span>
                    <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-violet-500/30 shadow-lg shadow-violet-900/20 aspect-[3/4]">
                      <img 
                        src={result.imageUrl} 
                        alt="Edited Result" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                 </div>
              </div>

              {result.text && (
                 <div className="mb-8 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                    <p className="text-slate-300 text-sm italic">"{result.text}"</p>
                 </div>
              )}

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  onClick={downloadImage}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  }
                >
                  Download Image
                </Button>
                <Button variant="secondary" onClick={handleEditAgain}>
                  Edit Same Photo
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Start New
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full py-6 text-center text-slate-600 text-sm">
        <p>© {new Date().getFullYear()} Ex-Photo. Powered by Google Gemini 2.5 Flash.</p>
      </footer>
    </div>
  );
}

export default App;
