import React, { useState } from "react";
import { User, Mail, Phone, MapPin, ShoppingBag, CheckCircle, Package, Truck, Calendar, X, Edit, Save, Trash2, ArrowLeft, Plus, Image, RefreshCw, Upload } from "lucide-react";
import { Order } from "../types";

interface UserProfilePanelProps {
  currentUser: any;
  setCurrentUser: (user: any) => void;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  language: 'en' | 'bn';
  currency: 'BDT' | 'USD';
  triggerToast: (msg: string) => void;
  onBackToShop: () => void;
  setCurrentTab?: (tab: string) => void;
  products: any[];
  setProducts: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function UserProfilePanel({
  currentUser,
  setCurrentUser,
  orders,
  setOrders,
  language,
  currency,
  triggerToast,
  onBackToShop,
  setCurrentTab,
  products,
  setProducts
}: UserProfilePanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(currentUser?.firstName || "");
  const [lastName, setLastName] = useState(currentUser?.lastName || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [address, setAddress] = useState(currentUser?.address || "");
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'products'>('orders');

  // Products manager state variables
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [prodForm, setProdForm] = useState({
    name: "",
    nameBn: "",
    category: "tshirt" as 'tshirt' | 'laptop' | 'appliances' | 'gadgets' | 'watches',
    priceBDT: 500,
    priceUSD: 4.35,
    stock: 15,
    image: ""
  });

  const userOrders = orders.filter((order) => {
    if (!currentUser) return false;
    // Link by matching email or phone
    const orderEmail = order.customerInfo.email?.toLowerCase().trim();
    const orderPhone = order.customerInfo.phone?.trim();
    const userEmail = currentUser.email?.toLowerCase().trim();
    const userPhone = currentUser.phone?.trim();

    return (userEmail && orderEmail === userEmail) || (userPhone && orderPhone === userPhone);
  });

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      triggerToast(language === 'bn' ? "সকল ক্ষেত্র পূরণ করুন!" : "All name fields are required!");
      return;
    }

    const updatedUser = {
      ...currentUser,
      firstName,
      lastName,
      email,
      phone,
      address
    };

    // Update state & localStorage
    setCurrentUser(updatedUser);
    localStorage.setItem("nabik_current_user", JSON.stringify(updatedUser));

    // Also update users db
    const users = JSON.parse(localStorage.getItem("nabik_registered_users") || "[]");
    const updatedUsers = users.map((u: any) => {
      const matchEmail = u.email && u.email.toLowerCase().trim() === currentUser.email?.toLowerCase().trim();
      const matchPhone = u.phone && u.phone.trim() === currentUser.phone?.trim();
      if ((currentUser.email && matchEmail) || (currentUser.phone && matchPhone)) {
        return updatedUser;
      }
      return u;
    });
    localStorage.setItem("nabik_registered_users", JSON.stringify(updatedUsers));

    setIsEditing(false);
    triggerToast(
      language === 'bn'
        ? "প্রোফাইল সফলভাবে আপডেট করা হয়েছে!"
        : "Profile updated successfully!"
    );
  };

