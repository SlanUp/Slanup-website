"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';

interface PhotoUploadProps {
  folderId: string;
  onUploadSuccess?: () => void;
}

export default function PhotoUpload({ folderId, onUploadSuccess }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{current: number, total: number}>({current: 0, total: 0});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'];
    const validFiles: File[] = [];
    const previews: string[] = [];

    for (const file of files) {
      // Validate file type
      if (!validTypes.includes(file.type)) {
        setUploadStatus('error');
        setUploadMessage(`${file.name}: Invalid file type`);
        continue;
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setUploadStatus('error');
        setUploadMessage(`${file.name}: File too large (max 50MB)`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setSelectedFiles(validFiles);
    setUploadStatus('idle');
    setUploadMessage('');

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrls(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadStatus('idle');

    try {
      let successCount = 0;
      
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folderId', folderId);

        const response = await fetch('/api/drive-upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          successCount++;
        }
      }

      if (successCount > 0) {
        setUploadStatus('success');
        setUploadMessage(`Successfully uploaded ${successCount} file(s)! They will appear in the gallery shortly.`);
        setSelectedFiles([]);
        setPreviewUrls([]);
        
        // Call success callback to refresh gallery
        if (onUploadSuccess) {
          setTimeout(() => {
            onUploadSuccess();
          }, 2000);
        }

        // Reset after 3 seconds
        setTimeout(() => {
          setUploadStatus('idle');
          setUploadMessage('');
        }, 3000);
      } else {
        throw new Error('All uploads failed');
      }
    } catch (error: any) {
      setUploadStatus('error');
      setUploadMessage(error.message || 'Failed to upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFiles([]);
    setPreviewUrls([]);
    setUploadStatus('idle');
    setUploadMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center justify-center mb-4">
          <Upload className="w-6 h-6 text-amber-400 mr-2" />
          <h3 className="text-xl font-bold">Share Your Photos & Videos</h3>
        </div>
        <p className="text-gray-400 text-center text-sm mb-6">
          Upload your favorite moments from the event
        </p>

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
          multiple
        />

        {/* Upload Area */}
        {selectedFiles.length === 0 ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full border-2 border-dashed border-white/20 hover:border-amber-400/50 rounded-xl p-8 transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex flex-col items-center">
              <ImageIcon className="w-12 h-12 text-gray-400 group-hover:text-amber-400 transition-colors mb-3" />
              <p className="text-gray-300 font-medium mb-1">Click to select a file</p>
              <p className="text-gray-500 text-sm">Images or videos (max 50MB)</p>
            </div>
          </button>
        ) : (
          <div className="space-y-4">
            {/* Previews Grid */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {previewUrls.map((previewUrl, index) => (
                  <div key={index} className="relative rounded-xl overflow-hidden bg-black/30">
                    {selectedFiles[index].type.startsWith('image/') ? (
                      <img
                        src={previewUrl}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <video
                        src={previewUrl}
                        className="w-full h-32 object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Files Info */}
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-sm text-gray-300 font-medium mb-2">
                {selectedFiles.length} file(s) selected
              </p>
              <p className="text-xs text-gray-500">
                Total: {(selectedFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>

            {/* Clear Button */}
            <button
              onClick={clearSelection}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-xl transition-colors"
              disabled={isUploading}
            >
              Clear All
            </button>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload to Gallery
                </>
              )}
            </button>
          </div>
        )}

        {/* Status Messages */}
        <AnimatePresence>
          {uploadMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-4 p-3 rounded-lg flex items-center ${
                uploadStatus === 'success'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {uploadStatus === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              )}
              <p className="text-sm">{uploadMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
