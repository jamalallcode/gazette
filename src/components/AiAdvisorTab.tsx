import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, HelpCircle, ArrowRight, CornerDownLeft, Loader2, RefreshCw, Paperclip, X } from "lucide-react";
import { ChatMessage, Product, Category } from "../types";

interface AiAdvisorTabProps {
  products: Product[];
  language: 'en' | 'bn';
  currency: 'BDT' | 'USD';
  onSelectProduct: (product: Product) => void;
}

const BOOTSTRAP_PROMPTS_EN = [
  { text: "Recommend a high-capacity powerbank or gadget helper", category: "gadgets" },
  { text: "Suggest a fast Intel business laptop with solid state disk", category: "laptop" },
  { text: "I need to purchase an elegant heart-rate smartwatch", category: "watches" },
  { text: "What is an excellent printing machine with sharp outcomes?", category: "appliances" }
];

const BOOTSTRAP_PROMPTS_BN = [
  { text: "একটি শক্তিশালী পাওয়ার ব্যাংক বা গ্যাজেট সাজেস্ট করুন", category: "gadgets" },
  { text: "এসএসডি সহ ভালো একটি ডেল ইন্টেল ল্যাপটপ দেখান", category: "laptop" },
  { text: "হার্টরেট ট্র্যাকার সহ একটি প্রিমিয়াম ওয়াচ দরকার", category: "watches" },
  { text: "ভালো কার্যক্ষমতার লেজার প্রিন্টিং ডিভাইস রিকমেন্ড করুন", category: "appliances" }
];

