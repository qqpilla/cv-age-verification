import { useState } from 'react'
import './ProductsList.css'

// Моковые данные для демонстрации
const mockProducts = [
  { id: 1, name: 'Донот Манго глазиров.', weight: '67 г', icon: '🍩' },
  { id: 2, name: 'Донот ягодный', weight: '65 г', icon: '🍩' },
  { id: 3, name: 'Донот шоколадный', weight: '65 г', icon: '🍩' },
  { id: 4, name: 'Роллини греческие', weight: '100 г', icon: '🥐' },
  { id: 5, name: 'Самса с говядиной', weight: '90 г', icon: '🥟' },
  { id: 6, name: 'Самса с курицей', weight: '100 г', icon: '🥟' },
  { id: 7, name: 'Хачапури с сыром', weight: '120 г', icon: '🧀' },
  { id: 8, name: 'Сосиска в тесте', weight: '100 г', icon: '🌭' },
  { id: 9, name: 'Хлеб Пшеничный', weight: '500 г', icon: '🍞' },
]

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
            <div className="product-icon">{prod.icon}</div>
            <div className="product-name">{prod.name}</div>
            <div className="product-weight">{prod.weight}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductsList