import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [msg, setMsg] = useState("Загрузка...")
  const [selectedFile, setSelectedFile] = useState(null)
  const [faceImage, setFaceImage] = useState(null)

  useEffect(() => {
    fetch("/api/hello")
      .then(response => response.json())
      .then(data => setMsg(data.message))
      .catch(error => {
        console.error("Ошибка:", error)
        setMsg("Ответ от сервера не получен")
      })
  })

  const handleFileChange = (event) => {
    if (faceImage) {
      URL.revokeObjectURL(faceImage)
    }
    
    setSelectedFile(event.target.files[0])
    setFaceImage(null)
  }

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Сначала выберите файл")
      return
    }

    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      const response = await fetch("/api/detect-face", {
        method: "POST",
        body: formData
      }) 

      if (!response.ok) throw new Error("Ошибка при обработке изображения")

      const imageBlob = await response.blob()
      const imageUrl = URL.createObjectURL(imageBlob)
      setFaceImage(imageUrl)
    } catch (error) {
      console.error("Ошибка:", error)
    }
  }

  return (
    <>
      <section id="center">
        <div>
          <p>Сообщение от сервера: {msg}</p>
          <p>Выберите изображение:</p>
        </div>
        <input type="file" accept="image/*" onChange={handleFileChange}/>
        <button
          className="counter"
          onClick={handleSubmit}
          disabled={!selectedFile}
        >
          Подтвердить
        </button>
        {faceImage && (
          <div style={{ textAlign: 'center' }}>
            <p>Результат детекции:</p>
            <img 
              src={faceImage} 
              alt="Вырезанное лицо" 
              style={{ maxWidth: '100%' }} 
            />
          </div>
        )}
      </section>

    </>
  )
}

export default App
