"use client";

import { useRef, useState, useEffect } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

export default function QRTestPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [result, setResult] = useState<string>('');
  const [codeReader, setCodeReader] = useState<BrowserMultiFormatReader | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const testZXingLibrary = () => {
    console.log('🧪 Testing ZXing library...');
    setResult('✅ ZXing library loaded successfully!');
    
    try {
      const reader = new BrowserMultiFormatReader();
      console.log('✅ ZXing BrowserMultiFormatReader created:', reader);
      setResult('✅ ZXing library is working! Ready to scan QR codes.');
    } catch (error) {
      setResult(`💥 ZXing Error: ${error}`);
      console.error('❌ ZXing library error:', error);
    }
  };

  const startLiveScanning = async () => {
    if (isScanning) {
      stopScanning();
      return;
    }
    
    try {
      setIsScanning(true);
      setResult('📹 Starting live QR scanning...');
      
      const reader = new BrowserMultiFormatReader();
      setCodeReader(reader);
      
      if (!videoRef.current) {
        throw new Error('Video element not found');
      }
      
      // Start live scanning
      reader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
        if (result) {
          setResult(`✅ QR Code detected: "${result.getText()}"`);
          console.log('✅ ZXing detected QR:', result.getText());
          stopScanning();
        }
        
        if (err && !(err instanceof NotFoundException)) {
          console.log('❌ Scanning error:', err);
        }
      });
      
      setResult('🔍 Scanning... Point a QR code at the camera');
      
    } catch (error) {
      setResult(`💥 Camera Error: ${error}`);
      console.error('❌ Camera error:', error);
      setIsScanning(false);
    }
  };
  
  const stopScanning = () => {
    if (codeReader) {
      codeReader.reset();
      setCodeReader(null);
    }
    setIsScanning(false);
    setResult('⏹️ Scanning stopped');
  };
  
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (codeReader) {
        codeReader.reset();
      }
    };
  }, [codeReader]);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 QR Detection Test</h1>
        
        <div className="space-y-6">
          <div>
            <p className="mb-4">This page tests if jsQR library is working properly.</p>
            <div className="flex gap-4 mb-6">
              <button
                onClick={testZXingLibrary}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Test ZXing Library
              </button>
              <button
                onClick={startLiveScanning}
                className={`px-6 py-3 rounded-lg ${
                  isScanning 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isScanning ? 'Stop Scanning' : 'Start Live QR Scan'}
              </button>
            </div>
          </div>
          
          <div>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="border border-gray-600 bg-black rounded-lg"
              style={{ maxWidth: '100%', maxHeight: '400px' }}
            />
          </div>
          
          {result && (
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="font-bold mb-2">Result:</h3>
              <p className="font-mono">{result}</p>
            </div>
          )}
          
          <div className="text-sm text-gray-400 space-y-2">
            <p>📝 <strong>Debug Steps:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Open browser console (F12)</li>
              <li>Click "Test ZXing Library" - should show ZXing is working</li>
              <li>Click "Start Live QR Scan" to test real-time detection</li>
              <li>Point a QR code at your camera</li>
              <li>If ZXing works here, the main check-in scanner should work too</li>
            </ol>
          </div>
          
          <div className="mt-8">
            <h3 className="font-bold mb-4">📱 Camera Test</h3>
            <p className="text-sm text-gray-400 mb-4">
              If jsQR works above, try manual QR input in the scanner:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
              <li>Go to /checkin</li>
              <li>Use "Manual Entry" instead of QR scan</li>
              <li>Type: DIW123456ABCD</li>
              <li>If that works, the issue is camera/video capture</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}