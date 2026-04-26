import { useState, useRef, useEffect } from 'react';
import './WebcamCapture.css';

const WebcamCapture = ({ onPhotoCaptured, onClear }) => {
  const [stream, setStream] = useState(null);          // Поток с веб-камеры
  const [previewUrl, setPreviewUrl] = useState(null);  // Локальная ссылка на сделанный снимок
  
  const videoRef = useRef(null);   // Ссылка на тег <video>
  const canvasRef = useRef(null);  // Ссылка на невидимый <canvas> (для создания снимка)

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const startCamera = async () => {
    try {
      if (onClear) onClear();
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setPreviewUrl(null)

    } catch (err) {
      console.error("Ошибка доступа к камере:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        stopCamera();

        onPhotoCaptured(blob);
      }, 'image/png');
    }
  };

  return (
    <div className="webcam-container">
      <canvas ref={canvasRef} className="webcam-canvas"></canvas>

      <div className="webcam-view-area">
        {stream && !previewUrl && (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="webcam-media"
          />
        )}
        {previewUrl && (
          <img 
            src={previewUrl} 
            alt="Снимок" 
            className="webcam-media"
          />
        )}
        {!stream && !previewUrl && (
          <p className="webcam-placeholder">Камера выключена</p>
        )}
      </div>

      <div className="webcam-controls">
        {!stream && !previewUrl && (
          <button onClick={startCamera}>Включить камеру</button>
        )}
        
        {stream && (
          <button onClick={capturePhoto}>Сделать снимок</button>
        )}

        {previewUrl && (
          <button onClick={startCamera}>Переснять</button>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture;