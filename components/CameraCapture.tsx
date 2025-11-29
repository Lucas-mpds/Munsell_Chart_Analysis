import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Prefer back camera on mobile
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to actually play to set streaming state
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => setIsStreaming(true));
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please allow camera permissions.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup stream tracks
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Match canvas size to video actual size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        onCapture(dataUrl);
      }
    }
  };

  return (
    <div className="relative h-full w-full flex flex-col bg-black">
      {error ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
          <div className="p-4 bg-red-500/10 rounded-full text-red-400">
            <Camera size={48} />
          </div>
          <p className="text-red-200">{error}</p>
          <button 
            onClick={startCamera}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <video 
            ref={videoRef} 
            className="h-full w-full object-cover" 
            playsInline 
            muted 
            autoPlay
          />
          
          {/* Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center items-center bg-gradient-to-t from-black/80 to-transparent pt-20">
             <button
              onClick={handleCapture}
              disabled={!isStreaming}
              className={`
                group relative flex items-center justify-center
                w-20 h-20 rounded-full border-4 border-white
                transition-transform active:scale-95
                ${!isStreaming ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/10'}
              `}
              aria-label="Take Photo"
            >
              <div className="w-16 h-16 bg-white rounded-full transition-transform group-hover:scale-90" />
            </button>
          </div>
          
          {/* Hidden Canvas for processing */}
          <canvas ref={canvasRef} className="hidden" />
        </>
      )}
    </div>
  );
};

export default CameraCapture;
