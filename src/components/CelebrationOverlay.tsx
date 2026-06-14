import React, { useEffect, useState } from "react";

interface CelebrationOverlayProps {
  onClose: () => void;
  language: "bn" | "en";
}

interface StarParticle {
  id: number;
  x: number; // percentage width
  y: number; // percentage height
  tx: number; // target relative X translation in px
  ty: number; // target relative Y translation in px
  size: number; // size in px
  color: string;
  delay: number; // ms
  char: string;
}

interface FlowerParticle {
  id: number;
  x: number;
  y: number;
  scale: number;
  emoji: string;
  delay: number;
  angle: number;
}

export function CelebrationOverlay({ onClose, language }: CelebrationOverlayProps) {
  const [stars, setStars] = useState<StarParticle[]>([]);
  const [flowers, setFlowers] = useState<FlowerParticle[]>([]);
  
  // Play beautiful synthetic procedural chime music
  const playMelodyClientSide = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      
      // Bright celebratory pentatonic sound sequence
      const sequence = [
        { f: 523.25, d: 0.15, t: 0 },     // C5
        { f: 659.25, d: 0.15, t: 0.1 },   // E5
        { f: 783.99, d: 0.15, t: 0.2 },   // G5
        { f: 880.00, d: 0.15, t: 0.3 },   // A5
        { f: 1046.50, d: 0.25, t: 0.4 },  // C6
        { f: 1318.51, d: 0.35, t: 0.55 }, // E6
        { f: 1567.98, d: 0.5, t: 0.7 }    // G6
      ];

      sequence.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(note.f, now + note.t);
        
        // Add subtle pitch vibrato
        const vibrato = ctx.createOscillator();
        const vibratoGain = ctx.createGain();
        vibrato.frequency.value = 10; // 10Hz
        vibratoGain.gain.setValueAtTime(15, now + note.t);
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);

        gain.gain.setValueAtTime(0, now + note.t);
        gain.gain.linearRampToValueAtTime(0.3, now + note.t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        vibrato.start(now + note.t);
        osc.start(now + note.t);
        
        vibrato.stop(now + note.t + note.d);
        osc.stop(now + note.t + note.d);
      });
    } catch (e) {
      console.warn("Autoplay block or audio initialization failed: ", e);
    }
  };

  useEffect(() => {
    // Play sound immediately when the overlay activates
    playMelodyClientSide();

    // Generate dozens of floating stars shooting in all directions from multiple centers
    const generatedStars: StarParticle[] = [];
    const colors = ["#f59e0b", "#f43f5e", "#ec4899", "#10b981", "#3b82f6", "#a855f7", "#eab308"];
    const chars = ["★", "✦", "✧", "✨", "🌸", "⭐", "🎉"];
    
    // 3 emitter points: center, top-left, top-right
    const emitters = [
      { x: 50, y: 50 },
      { x: 25, y: 35 },
      { x: 75, y: 35 },
      { x: 50, y: 80 }
    ];

    let starId = 0;
    emitters.forEach((emitter) => {
      // 20 stars per emitter
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 80 + Math.random() * 250;
        const tx = Math.cos(angle) * speed;
        const ty = Math.sin(angle) * speed;
        
        generatedStars.push({
          id: starId++,
          x: emitter.x,
          y: emitter.y,
          tx,
          ty,
          size: 10 + Math.random() * 22,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 400,
          char: chars[Math.floor(Math.random() * chars.length)]
        });
      }
    });
    setStars(generatedStars);

    // Generate blooming flowers
    const generatedFlowers: FlowerParticle[] = [];
    const flowerEmojis = ["🌸", "🌺", "🌷", "🌼", "🌻", "🌹", "🏵️", "💮"];
    
    // Create blooming spots across the entire screen
    for (let j = 0; j < 45; j++) {
      generatedFlowers.push({
        id: j,
        x: 10 + Math.random() * 80, // 10% to 90%
        y: 15 + Math.random() * 70, // 15% to 85%
        scale: 0.6 + Math.random() * 1.4,
        emoji: flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)],
        delay: Math.random() * 2200,
        angle: Math.random() * 360
      });
    }
    setFlowers(generatedFlowers);

    // Auto-close celebration after 9 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 9000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm overflow-hidden select-none font-sans">
      
      {/* Self-contained critical keyframe CSS */}
      <style>{`
        @keyframes custom-bloom {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          15% { transform: scale(var(--target-scale, 1.2)) rotate(180deg); opacity: 1; filter: drop-shadow(0 0 12px rgba(244,63,94,0.6)); }
          40% { transform: scale(var(--target-scale, 1)) rotate(360deg); opacity: 1; }
          85% { opacity: 0.9; transform: scale(var(--target-scale, 1)) translateY(10px) rotate(370deg); }
          100% { transform: scale(0) translateY(80px) rotate(400deg); opacity: 0; }
        }

        @keyframes custom-star-shoot {
          0% { transform: translate(0, 0) scale(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.8; }
          100% { transform: translate(var(--tx), var(--ty)) scale(1.1) rotate(360deg); opacity: 0; }
        }

        @keyframes drift-down-petal {
          0% { transform: translateY(-10vh) translateX(0) scale(0.5) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: translateY(45vh) translateX(40px) scale(1) rotate(180deg); }
          100% { transform: translateY(110vh) translateX(-20px) scale(0.7) rotate(360deg); opacity: 0; }
        }

        @keyframes badge-gasp {
          0% { transform: scale(0.3); opacity: 0; filter: brightness(2); }
          50% { transform: scale(1.08); filter: brightness(1.2); }
          70% { transform: scale(0.97); }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes pulse-glowing-gold {
          0%, 100% { box-shadow: 0 0 25px rgba(245, 158, 11, 0.5), inset 0 0 15px rgba(245, 158, 11, 0.3); border-color: rgba(245, 158, 11, 0.8); }
          50% { box-shadow: 0 0 45px rgba(245, 158, 11, 0.95), inset 0 0 25px rgba(245, 158, 11, 0.6); border-color: rgba(234, 179, 8, 1); }
        }

        .bloom-flower {
          animation: custom-bloom 5.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .shooting-star {
          animation: custom-star-shoot 3.2s cubic-bezier(0.1, 0.8, 0.1, 1) forwards;
        }

        .slow-falling-petal {
          animation: drift-down-petal 8s linear infinite;
        }

        .celebration-badge {
          animation: badge-gasp 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        .golden-glow-active {
          animation: pulse-glowing-gold 2s infinite ease-in-out;
        }
      `}</style>

      {/* Background Soft Falling Petals - Generating 25 infinite loop items */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 25 }).map((_, idx) => {
          const left = Math.random() * 100;
          const delay = Math.random() * 6;
          const size = 12 + Math.random() * 18;
          const emojiList = ["🌸", "🍁", "✨", "🌺", "🌷", "🍂"];
          const emoji = emojiList[idx % emojiList.length];
          return (
            <div
              key={`petal-${idx}`}
              className="absolute slow-falling-petal text-xl pointer-events-none select-none"
              style={{
                left: `${left}%`,
                animationDelay: `${delay}s`,
                fontSize: `${size}px`,
                zIndex: 10
              }}
            >
              {emoji}
            </div>
          );
        })}
      </div>

      {/* Emitter of Stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {stars.map((star) => (
          <div
            key={`star-${star.id}`}
            className="absolute shooting-star pointer-events-none font-bold text-center flex items-center justify-center select-none"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              fontSize: `${star.size}px`,
              color: star.color,
              filter: `drop-shadow(0 0 6px ${star.color})`,
              animationDelay: `${star.delay}ms`,
              // Pass custom transform destinations via css variables
              ["--tx" as any]: `${star.tx}px`,
              ["--ty" as any]: `${star.ty}px`,
              zIndex: 30
            }}
          >
            {star.char}
          </div>
        ))}
      </div>

      {/* Emitter of Blooming Flowers (they grow, stay, turn and fall down) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {flowers.map((flower) => (
          <div
            key={`flower-${flower.id}`}
            className="absolute bloom-flower pointer-events-none text-center flex items-center justify-center select-none"
            style={{
              left: `${flower.x}%`,
              top: `${flower.y}%`,
              fontSize: `${28 * flower.scale}px`,
              animationDelay: `${flower.delay}ms`,
              ["--target-scale" as any]: flower.scale,
              transform: `rotate(${flower.angle}deg)`,
              zIndex: 25
            }}
          >
            {flower.emoji}
          </div>
        ))}
      </div>

      {/* Central Gorgeous Congratulatory Board */}
      <div className="celebration-badge golden-glow-active z-50 max-w-lg w-[90%] mx-auto bg-zinc-950/90 backdrop-blur-lg border border-yellow-500/80 rounded-3xl p-8 text-center text-white relative shadow-2xl overflow-hidden">
        {/* Colorful top bar element */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500" />
        
        {/* Animated ambient decorative elements inside badge */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-pink-500/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl animate-pulse delay-700" />

        <div className="flex justify-center mb-4 text-5xl animate-bounce">
          👑
        </div>

        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent mb-3 font-sans">
          {language === "bn" ? "অসাধারণ! সচল হয়েছে!" : "Spectacular Success!"}
        </h2>
        
        <p className="text-sm md:text-base font-semibold text-zinc-100 max-w-md mx-auto mb-6 leading-relaxed">
          {language === "bn" 
            ? "অভিনন্দন! আপনার গেজেট বাজার পোর্টালটি সফলভাবে স্থায়ীভাবে সক্রিয় হয়েছে। ডেমো ট্রায়াল মোড চূড়ান্তভাবে অপসারিত হয়েছে ও প্রিমিয়াম প্রফেশনাল লাইফটাইম লাইসেন্স আপনার সাইটে এক্টিভ হয়েছে।"
            : "Congratulations! Your Gadget Bazar Portal is successfully upgraded and permanently activated. Live license limits are fully unlocked!"}
        </p>

        {/* Dynamic visual representation of license tier unlock */}
        <div className="flex flex-col items-center justify-center gap-2 mb-8 bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800 shadow-inner">
          <div className="text-[10px] text-yellow-400 font-mono tracking-widest uppercase">
            {language === 'bn' ? "লাইসেন্স সাবস্ক্রিপশন স্ট্যাটাস" : "LICENSE SUBSCRIPTION STATUS"}
          </div>
          <div className="text-base font-black tracking-tight text-white flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>{language === 'bn' ? "লাইফটাইম প্রো সংস্করণ সক্রিয়" : "LIFETIME PRO EDITION ENCODED"}</span>
          </div>
          <div className="text-[11px] text-zinc-400 font-semibold font-mono bg-zinc-950 px-2.5 py-0.5 rounded border border-zinc-800 mt-1">
            VERIFIED TYPE: GB-PRO-STAFF-ACTIVE
          </div>
        </div>

        {/* Trigger manually closing */}
        <button
          onClick={onClose}
          className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 active:scale-95 text-zinc-950 font-black text-xs px-8 py-3 rounded-xl border-0 cursor-pointer shadow-lg shadow-amber-500/20 transition duration-200 inline-flex items-center justify-center gap-2"
        >
          <span>{language === "bn" ? "ধন্যবাদ, হোম পেজে ফিরুন" : "Thank you, return to app"}</span>
          <span>➜</span>
        </button>

        {/* Sparkle decorative icons in corners */}
        <div className="absolute bottom-4 left-4 text-lg opacity-40">✨</div>
        <div className="absolute top-4 right-4 text-lg opacity-40">✨</div>
      </div>
    </div>
  );
}
