import { useState } from 'react'
import WebcamCapture from './WebcamCapture'
import './AgeVerification.css'

function AgeVerification({ onComplete }) {
  const [faceImage, setFaceImage] = useState(null)
  const [ageInfo, setAgeInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handlePhotoReady = (blob) => {
    sendToServer(blob)
  }

  const handleClear = () => {
    setFaceImage(null)
    setAgeInfo(null)
  }

  const sendToServer = async (blob) => {
    setIsLoading(true)

    const formData = new FormData()
    formData.append('file', blob, 'webcam.jpg')

    try {
      const response = await fetch('/api/estimate-age', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Ошибка при обработке изображения')

      const data = await response.json()
      setFaceImage(data.face_image)
      setAgeInfo({
        mean: data.age_mean,
        std: data.age_std,
        confidence: data.confidence_adult,
        purchase_allowed: data.purchase_allowed
      })

    } catch (error) {
      console.error("Ошибка:", error)
      handleClear()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="age-verification-wrapper">      
      {/* Если идет загрузка или есть результат - камеру скрываем */}
      {!faceImage && !isLoading && (
        <WebcamCapture 
          onPhotoCaptured={handlePhotoReady} 
          onClear={handleClear} 
        />
      )}

      {isLoading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Анализируем ваше фото...</p>
        </div>
      )}

      {faceImage && ageInfo && (
        <div className="result-container-centered">
          <div className={`result-card ${ageInfo.purchase_allowed ? 'status-allowed' : 'status-denied'}`}>
            <h3>{ageInfo.purchase_allowed ? "Покупка разрешена" : "Покупка запрещена"}</h3>
            <img 
              className="result-face-img"
              src={faceImage} 
              alt="Face" 
            />
            <div className="result-age-text">
              <p>
                Уверенность в совершеннолетии: {Math.trunc(ageInfo.confidence * 100)}% 
              </p>
            </div>
            
            <div className="result-actions">
              {ageInfo.purchase_allowed ? (
                <button 
                  className="retake-button" 
                  onClick={onComplete}
                >
                  Завершить покупки
                </button>
              ) : (
                <button className="retake-button" onClick={handleClear}>
                  Переснять фото
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgeVerification