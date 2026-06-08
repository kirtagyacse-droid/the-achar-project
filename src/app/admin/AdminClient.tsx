"use client";
import React, { useState, useEffect } from 'react';
import AdminShell from './components/AdminShell';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  stockStatus: string;
  stockCount: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  batchNumber?: string | null;
  batchDate?: string | Date | null;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    name: string;
  };
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  altPhone: string | null;
  address: string;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  notes: string | null;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: Date;
  items: OrderItem[];
  dispatchPhotoUrl: string | null;
  isGiftOrder?: boolean;
  giftPackaging?: string | null;
  giftMessage?: string | null;
  referralCode?: string | null;
}

export interface FestivalAlert {
  id: string;
  name: string;
  festivalDate: Date | string;
  alertDate: Date | string;
  isDismissed: boolean;
  message: string | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImage: string | null;
  isPublished: boolean;
  createdAt: Date | string;
}

export interface KitchenTarget {
  id: string;
  productId: string | null;
  productName: string;
  targetQuantity: number;
  notes: string | null;
  status: string;
  createdAt: string | Date;
}

export interface Subscription {
  id: string;
  customerName: string;
  phone: string;
  email: string | null;
  address: string;
  planJars: number;
  isActive: boolean;
  nextDelivery: Date | string | null;
  notes: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PicklePassport {
  id: string;
  phone: string;
  customerName: string;
  stamps: string[];
  isComplete: boolean;
  freeJarClaimed: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface JarReturn {
  id: string;
  phone: string;
  customerName: string;
  jarCount: number;
  discountApplied: boolean;
  loggedAt: Date | string;
}

export interface Referral {
  id: string;
  referrerPhone: string;
  referrerName: string;
  referralCode: string;
  usedByPhone: string | null;
  usedByName: string | null;
  referrerCredit: number;
  refereeDiscount: number;
  isUsed: boolean;
  createdAt: Date | string;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  reason: string;
  notes: string | null;
  batchNumber: string | null;
  createdAt: string | Date;
}

interface AdminClientProps {
  initialOrders: Order[];
  initialProducts: Product[];
  initialAlerts: FestivalAlert[];
  initialBlogPosts: BlogPost[];
  initialSubscriptions: Subscription[];
  initialPassports: PicklePassport[];
  initialJarReturns: JarReturn[];
  initialReferrals: Referral[];
  initialStockAdjustments: StockAdjustment[];
  isWhatsAppAlertConfigured: boolean;
}

export default function AdminClient({ 
  initialOrders, 
  initialProducts, 
  initialAlerts, 
  initialBlogPosts, 
  initialSubscriptions,
  initialPassports,
  initialJarReturns,
  initialReferrals,
  initialStockAdjustments,
  isWhatsAppAlertConfigured 
}: AdminClientProps) {
  // Core states
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [alerts, setAlerts] = useState<FestivalAlert[]>(initialAlerts);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialBlogPosts);
  const [subscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [passports, setPassports] = useState<PicklePassport[]>(initialPassports);
  const [jarReturns, setJarReturns] = useState<JarReturn[]>(initialJarReturns);
  const [referrals] = useState<Referral[]>(initialReferrals);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(initialStockAdjustments);
  
  // Lazy state initializers to avoid state settings inside effects
  const [sentNudgeIds, setSentNudgeIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('nudge_sent_order_ids') || '[]');
      } catch {
        return [];
      }
    }
    return [];
  });

  const [kitchenTargets, setKitchenTargets] = useState<KitchenTarget[]>([]);

  // Adjust states directly in render phase if initial props change (Next.js recommended pattern)
  const [prevOrders, setPrevOrders] = useState<Order[]>(initialOrders);
  if (initialOrders !== prevOrders) {
    setPrevOrders(initialOrders);
    setOrders(initialOrders);
  }

  const [prevProducts, setPrevProducts] = useState<Product[]>(initialProducts);
  if (initialProducts !== prevProducts) {
    setPrevProducts(initialProducts);
    setProducts(initialProducts);
  }

  const [prevAlerts, setPrevAlerts] = useState<FestivalAlert[]>(initialAlerts);
  if (initialAlerts !== prevAlerts) {
    setPrevAlerts(initialAlerts);
    setAlerts(initialAlerts);
  }

  const [prevBlogPosts, setPrevBlogPosts] = useState<BlogPost[]>(initialBlogPosts);
  if (initialBlogPosts !== prevBlogPosts) {
    setPrevBlogPosts(initialBlogPosts);
    setBlogPosts(initialBlogPosts);
  }

  const [prevPassports, setPrevPassports] = useState<PicklePassport[]>(initialPassports);
  if (initialPassports !== prevPassports) {
    setPrevPassports(initialPassports);
    setPassports(initialPassports);
  }

  const [prevJarReturns, setPrevJarReturns] = useState<JarReturn[]>(initialJarReturns);
  if (initialJarReturns !== prevJarReturns) {
    setPrevJarReturns(initialJarReturns);
    setJarReturns(initialJarReturns);
  }

  const [prevStockAdjustments, setPrevStockAdjustments] = useState<StockAdjustment[]>(initialStockAdjustments);
  if (initialStockAdjustments !== prevStockAdjustments) {
    setPrevStockAdjustments(initialStockAdjustments);
    setStockAdjustments(initialStockAdjustments);
  }

  // Fetch kitchen targets on mount
  useEffect(() => {
    async function fetchKitchenTargets() {
      try {
        const res = await fetch('/api/admin/kitchen-targets');
        if (res.ok) {
          const data = await res.json();
          setKitchenTargets(data.targets);
        }
      } catch (error) {
        console.error('Failed to load kitchen targets from database', error);
      }
    }
    fetchKitchenTargets();
  }, []);

  // Logout handler to call logout endpoint and redirect
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/admin/logout', { method: 'POST' });
      if (res.ok) {
        window.location.href = '/admin/login';
      } else {
        alert('Failed to log out');
      }
    } catch (error) {
      console.error('Error during logout', error);
      alert('Error during logout');
    }
  };

  return (
    <AdminShell
      orders={orders}
      setOrders={setOrders}
      products={products}
      setProducts={setProducts}
      alerts={alerts}
      setAlerts={setAlerts}
      blogPosts={blogPosts}
      setBlogPosts={setBlogPosts}
      subscriptions={subscriptions}
      passports={passports}
      setPassports={setPassports}
      jarReturns={jarReturns}
      referrals={referrals}
      sentNudgeIds={sentNudgeIds}
      setSentNudgeIds={setSentNudgeIds}
      isWhatsAppAlertConfigured={isWhatsAppAlertConfigured}
      onLogout={handleLogout}
      kitchenTargets={kitchenTargets}
      setKitchenTargets={setKitchenTargets}
      stockAdjustments={stockAdjustments}
      setStockAdjustments={setStockAdjustments}
    />
  );
}
