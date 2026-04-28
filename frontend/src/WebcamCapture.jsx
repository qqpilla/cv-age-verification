import { useState, useRef, useEffect } from 'react'
import './WebcamCapture.css'

const WebcamCapture = ({ onPhotoCaptured, onClear }) => {
  const [stream, setStream] = useState(null)              // Поток с веб-камеры
  const [previewUrl, setPreviewUrl] = useState(null)      // Локальная ссылка на загруженный файл
  const [selectedFile, setSelectedFile] = useState(null)  // Загруженный файл
  
  const videoRef = useRef(null)      // Ссылка на тег <video>
  const canvasRef = useRef(null)     // Ссылка на невидимый <canvas> (для создания снимка)
  const fileInputRef = useRef(null)  // Ссылка на невидимый инпут

  // Хук для unmount компонента
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stream])

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const startCamera = async () => {
    try {
      if (onClear) onClear()
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      setStream(mediaStream)
      setPreviewUrl(null)

    } catch (err) {
      console.error("Ошибка доступа к камере:", err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Отзеркаливание фото
      context.translate(canvas.width, 0)
      context.scale(-1, 1)

      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      canvas.toBlob((blob) => {
        if (!blob) return
        stopCamera()
        onPhotoCaptured(blob)
      }, 'image/jpeg')
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (onClear) onClear()
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setSelectedFile(file)
    }
  }

  const uploadSelectedFile = () => {
    if (selectedFile) {
      onPhotoCaptured(selectedFile);

      setPreviewUrl(null)
      setSelectedFile(null)
    }
  }

  return (
    <div className="webcam-container">
      <canvas ref={canvasRef} className="webcam-canvas"></canvas>

      <div className="webcam-view-area">
        {stream && (
          <video ref={videoRef} autoPlay playsInline className="webcam-media"/>
        )}
        {previewUrl && (
          <img src={previewUrl} alt="Загруженное изображение" className="webcam-media" />
        )}
        {!stream && !previewUrl && (
          <p className="webcam-placeholder">Камера готова к работе</p>
        )}
      </div>

      <div className="webcam-controls">
        {/* Если камера не включена и фото не выбрано - показываем обе кнопки */}
        {!stream && !previewUrl && (
          <>
            <button onClick={startCamera}>Включить камеру</button>
            <button onClick={() => fileInputRef.current.click()}>Загрузить изображение</button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
              accept="image/*" 
            />
          </>
        )}

        {stream && (
          <button onClick={capturePhoto}>Сделать снимок</button>
        )}
        {previewUrl && (
          <button onClick={uploadSelectedFile}>Подтвердить</button>
        )}
      </div>
    </div>
  )
}

export default WebcamCapture