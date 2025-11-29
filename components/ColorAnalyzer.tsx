import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ColorData, RGB } from '../types';
import { rgbToMunsell } from '../services/munsellService';

interface ColorAnalyzerProps {
  imageSrc: string;
  onRetake: () => void;
}

const ColorAnalyzer: React.FC<ColorAnalyzerProps> = ({ imageSrc, onRetake }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [selectedColor, setSelectedColor] = useState<ColorData | null>(null);
  const [clickPos, setClickPos] = useState<{x: number, y: number} | null>(null);

  // Initial draw of the image onto the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      if (canvas && ctx && containerRef.current) {
        // Set canvas dimensions to match the image natural resolution
        // We will scale it visually using CSS
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
      }
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Convert RGB to Hex
  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  };

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Calculate actual pixel position
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    // Visual marker position (CSS pixels)
    setClickPos({ 
      x: event.clientX - rect.left, 
      y: event.clientY - rect.top 
    });

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const rgb: RGB = { r: pixel[0], g: pixel[1], b: pixel[2] };
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      const munsell = rgbToMunsell(rgb.r, rgb.g, rgb.b);
      
      const newColorData = { rgb, hex, munsell };
      setSelectedColor(newColorData);
    } catch (e) {
      console.error("Error reading pixel data", e);
    }
  }, []);

  return (
    <div className="relative h-full w-full flex flex-col bg-gray-950">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent">
        <button 
          onClick={onRetake}
          className="p-2 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-white/80 text-sm font-medium px-3 py-1 rounded-full bg-black/40 backdrop-blur-md">
          Tap image to pick color
        </div>
      </div>

      {/* Image Container */}
      <div ref={containerRef} className="flex-1 overflow-hidden flex items-center justify-center bg-gray-900 relative touch-none">
        <canvas 
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="max-w-full max-h-full object-contain cursor-crosshair shadow-2xl"
        />
        
        {/* Click Indicator Ring */}
        {clickPos && (
          <div 
            className="absolute pointer-events-none w-8 h-8 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 animate-pulse z-10"
            style={{ 
              left: `calc(50% - ${canvasRef.current ? (canvasRef.current.getBoundingClientRect().width / 2) - clickPos.x : 0}px)`, 
              top: `calc(50% - ${canvasRef.current ? (canvasRef.current.getBoundingClientRect().height / 2) - clickPos.y : 0}px)`,
              borderColor: selectedColor?.hex === '#FFFFFF' ? '#000' : '#FFF',
              boxShadow: `0 0 0 2px ${selectedColor?.hex}`
            }}
          />
        )}
      </div>

      {/* Color Info Bottom Sheet */}
      {selectedColor && (
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-gray-900 border-t border-gray-800 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out transform translate-y-0">
          <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mt-3 mb-6" />
          
          <div className="px-8 pb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-4xl font-bold tracking-tight text-white mb-1 font-mono">
                  {selectedColor.munsell}
                </h2>
                <div className="text-gray-400 font-mono text-sm uppercase tracking-wider">
                   Munsell Color
                </div>
              </div>
              <div 
                className="w-16 h-16 rounded-2xl shadow-inner border border-white/10"
                style={{ backgroundColor: selectedColor.hex }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">HEX</div>
                <div className="text-xl font-mono text-white font-semibold">
                  {selectedColor.hex}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">RGB</div>
                <div className="text-lg font-mono text-white">
                  {selectedColor.rgb.r}, {selectedColor.rgb.g}, {selectedColor.rgb.b}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorAnalyzer;