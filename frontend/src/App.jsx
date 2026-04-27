import { useState } from 'react'
import AgeVerification from './AgeVerification'
import ProductsList from './ProductsList'
import './App.css'

function App() {
  const [isProductsSelected, setIsProductsSelected] = useState(false)
  const [showVerificationPhase, setShowVerificationPhase] = useState(false)

  return (
    <div className="app-layout">
      {!showVerificationPhase ? (
        <>
          <ProductsList onSelectionChange={setIsProductsSelected} />
          
          {isProductsSelected && (
            <div className="bottom-action-bar">
              <button 
                className="confirm-age-button"
                onClick={() => setShowVerificationPhase(true)}
              >
                Подтвердить возраст
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="verification-screen">
          <button 
            className="back-button" 
            onClick={() => setShowVerificationPhase(false)}
          >
            ← Назад к товарам
          </button>

          <AgeVerification />
        </div>
      )}
    </div>
  )
}

export default App