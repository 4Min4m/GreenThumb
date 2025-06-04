import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { RootState } from '../store';
import { incrementQuantity, decrementQuantity, removeFromCart } from '../store/cartSlice';
import { paymentService } from '../services/paymentService';

export default function Cart() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCost = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Function to handle checkout and process payment directly
  const handleCheckout = async () => {
    setIsProcessing(true);
    
    try {
      // Process payment using the payment service
      const result = await paymentService.processPayment(cartItems, totalCost);
      
      if (result.success) {
        // Redirect to success page with transaction details
        const successParams = new URLSearchParams({
          orderId: result.data.order_id || `ORDER_${Date.now()}`,
          amount: totalCost.toFixed(2),
          transactionId: result.data.iso8583_message.systemTraceNumber || 'N/A',
          status: result.data.status
        });
        window.location.href = `/order-success?${successParams.toString()}`;
      } else {
        // Redirect to cancelled/failed page
        const cancelParams = new URLSearchParams({
          orderId: result.data.order_id || `ORDER_${Date.now()}`,
          reason: result.message || 'Transaction declined'
        });
        window.location.href = `/order-cancelled?${cancelParams.toString()}`;
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      // Redirect to error page
      const cancelParams = new URLSearchParams({
        orderId: `ORDER_${Date.now()}`,
        reason: error instanceof Error ? error.message : 'Payment processing failed'
      });
      window.location.href = `/order-cancelled?${cancelParams.toString()}`;
    } finally {
      setIsProcessing(false);
    }
  };

  // Alternative method using form submission (uncomment if needed)
  const createPaymentForm = (orderData: any) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'http://localhost:3001/payment'; // Your payment gateway URL
    
    // Add form fields
    const fields = {
      amount: orderData.totalAmount.toFixed(2),
      currency: orderData.currency,
      orderId: orderData.orderId,
      merchantId: orderData.merchantId,
      returnUrl: orderData.returnUrl,
      cancelUrl: orderData.cancelUrl,
      description: `GreenThumb Plants - ${orderData.totalItems} items`,
      items: JSON.stringify(orderData.items) // Send cart items as JSON
    };

    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Cart is Empty</h1>
          <Link 
            to="/products"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {cartItems.map(item => (
              <div 
                key={item.id}
                className="bg-white rounded-lg shadow-md p-6 mb-4 flex items-center gap-4"
              >
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-green-600 font-bold">${item.price.toFixed(2)}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => dispatch(decrementQuantity(item.id))}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  
                  <button
                    onClick={() => dispatch(incrementQuantity(item.id))}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => dispatch(removeFromCart(item.id))}
                    className="p-1 hover:bg-red-100 rounded text-red-600 ml-4"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-semibold">{totalItems}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Cost:</span>
                  <span className="text-green-600">${totalCost.toFixed(2)}</span>
                </div>
              </div>
              
              <button 
                className={`w-full py-3 rounded-lg font-semibold mb-3 transition-colors ${
                  isProcessing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing Payment...' : 'Proceed to Checkout'}
              </button>
              
              <Link 
                to="/products"
                className="block w-full text-center text-green-600 font-semibold hover:text-green-700"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}