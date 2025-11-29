import React, { useState } from 'react';
import CameraCapture from './components/CameraCapture';
import ColorAnalyzer from './components/ColorAnalyzer';

const App: React.FC = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  return (
    <div className="h-screen w-screen overflow-hidden bg-black text-white font-sans antialiased">
      {!capturedImage ? (
        <CameraCapture onCapture={setCapturedImage} />
      ) : (
        <ColorAnalyzer 
          imageSrc={capturedImage} 
          onRetake={() => setCapturedImage(null)} 
        />
      )}
    </div>
  );
};

export default App;
