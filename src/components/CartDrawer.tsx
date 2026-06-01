import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { CartItem } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currency: 'BDT' | 'USD';
  language: 'en' | 'bn';
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  langText: any;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  currency,
  language,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  langText
}: CartDrawerProps) {
  if (!isOpen) return null;

  const totalBDT = cartItems.reduce((acc, item) => acc + (item.product.priceBDT * item.quantity), 0);
  const totalUSD = cartItems.reduce((acc, item) => acc + (item.product.priceUSD * item.quantity), 0);

  const displayTotal = currency === 'BDT'
    ? `৳${totalBDT.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}`
    : `$${totalUSD.toFixed(2)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="cart-drawer-overlay">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-zinc-900 border-l border-zinc-800 text-zinc-100 flex flex-col h-full shadow-2xl relative">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <ShoppingBag className="text-amber-400" size={20} />
              <h2 className="text-lg font-bold tracking-tight">
                {language === 'en' ? 'Your Shopping Cart' : 'আপনার শপিং কার্ট'}
              </h2>
              <span className="bg-zinc-800 text-zinc-300 text-xs font-mono px-2 py-0.5 rounded-full">
                {cartItems.length}
              </span>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-zinc-800/60">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="h-16 w-16 rounded-full bg-zinc-800/30 border border-zinc-800 flex items-center justify-center mb-4">
                  <ShoppingBag size={28} className="text-zinc-600" />
                </div>
                <p className="text-zinc-400 font-medium">
                  {language === 'en' ? 'Your cart is completely empty!' : 'আপনার কার্ট সম্পূর্ণ খালি!'}
                </p>
                <p className="text-xs text-zinc-600 max-w-xs mt-1">
                  {language === 'en' 
                    ? 'Explore our unique handpicked premium collection and add items to begin.' 
                    : 'আমাদের প্রিমিয়াম কালেকশন থেকে পছন্দের সামগ্রী যোগ করে শুরু করুন।'}
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold tracking-wider rounded-xl transition cursor-pointer"
                >
                  {language === 'en' ? 'Start Shopping' : 'কেনাকাটা শুরু করুন'}
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const title = language === 'bn' ? item.product.nameBn : item.product.name;
                const price = currency === 'BDT'
                  ? `৳${item.product.priceBDT.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}`
                  : `$${item.product.priceUSD}`;

                return (
                  <div key={item.product.id} className="py-4 flex space-x-4 items-start" id={`cart-item-${item.product.id}`}>
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className={`w-16 h-16 rounded-xl bg-zinc-950 border border-zinc-800 flex-shrink-0 ${
                        item.product.image.startsWith('data:image') ? 'object-contain p-2' : 'object-cover'
                      }`}
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-zinc-100 truncate">
                        {title}
                      </h4>
                      <p className="text-xs text-amber-400 font-mono font-bold mt-0.5">
                        {price}
                      </p>
                      
                      {/* Quantity Selector */}
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="h-6 w-6 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition text-zinc-400 hover:text-zinc-100 cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-mono font-bold w-6 text-center text-zinc-300">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          disabled={item.quantity >= item.product.stock}
                          className={`h-6 w-6 rounded flex items-center justify-center transition cursor-pointer ${
                            item.quantity >= item.product.stock 
                              ? 'bg-zinc-800/40 text-zinc-600 cursor-not-allowed'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100'
                          }`}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition flex-shrink-0 cursor-pointer"
                      title={language === 'en' ? 'Remove' : 'বাদ দিন'}
                      id={`remove-item-${item.product.id}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Controls */}
          {cartItems.length > 0 && (
            <div className="px-6 py-5 border-t border-zinc-800 bg-zinc-950/40">
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-sm text-zinc-400 font-medium">
                  {language === 'en' ? 'Subtotal Amount' : 'সর্বোমোট মূল্য'}
                </span>
                <span className="text-2xl font-black text-amber-400 tracking-tight font-sans">
                  {displayTotal}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed mb-4">
                {language === 'en'
                  ? 'Shipping and taxes are calculated at next screen. Premium packaging included by default.'
                  : 'পরবর্তী স্ক্রিনে অর্ডার ও ডেলিভারি তথ্য যোগ করা হবে। স্টাইলিশ গিফট প্যাকিং প্রি-সিলেক্ট করা আছে।'}
              </p>
              
              <button
                onClick={onCheckout}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 text-sm font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-sans tracking-wide uppercase cursor-pointer"
                id="cart-proceed-checkout"
              >
                {language === 'en' ? 'Proceed to Checkout' : 'অর্ডার সম্পন্ন করুন'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
