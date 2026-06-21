'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MapDashboard = dynamic(() => import('@/components/MapDashboard'), { ssr: false, loading: () => <div className="h-[400px] w-full bg-brand-light animate-pulse rounded-2xl flex items-center justify-center font-semibold text-brand-gray">Loading Map...</div> });

interface Assignment {
  id: string;
  orderId: string;
  status: string;
  clusterKey: string | null;
  codAmount: number;
  order: { customerName: string; phone: string; address: string };
}

interface DashboardData {
  summary: {
    total: number;
    pending: number;
    completed: number;
    totalCodToCollect: number;
  };
  clusters: Array<{ name: string; count: number }>;
  assignments: Assignment[];
  isOnline: boolean;
}

export default function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    fetch('/api/rider/dashboard')
      .then(r => r.json())
      .then(d => {
        setData(d);
        if (d.success) setIsOnline(d.isOnline);
      })
      .finally(() => setLoading(false));
  }, []);

  // Background Location Sync
  useEffect(() => {
    let watchId: number;
    if (isOnline) {
      // Mocking the rider's location to "110, Krishna Nagar, Teen Dukan, Dher Ke Balaji, Jaipur"
      // instead of using navigator.geolocation because the user is currently in Haryana
      const MOCK_LAT = 26.9650;
      const MOCK_LNG = 75.7750;
      
      setLocation({ lat: MOCK_LAT, lng: MOCK_LNG });
      
      fetch('/api/rider/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: MOCK_LAT, lng: MOCK_LNG })
      }).catch(err => console.error('Failed to sync location', err));
    }
    return () => {
      // Cleanup if needed
    };
  }, [isOnline]);

  const toggleOnlineStatus = async () => {
    const newState = !isOnline;
    setIsOnline(newState);
    await fetch('/api/rider/location', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOnline: newState })
    });
  };

  // Mock coordinates for assignments based on Vidyadhar Nagar, Jaipur
  const mapDestinations = useMemo(() => {
    if (!data?.assignments) return [];
    return data.assignments.filter(a => a.status === 'ASSIGNED').map((a, i) => {
      // Dummy destination in Vidyadhar Nagar (near National Handloom, for instance)
      const offsetLat = (Math.sin(i * 10) * 0.005);
      const offsetLng = (Math.cos(i * 10) * 0.005);
      return {
        id: a.id,
        title: a.order.customerName,
        lat: 26.9580 + offsetLat, // Vidyadhar Nagar coordinates
        lng: 75.7720 + offsetLng
      };
    });
  }, [data]);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-8 bg-brand-light rounded animate-pulse" />
        <div className="h-24 bg-brand-light rounded animate-pulse" />
        <div className="h-12 bg-brand-light rounded animate-pulse" />
      </div>
    );
  }

  if (!data || !data.success) {
    if (data?.error === 'Unauthorized') {
      window.location.href = '/login';
      return null;
    }
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">{data?.error || 'Failed to load dashboard'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light font-sans pb-10">
      <header className="bg-brand-purple p-6 shadow-md rounded-b-[2rem]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">BRDG ERRAND</h1>
            <p className="text-sm font-semibold text-brand-orange uppercase tracking-wider">Today's Deliveries</p>
          </div>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-full transition-colors">
              Sign Out
            </button>
          </form>
        </div>

        <div className="bg-brand-dark/50 rounded-2xl p-4 flex justify-between items-center border border-white/10">
          <div>
            <p className="text-white font-bold">{isOnline ? 'Online & Tracking' : 'Offline'}</p>
            <p className="text-brand-gray text-xs">{isOnline ? 'Receiving assignments' : 'Go online to start shift'}</p>
          </div>
          <button 
            onClick={toggleOnlineStatus}
            className={`w-14 h-8 rounded-full relative transition-colors ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all ${isOnline ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </header>

      <main className="p-4 max-w-3xl mx-auto space-y-6 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Pending" value={data.summary.pending} bg="bg-white" />
          <StatCard label="Completed" value={data.summary.completed} bg="bg-white" />
          <StatCard label="Total Stops" value={data.summary.total} bg="bg-white" full />
          <StatCard label="COD to Collect" value={`₹${data.summary.totalCodToCollect}`} bg="bg-brand-orange" text="text-white" full />
        </div>

        {/* View Toggle */}
        <div className="flex p-1 bg-white rounded-xl shadow-sm border border-brand-light">
          <button 
            onClick={() => setViewMode('LIST')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${viewMode === 'LIST' ? 'bg-brand-purple text-white' : 'text-brand-gray hover:bg-brand-light'}`}
          >
            List View
          </button>
          <button 
            onClick={() => setViewMode('MAP')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${viewMode === 'MAP' ? 'bg-brand-purple text-white' : 'text-brand-gray hover:bg-brand-light'}`}
          >
            Map View
          </button>
        </div>

        {viewMode === 'MAP' ? (
          <section>
            <h2 className="text-lg font-bold text-brand-dark mb-3">Live Map</h2>
            {!isOnline ? (
               <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-brand-light">
                 <p className="text-brand-gray font-medium">Go Online to view the map and start routing.</p>
               </div>
            ) : (
              <MapDashboard riderLocation={location} destinations={mapDestinations} />
            )}
          </section>
        ) : (
          <>
            {data.clusters.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-brand-dark mb-3">Clusters</h2>
                <div className="flex flex-wrap gap-2">
                  {data.clusters.map(c => (
                    <span key={c.name} className="px-4 py-1.5 bg-white shadow-sm rounded-full text-sm font-semibold text-brand-purple border border-brand-light">
                      {c.name} ({c.count})
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-brand-dark">Deliveries</h2>
                <span className="text-sm font-semibold text-brand-gray">{data.assignments.length} Total</span>
              </div>
              <div className="space-y-4">
                {data.assignments.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-brand-light">
                    <p className="text-brand-gray font-medium">No deliveries today</p>
                  </div>
                ) : (
                  data.assignments.map(a => (
                    <DeliveryCard key={a.id} assignment={a} />
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, bg, text, full }: { label: string; value: string | number; bg: string; text?: string; full?: boolean }) {
  return (
    <div className={`${bg} ${full ? 'col-span-2' : ''} p-5 rounded-2xl shadow-sm border border-black/5`}>
      <p className={`text-xs font-semibold ${text ? text : 'text-brand-gray'} uppercase tracking-wider mb-1`}>{label}</p>
      <p className={`text-3xl font-black ${text ? text : 'text-brand-dark'}`}>{value}</p>
    </div>
  );
}

function DeliveryCard({ assignment }: { assignment: Assignment }) {
  const statusColor = {
    ASSIGNED: 'border-l-brand-orange text-brand-orange bg-brand-orange/10',
    DELIVERED: 'border-l-green-500 text-green-700 bg-green-50',
    FAILED: 'border-l-red-500 text-red-700 bg-red-50'
  }[assignment.status] || 'border-l-brand-gray text-brand-gray bg-gray-50';

  const badgeColor = {
    ASSIGNED: 'bg-brand-orange text-white',
    DELIVERED: 'bg-green-500 text-white',
    FAILED: 'bg-red-500 text-white'
  }[assignment.status] || 'bg-brand-gray text-white';

  return (
    <Link href={`/deliveries/${assignment.orderId}`} className="block bg-white rounded-2xl shadow-sm border border-brand-light hover:shadow-md transition-shadow overflow-hidden">
      <div className={`p-4 border-l-4 ${statusColor.split(' ')[0]}`}>
        <div className="flex justify-between items-start mb-3">
          <span className="font-bold text-lg text-brand-dark">{assignment.order.customerName}</span>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider ${badgeColor}`}>
            {assignment.status}
          </span>
        </div>
        <div className="flex justify-between items-end text-sm text-brand-dark">
          <div className="space-y-1">
            <p className="font-medium text-brand-gray">Phone</p>
            <span className="block font-semibold hover:text-brand-orange transition-colors">{assignment.order.phone}</span>
          </div>
          <div className="text-right space-y-1">
            <p className="font-medium text-brand-gray">Collect COD</p>
            <p className="font-bold text-base text-brand-orange">₹{assignment.codAmount}</p>
          </div>
        </div>
        {assignment.clusterKey && (
          <div className="mt-4 pt-3 border-t border-brand-light">
            <span className="inline-block px-3 py-1 bg-brand-light text-brand-dark text-xs font-bold rounded-lg">
              Cluster: {assignment.clusterKey}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}