import React, { useState } from 'react';
import CameraCapture from './components/CameraCapture';
import ColorAnalyzer from './components/ColorAnalyzer';
import StartMenu from './components/StartMenu';

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  if (!hasStarted) {
    return <StartMenu onStart={() => setHasStarted(true)} />;
  }

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