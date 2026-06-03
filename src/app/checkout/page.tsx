"use client";
import { useCart } from '@/context/CartContext';
import { useGiftingMode } from '@/context/GiftingModeContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const { isGiftingMode, giftMessage, giftPackaging } = useGiftingMode();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    altPhone: '',
    address: '',
    landmark: '',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '',
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: 'flat' | 'percentage';
    discountValue: number;
    message: string;
  } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const response = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, phone: formData.phone })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Validation failed');
      }
      if (data.valid) {
        setAppliedCoupon({
          code: data.code,
          discountType: data.discountType,
          discountValue: data.discountValue,
          message: data.message
        });
        setCouponCode('');
      } else {
        setCouponError(data.message || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (err: any) {
      setCouponError(err.message || 'Error validating coupon');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const packagingFee = isGiftingMode && giftPackaging === 'wooden-crate' ? 150 : 0;
  let finalPrice = totalPrice + packagingFee;
  let discountDeduction = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'flat') {
      discountDeduction = appliedCoupon.discountValue;
    } else {
      discountDeduction = Math.round(totalPrice * appliedCoupon.discountValue);
    }
    finalPrice = Math.max(0, finalPrice - discountDeduction);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalAmount: finalPrice,
          referralCode: appliedCoupon ? appliedCoupon.code : null,
          isGiftOrder: isGiftingMode,
          giftMessage: isGiftingMode ? giftMessage : null,
          giftPackaging: isGiftingMode ? (giftPackaging === 'none' ? null : giftPackaging) : null,
          items: cart.map(item => ({
            productId: item.productId || item.id.split('-')[0], // Extract raw uuid from cart item id if split by size
            quantity: item.quantity,
            price: item.price
          }))
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      // Save visitor history order flag
      localStorage.setItem('achar_order_history_placed', 'true');
      clearCart();
      router.push(`/checkout/success?id=${data.orderId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };


  if (cart.length === 0 && !loading) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Your cart is empty</h2>
        <button className="btn-primary" onClick={() => router.push('/products')} style={{ marginTop: '20px' }}>
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '60px 20px' }}>
      <h1 className="heading-serif" style={{ fontSize: '2.5rem', marginBottom: '40px' }}>Checkout</h1>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
        <div style={{ flex: '1 1 60%' }}>
          <div className="card" style={{ padding: '30px' }}>
            <h2 className="heading-serif" style={{ marginBottom: '20px' }}>Shipping Details</h2>
            {error && <div style={{ color: 'red', marginBottom: '20px', padding: '10px', backgroundColor: '#FFEBEE', borderRadius: '4px' }}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input required type="text" name="customerName" className="form-control" value={formData.customerName} onChange={handleChange} />
              </div>
              
              <div style={{ display: 'flex', gap: '20px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Phone Number *</label>
                  <input required type="tel" name="phone" className="form-control" value={formData.phone} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Alternate Phone</label>
                  <input type="tel" name="altPhone" className="form-control" value={formData.altPhone} onChange={handleChange} />
                </div>
              </div>
              
              <div className="form-group">
                <label>Full Address *</label>
                <textarea required name="address" rows={3} className="form-control" value={formData.address} onChange={handleChange} />
              </div>
              
              <div className="form-group">
                <label>Landmark</label>
                <input type="text" name="landmark" className="form-control" value={formData.landmark} onChange={handleChange} />
              </div>
              
              <div style={{ display: 'flex', gap: '20px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>City *</label>
                  <input required type="text" name="city" className="form-control" value={formData.city} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>State *</label>
                  <input required type="text" name="state" className="form-control" value={formData.state} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Pincode *</label>
                  <input required type="text" name="pincode" className="form-control" value={formData.pincode} onChange={handleChange} />
                </div>
              </div>
              
              <div className="form-group">
                <label>Order Notes (Optional)</label>
                <textarea name="notes" rows={2} className="form-control" value={formData.notes} onChange={handleChange} />
              </div>
              
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '20px' }} disabled={loading}>
                {loading ? 'Processing...' : 'Place Order (Cash on Delivery)'}
              </button>
            </form>
          </div>
        </div>
        
        <div style={{ flex: '1 1 30%', minWidth: '300px' }}>
          <div className="card" style={{ padding: '30px', backgroundColor: '#F9F9F9' }}>
            <h2 className="heading-serif" style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Order Summary</h2>
            
            <div style={{ marginBottom: '20px' }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                  <span>{item.quantity}x {item.name}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid #DDD', margin: '20px 0' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span>Subtotal</span>
              <span>₹{totalPrice}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span>Shipping</span>
              <span style={{ color: 'var(--color-success)' }}>Free</span>
            </div>
            
            {isGiftingMode && giftPackaging === 'wooden-crate' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '0.9rem' }}>
                <span>Wooden Crate Fee</span>
                <span>₹150</span>
              </div>
            )}
            
            {appliedCoupon && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '0.9rem', color: 'var(--color-success)' }}>
                <span>Discount</span>
                <span>-₹{discountDeduction}</span>
              </div>
            )}
            
            {/* Have a referral/discount code form */}
            <hr style={{ border: 'none', borderTop: '1px solid #DDD', margin: '15px 0' }} />
            
            {!appliedCoupon ? (
              <div style={{ marginBottom: '15px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Have a referral or jar-return code?</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="form-control"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    style={{ padding: '8px 12px', fontSize: '0.85rem', flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="btn-lux-primary"
                    style={{ padding: '8px 16px', fontSize: '0.85rem', margin: 0 }}
                    disabled={couponLoading}
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-success-light)', padding: '8px 12px', borderRadius: '2px', marginBottom: '15px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600 }}>
                  Code {appliedCoupon.code} Applied!
                </span>
                <button
                  type="button"
                  onClick={() => setAppliedCoupon(null)}
                  style={{ background: 'none', border: 'none', color: '#7B1C1C', fontSize: '1.2rem', cursor: 'pointer', padding: '0 4px', fontWeight: 'bold' }}
                >
                  &times;
                </button>
              </div>
            )}
            
            {couponError && (
              <p style={{ color: '#7B1C1C', fontSize: '0.8rem', marginBottom: '15px', marginTop: '-10px' }}>{couponError}</p>
            )}
            
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '20px 0' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
              <span>Total</span>
              <span style={{ color: 'var(--color-accent)' }}>₹{finalPrice}</span>
            </div>
            
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', fontSize: '0.9rem', textAlign: 'center' }}>
              <strong>Payment Method:</strong> Cash on Delivery
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
