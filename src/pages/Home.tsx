import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1604762524889-3e2fcc145683?auto=format&fit=crop&w=2000)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.7)'
        }}
      />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-white px-4">
        <div className="flex items-center gap-3 mb-6">
          <Leaf className="w-12 h-12" />
          <h1 className="text-5xl font-bold">GreenThumb</h1>
        </div>
        
        <p className="max-w-2xl text-center text-lg mb-8">
          Welcome to GreenThumb, your premier destination for beautiful houseplants. 
          We carefully select and nurture each plant in our collection to bring life 
          and natural beauty to your space. Whether you're a seasoned plant parent or 
          just starting your green journey, we have the perfect plant for you.
        </p>
        
        <Link 
          to="/products" 
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg 
                     text-lg font-semibold transition-colors duration-300"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}