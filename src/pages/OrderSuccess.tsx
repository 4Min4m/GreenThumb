// src/pages/OrderSuccess.tsx
import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, CreditCard, Calendar } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { clearCart } from '../store/cartSlice';

export function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const transactionId = searchParams.get('transactionId');
  const status = searchParams.get('status');

  useEffect(() => {
    // Clear the cart after successful payment
    dispatch(clearCart());
  }, [dispatch]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-xl text-gray-600">Thank you for your purchase from GreenThumb</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Transaction Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orderId && (
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-semibold text-gray-900">{orderId}</p>
                </div>
              </div>
            )}
            
            {transactionId && (
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-semibold text-gray-900">{transactionId}</p>
                </div>
              </div>
            )}
            
            {amount && (
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 text-green-600 font-bold text-lg">$</span>
                <div>
                  <p className="text-sm text-gray-500">Amount Paid</p>
                  <p className="font-semibold text-gray-900">${amount}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Transaction Date</p>
                <p className="font-semibold text-gray-900">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
            
            {status && (
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-semibold text-green-900">{status}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-green-800 mb-2">What's Next?</h3>
          <ul className="text-green-700 space-y-1">
            <li>• You will receive an email confirmation shortly</li>
            <li>• Your plants will be carefully packaged and shipped within 2-3 business days</li>
            <li>• Track your order using the Order ID provided above</li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/products"
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 text-center"
          >
            Continue Shopping
          </Link>
          <Link 
            to="/"
            className="inline-block bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 text-center"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}