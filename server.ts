import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Simple JSON-file and In-memory Order Database
  const ORDERS_FILE = path.join(process.cwd(), "orders_database.json");
  
  function readOrdersFromDisk() {
    try {
      if (fs.existsSync(ORDERS_FILE)) {
        return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8"));
      }
    } catch (e) {
      console.error("Error reading orders file:", e);
    }
    return [];
  }

  function writeOrdersToDisk(ordersList: any[]) {
    try {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(ordersList, null, 2), "utf-8");
    } catch (e) {
      console.error("Error writing orders file:", e);
    }
  }

  // Pre-seed if file doesn't exist
  if (!fs.existsSync(ORDERS_FILE)) {
    writeOrdersToDisk([]);
  }

  // Admin Authentication (Direct Login without OTP as requested)
  app.post("/api/admin/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    
    // Explicit authorization check for specified Admin accounts
    if ((cleanEmail === "jamaluddinkh3424@gmail.com" || cleanEmail === "admin@gmail.com") && password === "admin123") {
      console.log(`[ADMIN AUTH SHIELD] Direct administrator login successful for: ${cleanEmail}`);
      return res.json({ 
        success: true, 
        user: { 
          firstName: "Admin", 
          lastName: "Owner", 
          email: cleanEmail, 
          role: "admin",
          phone: "+8801784905075"
        } 
      });
    } else {
      return res.status(401).json({ 
        error: "Incorrect Gmail or password! Only designated Admin addresses can log in." 
      });
    }
  });

  app.get("/api/orders", (req, res) => {
    const orders = readOrdersFromDisk();
    res.json(orders);
  });

  app.post("/api/orders", (req, res) => {
    const newOrder = req.body;
    console.log("[SERVER] Received POST /api/orders request with payload:", JSON.stringify(newOrder));
    
    if (!newOrder || !newOrder.id) {
      console.error("[SERVER ERROR] Invalid order payload detected");
      return res.status(400).json({ error: "Invalid order object" });
    }

    try {
      const currentOrders = readOrdersFromDisk();
      const alreadyExists = currentOrders.some((o: any) => o.id === newOrder.id);
      
      if (!alreadyExists) {
        currentOrders.unshift(newOrder); // Add to beginning
        writeOrdersToDisk(currentOrders);
        console.log(`[SERVER] Successfully added and saved new order ${newOrder.id}. Total orders: ${currentOrders.length}`);
      } else {
        console.log(`[SERVER] Order ${newOrder.id} already exists in database. Skipping duplicate append.`);
      }
      return res.json({ success: true, order: newOrder });
    } catch (err: any) {
      console.error("[SERVER ERROR] Exception during POST /api/orders:", err);
      return res.status(500).json({ error: "Internal database writing exception", details: err?.message });
    }
  });

  // Bidirectional Synchronization Endpoint
  app.post("/api/orders/sync", (req, res) => {
    const { orders: clientOrders } = req.body;
    
    if (!Array.isArray(clientOrders)) {
      console.error("[SERVER ERROR] POST /api/orders/sync client orders is not an array");
      return res.status(400).json({ error: "orders must be an array" });
    }

    try {
      const serverOrders = readOrdersFromDisk();
      const orderMap: Record<string, any> = {};

      // 1. Load server-side orders
      serverOrders.forEach((o: any) => {
        if (o && o.id) {
          orderMap[o.id] = o;
        }
      });

      // 2. Merge with client orders (update if status/courier changed)
      clientOrders.forEach((co: any) => {
        if (!co || !co.id) return;
        const existing = orderMap[co.id];
        if (!existing) {
          orderMap[co.id] = co;
        } else {
          // If client order has status updates or courier updates, merge them onto server
          if (co.status !== existing.status || co.courierTrackingId !== existing.courierTrackingId) {
            orderMap[co.id] = { ...existing, ...co };
          }
        }
      });

      // Convert map back to list
      const mergedOrders = Object.values(orderMap);
      
      // Robust fall-safe descending date sorter using timestamp, date parsers, or ID lexical string ordering as ultimate fallback
      mergedOrders.sort((a: any, b: any) => {
        const timeB = b.timestamp || (b.date ? new Date(b.date).getTime() : 0) || 0;
        const timeA = a.timestamp || (a.date ? new Date(a.date).getTime() : 0) || 0;
        
        if (isNaN(timeB) || isNaN(timeA) || timeB === timeA) {
          // Absolute deterministic fallback using Lexical ID sorting
          return String(b.id || "").localeCompare(String(a.id || ""));
        }
        return timeB - timeA;
      });

      writeOrdersToDisk(mergedOrders);
      
      // Console diagnostic report to track remote/local sync exchanges
      if (clientOrders.length > 0 || serverOrders.length > 0) {
        console.log(`[SERVER SYNC] Client sent ${clientOrders.length} orders. Server has ${serverOrders.length} orders. Returned merged: ${mergedOrders.length}`);
      }
      
      return res.json(mergedOrders);
    } catch (err: any) {
      console.error("[SERVER ERROR] Exception during POST /api/orders/sync:", err);
      // Return server orders as a resilient backup rather than crashing the loop
      try {
        return res.json(readOrdersFromDisk());
      } catch (_) {
        return res.status(500).json({ error: "Sync failed completely" });
      }
    }
  });

  app.put("/api/orders/:id/status", (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;
    const currentOrders = readOrdersFromDisk();
    const orderIndex = currentOrders.findIndex((o: any) => o.id === orderId);
    if (orderIndex > -1) {
      currentOrders[orderIndex].status = status;
      writeOrdersToDisk(currentOrders);
      res.json({ success: true, order: currentOrders[orderIndex] });
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  });

  // Server-side Gemini API route proxy
  app.post("/api/chat", async (req, res) => {
    const { message, history = [], products = [], image } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      // Graceful fallback when API key is missing
      console.warn("GEMINI_API_KEY is not configured or uses default template string. Serving mock AI advice.");
      
      const lowerMsg = (message || "").toLowerCase();
      let reply = "আমি আপনাকে সাহায্য করতে পেরে আনন্দিত! এটি ডেমো মোড। আপনার গুগল এআই স্টুডিওতে সেটিংস থেকে **Secrets** প্যানেলে `GEMINI_API_KEY` সেট করুন।\n\n";
      let suggested: string[] = [];

      if (image) {
        reply += "📸 **চিত্র বিশ্লেষণ সম্পন্ন (Image Scan Successful)!**\n\nআপনি আপনার ডিভাইস (কম্পিউটার/মোবাইল) থেকে সফলভাবে একটি ছবি আপলোড করেছেন। ডেমো মোডে আপনার আপলোড করা ইমেজ স্ক্যান করে আমাদের ভার্চুয়াল AI সহকারী নিচে আপনার সাথে ম্যাচিং ক্যাটালগ প্রোডাক্ট দেখাবে:\n\n";
        
        if (lowerMsg.includes("shoe") || lowerMsg.includes("জু") || lowerMsg.includes("স্নিকার") || lowerMsg.includes("sneaker")) {
          reply += "আপনার আপলোড করা ছবির স্যু/জুতো স্টাইল অনুযায়ী, আমরা প্রিমিয়াম **Zenith Comfort Running Sneakers** (৳৮,২০০ | $৬৮) রেকমেন্ড করছি যা লাইটওয়েট এবং অত্যন্ত আরামদায়ক!";
          suggested = ["prod-7"];
        } else if (lowerMsg.includes("headphone") || lowerMsg.includes("কান") || lowerMsg.includes("হেডফ") || lowerMsg.includes("sound") || lowerMsg.includes("অডিও")) {
          reply += "আপনার আপলোড করা ডিভাইস ইমেজ অনুযায়ী, আমরা বেস্ট-সেলার **AeroSound Pro ANC Headphones** (৳১৮,৫০০ | $১৫৪) সাজেস্ট করছি যা চমৎকার অ্যাক্টিভ নয়েজ ক্যান্সেলেশন দেয়।";
          suggested = ["prod-1"];
        } else {
          reply += "আমরা আপনার সংযুক্ত ফাইলের স্টাইল ও কালারের সাথে মেলাতে আমাদের ইউনিক ক্রিয়েশন ক্যাটালগ থেকে **Titanium Alpha Sports Smartwatch** (৳২৪,০০০ | $২০০) অথবা আমাদের ট্র্যাডিশনাল ফেসিভ ওয়্যার এবং স্পোর্টস ওয়্যার কালেকশন রিকমেন্ড করছি।";
          suggested = ["prod-2", "prod-3", "prod-10"];
        }
      } else {
        if (lowerMsg.includes("shoe") || lowerMsg.includes("জু") || lowerMsg.includes("স্নিকার") || lowerMsg.includes("sneaker")) {
          reply += "আমি আমাদের ডিজাইনার কালেকশন থেকে অত্যন্ত আধুনিক **Zenith Comfort Running Sneakers** (৳৮,২০০ | $৬৮) রেকমেন্ড করছি! এটি উন্নত মেস গ্রিড এবং ডুয়াল ডেনসিটি স্পোর্টস ফোম কুশন সংবলিত যা সারাদিন দৌড়ঝাঁপ ও হাঁটার জন্য অত্যন্ত আরামদায়ক।";
          suggested = ["prod-7"];
        } else if (lowerMsg.includes("panjabi") || lowerMsg.includes("পাঞ্জা") || lowerMsg.includes("জামা") || lowerMsg.includes("কাপড়") || lowerMsg.includes("wear")) {
          reply += "উৎসবের জন্য আমাদের তৈরি **Luxe Handloom Linen Panjabi** (৳৪,৫০০ | $৩৮) আপনার জন্য চমৎকার হবে। এটি ১০০% অর্গানিক লিনেন এবং গলায় চমৎকার সূক্ষ্ম হাতের এমব্রয়ডারি কাজের সাথে আসে!";
          suggested = ["prod-2"];
        } else if (lowerMsg.includes("headphone") || lowerMsg.includes("কান") || lowerMsg.includes("হেডফ") || lowerMsg.includes("sound") || lowerMsg.includes("অডিও")) {
          reply += "আমরা সাজেস্ট করছি আমাদের বেস্ট সেলার **AeroSound Pro ANC Headphones** (৳১৮,৫০০ | $১৫৪)। এটি সর্বোচ্চ অ্যাক্টিভ নয়েজ ক্যান্সেলেশন এবং ৪০ ঘণ্টার স্টুডিও অডিও ব্যাকআপ দেয়।";
          suggested = ["prod-1"];
        } else if (lowerMsg.includes("watch") || lowerMsg.includes("ঘড়ি") || lowerMsg.includes("স্মার্টওয়াচ")) {
          reply += "আমাদের লাইভ স্টকে থাকা অ্যারোস্পেস-গ্রেড টাইটানিয়াম নির্মিত **Titanium Alpha Sports Smartwatch** (৳২৪,০০০ | $২০০) দেখতে পারেন। এতে রয়েছে অলওয়েজ-অন অ্যামোলেড রেটিনা রেসপন্স এবং হার্টরেট মনিটরিং সুবিধা।";
          suggested = ["prod-3"];
        } else {
          reply += "আমাদের প্রিমিয়াম স্টোরে অনেক চমৎকার কালেকশন রয়েছে যেমন লাক্সারি লিনেন পাঞ্জাবি, সিরামিক ফুলদানি, নয়েজ-ক্যানসেলিং হেডফোন এবং কাস্টম বুকস। আপনার কাছে আজকের দিনটি আরও রিচ করতে সাহায্য করছি! অনুগ্রহ করে যেকোনো প্রোডাক্ট ডেমো জানতে আমাকে জিজ্ঞাসা করুন।";
          suggested = ["prod-1", "prod-2", "prod-3"];
        }
      }

      return res.json({
        text: reply,
        suggestedProductIds: suggested
      });
    }

    try {
      // Lazy initialization of active client
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      // Assemble system instruction with live product details
      const productsContextString = products.map((p: any) => 
        `ID: ${p.id} | Name: ${p.name} (${p.nameBn}) | Category: ${p.category} | Price: ৳${p.priceBDT} / $${p.priceUSD} | Stock: ${p.stock} | Features: ${p.features.join(", ")} | Description: ${p.description}`
      ).join("\n");

      const systemInstruction = 
        `You are 'Aura AI', a highly professional, courteous, and sophisticated personal shopping consultant for the 'Modern E-Commerce Portal'.
Your primary job is to consult and assist clients in discovering matching products from our premium catalog.

Here is our live stock database representing available inventory:
${productsContextString}

Guidelines:
1. Speak in a helpful client-centric fashion. Be warm, professional, and knowledgeable.
2. Communicate natively in Bengali (বাংলা) or English, dynamically matching the language used by the user. You can also mix them naturally (e.g., using terms like premium, coupon, discount) when helpful to Bangladeshi clients.
3. Highlight specific product benefits, prices, specs and stock if requested.
4. You MUST recommend exactly one or more matching products from the live database if they ask for suggestions or matches (e.g. matching 'shoes', 'electronics', 'gift ideas', 'traditional festive wear', etc.).
5. If the user attaches an image, analyze its visual characteristics (e.g., shape, pattern, product category, color vibe) and mention what you spotted in their photo. Find and recommend the closest matching products in the inventory with their IDs inside suggestedProductIds.
6. You must return your response inside a structured JSON object. 

The JSON structure MUST follow this exact schema:
{
  "text": "Your helpful response translated in markdown format. Use bullet points and paragraphs properly to make it look highly stylized. Encourage them.",
  "suggestedProductIds": ["prod-X", "prod-Y"] 
}
Only include IDs inside suggestedProductIds that literally exist in the database parameters provided. If no products are relevant, return an empty array [].`;

      // Structure conversational turns for Gemini
      const conversationContents = [];
      
      // Map previous history to Gemini conversational structure
      for (const turn of history.slice(-8)) { // limit history depth for optimization
        conversationContents.push({
          role: turn.sender === "user" ? "user" : "model",
          parts: [{ text: turn.text }]
        });
      }

      // Add the final user turn (allowing multimodal inline image)
      if (image) {
        let mimeType = "image/jpeg";
        let base64Data = image;
        if (image.includes(";base64,")) {
          const parts = image.split(";base64,");
          mimeType = parts[0].replace("data:", "");
          base64Data = parts[1];
        }
        
        conversationContents.push({
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              }
            },
            { text: message || "Analyze this image and recommend corresponding matching products from the inventory." }
          ]
        });
      } else {
        conversationContents.push({
          role: "user",
          parts: [{ text: message }]
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: conversationContents,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.7,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: {
                type: Type.STRING,
                description: "The Markdown formatted conversational response to the client."
              },
              suggestedProductIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of product ID strings recommended to the user."
              }
            },
            required: ["text", "suggestedProductIds"]
          }
        }
      });

      const rawText = response.text || "{}";
      const parsed = JSON.parse(rawText.trim());
      
      res.json({
        text: parsed.text || "I am processing your shopping requests.",
        suggestedProductIds: parsed.suggestedProductIds || []
      });

    } catch (error: any) {
      console.error("Gemini API Error details:", error);
      res.status(500).json({
        error: "AI translation error occurred.",
        text: "আমি দুঃখিত, এআই অ্যাসিস্ট্যান্টের সাথে সংযোগ স্থাপন করতে কিছুটা সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন বা সরাসরি আমাদের ক্যাটালগ ব্রাউজ করুন!",
        suggestedProductIds: []
      });
    }
  });

  // Vite Integration for Dev / Prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Port 3000 container reverse proxy ready! Fullstack server online.`);
  });
}

startServer();
