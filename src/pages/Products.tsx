import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { plants } from '../data/plants';
import { addToCart } from '../store/cartSlice';
import { RootState } from '../store';

export default function Products() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const categories = [...new Set(plants.map(plant => plant.category))];

  const isInCart = (plantId: number) => {
    return cartItems.some(item => item.id === plantId);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Our Plants</h1>
        
        {categories.map(category => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plants
                .filter(plant => plant.category === category)
                .map(plant => (
                  <div 
                    key={plant.id} 
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <img 
                      src={plant.image} 
                      alt={plant.name}
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{plant.name}</h3>
                      <p className="text-gray-600 mb-4">{plant.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-green-600">
                          ${plant.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => dispatch(addToCart(plant))}
                          disabled={isInCart(plant.id)}
                          className={`px-4 py-2 rounded-lg font-semibold ${
                            isInCart(plant.id)
                              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {isInCart(plant.id) ? 'In Cart' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}