import { useState } from 'react';
import WebcamCapture from './WebcamCapture';
import './App.css';

function App() {
  const [photoBlob, setPhotoBlob] = useState(null);
  const [faceImage, setFaceImage] = useState(null);
  const [ageInfo, setAgeInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePhotoReady = (blob) => {
    setPhotoBlob(blob);
  };

  const handleClear = () => {
    setPhotoBlob(null);
    setFaceImage(null);
    setAgeInfo(null);
  };

  const handleSubmit = async () => {
    if (!photoBlob) return;
    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', photoBlob, 'webcam.jpg');

    try {
      const response = await fetch('/api/estimate-age', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Ошибка при обработке изображения');

      const data = await response.json();
      setFaceImage(data.face_image);
      setAgeInfo({
        mean: data.age_mean,
        std: data.age_std
      });

    } catch (error) {
      console.error("Ошибка:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app-container">
      <h1>Анализатор возраста</h1>
      
      <WebcamCapture 
        onPhotoCaptured={handlePhotoReady} 
        onClear={handleClear} 
      />

      {photoBlob && !faceImage && (
        <button 
          className="submit-button"
          onClick={handleSubmit} 
          disabled={isLoading}
        >
          {isLoading ? 'Анализ...' : 'Подтвердить и отправить'}
        </button>
      )}

      {faceImage && ageInfo && (
        <div className="result-container">
          <h3>Результат:</h3>
          <img 
            className="result-face-img"
            src={faceImage} 
            alt="Face" 
          />
          <div className="result-age-text">
            {ageInfo.mean} ± {ageInfo.std} лет
          </div>
        </div>
      )}
    </div>
  );
}

export default App