"use client";
import React, { useState, useEffect } from 'react';
import { Product, Order, Subscription, FestivalAlert } from '../AdminClient';
import { TabType } from './AdminShell';

interface PlannerTabProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  subscriptions: Subscription[];
  alerts: FestivalAlert[];
  setActiveTab: (tab: TabType) => void;
}

interface WeatherForecast {
  success: boolean;
  source: string;
  daily: {
    time: string[];
    uv_index_max: number[];
    precipitation_sum: number[];
    temperature_2m_max: number[];
  };
}

export default function PlannerTab({ 
  products, 
  setProducts, 
  orders, 
  subscriptions, 
  alerts, 
  setActiveTab 
}: PlannerTabProps) {
  // Scenario Planning & Overrides
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products.length > 0 ? products[0].id : ''
  );
  const [demandModifier, setDemandModifier] = useState<number>(100); // percentage, 80% to 150%
  const [weatherData, setWeatherData] = useState<WeatherForecast | null>(null);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(true);

  // Override Form State
  const [overrideMinStock, setOverrideMinStock] = useState<number>(10);
  const [overrideNotes, setOverrideNotes] = useState<string>('');
  const [savingOverrides, setSavingOverrides] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Sync override form fields with selected product
  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Sync override states directly in render phase if selected product changes to avoid useEffect hook warning
  const [prevSelectedId, setPrevSelectedId] = useState<string>(selectedProductId);
  if (selectedProductId !== prevSelectedId) {
    setPrevSelectedId(selectedProductId);
    setOverrideMinStock(selectedProduct?.plannerMinStock ?? 10);
    setOverrideNotes(selectedProduct?.plannerNotes ?? '');
    setSaveMessage(null);
  }

  // Fetch weather data on mount
  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch('/api/admin/weather');
        if (res.ok) {
          const data = await res.json();
          setWeatherData(data);
        }
      } catch (err) {
        console.error('Failed to load weather forecast', err);
      } finally {
        setLoadingWeather(false);
      }
    }
    fetchWeather();
  }, []);

  // 1. Calculate general stats & subscription demand mapping by spice level preference
  const activeSubsList = subscriptions.filter(s => s.status === 'ACTIVE');
  const totalSubJars = activeSubsList.reduce((sum, s) => sum + s.planJars, 0);
  const avgDailySubJarsPerProduct = products.length > 0 ? (totalSubJars / products.length) / 30 : 0;

  const sweetSubsJars = activeSubsList.filter(s => s.spicePreference === 'Sweet').reduce((sum, s) => sum + s.planJars, 0);
  const mildSubsJars = activeSubsList.filter(s => s.spicePreference === 'Mild').reduce((sum, s) => sum + s.planJars, 0);
  const mediumSubsJars = activeSubsList.filter(s => s.spicePreference === 'Medium' || !s.spicePreference).reduce((sum, s) => sum + s.planJars, 0);
  const hotSubsJars = activeSubsList.filter(s => s.spicePreference === 'Hot').reduce((sum, s) => sum + s.planJars, 0);

  const sweetProdsCount = products.filter(p => p.spiciness === 0).length || 1;
  const mildProdsCount = products.filter(p => p.spiciness === 1).length || 1;
  const mediumProdsCount = products.filter(p => p.spiciness === 2 || p.spiciness === undefined).length || 1;
  const hotProdsCount = products.filter(p => p.spiciness === 3).length || 1;

  const getProductSubscriptionDailyRate = (spiciness: number) => {
    let monthlyShare = 0;
    if (spiciness === 0) monthlyShare = sweetSubsJars / sweetProdsCount;
    else if (spiciness === 1) monthlyShare = mildSubsJars / mildProdsCount;
    else if (spiciness === 2) monthlyShare = mediumSubsJars / mediumProdsCount;
    else if (spiciness === 3) monthlyShare = hotSubsJars / hotProdsCount;
    else monthlyShare = totalSubJars / (products.length || 1);
    
    return monthlyShare / 30;
  };

  // 2. Weather adjustments: Calculate rain delay days and sunlight index
  let weatherDelay = 0;
  let avgUvIndex = 8.5; // fallback defaults
  let maxPrecip = 0;
  let avgTemp = 40.0;

  if (weatherData && weatherData.daily) {
    const daily = weatherData.daily;
    const count = daily.time.length || 7;
    
    avgUvIndex = daily.uv_index_max.reduce((sum, val) => sum + val, 0) / count;
    maxPrecip = Math.max(...daily.precipitation_sum);
    avgTemp = daily.temperature_2m_max.reduce((sum, val) => sum + val, 0) / count;

    // Rainy day or heavy cloud delay logic:
    // Every day with rain > 1.5mm or UV index < 4 adds 0.8 days of delay to the drying time.
    for (let i = 0; i < count; i++) {
      if (daily.precipitation_sum[i] > 1.5 || daily.uv_index_max[i] < 4.0) {
        weatherDelay += 0.8;
      }
    }
  }

  // Calculate dynamic production readiness score (0-100) based on weather
  const calcWeatherReadiness = () => {
    // UV index max (optimal > 7) - Max 40 points
    const uvScore = Math.min(40, avgUvIndex * 4.5);
    // Precipitation (optimal 0mm) - Max 30 points (each 1mm of rain drops score by 3 points)
    const rainScore = Math.max(0, 30 - maxPrecip * 3);
    // Max Temperature (optimal 35-43C for fast fermentation) - Max 30 points
    const tempScore = Math.min(30, Math.max(0, (avgTemp - 18) * 1.5));
    return Math.round(uvScore + rainScore + tempScore);
  };
  
  const weatherReadinessScore = calcWeatherReadiness();

  // 3. Compute planning metrics for ALL products to construct queues
  const getProductPlannerData = (prod: Product) => {
    const minSafetyStock = prod.plannerMinStock ?? 10;

    // Rolling 14-day sales count
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const recentItems = orders
      .filter(o => new Date(o.createdAt) >= fourteenDaysAgo)
      .flatMap(o => o.items)
      .filter(i => i.productId === prod.id);

    const soldQty14Days = recentItems.reduce((sum, i) => sum + i.quantity, 0);
    const baseDailyBurn = soldQty14Days / 14;

    // Scale by scenario modifier
    const scaledDailyBurn = baseDailyBurn * (demandModifier / 100);

    // Combine with subscription daily commitment based on spiciness level
    const dailyDemandRate = scaledDailyBurn + getProductSubscriptionDailyRate(prod.spiciness ?? 2);

    // Pending customer orders (NEW, CONFIRMED, PACKED statuses)
    const pendingOrderQty = orders
      .filter(o => ['NEW', 'CONFIRMED', 'PACKED'].includes(o.status))
      .flatMap(o => o.items)
      .filter(i => i.productId === prod.id)
      .reduce((sum, i) => sum + i.quantity, 0);

    // Available shelf stock after fulfilling active order pipeline
    const netAvailableStock = prod.stockCount - pendingOrderQty;

    // Projected depletion days
    // If daily demand is 0, assume an organic micro-demand (e.g. 0.05 jars/day) to prevent infinite days
    const rateToUse = dailyDemandRate > 0 ? dailyDemandRate : 0.05;
    const depletionDays = netAvailableStock > 0 ? netAvailableStock / rateToUse : 0;

    const depletionDate = new Date();
    depletionDate.setDate(depletionDate.getDate() + Math.round(depletionDays));

    // Base drying times in days
    let baseDryingTime = 5;
    const lowerName = prod.name.toLowerCase();
    if (lowerName.includes('mango')) baseDryingTime = 7;
    else if (lowerName.includes('chili') || lowerName.includes('mirch')) baseDryingTime = 4;
    else if (lowerName.includes('lemon') || lowerName.includes('nimbu')) baseDryingTime = 10;

    const totalLeadTime = baseDryingTime + Math.round(weatherDelay);
    const recommendedBatchDate = new Date(depletionDate);
    recommendedBatchDate.setDate(recommendedBatchDate.getDate() - totalLeadTime);

    // Urgency categorization
    let urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (netAvailableStock <= 0 || depletionDays <= 3) {
      urgency = 'CRITICAL';
    } else if (depletionDays <= 7 || prod.stockCount < minSafetyStock) {
      urgency = 'HIGH';
    } else if (depletionDays <= 14) {
      urgency = 'MEDIUM';
    }

    // Recommended batch size
    let recommendedBatch = 0;
    const deficit = pendingOrderQty + minSafetyStock - prod.stockCount;
    if (deficit > 0) {
      // 25% buffer, rounded up to nearest 5 jars
      recommendedBatch = Math.ceil((deficit * 1.25) / 5) * 5;
    }

    // Check for upcoming festival warnings in next 30 days
    const upcomingFestivals = alerts.filter(a => {
      if (a.isDismissed) return false;
      const festivalTime = new Date(a.festivalDate).getTime();
      const diffDays = (festivalTime - Date.now()) / (24 * 3600 * 1000);
      return diffDays >= 0 && diffDays <= 30;
    });

    return {
      product: prod,
      soldQty14Days,
      dailyDemandRate,
      pendingOrderQty,
      netAvailableStock,
      depletionDays,
      depletionDate,
      baseDryingTime,
      totalLeadTime,
      recommendedBatchDate,
      urgency,
      recommendedBatch,
      safetyStock: minSafetyStock,
      upcomingFestivals
    };
  };

  const allPlannerData = products.map(getProductPlannerData);

  // Group by urgency for the workload summary lists
  const criticalQueue = allPlannerData.filter(d => d.urgency === 'CRITICAL');
  const highQueue = allPlannerData.filter(d => d.urgency === 'HIGH');
  const mediumStableQueue = allPlannerData.filter(d => d.urgency === 'MEDIUM' || d.urgency === 'LOW');

  // Currently focused product data
  const currentPlan = allPlannerData.find(d => d.product.id === selectedProductId);

  // 4. Recipe / Ingredient Purchase scaling
  const getIngredientList = (batchSize: number, category: string, name: string) => {
    // If batch size is 0, calculate recipe for a standard batch size of 20 jars
    const size = batchSize > 0 ? batchSize : 20;
    const lowerName = name.toLowerCase();

    if (lowerName.includes('mango')) {
      return [
        { name: 'Green Raw Mangoes', amount: `${(size * 0.45).toFixed(1)} kg`, purpose: 'Main produce' },
        { name: 'Mustard Oil (Kacchi Ghani)', amount: `${(size * 0.12).toFixed(1)} L`, purpose: 'Base & preservation' },
        { name: 'Coarse Sea Salt', amount: `${(size * 0.05).toFixed(2)} kg`, purpose: 'Curing & shelf-life' },
        { name: 'Spices Mix (Fennel, Fenugreek, Mustard seeds)', amount: `${(size * 0.04).toFixed(2)} kg`, purpose: 'Signature dry rub' },
        { name: 'Turmeric & Hing', amount: `${(size * 0.015).toFixed(2)} kg`, purpose: 'Aromatics & color' }
      ];
    } else if (lowerName.includes('chili') || lowerName.includes('mirch')) {
      return [
        { name: 'Fresh Green/Red Chilies', amount: `${(size * 0.28).toFixed(1)} kg`, purpose: 'Main produce' },
        { name: 'Mustard Oil', amount: `${(size * 0.08).toFixed(1)} L`, purpose: 'Base seasoning' },
        { name: 'Lemon Juice / Citric Curing', amount: `${(size * 0.04).toFixed(2)} L`, purpose: 'Tangy fermentation' },
        { name: 'Coarse Salt', amount: `${(size * 0.04).toFixed(2)} kg`, purpose: 'Curing' },
        { name: 'Rye (Crushed Yellow Mustard Seeds)', amount: `${(size * 0.03).toFixed(2)} kg`, purpose: 'Stuffing/spicing' }
      ];
    } else if (lowerName.includes('lemon') || lowerName.includes('nimbu')) {
      return [
        { name: 'Kagzi Lemons (Thin skinned)', amount: `${(size * 0.4).toFixed(1)} kg`, purpose: 'Main produce' },
        { name: 'White / Rock Salt', amount: `${(size * 0.06).toFixed(2)} kg`, purpose: 'Juice extraction & cure' },
        { name: 'Sugar / Jaggery (Gur)', amount: `${lowerName.includes('meetha') ? (size * 0.22).toFixed(1) : '0'} kg`, purpose: 'Sweet profile sweetening' },
        { name: 'Spices Mix (Ajwain, Black Pepper, Cumin)', amount: `${(size * 0.02).toFixed(2)} kg`, purpose: 'Digestive spice blend' }
      ];
    } else {
      // Default fallback pickle recipe
      return [
        { name: 'Raw Vegetable / Produce', amount: `${(size * 0.38).toFixed(1)} kg`, purpose: 'Main base' },
        { name: 'Preserving Oil', amount: `${(size * 0.1).toFixed(1)} L`, purpose: 'Fluid cover' },
        { name: 'Salt & Turmeric', amount: `${(size * 0.06).toFixed(2)} kg`, purpose: 'Preservatives' },
        { name: 'All-Spice Powder mix', amount: `${(size * 0.03).toFixed(2)} kg`, purpose: 'Flavoring' }
      ];
    }
  };

  // 5. Save Manual Overrides Handler
  const handleSaveOverrides = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    setSavingOverrides(true);
    setSaveMessage(null);

    try {
      const res = await fetch(`/api/admin/products/${selectedProductId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plannerMinStock: overrideMinStock,
          plannerNotes: overrideNotes
        })
      });

      const data = await res.json();
      if (data.success && data.product) {
        setProducts(prev => 
          prev.map(p => p.id === selectedProductId ? {
            ...p,
            plannerMinStock: data.product.plannerMinStock,
            plannerNotes: data.product.plannerNotes
          } : p)
        );
        setSaveMessage({ text: 'Planner overrides saved successfully!', type: 'success' });
      } else {
        throw new Error(data.error || 'Failed to save settings');
      }
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Error connection error';
      setSaveMessage({ text: msg, type: 'error' });
    } finally {
      setSavingOverrides(false);
    }
  };

  return (
    <div className="admin-section" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. TOP HEADER PANEL: Weather & Global Workload summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Left Side: Simulation settings & Weather overview */}
        <div className="admin-premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 className="admin-card-title-lux" style={{ margin: 0 }}>📊 Planner Scenario Settings</h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setDemandModifier(100)} 
                className="admin-logout-btn" 
                style={{ padding: '4px 10px', fontSize: '0.75rem', backgroundColor: demandModifier === 100 ? 'var(--admin-maroon)' : '', color: demandModifier === 100 ? '#fff' : '' }}
              >
                Normal
              </button>
              <button 
                onClick={() => setDemandModifier(125)} 
                className="admin-logout-btn" 
                style={{ padding: '4px 10px', fontSize: '0.75rem', backgroundColor: demandModifier === 125 ? 'var(--admin-maroon)' : '', color: demandModifier === 125 ? '#fff' : '' }}
              >
                Festival Rush (+25%)
              </button>
              <button 
                onClick={() => setDemandModifier(150)} 
                className="admin-logout-btn" 
                style={{ padding: '4px 10px', fontSize: '0.75rem', backgroundColor: demandModifier === 150 ? 'var(--admin-maroon)' : '', color: demandModifier === 150 ? '#fff' : '' }}
              >
                Monsoon Peak (+50%)
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', backgroundColor: '#FAFAFA', padding: '16px', border: '1px solid var(--admin-border)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                <span style={{ color: 'var(--admin-muted)' }}>Simulated Demand Scale:</span>
                <strong style={{ color: 'var(--admin-maroon)' }}>{demandModifier}%</strong>
              </div>
              <input 
                type="range" 
                min="80" 
                max="180" 
                step="5"
                value={demandModifier}
                onChange={e => setDemandModifier(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--admin-maroon)', cursor: 'pointer' }}
              />
            </div>
            <div style={{ borderLeft: '1px solid var(--admin-border)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Daily Achar Club Share</span>
              <strong style={{ fontSize: '1.25rem' }}>{avgDailySubJarsPerProduct.toFixed(2)} Jars/day</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--admin-muted)' }}>({totalSubJars} jars / {products.length} products)</span>
            </div>
          </div>
        </div>

        {/* Right Side: Dynamic Weather Readiness Score */}
        <div className="admin-premium-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-maroon)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            ☀️ Jaipur Sunlight Readiness
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '12px' }}>
            <strong style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--admin-text)' }}>
              {loadingWeather ? '...' : `${weatherReadinessScore}%`}
            </strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--admin-muted)' }}>Readiness Index</span>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', marginTop: '8px', borderTop: '1px solid var(--admin-border)', paddingTop: '10px' }}>
            {loadingWeather ? (
              <span>Connecting weather satellites...</span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div>Avg UV Index: <strong>{avgUvIndex.toFixed(1)}/10</strong> ({avgUvIndex > 6 ? 'Excellent Sun' : 'Shaded'})</div>
                <div>Expected Rain: <strong>{maxPrecip.toFixed(1)} mm</strong> ({maxPrecip > 1.5 ? 'Delay Risk' : 'Dry/Sunny'})</div>
                {weatherDelay > 0 && (
                  <span style={{ color: '#C53030', fontWeight: '600' }}>⚠️ +{Math.round(weatherDelay)} days sun-curing delay active</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. WORKLOAD QUEUES SUMMARY (Urgency rankings) */}
      <div className="admin-premium-card">
        <h4 className="admin-card-title-lux" style={{ marginBottom: '16px' }}>📅 Combined Workload Urgency Dashboard</h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          {/* CRITICAL BATCHES queue */}
          <div style={{ border: '1px solid var(--admin-border)', borderTop: '3px solid #E53E3E', padding: '16px', backgroundColor: '#FFFDFD' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: 700, color: '#C53030', fontSize: '0.8rem', textTransform: 'uppercase' }}>🚨 Critical (0-3 Days)</span>
              <span style={{ backgroundColor: '#FED7D7', color: '#9B2C2C', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                {criticalQueue.length}
              </span>
            </div>
            {criticalQueue.length === 0 ? (
              <p style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', margin: '10px 0' }}>Clean queue! No immediate shortages.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {criticalQueue.map(q => (
                  <button 
                    key={q.product.id} 
                    onClick={() => setSelectedProductId(q.product.id)}
                    style={{ textAlign: 'left', background: '#FFFFFF', border: '1px solid #FEB2B2', padding: '8px 12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{q.product.name}</div>
                      <span style={{ fontSize: '0.75rem', color: '#9B2C2C' }}>
                        Deficit: {Math.max(0, q.pendingOrderQty - q.product.stockCount)} jars
                      </span>
                    </div>
                    <span style={{ fontSize: '1.2rem' }}>&rarr;</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* HIGH PRIORITY queue */}
          <div style={{ border: '1px solid var(--admin-border)', borderTop: '3px solid #DD6B20', padding: '16px', backgroundColor: '#FFFAFA' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: 700, color: '#C05621', fontSize: '0.8rem', textTransform: 'uppercase' }}>⚠️ High (4-7 Days)</span>
              <span style={{ backgroundColor: '#FEEBC8', color: '#7B341E', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                {highQueue.length}
              </span>
            </div>
            {highQueue.length === 0 ? (
              <p style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', margin: '10px 0' }}>No high priority warnings.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {highQueue.map(q => (
                  <button 
                    key={q.product.id} 
                    onClick={() => setSelectedProductId(q.product.id)}
                    style={{ textAlign: 'left', background: '#FFFFFF', border: '1px solid #FBD38D', padding: '8px 12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{q.product.name}</div>
                      <span style={{ fontSize: '0.75rem', color: '#7B341E' }}>
                        Run out: ~{Math.round(q.depletionDays)} days
                      </span>
                    </div>
                    <span style={{ fontSize: '1.2rem' }}>&rarr;</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* STABLE/LONG TERM queue */}
          <div style={{ border: '1px solid var(--admin-border)', borderTop: '3px solid #38A169', padding: '16px', backgroundColor: '#FAFFFA' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: 700, color: '#276749', fontSize: '0.8rem', textTransform: 'uppercase' }}>🟢 Stable (8+ Days)</span>
              <span style={{ backgroundColor: '#C6F6D5', color: '#22543D', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                {mediumStableQueue.length}
              </span>
            </div>
            {mediumStableQueue.length === 0 ? (
              <p style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', margin: '10px 0' }}>All stock low or critical.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '140px', overflowY: 'auto' }}>
                {mediumStableQueue.map(q => (
                  <button 
                    key={q.product.id} 
                    onClick={() => setSelectedProductId(q.product.id)}
                    style={{ textAlign: 'left', background: '#FFFFFF', border: '1px solid #A3E635', padding: '8px 12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{q.product.name}</div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--admin-success)' }}>
                        Stock: {q.product.stockCount} jars
                      </span>
                    </div>
                    <span style={{ fontSize: '1rem' }}>&rarr;</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. PRODUCT SPECIFIC INTELLIGENCE & INGREDIENTS RECIPE SCALER */}
      {currentPlan && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          
          {/* Left Side: Product planning sheet */}
          <div className="admin-premium-card" style={{ borderLeft: `6px solid ${
            currentPlan.urgency === 'CRITICAL' ? '#C53030' : currentPlan.urgency === 'HIGH' ? '#DD6B20' : '#38A169'
          }` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Product Specific Plan</span>
                <h3 className="admin-card-title-lux" style={{ fontSize: '1.4rem', margin: '4px 0' }}>{currentPlan.product.name}</h3>
              </div>
              <select 
                className="form-control" 
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.9rem' }}
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Explanation & Urgency Box */}
            <div style={{ 
              backgroundColor: currentPlan.urgency === 'CRITICAL' ? '#FFF5F5' : currentPlan.urgency === 'HIGH' ? '#FFFAF0' : '#F0FFF4',
              border: `1px solid ${currentPlan.urgency === 'CRITICAL' ? '#FEB2B2' : currentPlan.urgency === 'HIGH' ? '#FEEBC8' : '#C6F6D5'}`,
              padding: '16px',
              marginBottom: '20px',
              fontSize: '0.9rem'
            }}>
              <div style={{ fontWeight: 700, color: currentPlan.urgency === 'CRITICAL' ? '#C53030' : currentPlan.urgency === 'HIGH' ? '#C05621' : '#276749', marginBottom: '6px' }}>
                {currentPlan.urgency === 'CRITICAL' && '🚨 CRITICAL SHORTAGE DETECTED'}
                {currentPlan.urgency === 'HIGH' && '⚠️ INSUFFICIENT SAFETY STOCK WARNING'}
                {currentPlan.urgency === 'MEDIUM' && '🟢 STOCK LEVEL ADEQUATE'}
                {currentPlan.urgency === 'LOW' && '🟢 FULLY STOCK SATISFIED'}
              </div>
              
              <div style={{ color: 'var(--admin-text)', lineHeight: '1.5' }}>
                Current shelf stock (<strong>{currentPlan.product.stockCount} Jars</strong>) satisfies active customer orders (<strong>{currentPlan.pendingOrderQty} Jars</strong>) with a net reserve of <strong>{currentPlan.netAvailableStock} Jars</strong>. 
                At a simulated burn rate of <strong>{currentPlan.dailyDemandRate.toFixed(2)} jars/day</strong> (including Achar Club obligations):
                <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                  <li>Depletion projected in <strong>{Math.round(currentPlan.depletionDays)} days</strong> ({currentPlan.depletionDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}).</li>
                  <li>Curing Lead Time: <strong>{currentPlan.totalLeadTime} days</strong> (Base drying of {currentPlan.baseDryingTime}d + {Math.round(weatherDelay)}d weather lag).</li>
                  <li>Recommended batch start: <strong style={{ color: 'var(--admin-maroon)' }}>{currentPlan.recommendedBatchDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>.</li>
                </ul>
              </div>
            </div>

            {/* Core Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '12px', border: '1px solid var(--admin-border)', backgroundColor: '#FAFAFA', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', display: 'block' }}>Pending Orders</span>
                <strong style={{ fontSize: '1.25rem' }}>{currentPlan.pendingOrderQty} jars</strong>
              </div>
              <div style={{ padding: '12px', border: '1px solid var(--admin-border)', backgroundColor: '#FAFAFA', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', display: 'block' }}>Safety Threshold</span>
                <strong style={{ fontSize: '1.25rem' }}>{currentPlan.safetyStock} jars</strong>
              </div>
              <div style={{ padding: '12px', border: '1px solid var(--admin-border)', backgroundColor: '#FAFAFA', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', display: 'block' }}>Recommended Batch</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--admin-maroon)' }}>
                  {currentPlan.recommendedBatch > 0 ? `${currentPlan.recommendedBatch} Jars` : 'None Needed'}
                </strong>
              </div>
            </div>

            {/* Upcoming festival warning */}
            {currentPlan.upcomingFestivals.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#FFF5F5', border: '1px solid #FEB2B2', padding: '12px', fontSize: '0.85rem', color: '#9B2C2C', marginBottom: '16px' }}>
                <span>🏮</span>
                <div>
                  <strong>Upcoming Demand Spike:</strong> {currentPlan.upcomingFestivals[0].name} occurs on {new Date(currentPlan.upcomingFestivals[0].festivalDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}. We suggest increasing batch quantities by 20% to account for gifting and bundle sales.
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Ingredient Purchase Scaler */}
          <div className="admin-premium-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Purchase Sheet</span>
              <h4 className="admin-card-title-lux" style={{ marginTop: '4px', marginBottom: '6px' }}>
                🥣 Ingredient Scaler & Prep List
              </h4>
              <p style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                Automated scaling based on a recommended batch of <strong>{currentPlan.recommendedBatch > 0 ? currentPlan.recommendedBatch : 20}</strong> jars.
                {currentPlan.recommendedBatch === 0 && ' (Showing baseline batch formula of 20 jars)'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {getIngredientList(currentPlan.recommendedBatch, currentPlan.product.category, currentPlan.product.name).map((ing, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '10px 12px',
                      borderBottom: '1px solid var(--admin-border)',
                      fontSize: '0.9rem'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{ing.name}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>{ing.purpose}</span>
                    </div>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--admin-maroon)' }}>{ing.amount}</strong>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => setActiveTab('kitchen')} 
              className="admin-logout-btn" 
              style={{ marginTop: '20px', padding: '10px', textAlign: 'center', width: '100%', fontSize: '0.9rem' }}
            >
              📋 Add to Kitchen View targets list &rarr;
            </button>
          </div>
        </div>
      )}

      {/* 4. OVERRIDES PANEL & MANAGE SETTINGS */}
      {selectedProduct && (
        <div className="admin-premium-card">
          <h4 className="admin-card-title-lux" style={{ marginBottom: '16px' }}>⚙️ Edit Planning Constants & Safety Overrides</h4>
          
          <form onSubmit={handleSaveOverrides} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
              <div className="form-group">
                <label>Minimum Safety Stock (Jars)</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  className="form-control" 
                  value={overrideMinStock}
                  onChange={e => setOverrideMinStock(parseInt(e.target.value) || 0)}
                  placeholder="e.g. 10"
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>
                  Triggers run out warning when stock level falls below this number.
                </span>
              </div>
              <div className="form-group">
                <label>Planner Override Notes / Instructions</label>
                <textarea 
                  className="form-control" 
                  rows={3}
                  value={overrideNotes}
                  onChange={e => setOverrideNotes(e.target.value)}
                  placeholder="Enter custom batch size directions, fruit source notes, or sunlight precautions (e.g. 'Hold off Mango curing if Monsoon starts')"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--admin-border)', paddingTop: '16px' }}>
              <div>
                {saveMessage && (
                  <span style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: 600, 
                    color: saveMessage.type === 'success' ? '#2F855A' : '#C53030' 
                  }}>
                    {saveMessage.type === 'success' ? '✅ ' : '❌ '}{saveMessage.text}
                  </span>
                )}
              </div>
              <button 
                type="submit" 
                disabled={savingOverrides}
                className="admin-logout-btn" 
                style={{ padding: '10px 24px', backgroundColor: 'var(--admin-maroon)', color: '#FFFFFF' }}
              >
                {savingOverrides ? 'Saving Settings...' : 'Save Product Constants'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