export default function AiAdvisorTab({
  products,
  language,
  currency,
  onSelectProduct
}: AiAdvisorTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      sender: "assistant",
      text: language === 'en'
        ? "Hello there! I am **Aura AI**, your premium bespoke personal shopper. 🌸\n\nI can recommend matching items from our live database, describe specialized product attributes, or help you coordinate a custom style. What premium essentials are you looking for today?"
        : "স্বাগতম! আমি **অরা এআই (Aura AI)**, আপনার ভার্চুয়াল শপিং কনসালট্যান্ট। 🌸\n\nআমি আপনাকে আমাদের লাইভ প্রোডাক্ট ডেবটাবেস থেকে সঠিক পণ্যটি সিলেক্ট করতে, পছন্দসই কাপড়ের সাইজ সাজেস্ট করতে বা যেকোনো টেকনিক্যাল পণ্য সম্পর্কে বিস্তারিত তথ্য দিতে সাহায্য করতে পারব। আপনি আজকে আমাদের স্টোরে কী খুঁজছেন?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert(language === 'en' ? "Please select an image file only!" : "শুধুমাত্র ছবি ফাইল নির্বাচন করুন!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  // Synchronize initial welcome message on language swap
  useEffect(() => {
    setMessages(prev => {
      return prev.map(msg => {
        if (msg.id === "welcome-msg") {
          return {
            ...msg,
            text: language === 'en'
              ? "Hello there! I am **Aura AI**, your premium bespoke personal shopper. 🌸\n\nI can recommend matching items from our live database, describe specialized product attributes, or help you coordinate a custom style. What premium essentials are you looking for today?"
              : "স্বাগতম! আমি **অরা এআই (Aura AI)**, আপনার ভার্চুয়াল শপিং কনসালট্যান্ট। 🌸\n\nআমি আপনাকে আমাদের লাইভ প্রোডাক্ট ডেবটাবেস থেকে সঠিক পণ্যটি সিলেক্ট করতে, পছন্দসই কাপড়ের সাইজ সাজেস্ট করতে বা যেকোনো টেকনিক্যাল পণ্য সম্পর্কে বিস্তারিত তথ্য দিতে সাহায্য করতে পারব। আপনি আজকে আমাদের স্টোরে কী খুঁজছেন?"
          };
        }
        return msg;
      });
    });
  }, [language]);

  const handleSend = async (textToSend: string, imageToSend: string | null = null) => {
    if (!textToSend.trim() && !imageToSend) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: textToSend,
      image: imageToSend || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setAttachedImage(null);
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages,
          products: products,
          image: imageToSend
        })
      });

      if (!response.ok) {
        throw new Error("Failed response from server API");
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "assistant",
        text: data.text || "I am processing your shopping requests.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedProducts: data.suggestedProductIds || []
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: `msg-error-${Date.now()}`,
        sender: "assistant",
        text: language === 'en'
          ? "I apologize, there was a temporary network timeout connecting with Aura servers. Please retry sending your query!"
          : "আমি সত্যি দুঃখিত! অরা স্টোর সার্ভারের সাথে সাময়িকভাবে সংযোগ ব্যাহত হয়েছে। দয়া করে আপনার প্রশ্নটি আরও একবার পাঠিয়ে ট্রাই করুন।",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearHistory = () => {
    setMessages([
      {
        id: "welcome-msg",
        sender: "assistant",
        text: language === 'en'
          ? "Hello there! I am **Aura AI**, your premium bespoke personal shopper. 🌸\n\nI can recommend matching items from our live database, describe specialized product attributes, or help you coordinate a custom style. What premium essentials are you looking for today?"
          : "স্বাগতম! আমি **অরা এআই (Aura AI)**, আপনার ভার্চুয়াল শপিং কনসালট্যান্ট। 🌸\n\nআমি আপনাকে আমাদের লাইভ প্রোডাক্ট ডেবটাবেস থেকে সঠিক পণ্যটি সিলেক্ট করতে, পছন্দসই কাপড়ের সাইজ সাজেস্ট করতে বা যেকোনো টেকনিক্যাল পণ্য সম্পর্কে বিস্তারিত তথ্য দিতে সাহায্য করতে পারব। আপনি আজকে আমাদের স্টোরে কী খুঁজছেন?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  const promptBoxes = language === 'en' ? BOOTSTRAP_PROMPTS_EN : BOOTSTRAP_PROMPTS_BN;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="ai-advisor-container">
      
      {/* Informative Guidance Left Drawer */}
      <div className="lg:col-span-4 space-y-5 order-2 lg:order-1">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-2.5 text-amber-400 mb-4">
            <Sparkles size={20} className="animate-pulse" />
            <h3 className="font-bold text-base tracking-tight text-zinc-100">
              {language === 'en' ? 'Aura AI Assistant' : 'অরা এআই অ্যাসিস্ট্যান্ট'}
            </h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed mb-4">
            {language === 'en'
              ? 'Our embedded LLM consultant has structural understanding of real-time inventory levels, prices in both BDT/USD, and product specifications.'
              : 'আমাদের এআই কনসালট্যান্টের কাছে স্টোরের লাইভ ইনভেন্টরি, টাকা বা ডলার অনুযায়ী সঠিক মূল্য এবং পণ্যের গুণবাচক মান সম্পর্কে সম্যক ধারণা রয়েছে।'}
          </p>
          <div className="space-y-3 pt-3 border-t border-zinc-805 border-zinc-800">
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1aa] block mb-1">
              {language === 'en' ? 'Capabilities' : 'অ্যাসিস্ট্যান্ট স্পেশালিটি'}
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span>{language === 'en' ? 'Interactive stock status' : 'লাইভ স্টক যাচাইকরণ'}</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span>{language === 'en' ? 'Dynamic bilingual advice' : 'বাংলা ও ইংরেজিতে সহযোগিতা'}</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span>{language === 'en' ? 'Smart product recommendations' : 'কাস্টম কালেকশন রেকমেন্ডেশন'}</span>
            </div>
          </div>
        </div>

        {/* Dynamic prompt builder helper boxes */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center space-x-2 text-zinc-350 mb-3.5">
            <HelpCircle size={16} className="text-zinc-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              {language === 'en' ? 'Suggested Queries' : 'জিজ্ঞাসা করুন'}
            </h4>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {promptBoxes.map((p, index) => (
              <button
                key={index}
                onClick={() => handleSend(p.text)}
                disabled={isTyping}
                className="text-left py-3 px-3.5 bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-850 hover:border-amber-500/25 rounded-xl text-xs text-zinc-300 hover:text-amber-300 transition duration-200 cursor-pointer flex items-center justify-between group"
              >
                <span className="pr-4 line-clamp-1">{p.text}</span>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 text-amber-400 transition" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main chat window Area */}
      <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-[650px] shadow-sm relative order-1 lg:order-2">
        
        {/* Chat window header */}
        <div className="bg-zinc-950/40 p-4 border-b border-zinc-805 border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="relative">
              <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center font-mono font-bold text-zinc-950 text-base">
                Α
              </div>
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-zinc-900 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-100 leading-none">Aura AI Shopping Consultant</h4>
              <span className="text-[10px] text-zinc-500 flex items-center space-x-1 mt-1">
                <span>{language === 'en' ? 'Ready to assist' : 'সাহায্যের জন্য প্রস্তুত'}</span>
              </span>
            </div>
          </div>

          <button
            onClick={clearHistory}
            className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition cursor-pointer flex items-center space-x-1.5 text-xs font-mono"
            title={language === 'en' ? 'Reset Thread' : 'চ্যাট মুছে দিন'}
          >
            <RefreshCw size={12} />
            <span>{language === 'en' ? 'Clear' : 'মুছুন'}</span>
          </button>
        </div>

        {/* Chat Scroll Thread Panel */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex space-x-3.5 ${isUser ? "flex-row-reverse space-x-reverse" : "items-start"}`}
              >
                {/* Avatar */}
                {!isUser ? (
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 font-mono text-xs font-black shrink-0">
                    AI
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold text-xs shrink-0">
                    U
                  </div>
                )}

                {/* Bubble */}
                <div className="space-y-3 max-w-[85%]">
                  {msg.image && (
                    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-1`}>
                      <div className="max-w-[200px] rounded-xl overflow-hidden border border-zinc-800 shadow bg-zinc-950 p-1">
                        <img 
                          src={msg.image} 
                          alt="Uploaded attachment" 
                          className="max-h-40 w-auto object-contain rounded-lg" 
                        />
                      </div>
                    </div>
                  )}
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isUser 
                      ? "bg-amber-500 text-zinc-950 rounded-tr-none font-medium selection:bg-zinc-900 selection:text-white" 
                      : "bg-zinc-950/60 text-zinc-300 border border-zinc-800 rounded-tl-none"
                  }`}>
                    {/* Rich text markdown simple parser (supporting basic lists and bolding) */}
                    <div className="space-y-2 whitespace-pre-wrap">
                      {msg.text.split("\n\n").map((para, i) => {
                        // Check if it's a bullet list
                        if (para.startsWith("* ") || para.startsWith("- ")) {
                          return (
                            <ul key={i} className="list-disc pl-5 space-y-1 my-2">
                              {para.split("\n").map((line, li) => {
                                const cleanLine = line.replace(/^[*-\s]+/, "");
                                return (
                                  <li key={li} dangerouslySetInnerHTML={{ __html: parseBoldText(cleanLine) }} />
                                );
                              })}
                            </ul>
                          );
                        }
                        return (
                          <p key={i} dangerouslySetInnerHTML={{ __html: parseBoldText(para) }} />
                        );
                      })}
                    </div>
                  </div>

                  {/* Inline Suggested Products Cards if attached to assistant turn */}
                  {!isUser && msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {msg.suggestedProducts
                        .map(pid => products.find(p => p.id === pid))
                        .filter((p): p is Product => !!p)
                        .map((prod) => {
                          const name = language === 'bn' ? prod.nameBn : prod.name;
                          const formattedPrice = currency === 'BDT'
                            ? `৳${prod.priceBDT.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}`
                            : `$${prod.priceUSD}`;
                          return (
                            <div
                              key={prod.id}
                              onClick={() => onSelectProduct(prod)}
                              className="p-3 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-500/35 rounded-xl flex items-center space-x-3.5 cursor-pointer transition group shadow"
                              id={`suggested-mini-${prod.id}`}
                            >
                              <img
                                src={prod.image}
                                alt={name}
                                className="h-10 w-10 rounded-lg object-cover bg-zinc-900 border border-zinc-800 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="min-w-0">
                                <span className="block text-[11px] font-semibold text-zinc-200 truncate group-hover:text-amber-400 transition">
                                  {name}
                                </span>
                                <span className="text-[10px] font-bold text-amber-500 font-mono">
                                  {formattedPrice}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}

                  <span className="block text-[10px] text-zinc-600 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex space-x-3.5 items-start">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 font-mono text-xs font-black shrink-0">
                AI
              </div>
              <div className="bg-zinc-950/40 p-4 rounded-2xl rounded-tl-none border border-zinc-800 flex items-center space-x-2 text-zinc-400 text-xs">
                <Loader2 size={14} className="animate-spin text-amber-400" />
                <span>{language === 'en' ? 'Aura is looking up catalogs...' : 'অরা ক্যাটালগ সার্চ করছে...'}</span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Message Input Footer box */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/20">
          {/* Attached image preview panel */}
          {attachedImage && (
            <div className="relative inline-flex mb-3.5 bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl animate-fade-in group items-center space-x-3.5">
              <div className="relative shrink-0">
                <img
                  src={attachedImage}
                  alt="Attached preview"
                  className="h-16 w-16 rounded-lg object-cover bg-zinc-900 border border-zinc-800"
                />
                <button
                  type="button"
                  onClick={() => setAttachedImage(null)}
                  className="absolute -top-2 -right-2 bg-rose-600 hover:bg-rose-500 text-white rounded-full p-1 border border-zinc-900 cursor-pointer shadow hover:scale-105 transition"
                >
                  <X size={10} />
                </button>
              </div>
              <div className="text-left text-xs">
                <span className="block font-bold text-zinc-200">
                  {language === 'en' ? 'Scanning Image Attached' : 'ছবি স্ক্যান করার জন্য প্রস্তুত'}
                </span>
                <span className="block text-[10px] text-zinc-500 font-mono leading-none mt-0.5">
                  {language === 'en' ? 'Will be analyzed by Aura AI' : 'অরা এআই দ্বারা বিশ্লেষিত হবে'}
                </span>
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputText, attachedImage);
            }}
            className="flex items-center space-x-2"
          >
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {/* Premium Attachment Trigger */}
            <button
              type="button"
              onClick={triggerImageUpload}
              disabled={isTyping}
              title={language === 'en' ? 'Attach Image / Camera Photo' : 'ছবি / ক্যামেরা ফটো সংযুক্ত করুন'}
              className="p-3 bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-900 text-zinc-400 hover:text-amber-400 rounded-xl transition cursor-pointer shrink-0"
              id="ai-attach-btn"
            >
              <Paperclip size={16} />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTyping}
              placeholder={
                language === 'en'
                  ? "Describe what you want (e.g. 'I want traditional clothes')..."
                  : "আপনার পছন্দ বর্ণনা করুন (যেমন: 'আরামদায়ক জুতো দেখান')..."
              }
              className="flex-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:border-amber-500/80 transition"
              id="ai-chat-input"
            />
            <button
              type="submit"
              disabled={isTyping || (!inputText.trim() && !attachedImage)}
              className={`p-3 rounded-xl transition cursor-pointer shrink-0 ${
                (!inputText.trim() && !attachedImage) || isTyping
                  ? "bg-zinc-800 border border-zinc-800 text-zinc-600 cursor-not-allowed"
                  : "bg-amber-500 text-zinc-950 hover:bg-amber-400 shadow-md shadow-amber-950/20 hover:scale-103"
              }`}
            >
              <Send size={16} />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}

// Simple Helper function to bold markdown stars syntax
function parseBoldText(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
}
