import { useState } from 'react'
import './ProductsList.css'

// Моковые данные для демонстрации
const mockProducts = [
  { id: 1, name: 'Сигареты', volume: '', image: '/cigarettes1.jpg' },
  { id: 2, name: 'Сигареты', volume: '', image: '/cigarettes2.png' },
  { id: 3, name: 'Энергетик', volume: '0.5 л', image: '/energy.jpg' },
  { id: 4, name: 'Пиво', volume: '0.5 л', image: '/beer.jpg' },
  { id: 5, name: 'Водка', volume: '0.5 л', image: '/vodka.jpg' },
  { id: 6, name: 'Виски', volume: '0.7 л', image: '/whiskey.jpg' },
  { id: 7, name: 'Вино', volume: '0.75 л', image: '/wine.jpg' },
  { id: 8, name: 'Ром', volume: '0.7 л', image: '/rum.jpg' },
  { id: 9, name: 'Сидр', volume: '0.45 л', image: '/cider.jpg' },
  { id: 10, name: 'Коньянк', volume: '0.5 л', image: '/cognac.jpg' },
];

const ProductsList = ({ onSelectionChange }) => {
  const [selectedIds, setSelectedIds] = useState([])

  // Функция для выделения/снятия выделения с карточки
  const toggleProduct = (id) => {
    let newSelection
    if (selectedIds.includes(id)) {
      newSelection = selectedIds.filter(prodId => prodId !== id)
    } else {
      newSelection = [...selectedIds, id]
    }
    
    setSelectedIds(newSelection)
    onSelectionChange(newSelection.length > 0)
  }

  return (
    <div className="products-container">
      <h1 className="products-title">Выберите товар</h1>      
      <div className="products-grid">
        {mockProducts.map((prod) => (
          <div 
            key={prod.id} 
            className={`product-card ${selectedIds.includes(prod.id) ? 'selected' : ''}`}
            onClick={() => toggleProduct(prod.id)}
          >
            <div className="product-image-container">
              <img 
                src={prod.image} 
                alt={prod.name} 
                className="product-main-image"
              />
            </div>
            <div className="product-info">
              <div className="product-name">{prod.name}</div>
              {prod.volume && <div className="product-volume">{prod.volume}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductsList