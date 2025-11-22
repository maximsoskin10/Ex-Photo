import React, { useCallback, useRef, useState } from 'react';
import { ImageData } from '../types';

interface ImageUploaderProps {
  onImageSelected: (data: ImageData) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageSelected({
          file,
          previewUrl: URL.createObjectURL(file),
          base64: e.target.result as string,
          mimeType: file.type,
        });
      }
    };
    reader.readAsDataURL(file);
  }, [onImageSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative group cursor-pointer
          border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300
          ${isDragging 
            ? 'border-violet-500 bg-violet-500/10 scale-105 shadow-xl shadow-violet-500/20' 
            : 'border-slate-700 hover:border-violet-500/50 hover:bg-slate-800/50 bg-slate-800/30'
          }
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
        />
        
        <div className="flex flex-col items-center gap-6">
          <div className={`
            w-20 h-20 rounded-2xl flex items-center justify-center
            bg-gradient-to-tr from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-900/30
            transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3
          `}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">Upload a Photo</h3>
            <p className="text-slate-400 max-w-xs mx-auto">
              Drag and drop your portrait here, or click to browse files
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Supported Formats</p>
        <p className="text-sm text-slate-400 mt-2">JPEG, PNG, WEBP</p>
      </div>
    </div>
  );
};
