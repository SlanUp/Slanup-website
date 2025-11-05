"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, ExternalLink, Image as ImageIcon, Loader2 } from 'lucide-react';

interface DriveFile {
  id: string;
  name: string;
  thumbnailLink?: string;
  webContentLink?: string;
  webViewLink?: string;
  mimeType: string;
}

interface GoogleDriveGalleryProps {
  folderId: string; // Google Drive folder ID
  apiKey?: string; // Optional: If you want to use API key
}

export default function GoogleDriveGallery({ folderId, apiKey }: GoogleDriveGalleryProps) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<DriveFile | null>(null);

  useEffect(() => {
    loadDriveFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId]);

  const loadDriveFiles = async () => {
    try {
      setIsLoading(true);
      
      // If using API key
      if (apiKey) {
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}&fields=files(id,name,thumbnailLink,webContentLink,webViewLink,mimeType)&orderBy=createdTime desc`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch files');
        }
        
        const data = await response.json();
        setFiles(data.files || []);
      } else {
        // Fallback: Fetch from our API endpoint that scrapes the public folder
        const response = await fetch(`/api/drive-files?folderId=${folderId}`);
        
        if (response.ok) {
          const data = await response.json();
          setFiles(data.files || []);
        } else {
          // If API fails, show empty state - gallery will be hidden
          setFiles([]);
        }
      }
    } catch (err) {
      console.error('Error loading drive files:', err);
      // Don't show error, just show empty state
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (file: DriveFile) => {
    // Open download link in new tab
    if (file.webContentLink) {
      window.open(file.webContentLink, '_blank');
    } else {
      // Fallback to direct link
      window.open(`https://drive.google.com/uc?export=download&id=${file.id}`, '_blank');
    }
  };

  const getThumbnail = (file: DriveFile) => {
    if (file.thumbnailLink) {
      return file.thumbnailLink.replace('=s220', '=s400');
    }
    return `https://drive.google.com/thumbnail?id=${file.id}&sz=w400`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <span className="ml-3 text-gray-400">Loading gallery...</span>
      </div>
    );
  }


  return (
    <>
      <div className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600">
            📸 Event Gallery
          </h2>
          <p className="text-gray-400">Download your favorite moments!</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {files.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-amber-400/50 transition-all cursor-pointer"
              onClick={() => setSelectedImage(file)}
            >
              {/* Thumbnail */}
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={getThumbnail(file)}
                  alt={file.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Download button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(file);
                }}
                className="absolute bottom-2 right-2 bg-amber-400 hover:bg-amber-500 text-black p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        {files.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No photos yet. Check back soon!</p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <img
              src={getThumbnail(selectedImage)}
              alt={selectedImage.name}
              className="w-full h-auto rounded-lg"
            />

            {/* Actions */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={() => handleDownload(selectedImage)}
                className="bg-amber-400 hover:bg-amber-500 text-black px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => window.open(selectedImage.webViewLink, '_blank')}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View in Drive
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}