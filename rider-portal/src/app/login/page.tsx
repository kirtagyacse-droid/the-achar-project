'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-brand-light flex flex-col md:flex-row font-sans">
      {/* Left Pane - Branding & Illustration */}
      <div className="md:flex-1 bg-brand-purple flex flex-col justify-between p-8 md:p-12 text-white relative overflow-hidden h-64 md:h-auto">
        <div className="z-10">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">BRDG ERRAND</h1>
          <p className="text-brand-orange text-lg font-semibold tracking-wider uppercase">Rider Portal</p>
        </div>
        
        <div className="z-10 mt-auto hidden md:block">
          <h2 className="text-4xl lg:text-6xl font-black leading-tight mb-4 text-brand-white">
            WE HAVE <br />
            FASTER <br />
            <span className="text-brand-orange">DELIVERY...</span>
          </h2>
        </div>

        {/* Floating Background Elements / Image */}
        <div className="absolute right-[-20%] bottom-[-10%] md:right-0 md:bottom-10 w-[120%] md:w-full max-w-[600px] opacity-90">
          <Image 
            src="/delivery-scooter.png" 
            alt="Delivery Rider on Scooter" 
            width={600} 
            height={600}
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Right Pane - Login Form */}
      <div className="md:w-[450px] lg:w-[550px] bg-white flex flex-col justify-center p-8 md:p-12 shadow-2xl z-20">
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-10 text-center md:text-left">
            <h3 className="text-2xl font-bold text-brand-dark mb-2">Welcome Back!</h3>
            <p className="text-brand-gray">Sign in to view your daily assignments.</p>
          </div>

          <LoginForm />
        </div>
      </div>
    </main>
  );
}

function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: formData.get('phone'), 
          pin: formData.get('pin') 
        })
      });
      const data = await res.json();
      if (data.success) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 font-medium">
          {error}
        </div>
      )}
      
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-brand-dark">Phone Number</label>
        <input
          type="tel"
          name="phone"
          placeholder="e.g. 9876543210"
          className="w-full px-5 py-4 text-base bg-brand-light border border-transparent rounded-xl focus:bg-white focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all"
          maxLength={10}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-semibold text-brand-dark">4-Digit PIN</label>
        <input
          type="password"
          name="pin"
          inputMode="numeric"
          pattern="[0-9]{4}"
          placeholder="••••"
          className="w-full px-5 py-4 text-2xl tracking-[0.5em] bg-brand-light border border-transparent rounded-xl focus:bg-white focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all font-mono"
          maxLength={4}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 mt-4 bg-brand-orange text-white text-lg font-bold rounded-xl hover:bg-brand-orangeHover active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 shadow-lg shadow-brand-orange/30"
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );
}