
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, AlertCircle } from 'lucide-react';

export function OrderCancelled() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const reason = searchParams.get('reason');

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h1>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 font-semibold">Transaction could not be processed</p>
          </div>
          
          {reason && (
            <p className="text-red-700 mb-2">Reason: {reason}</p>
          )}
          
          {orderId && (
            <p className="text-sm text-red-600">Order ID: {orderId}</p>
          )}
          
          <p className="text-sm text-red-600 mt-3">No charges have been made to your account.</p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">What can you do?</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• Check your card details and try again</li>
            <li>• Ensure you have sufficient funds</li>
            <li>• Contact your bank if the issue persists</li>
            <li>• Try a different payment method</li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/cart"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
          >
            Try Again
          </Link>
          <Link 
            to="/products"
            className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}