  const handleCancelOrder = (orderId: string) => {
    if (!window.confirm(language === 'bn' ? "আপনি কি নিশ্চিতভাবে এই অর্ডারটি বাতিল করতে চান?" : "Are you sure you want to cancel this order?")) {
      return;
    }

    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId) {
          return { ...order, status: 'placed' }; // Standard fallback, wait, let's add a custom status or change it
        }
        return order;
      })
    );

    // Let's mark as cancelled
    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        return { ...o, status: 'placed' as any, cancelled: true }; // Custom cancel flag
      }
      return o;
    });
    setOrders(updatedOrders);
    localStorage.setItem("nabik_orders", JSON.stringify(updatedOrders));

    triggerToast(
      language === 'bn'
        ? "অর্ডারটি সফলভাবে বাতিল করা হয়েছে!"
        : "Order cancelled successfully!"
    );
  };

  const statusProgress = {
    placed: 1,
    processing: 2,
    shipped: 3,
    delivered: 4
  };

  const getStatusLabel = (status: string, isCancelled?: boolean) => {
    if (isCancelled) {
      return language === 'bn' ? 'বাতিল করা হয়েছে' : 'Cancelled';
    }
    switch (status) {
      case 'placed':
        return language === 'bn' ? 'অর্ডার গৃহীত' : 'Placed';
      case 'processing':
        return language === 'bn' ? 'প্রক্রিয়াকরণাধীন' : 'Processing';
      case 'shipped':
        return language === 'bn' ? 'পাঠানো হয়েছে' : 'Shipped';
      case 'delivered':
        return language === 'bn' ? 'সরবরাহ করা হয়েছে' : 'Delivered';
      default:
        return status;
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-white border rounded-2xl p-10 text-center font-sans">
        <div className="h-16 w-16 bg-orange-100 text-[#f58220] rounded-full mx-auto flex items-center justify-center mb-6">
          <User size={28} />
        </div>
        <h3 className="text-xl font-black text-zinc-900 leading-tight">
          {language === 'bn' ? 'লগইন করুন' : 'Login Required'}
        </h3>
        <p className="text-sm text-zinc-500 mt-2 max-w-sm mx-auto">
          {language === 'bn'
            ? 'অর্ডার হিস্ট্রি ট্র্যাক করতে এবং প্রোফাইল পরিচালনা করতে আপনার অ্যাকাউন্টে লগইন করুন।'
            : 'Please sign in or create an account to view shopping history and manage your delivery details.'}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setCurrentTab?.('signin')}
            className="px-6 py-2.5 bg-[#f58220] text-white hover:bg-orange-600 font-bold uppercase text-xs tracking-wider rounded-lg shadow-sm transition cursor-pointer border-0"
          >
            {language === 'bn' ? 'সাইন ইন করুন' : 'Sign In'}
          </button>
          <button
            onClick={() => setCurrentTab?.('signup')}
            className="px-6 py-2.5 bg-zinc-900 text-white hover:bg-zinc-800 font-bold uppercase text-xs tracking-wider rounded-lg shadow-sm transition cursor-pointer border-0"
          >
            {language === 'bn' ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create Account'}
          </button>
          <button
            onClick={onBackToShop}
            className="px-6 py-2.5 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 font-bold uppercase text-xs tracking-wider rounded-lg shadow-sm transition cursor-pointer border border-zinc-300"
          >
            {language === 'bn' ? 'আমাদের ক্যাটালগ' : 'Browse Catalog'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full text-zinc-800 bg-white border border-zinc-150 rounded-2xl shadow-sm overflow-hidden font-sans text-left">
      {/* Top Banner Accent */}
      <div className="bg-[#f58220] px-6 py-4.5 flex flex-col sm:flex-row items-center justify-between text-black select-none gap-3">
        <div className="flex items-center space-x-3.5">
          <div className="relative group shrink-0">
            {currentUser?.avatar ? (
              <img 
                src={currentUser.avatar} 
                alt="User profile avatar" 
                className="h-11 w-11 rounded-full object-cover bg-white ring-2 ring-black/10 shadow-sm shrink-0" 
              />
            ) : (
              <div className="h-11 w-11 rounded-full bg-white flex items-center justify-center text-[#f58220] font-black text-base shadow-sm shrink-0">
                {firstName.slice(0, 1).toUpperCase()}{lastName.slice(0, 1).toUpperCase()}
              </div>
            )}
            {/* Camera Overlay Icon trigger */}
            <label className="absolute -bottom-1 -right-1 bg-black hover:bg-zinc-800 text-white p-1 rounded-full border border-white cursor-pointer hover:scale-110 transition shadow flex items-center justify-center">
              <svg className="w-3 h-3 text-[#f58220]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      if (ev.target?.result) {
                        const base64Avatar = ev.target.result as string;
                        // update user state & local storage
                        const updated = { ...currentUser, avatar: base64Avatar };
                        setCurrentUser(updated);
                        localStorage.setItem("nabik_current_user", JSON.stringify(updated));
                        
                        const users = JSON.parse(localStorage.getItem("nabik_registered_users") || "[]");
                        const updatedUsers = users.map((u: any) => {
                          const matchEmail = u.email && u.email.toLowerCase().trim() === currentUser.email?.toLowerCase().trim();
                          const matchPhone = u.phone && u.phone.trim() === currentUser.phone?.trim();
                          if ((currentUser.email && matchEmail) || (currentUser.phone && matchPhone)) {
                            return updated;
                          }
                          return u;
                        });
                        localStorage.setItem("nabik_registered_users", JSON.stringify(updatedUsers));
                        triggerToast(language === 'bn' ? "প্রোফাইল ছবি সফলভাবে পরিবর্তন হয়েছে!" : "Avatar uploaded successfully!");
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden" 
              />
            </label>
          </div>
          <div>
            <h2 className="text-base font-extrabold leading-none text-black">
              {firstName} {lastName}
            </h2>
            <p className="text-[10px] uppercase font-black tracking-wider text-black/60 mt-1">
              {language === 'bn' ? 'নিবন্ধিত গ্রাহক অ্যাকাউন্ট' : 'Registered Customer Space'}
            </p>
          </div>
        </div>

        <button
          onClick={onBackToShop}
          className="bg-black hover:bg-zinc-900 text-white font-extrabold text-[11px] uppercase tracking-wider py-2 px-4 rounded-lg flex items-center space-x-1.5 transition border-0 cursor-pointer shadow"
        >
          <ArrowLeft size={12} className="stroke-[2.5px] text-[#f58220]" />
          <span>{language === 'bn' ? 'কেনাকাটায় ফিরুন' : 'Back to shop'}</span>
        </button>
      </div>

      {/* Account Control Tabs */}
      <div className="flex border-b border-zinc-200">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-4.5 text-xs font-bold uppercase tracking-wider transition border-0 border-b-2 bg-transparent cursor-pointer flex items-center space-x-2 ${
            activeTab === 'orders'
              ? 'border-[#f58220] text-[#f58220] font-black'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50/50'
          }`}
        >
          <ShoppingBag size={14} />
          <span>{language === 'bn' ? 'অর্ডার ট্র্যাকিং ও ইতিহাস' : 'Track Orders & History'}</span>
          <span className="bg-orange-50 text-orange-600 text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">
            {userOrders.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('profile');
            setIsEditing(false);
          }}
          className={`px-6 py-4.5 text-xs font-bold uppercase tracking-wider transition border-0 border-b-2 bg-transparent cursor-pointer flex items-center space-x-2 ${
            activeTab === 'profile'
              ? 'border-[#f58220] text-[#f58220] font-black'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50/50'
          }`}
        >
          <User size={14} />
          <span>{language === 'bn' ? 'প্রোফাইল পরিচালনা' : 'Edit Profile Parameters'}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('products');
            setEditingProdId(null);
            setShowAddForm(false);
          }}
          className={`px-6 py-4.5 text-xs font-bold uppercase tracking-wider transition border-0 border-b-2 bg-transparent cursor-pointer flex items-center space-x-2 ${
            activeTab === 'products'
              ? 'border-[#f58220] text-[#f58220] font-black'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50/50'
          }`}
        >
          <Image size={14} className="text-[#f58220]" />
          <span>{language === 'bn' ? 'প্রোডাক্ট ও ছবি পরিচালনা' : 'Product & Photo Control'}</span>
        </button>
      </div>

      {/* Content Panels */}
      <div className="p-6 sm:p-8">
        
        {/* TAB 1: ORDER TRACKING & HISTORY */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {userOrders.length === 0 ? (
              <div className="text-center py-14 bg-zinc-50 border border-dashed border-zinc-200 rounded-xl">
                <ShoppingBag size={36} className="mx-auto text-zinc-300 mb-3" />
                <p className="text-zinc-650 font-bold text-sm">
                  {language === 'bn' ? 'আপনার কোনো পূর্ববর্তী অর্ডার পাওয়া যায়নি।' : 'No active or past purchases found under this account.'}
                </p>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                  {language === 'bn'
                    ? 'যেকোনো পণ্য কার্টে যোগ করে অর্ডার সম্পন্ন করুন এবং লাইভ ট্র্যাকিং অনুসরণ করুন।'
                    : 'Place an order through Gadget Bazar checkout to track physical shipment routes.'}
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {userOrders.map((order) => {
                  const billVal = currency === 'BDT'
                    ? `৳${order.totalBDT.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}`
                    : `$${order.totalUSD.toFixed(2)}`;

                  const isCancelled = (order as any).cancelled;
                  const currentStep = isCancelled ? 0 : statusProgress[order.status] || 1;

                  return (
                    <div key={order.id} className="border border-zinc-200 rounded-xl overflow-hidden hover:shadow-xs transition duration-200 bg-zinc-50/50">
                      
                      {/* Order info header */}
                      <div className="bg-zinc-100/80 px-5 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-150">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-black text-orange-400 text-[10px] font-black px-2.5 py-0.5 rounded uppercase font-mono">
                            ID: {order.id}
                          </span>
                          <span className="text-zinc-300">|</span>
                          <span className="text-xs text-zinc-500 font-mono font-bold flex items-center space-x-1">
                            <Calendar size={13} />
                            <span>{order.date}</span>
                          </span>
                        </div>

                        <div className="flex items-center space-x-3.5">
                          <span className="text-sm font-black text-orange-600 font-mono">{billVal}</span>
                          <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-black tracking-wider ${
                            isCancelled ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-700 border border-green-200' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}>
                            {getStatusLabel(order.status, isCancelled)}
                          </span>
                        </div>
                      </div>

                      {/* Purchased items summary */}
                      <div className="p-5 space-y-4">
                        <div className="text-xs text-zinc-600 font-medium">
                          <strong className="text-zinc-800 block mb-1">{language === 'bn' ? 'ক্রয়কৃত সামগ্রী:' : 'Ordered Garments & IT Equipment:'}</strong>
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between py-1 border-b border-zinc-100 last:border-b-0">
                              <span>{language === 'bn' ? item.product.nameBn : item.product.name} <strong className="text-orange-500 ml-1">x{item.quantity}</strong></span>
                              <span className="font-mono text-[11px]">BDT ৳{item.product.priceBDT * item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Ship details */}
                        <div className="text-xs text-zinc-500 bg-white border border-zinc-150 p-3 rounded-lg space-y-1">
                          <p><span className="font-bold text-zinc-700">{language === 'bn' ? 'গ্রাহক:' : 'Recipient:'}</span> {order.customerInfo.name} ({order.customerInfo.phone})</p>
                          <p><span className="font-bold text-zinc-700">{language === 'bn' ? 'ঠিকানা:' : 'Delivery address:'}</span> {order.customerInfo.address}</p>
                          <p><span className="font-bold text-zinc-700">{language === 'bn' ? 'পেমেন্ট মাধ্যম:' : 'Payment Mode:'}</span> {order.customerInfo.paymentMethod}</p>
                        </div>

                        {/* Live Delivery Progress Tracker Visual Bar */}
                        {!isCancelled && (
                          <div className="pt-2">
                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-3">
                              {language === 'bn' ? 'ডেলিভারি অগ্রগতির লাইভ ট্র্যাকিং' : 'Physical Routing Flow Status Tracker:'}
                            </p>
                            
                            {/* Visual Progress Bar */}
                            <div className="grid grid-cols-4 gap-1 sm:gap-2 text-[10px] font-extrabold select-none">
                              {[
                                { step: 1, label: language === 'bn' ? 'অর্ডার গৃহীত' : 'Placed', val: 'placed', icon: CheckCircle },
                                { step: 2, label: language === 'bn' ? 'প্রক্রিয়াকরণাধীন' : 'Processing', val: 'processing', icon: Package },
                                { step: 3, label: language === 'bn' ? 'পাঠানো হয়েছে' : 'Shipped', val: 'shipped', icon: Truck },
                                { step: 4, label: language === 'bn' ? 'সরবরাহ হয়েছে' : 'Delivered', val: 'delivered', icon: CheckCircle }
                              ].map((node) => {
                                const isDone = currentStep >= node.step;
                                const isActive = currentStep === node.step;
                                return (
                                  <div key={node.step} className="flex flex-col items-center text-center">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                      isDone 
                                        ? 'bg-[#f58220] border-[#f58220] text-black shadow-sm'
                                        : 'bg-zinc-100 border-zinc-200 text-zinc-400'
                                    } ${isActive ? 'ring-4 ring-orange-500/10 animate-bounce' : ''}`}>
                                      <node.icon size={14} className={isDone ? "stroke-[2.5px]" : ""} />
                                    </div>
                                    <span className={`block mt-2 text-[10px] leading-tight ${
                                      isDone ? 'text-zinc-700 font-bold' : 'text-zinc-400'
                                    }`}>
                                      {node.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Actions row */}
                        <div className="pt-3 border-t border-zinc-150 flex items-center justify-between text-xs">
                          <p className="text-zinc-500 font-bold">
                            {language === 'bn' ? 'আনুমানিক ডেলিভারি সময়:' : 'Est. Arrival Date:'} <strong className="text-zinc-800 font-mono">{order.estimatedDelivery}</strong>
                          </p>

                          {order.status === 'placed' && !isCancelled && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="px-3.5 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-[10.5px] font-bold uppercase tracking-wider flex items-center space-x-1 bg-transparent cursor-pointer transition"
                              id={`cancel-order-${order.id}`}
                            >
                              <X size={12} className="stroke-[2.5px]" />
                              <span>{language === 'bn' ? 'বাতিল করুন' : 'Cancel Order'}</span>
                            </button>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROFILE MANAGEMENT */}
        {activeTab === 'profile' && (
          <div className="max-w-xl mx-auto bg-zinc-50 p-5 border border-zinc-150 rounded-xl">
            {!isEditing ? (
              // View Mode Profile Detail Card
              <div className="space-y-4 text-xs font-semibold">
                <div className="flex justify-between items-center border-b border-zinc-200 pb-3 mb-2">
                  <h3 className="text-sm font-black text-zinc-900 uppercase">
                    {language === 'bn' ? 'ব্যক্তিগত তথ্য বিবরণী' : 'Your Personal Records'}
                  </h3>
                  <button
                    onClick={() => {
                      setFirstName(currentUser?.firstName || "");
                      setLastName(currentUser?.lastName || "");
                      setEmail(currentUser?.email || "");
                      setPhone(currentUser?.phone || "");
                      setAddress(currentUser?.address || "");
                      setIsEditing(true);
                    }}
                    className="px-3 py-1.5 bg-[#f58220] hover:bg-orange-600 text-white font-extrabold text-[10px] rounded-lg tracking-wider uppercase flex items-center space-x-1 cursor-pointer transition border-0 shadow-xs"
                  >
                    <Edit size={11} />
                    <span>{language === 'bn' ? 'সম্পাদনা করুন' : 'Edit profile'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white border p-3.5 rounded-lg space-y-1">
                    <span className="text-[10px] text-zinc-400 font-bold block uppercase">{language === 'bn' ? 'প্রথম নাম' : 'First Name'}</span>
                    <strong className="text-zinc-800 text-sm block">{currentUser?.firstName || "N/A"}</strong>
                  </div>

                  <div className="bg-white border p-3.5 rounded-lg space-y-1">
                    <span className="text-[10px] text-zinc-400 font-bold block uppercase">{language === 'bn' ? 'শেষ নাম' : 'Last Name'}</span>
                    <strong className="text-zinc-800 text-sm block">{currentUser?.lastName || "N/A"}</strong>
                  </div>

                  <div className="bg-white border p-3.5 rounded-lg space-y-1 sm:col-span-2">
                    <span className="text-[10px] text-zinc-400 font-bold block uppercase flex items-center space-x-1">
                      <Mail size={11} className="text-zinc-400" />
                      <span>{language === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'E-Mail Address'}</span>
                    </span>
                    <strong className="text-zinc-800 text-sm block font-mono">{currentUser?.email || "N/A"}</strong>
                  </div>

                  <div className="bg-white border p-3.5 rounded-lg space-y-1 sm:col-span-2">
                    <span className="text-[10px] text-zinc-400 font-bold block uppercase flex items-center space-x-1">
                      <Phone size={11} className="text-zinc-400" />
                      <span>{language === 'bn' ? 'ফোন নম্বর' : 'Primary Phone Sequence'}</span>
                    </span>
                    <strong className="text-zinc-800 text-sm block font-mono">{currentUser?.phone || "N/A"}</strong>
                  </div>

                  <div className="bg-white border p-3.5 rounded-lg space-y-1 sm:col-span-2">
                    <span className="text-[10px] text-zinc-400 font-bold block uppercase flex items-center space-x-1">
                      <MapPin size={11} className="text-zinc-400" />
                      <span>{language === 'bn' ? 'শিপিং এড্রেস / ঠিকানা' : 'Preserved Shipping Address'}</span>
                    </span>
                    <p className="text-zinc-700 text-sm font-semibold max-w-sm mt-0.5">
                      {currentUser?.address || (language === 'bn' ? 'কোনো ঠিকানা সংরক্ষণ করা নেই!' : 'None entered yet! Populate this address so checkout is instant.')}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode Profile HTML Form
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="border-b pb-2 mb-2">
                  <h3 className="text-xs font-black text-zinc-900 uppercase">
                    {language === 'bn' ? 'তথ্য পরিবর্তন ফর্ম' : 'Modify Stored Variables'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] text-zinc-500 font-bold block uppercase">{language === 'bn' ? 'প্রথম নাম' : 'First Name'}</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="rounded-lg border border-zinc-300 px-4 py-2 w-full text-zinc-805 bg-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#f58220]"
                      id="edit-firstname"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] text-zinc-500 font-bold block uppercase">{language === 'bn' ? 'শেষ নাম' : 'Last Name'}</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="rounded-lg border border-zinc-300 px-4 py-2 w-full text-zinc-805 bg-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#f58220]"
                      id="edit-lastname"
                    />
                  </div>

                  <div className="space-y-1 text-left sm:col-span-2">
                    <label className="text-[10px] text-zinc-500 font-bold block uppercase">{language === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'E-Mail Address'}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-lg border border-zinc-300 px-4 py-2 w-full text-zinc-850 bg-white text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#f58220]"
                      id="edit-email"
                    />
                  </div>

                  <div className="space-y-1 text-left sm:col-span-2">
                    <label className="text-[10px] text-zinc-500 font-bold block uppercase">{language === 'bn' ? 'ফোন নম্বর' : 'Phone Sequence'}</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="rounded-lg border border-zinc-300 px-4 py-2 w-full text-zinc-850 bg-white text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#f58220]"
                      id="edit-phone"
                    />
                  </div>

                  <div className="space-y-1 text-left sm:col-span-2">
                    <label className="text-[10px] text-zinc-500 font-bold block uppercase">{language === 'bn' ? 'শিপিং এড্রেস / ঠিকানা' : 'Preserved Shipping Address'}</label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={language === 'bn' ? 'যেমন: বাড়ি নং, রোড নং, এলাকা, শহর, ঢাকা।' : 'e.g. 12, Main Street, Mirpur-10, Dhaka'}
                      className="rounded-lg border border-zinc-300 px-4 py-2 w-full text-zinc-805 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#f58220]"
                      id="edit-address"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-3 text-xs sm:text-sm">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-bold rounded-lg border-0 cursor-pointer"
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#f58220] hover:bg-orange-600 text-white font-extrabold rounded-lg inline-flex items-center space-x-1 border-0 cursor-pointer shadow"
                    id="save-profile-btn"
                  >
                    <Save size={13} />
                    <span>{language === 'bn' ? 'সংরক্ষণ করুন' : 'SaveChanges'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: PRODUCT & PHOTO DATABASE MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-50 p-4.5 rounded-xl border border-zinc-200">
              <div>
                <h3 className="text-zinc-900 text-sm font-black uppercase font-sans tracking-wide">
                  {language === 'bn' ? 'প্রোডাক্ট এবং ছবি ক্যাটালগ' : 'Product & Photo Control Center'}
                </h3>
                <p className="text-[11px] text-zinc-400 font-semibold mt-0.5">
                  {language === 'bn' ? 'ক্যাটালগ থেকে নতুন প্রোডাক্ট যোগ করুন, ছবি পরিবর্তন করুন অথবা স্থায়ীভাবে ডিলিট করুন।' : 'Upload custom item photos, adjust price tags, or discard items from the shop.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingProdId(null);
                  setProdForm({
                    name: "",
                    nameBn: "",
                    category: "tshirt",
                    priceBDT: 1200,
                    priceUSD: 10.45,
                    stock: 20,
                    image: `https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80`
                  });
                  setShowAddForm(!showAddForm);
                }}
                className="bg-[#f58220] hover:bg-orange-600 text-white font-extrabold text-[10.5px] uppercase tracking-wider py-2 px-3.5 rounded-lg transition border-0 cursor-pointer shadow-sm flex items-center space-x-1.5 shrink-0"
              >
                {showAddForm ? <X size={12} className="stroke-[3px]" /> : <Plus size={12} className="stroke-[3px]" />}
                <span>{showAddForm ? (language === 'bn' ? 'ফর্ম লুকান' : 'Hide Form') : (language === 'bn' ? 'নতুন পণ্য যোগ করুন +' : 'Add Custom Item +')}</span>
              </button>
            </div>

            {/* Form structure: Add or Edit */}
            {(showAddForm || editingProdId) && (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!prodForm.name.trim() || !prodForm.image.trim()) {
                    triggerToast(language === 'bn' ? "পণ্য নাম এবং ছবি অবশ্যই দিতে হবে!" : "Item name and valid image URL/file are required!");
                    return;
                  }
                  
                  if (editingProdId) {
                    // Update
                    const updated = products.map(p => p.id === editingProdId ? {
                      ...p,
                      name: prodForm.name,
                      nameBn: prodForm.nameBn || prodForm.name,
                      category: prodForm.category,
                      priceBDT: Number(prodForm.priceBDT),
                      priceUSD: Number((Number(prodForm.priceBDT) / 115).toFixed(2)),
                      stock: Number(prodForm.stock),
                      image: prodForm.image
                    } : p);
                    setProducts(updated);
                    triggerToast(language === 'bn' ? "প্রোডাক্ট এবং ছবি সফলভাবে আপডেট করা হয়েছে!" : "Product specifications and photo updated successfully!");
                    setEditingProdId(null);
                  } else {
                    // Create
                    const newProd = {
                      id: `custom-prod-${Date.now()}`,
                      name: prodForm.name,
                      nameBn: prodForm.nameBn || prodForm.name,
                      category: prodForm.category,
                      priceBDT: Number(prodForm.priceBDT),
                      priceUSD: Number((Number(prodForm.priceBDT) / 115).toFixed(2)),
                      stock: Number(prodForm.stock),
                      rating: 4.8,
                      image: prodForm.image,
                      reviews: []
                    };
                    setProducts([newProd, ...products]);
                    triggerToast(language === 'bn' ? "নতুন পণ্য সফলভাবে ক্যাটালগে তালিকাভুক্ত হয়েছে!" : "New product registered live in the catalog!");
                    setShowAddForm(false);
                  }
                }}
                className="bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-200 p-5 rounded-xl space-y-4 text-xs font-sans text-left"
              >
                <h4 className="font-extrabold text-zinc-900 border-b pb-1.5 uppercase tracking-wider text-[11px] text-[#f58220]">
                  {editingProdId ? (language === 'bn' ? `পণ্য পরিবর্তন ফর্ম: ID ${editingProdId}` : `Edit Product parameters: ID ${editingProdId}`) : (language === 'bn' ? 'নতুন পণ্য রেজিস্টার করুন' : 'Register New Custom Commerce Product')}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-zinc-500">{language === 'bn' ? 'পণ্যের নাম (ইংরেজি)' : 'Product Name (English)'}</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Redmi 10000mAh Powerbank"
                      value={prodForm.name}
                      onChange={(e) => setProdForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-zinc-300 px-3 py-2 rounded-lg bg-white focus:outline-none focus:border-[#f58220]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-zinc-500">{language === 'bn' ? 'পণ্যের নাম (বাংলা)' : 'Product Name (Bengali)'}</label>
                    <input 
                      type="text"
                      placeholder="যেমন: রেডমি ১০০০০এমএএইচ পাওয়ার ব্যাংক"
                      value={prodForm.nameBn}
                      onChange={(e) => setProdForm(prev => ({ ...prev, nameBn: e.target.value }))}
                      className="w-full border border-zinc-300 px-3 py-2 rounded-lg bg-white focus:outline-none focus:border-[#f58220]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-zinc-500">{language === 'bn' ? 'ক্যাটাগরি' : 'Category Segment'}</label>
                    <select
                      value={prodForm.category}
                      onChange={(e) => setProdForm(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full border border-zinc-300 bg-white px-3 py-2 rounded-lg focus:outline-none focus:border-[#f58220]"
                    >
                      <option value="tshirt">T-Shirt (পোশাক)</option>
                      <option value="laptop">Laptop (ল্যাপটপ)</option>
                      <option value="appliances">Appliances (গৃহস্থালী সরঞ্জাম)</option>
                      <option value="gadgets">Gadgets / Powerbanks (অন্যান্য গ্যাজেটস)</option>
                      <option value="watches">Smart Watch (স্মার্ট ওয়াচ)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-zinc-500">{language === 'bn' ? 'মূল্য (টাকা)' : 'Price BDT (৳)'}</label>
                      <input 
                        type="number"
                        required
                        min="1"
                        value={prodForm.priceBDT}
                        onChange={(e) => setProdForm(prev => ({ ...prev, priceBDT: Number(e.target.value) }))}
                        className="w-full border border-zinc-300 px-3 py-2 rounded-lg bg-white focus:outline-none focus:border-[#f58220] font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-zinc-500">{language === 'bn' ? 'স্টক Units' : 'Available Stock'}</label>
                      <input 
                        type="number"
                        required
                        min="0"
                        value={prodForm.stock}
                        onChange={(e) => setProdForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                        className="w-full border border-zinc-300 px-3 py-2 rounded-lg bg-white focus:outline-none focus:border-[#f58220] font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Picture loader setup block */}
                <div className="space-y-2 border-t pt-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <label className="text-[10px] uppercase font-black text-zinc-500">{language === 'bn' ? 'প্রোডাক্টের ছবি সোর্স' : 'Product Photo Source'}</label>
                    {/* Presets picker list */}
                    <div className="flex flex-wrap items-center gap-1.5 select-none">
                      <span className="text-[9px] text-zinc-400 font-bold uppercase mr-1">{language === 'bn' ? 'কুইক প্রিসেট ছবি:' : 'Stock Presets:'}</span>
                      {[
                        { label: language === 'bn' ? '👕 পোশাক' : '👕 Tee', tag: 'tshirt', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80' },
                        { label: language === 'bn' ? '💻 ল্যাপটপ' : '💻 Laptop', tag: 'laptop', url: 'https://images.unsplash.com/photo-1496181130204-755241524eab?auto=format&fit=crop&w=600&q=80' },
                        { label: language === 'bn' ? '🔌 ওভেন' : '🔌 Oven', tag: 'appliances', url: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=600&q=80' },
                        { label: language === 'bn' ? '🔋 পাওয়ারব্যাংক' : '🔋 Power', tag: 'gadgets', url: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=600&q=80' },
                        { label: language === 'bn' ? '⌚ ঘড়ি' : '⌚ Watch', tag: 'watches', url: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=600&q=80' }
                      ].map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => setProdForm(prev => ({ ...prev, image: preset.url, category: preset.tag as any }))}
                          className="bg-white hover:bg-zinc-100 text-zinc-700 text-[9px] font-bold py-1 px-2 rounded-md border border-zinc-200 transition cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-3">
                      <input 
                        type="text"
                        placeholder="Paste image address (https://...)"
                        value={prodForm.image}
                        onChange={(e) => setProdForm(prev => ({ ...prev, image: e.target.value }))}
                        className="w-full border border-zinc-300 px-3 py-2.5 rounded-lg bg-white focus:outline-none focus:border-[#f58220] font-mono text-xs"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="flex items-center justify-center space-x-1.5 bg-black hover:bg-zinc-800 text-white font-extrabold text-[11px] py-2.5 px-3 rounded-lg cursor-pointer transition select-none shadow text-center w-full h-full border border-zinc-800">
                        <Upload size={13} className="text-[#f58220]" />
                        <span>{language === 'bn' ? 'ছবি আপলোড' : 'Upload File'}</span>
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const r = new FileReader();
                              r.onload = (ev) => {
                                if (ev.target?.result) {
                                  setProdForm(prev => ({ ...prev, image: ev.target.result as string }));
                                }
                              };
                              r.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Drag and Drop visually interactive container */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault(); e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith("image/")) {
                        const r = new FileReader();
                        r.onload = (ev) => {
                          if (ev.target?.result) {
                            setProdForm(prev => ({ ...prev, image: ev.target.result as string }));
                          }
                        };
                        r.readAsDataURL(file);
                      }
                    }}
                    className="border border-dashed border-zinc-300 hover:border-orange-400 bg-white rounded-xl p-4.5 text-center transition cursor-pointer"
                  >
                    {prodForm.image ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-left">
                          <img src={prodForm.image} alt="Form preview" className="w-11 h-11 object-cover rounded-lg border border-zinc-200" referrerPolicy="no-referrer" />
                          <div>
                            <span className="block text-[11px] font-black text-emerald-600">✓ Image Attached Successfully</span>
                            <span className="text-[9px] text-zinc-400 font-semibold">{prodForm.image.startsWith("data:") ? "Custom uploaded image" : "Unsplash/Web image sounce link"}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setProdForm(prev => ({ ...prev, image: "" }))}
                          className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-transparent border-0 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="text-zinc-400 flex flex-col items-center justify-center space-y-1">
                        <p className="text-[10px] font-black text-zinc-650 leading-none">
                          {language === 'bn' ? 'কম্পিউটার/ফোনের যেকোনো ছবি এখানে ড্র্যাগ অ্যান্ড ড্রপ করে ছেড়ে দিন' : 'Drag & Drop any customer photo file directly here'}
                        </p>
                        <p className="text-[9px] text-zinc-400">Supports JPEG, PNG, WEBP, or Base64 formats</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Command actions */}
                <div className="flex justify-end space-x-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProdId(null);
                      setShowAddForm(false);
                    }}
                    className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-bold rounded-lg border-0 cursor-pointer transition"
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#f58220] hover:bg-orange-600 text-white font-extrabold rounded-lg inline-flex items-center space-x-1.5 border-0 cursor-pointer shadow-sm"
                  >
                    <Save size={13} />
                    <span>{editingProdId ? (language === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes') : (language === 'bn' ? 'ক্যাটালগে যুক্ত করুন' : 'Live Deploy Item')}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Product items catalog lists in real-time */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p.id} className="bg-white border text-left border-zinc-200 rounded-xl overflow-hidden flex flex-col justify-between hover:shadow-xs transition p-4 relative space-y-3">
                  <div className="flex items-start space-x-3.5">
                    <img 
                      src={p.image} 
                      alt="" 
                      className="w-14 h-14 object-cover border rounded-lg shadow-2xs shrink-0 bg-zinc-50"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        // Safe fallback is Unsplash placeholder to make sure NO blank images survive
                        (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=200&q=80`;
                      }}
                    />
                    <div className="space-y-1 select-none leading-normal">
                      <span className="text-[9px] font-black uppercase bg-[#fdf3eb] text-[#f58220] py-0.5 px-2.5 rounded-full inline-block">
                        {p.category}
                      </span>
                      <h4 className="text-zinc-900 text-sm font-extrabold leading-tight block">
                        {language === 'bn' ? p.nameBn : p.name}
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-mono font-medium leading-none">
                        ID: {p.id} • {language === 'bn' ? 'স্টক:' : 'Stock:'} <strong>{p.stock} Units</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-zinc-100 select-none">
                    <div>
                      <strong className="text-[#f58220] text-sm font-mono block">৳{p.priceBDT.toLocaleString()}</strong>
                      <span className="text-[9px] text-zinc-400 block -mt-0.5 font-sans">USD ${p.priceUSD}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-xs">
                      <button
                        onClick={() => {
                          setEditingProdId(p.id);
                          setProdForm({
                            name: p.name,
                            nameBn: p.nameBn || p.name,
                            category: p.category,
                            priceBDT: p.priceBDT,
                            priceUSD: p.priceUSD,
                            stock: p.stock,
                            image: p.image
                          });
                          setShowAddForm(false);
                        }}
                        className="p-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-750 rounded-lg border-0 cursor-pointer flex items-center justify-center transition"
                        title={language === 'bn' ? 'ছবি ও পণ্য এডিট করুন' : 'Edit Specifications'}
                      >
                        📝
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(language === 'bn' ? `আপনি কি নিশ্চিতভাবে '${p.nameBn || p.name}' পণ্যটি ডিলিট করতে চান?` : `Are you sure you want to permanently delete '${p.name}'?`)) {
                            setProducts(prev => prev.filter(it => it.id !== p.id));
                            triggerToast(language === 'bn' ? 'পণ্য এবং তার ছবি সফলভাবে মুছে ফেলা হয়েছে!' : 'Product and its picture deleted successfully!');
                          }
                        }}
                        className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border-0 cursor-pointer flex items-center justify-center transition"
                        title={language === 'bn' ? 'মুছে ফেলুন' : 'Discard Product'}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
