"use client";
import React, { useState } from 'react';
import '../admin.css';
import OverviewTab from './OverviewTab';
import OrdersTab from './OrdersTab';
import KitchenViewTab from './KitchenViewTab';
import InventoryTab from './InventoryTab';
import PlannerTab from './PlannerTab';
import CustomersTab from './CustomersTab';
import SubscriptionsTab from './SubscriptionsTab';
import ReferralsTab from './ReferralsTab';
import DiaryTab from './DiaryTab';
import FestivalTab from './FestivalTab';
import SettingsTab from './SettingsTab';
import { 
  Product, 
  Order, 
  FestivalAlert, 
  BlogPost, 
  KitchenTarget, 
  Subscription, 
  PicklePassport, 
  JarReturn, 
  Referral,
  StockAdjustment
} from '../AdminClient';

interface AdminShellProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  alerts: FestivalAlert[];
  setAlerts: React.Dispatch<React.SetStateAction<FestivalAlert[]>>;
  blogPosts: BlogPost[];
  setBlogPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
  subscriptions: Subscription[];
  passports: PicklePassport[];
  setPassports: React.Dispatch<React.SetStateAction<PicklePassport[]>>;
  jarReturns: JarReturn[];
  referrals: Referral[];
  sentNudgeIds: string[];
  setSentNudgeIds: React.Dispatch<React.SetStateAction<string[]>>;
  isWhatsAppAlertConfigured: boolean;
  onLogout: () => void;
  kitchenTargets: KitchenTarget[];
  setKitchenTargets: React.Dispatch<React.SetStateAction<KitchenTarget[]>>;
  stockAdjustments: StockAdjustment[];
  setStockAdjustments: React.Dispatch<React.SetStateAction<StockAdjustment[]>>;
}

export type TabType = 
  | 'overview' 
  | 'orders' 
  | 'kitchen' 
  | 'inventory' 
  | 'planner' 
  | 'customers' 
  | 'subscriptions' 
  | 'referrals' 
  | 'diary' 
  | 'festivals' 
  | 'settings';

export default function AdminShell({
  orders,
  setOrders,
  products,
  setProducts,
  alerts,
  setAlerts,
  blogPosts,
  setBlogPosts,
  subscriptions,
  passports,
  setPassports,
  jarReturns,
  referrals,
  sentNudgeIds,
  setSentNudgeIds,
  isWhatsAppAlertConfigured,
  onLogout,
  kitchenTargets,
  setKitchenTargets,
  stockAdjustments,
  setStockAdjustments
}: AdminShellProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Count metrics for sidebar badges
  const pendingOrdersCount = orders.filter(o => ['NEW', 'CONFIRMED', 'PACKED'].includes(o.status)).length;
  const lowStockCount = products.filter(p => p.stockCount < 10).length;
  const activeAlertsCount = alerts.filter(a => !a.isDismissed).length;
  const pendingTargetsCount = kitchenTargets.filter(t => ['pending', 'in_progress'].includes(t.status)).length;

  const menuItems: { type: TabType; label: string; icon: string; badge?: number }[] = [
    { type: 'overview', label: 'Overview', icon: '📊' },
    { type: 'orders', label: 'Orders', icon: '📋', badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined },
    { type: 'kitchen', label: 'Kitchen View', icon: '🥣', badge: pendingTargetsCount > 0 ? pendingTargetsCount : undefined },
    { type: 'inventory', label: 'Inventory', icon: '🌶️', badge: lowStockCount > 0 ? lowStockCount : undefined },
    { type: 'planner', label: 'Production Planner', icon: '📅' },
    { type: 'customers', label: 'Customers & Loyalty', icon: '👥' },
    { type: 'subscriptions', label: 'Subscriptions', icon: '📬' },
    { type: 'referrals', label: 'Referrals', icon: '🔗' },
    { type: 'diary', label: 'Achar Diary', icon: '✍️' },
    { type: 'festivals', label: 'Festival Bundles', icon: '🏮', badge: activeAlertsCount > 0 ? activeAlertsCount : undefined },
    { type: 'settings', label: 'Settings & Security', icon: '⚙️' },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            orders={orders}
            products={products}
            alerts={alerts}
            referrals={referrals}
            kitchenTargets={kitchenTargets}
            setActiveTab={setActiveTab}
            setAlerts={setAlerts}
            subscriptions={subscriptions}
            stockAdjustments={stockAdjustments}
          />
        );
      case 'orders':
        return (
          <OrdersTab
            orders={orders}
            setOrders={setOrders}
          />
        );
      case 'kitchen':
        return (
          <KitchenViewTab
            kitchenTargets={kitchenTargets}
            setKitchenTargets={setKitchenTargets}
            products={products}
            orders={orders}
            setActiveTab={setActiveTab}
          />
        );
      case 'inventory':
        return (
          <InventoryTab
            products={products}
            setProducts={setProducts}
            stockAdjustments={stockAdjustments}
            setStockAdjustments={setStockAdjustments}
            orders={orders}
          />
        );
      case 'planner':
        return (
          <PlannerTab
            products={products}
            orders={orders}
            setActiveTab={setActiveTab}
          />
        );
      case 'customers':
        return (
          <CustomersTab
            passports={passports}
            setPassports={setPassports}
            jarReturns={jarReturns}
            orders={orders}
            sentNudgeIds={sentNudgeIds}
            setSentNudgeIds={setSentNudgeIds}
          />
        );
      case 'subscriptions':
        return (
          <SubscriptionsTab
            subscriptions={subscriptions}
          />
        );
      case 'referrals':
        return (
          <ReferralsTab
            referrals={referrals}
          />
        );
      case 'diary':
        return (
          <DiaryTab
            blogPosts={blogPosts}
            setBlogPosts={setBlogPosts}
          />
        );
      case 'festivals':
        return (
          <FestivalTab
            alerts={alerts}
            setAlerts={setAlerts}
          />
        );
      case 'settings':
        return (
          <SettingsTab
            isWhatsAppAlertConfigured={isWhatsAppAlertConfigured}
            onLogout={onLogout}
          />
        );
      default:
        return <div>Section not found.</div>;
    }
  };

  const getPageTitle = () => {
    const activeItem = menuItems.find(item => item.type === activeTab);
    return activeItem ? `${activeItem.icon} ${activeItem.label}` : 'Admin Dashboard';
  };

  return (
    <div className="admin-container">
      {/* Sidebar navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">RS Savoury</div>
        </div>
        
        <nav className="admin-sidebar-menu">
          {menuItems.map(item => (
            <button
              key={item.type}
              onClick={() => setActiveTab(item.type)}
              className={`admin-menu-item ${activeTab === item.type ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="admin-menu-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button 
            type="button" 
            onClick={onLogout}
            className="admin-logout-btn"
            style={{ width: '100%', padding: '12px' }}
          >
            🚪 Logout Session
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="admin-content-viewport">
        {/* Top Header Bar */}
        <header className="admin-topbar">
          <h1 className="admin-topbar-title">{getPageTitle()}</h1>
          
          <div className="admin-topbar-meta">
            <span className="admin-topbar-status">Live Server Connected</span>
            <span>{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="admin-main-body">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}
