'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const MapDashboard = dynamic(() => import('@/components/MapDashboard'), { ssr: false, loading: () => <div className="h-[200px] w-full bg-brand-light animate-pulse rounded-2xl flex items-center justify-center font-semibold text-brand-gray">Loading Map...</div> });

interface Order {
  customerName: string;
  phone: string;
  address: string;
  landmark: string | null;
}

interface AssignmentDetail {
  id: string;
  orderId: string;
  status: string;
  clusterKey: string | null;
  codAmount: number;
  codCollected: boolean;
  failedReason: string | null;
  failureNote: string | null;
  order: Order;
  events: Array<{ eventType: string; note: string | null; createdAt: string }>;
  otps: Array<{ otpPlain: string | null; requestedAt: string; expiresAt: string; used: boolean }>;
}

export default function DeliveryDetailClient() {
  const params = useParams();
  const router = useRouter();
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState('');
  const [showFailModal, setShowFailModal] = useState(false);
  const [failReason, setFailReason] = useState('NO_ANSWER');
  const [failNote, setFailNote] = useState('');
  const [riderLocation, setRiderLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/deliveries/assignment?orderId=${params.id}`)
        .then(r => r.json())
        .then(d => setAssignment(d.success ? d.assignment : null))
        .finally(() => setLoading(false));
    }
    
    // Mocking the rider's location to "110, Krishna Nagar, Teen Dukan, Dher Ke Balaji, Jaipur"
    // instead of using navigator.geolocation because the user is currently in Haryana
    setRiderLocation({ lat: 26.9650, lng: 75.7750 });
  }, [params.id]);

  const mapDestinations = useMemo(() => {
    if (!assignment) return [];
    return [{
      id: assignment.id,
      title: assignment.order.customerName,
      lat: 26.9580, // Dummy destination in Vidyadhar Nagar
      lng: 75.7720
    }];
  }, [assignment]);

  const requestOtp = async () => {
    if (!assignment) return;
    const res = await fetch('/api/deliveries/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: assignment.orderId })
    });
    const data = await res.json();
    if (data.success && data.otp) {
      setAssignment({
        ...assignment,
        otps: [{ otpPlain: data.otp, requestedAt: new Date().toISOString(), expiresAt: '', used: false }, ...(assignment.otps || [])]
      });
    }
  };

  const verifyOtp = async () => {
    if (!assignment) return;
    const res = await fetch('/api/deliveries/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: assignment.orderId, otp })
    });
    const data = await res.json();
    if (data.success) {
      alert('Delivery confirmed!');
      router.push('/dashboard');
    } else {
      alert(data.error || 'Verification failed');
    }
  };

  const handleFail = async () => {
    if (!assignment) return;
    const res = await fetch('/api/deliveries/fail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: assignment.orderId, reason: failReason, note: failNote })
    });
    const data = await res.json();
    if (data.success) {
      alert('Marked as failed');
      router.push('/dashboard');
    }
    setShowFailModal(false);
  };

  const openMap = () => {
    if (!assignment?.order) return;
    const { address, landmark } = assignment.order;
    const query = encodeURIComponent(`${address}${landmark ? ' ' + landmark : ''}`);
    window.open(`https://maps.google.com/?q=${query}`, '_blank');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center p-4"><div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!loading && !assignment) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-brand-gray mb-4 font-semibold">Delivery not found or access denied</p>
          <button onClick={() => router.push('/dashboard')} className="px-6 py-3 bg-white text-brand-dark font-bold rounded-xl shadow-sm">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const latestOtp = assignment?.otps?.[0];

  const badgeColor = {
    ASSIGNED: 'bg-brand-orange text-white',
    DELIVERED: 'bg-green-500 text-white',
    FAILED: 'bg-red-500 text-white'
  }[assignment!.status] || 'bg-brand-gray text-white';

  return (
    <div className="min-h-screen bg-brand-light font-sans pb-10">
      <header className="bg-brand-purple p-6 shadow-md rounded-b-[2rem]">
        <div className="flex items-center text-white">
          <button onClick={() => router.back()} className="mr-4 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors font-bold text-xl">
            ←
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Delivery Details</h1>
            <p className="text-brand-orange text-sm font-semibold tracking-wider uppercase">#{assignment.orderId.slice(-6)}</p>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-3xl mx-auto space-y-5 mt-4">
        
        {assignment.status === 'ASSIGNED' && (
          <div className="w-full mb-6 space-y-3">
            <div className="h-[250px] w-full relative z-0">
              <MapDashboard riderLocation={riderLocation} destinations={mapDestinations} />
            </div>
            {mapDestinations.length > 0 && (
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${mapDestinations[0].lat},${mapDestinations[0].lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                Get Directions
              </a>
            )}
          </div>
        )}

        <div className="card">
          <h2 className="font-bold text-lg text-brand-dark mb-4 border-b border-brand-light pb-2">Customer</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-brand-gray uppercase tracking-wide">Name</p>
              <p className="font-bold text-lg text-brand-dark">{assignment.order.customerName}</p>
            </div>
            
            <div>
              <p className="text-xs font-semibold text-brand-gray uppercase tracking-wide">Phone</p>
              <a href={`tel:${assignment.order.phone}`} className="inline-block font-semibold text-brand-orange text-lg hover:underline">{assignment.order.phone}</a>
            </div>

            <div className="bg-brand-light p-4 rounded-xl mt-4">
              <p className="text-xs font-semibold text-brand-gray uppercase tracking-wide mb-1">Delivery Address</p>
              <p className="text-brand-dark font-medium leading-relaxed">{assignment.order.address}</p>
              {assignment.order.landmark && <p className="text-brand-gray text-sm mt-1 font-medium">Near: {assignment.order.landmark}</p>}
            </div>

            <button onClick={openMap} className="w-full mt-2 py-3 bg-white border border-brand-light text-brand-dark font-bold rounded-xl hover:bg-brand-light transition-colors shadow-sm flex justify-center items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-orange" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Open in Maps
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="font-bold text-lg text-brand-dark mb-4 border-b border-brand-light pb-2">Delivery Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-brand-light p-4 rounded-xl">
              <p className="text-xs font-semibold text-brand-gray uppercase tracking-wide">COD Amount</p>
              <p className="text-2xl font-black text-brand-orange">₹{assignment.codAmount}</p>
            </div>
            <div className="bg-brand-light p-4 rounded-xl">
              <p className="text-xs font-semibold text-brand-gray uppercase tracking-wide">Status</p>
              <p className="mt-1">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider ${badgeColor}`}>
                  {assignment.status}
                </span>
              </p>
            </div>
            
            {assignment.clusterKey && (
              <div className="col-span-2">
                <p className="text-xs font-semibold text-brand-gray uppercase tracking-wide mb-1">Locality Cluster</p>
                <p className="font-bold text-brand-dark bg-white inline-block px-3 py-1 border border-brand-light rounded-lg">{assignment.clusterKey}</p>
              </div>
            )}

            {assignment.failedReason && (
              <div className="col-span-2 bg-red-50 border border-red-100 p-4 rounded-xl">
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">Failure Reason</p>
                <p className="font-bold text-red-700">{assignment.failedReason}</p>
                {assignment.failureNote && <p className="text-sm text-red-600 mt-1">{assignment.failureNote}</p>}
              </div>
            )}
          </div>
        </div>

        {assignment.status === 'ASSIGNED' && (
          <div className="space-y-4">
            <div className="card bg-brand-purple border-none shadow-xl">
              <h3 className="font-bold text-lg text-white mb-2">Complete Delivery</h3>
              <p className="text-brand-orange text-sm mb-4">Request and verify OTP from customer</p>
              
              <button onClick={requestOtp} className="w-full py-3 bg-white/10 text-white border border-white/20 font-bold rounded-xl hover:bg-white/20 transition-colors mb-4">
                Request OTP SMS
              </button>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="0000"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full p-4 text-center text-3xl font-mono tracking-[0.5em] border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange bg-white text-brand-dark"
                  maxLength={4}
                />
              </div>
              <button onClick={verifyOtp} disabled={otp.length !== 4} className="btn-primary w-full disabled:opacity-50">
                Verify & Confirm
              </button>
            </div>

            <button onClick={() => setShowFailModal(true)} className="btn-secondary w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300">
              Mark as Failed
            </button>
          </div>
        )}
      </main>

      {showFailModal && (
        <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-black text-xl text-brand-dark mb-4">Report Failure</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wide mb-2">Reason</label>
                <select value={failReason} onChange={e => setFailReason(e.target.value)} className="w-full p-4 bg-brand-light border border-transparent rounded-xl focus:bg-white focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none font-semibold text-brand-dark">
                  <option value="UNREACHABLE">Unreachable</option>
                  <option value="ADDRESS_ISSUE">Address Issue</option>
                  <option value="NO_ANSWER">No Answer</option>
                  <option value="RESCHEDULE">Reschedule Requested</option>
                  <option value="COD_ISSUE">COD/Payment Issue</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-gray uppercase tracking-wide mb-2">Additional Note (Optional)</label>
                <input
                  type="text"
                  placeholder="E.g., Customer not home..."
                  value={failNote}
                  onChange={e => setFailNote(e.target.value)}
                  className="w-full p-4 bg-brand-light border border-transparent rounded-xl focus:bg-white focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowFailModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleFail} className="flex-1 py-3 px-5 bg-red-500 text-white text-base font-bold rounded-xl hover:bg-red-600 active:scale-[0.98] transition-all shadow-lg shadow-red-500/30">Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}