"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, BrainCircuit, MessagesSquare, Target, Activity, Bot, FileSearch, Megaphone, Heart, Percent, Calculator, DatabaseZap, ChevronDown, BookOpen, FileText, BarChart, Mail, Mic, CalendarDays, ShoppingBag, Globe, Smartphone, Ticket, Database, UserCircle, Zap, MessageCircle, Gift, Award, LayoutDashboard, Tag, Star, Linkedin, Instagram, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const FEATURES = [
  {
    icon: Target,
    title: "Segments in Plain English",
    desc: "Type “high spenders who went quiet for 60 days” — our AI turns it into a live audience instantly. No SQL, no filters to learn.",
    accent: "from-orbit-purple/20 to-purple-600/5 border-purple-800/30",
    iconColor: "text-orbit-purple",
  },
  {
    icon: MessagesSquare,
    title: "1:1 Personalized Messaging",
    desc: "Every customer gets a unique message referencing their name, last product, and habits — written by AI at send time, across WhatsApp, SMS, Email & RCS.",
    accent: "from-indigo-600/20 to-orbit-blue/5 border-indigo-800/30",
    iconColor: "text-orbit-blue",
  },
  {
    icon: BrainCircuit,
    title: "Churn Prediction Built-In",
    desc: "Every customer is scored on Recency, Frequency & Monetary value automatically. Know who’s about to leave before they do.",
    accent: "from-fuchsia-600/20 to-fuchsia-600/5 border-fuchsia-800/30",
    iconColor: "text-orbit-purple",
  },
  {
    icon: Bot,
    title: "An AI Copilot That Acts",
    desc: "Describe your goal in chat — the Copilot finds the audience, writes the copy, builds the campaign, and launches it with your confirmation.",
    accent: "from-violet-600/20 to-violet-600/5 border-violet-800/30",
    iconColor: "text-violet-400",
  },
  {
    icon: Activity,
    title: "Live Delivery Tracking",
    desc: "Watch every message move from sent → delivered → opened → clicked in real time, with an AI-written post-mortem when the campaign completes.",
    accent: "from-teal-600/20 to-teal-600/5 border-teal-800/30",
    iconColor: "text-orbit-teal",
  },
  {
    icon: FileSearch,
    title: "Upload Any Data Format",
    desc: "Our import agent reads your CSV — whatever the column names — maps it to our schema with AI, and visualizes your raw data instantly.",
    accent: "from-sky-600/20 to-sky-600/5 border-sky-800/30",
    iconColor: "text-sky-400",
  },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [contactEmail, setContactEmail] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleContactSubmit = () => {
    if (!contactEmail || !contactEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success("Thanks! We'll be in touch shortly.");
    setContactEmail("");
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-[#030712] text-foreground font-sans selection:bg-orbit-purple/30">
      {/* Navbar */}
      <nav className="absolute top-0 left-0 w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex flex-col items-center hover:opacity-80 transition-opacity">
            <img 
              src="https://cdn.prod.website-files.com/620353a026ae70e21288308a/69e0a8442fde5f7cc3b2d3c6_newlogoxeno-blue11.png" 
              alt="Xeno Logo" 
              className="h-6 w-auto object-contain" 
            />
            <div className="flex items-center mt-0.5 ml-10">
              <span className="text-slate-300 font-medium text-sm tracking-wide">mini CRM</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <div className="relative group h-20 flex items-center">
              <button className="hover:text-white transition-colors flex items-center gap-1 h-full">
                Product <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
              </button>
              
              {/* Mega Menu Dropdown */}
              <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out translate-y-2 group-hover:translate-y-0">
                <div className="bg-[#0f172a] border border-slate-700 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden flex">
                  
                  {/* Left Column - Suite */}
                  <div className="w-1/3 bg-slate-800/30 p-8 border-r border-slate-800/80">
                    <h3 className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-6">
                      Xeno Customer Engagement Suite
                    </h3>
                    <div className="space-y-2">
                      <Link href="#features" className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/50 transition-colors group/item">
                        <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700/50 group-hover/item:border-orbit-blue/50 group-hover/item:text-orbit-blue text-slate-400 transition-colors">
                          <Megaphone className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-slate-200 group-hover/item:text-white transition-colors text-sm">Next Gen CRM</span>
                      </Link>
                      
                      <Link href="#features" className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/50 transition-colors group/item">
                        <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700/50 group-hover/item:border-orbit-purple/50 group-hover/item:text-orbit-purple text-slate-400 transition-colors">
                          <Heart className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-slate-200 group-hover/item:text-white transition-colors text-sm">Next Gen Loyalty</span>
                      </Link>
                      
                      <Link href="#features" className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/50 transition-colors group/item">
                        <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700/50 group-hover/item:border-orbit-teal/50 group-hover/item:text-orbit-teal text-slate-400 transition-colors">
                          <Percent className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-slate-200 group-hover/item:text-white transition-colors text-sm">Next Gen Offers</span>
                      </Link>
                    </div>
                  </div>

                  {/* Right Column - Cards */}
                  <div className="w-2/3 p-8 bg-slate-950/40 flex gap-6">
                    {/* Card 1 */}
                    <div className="flex-1 group/card cursor-pointer">
                      <div className="h-32 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-600/10 border border-indigo-500/20 mb-4 overflow-hidden relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <DatabaseZap className="w-12 h-12 text-indigo-400/50 group-hover/card:scale-110 group-hover/card:text-indigo-400 transition-all duration-500" />
                        </div>
                        <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-indigo-950/80 to-transparent">
                          <span className="text-[10px] font-bold text-indigo-300 tracking-wider uppercase">Customer Data Platform for Retail</span>
                        </div>
                      </div>
                      <h4 className="font-semibold text-sm text-slate-200 group-hover/card:text-orbit-blue transition-colors leading-snug">
                        Customer Data Platform | How CDPs Drive Retail Success
                      </h4>
                    </div>

                    {/* Card 2 */}
                    <div className="flex-1 group/card cursor-pointer">
                      <div className="h-32 rounded-xl bg-gradient-to-br from-orbit-purple/20 to-fuchsia-600/10 border border-orbit-purple/20 mb-4 overflow-hidden relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Calculator className="w-12 h-12 text-orbit-purple/50 group-hover/card:scale-110 group-hover/card:text-orbit-purple transition-all duration-500" />
                        </div>
                        <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-purple-950/80 to-transparent">
                          <span className="text-[10px] font-bold text-purple-300 tracking-wider uppercase">Xeno's ROI Calculator</span>
                        </div>
                      </div>
                      <h4 className="font-semibold text-sm text-slate-200 group-hover/card:text-orbit-purple transition-colors leading-snug">
                        Calculate the incremental revenue you can generate with Xeno's Suite
                      </h4>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>

            <Link href="#solutions" className="hover:text-white transition-colors">Solutions</Link>
            
            {/* Resources Mega Menu */}
            <div className="relative group h-20 flex items-center">
              <button className="hover:text-white transition-colors flex items-center gap-1 h-full">
                Resources <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
              </button>
              
              <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out translate-y-2 group-hover:translate-y-0">
                <div className="bg-[#0f172a] border border-slate-700 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden flex">
                  
                  {/* Left Column - Links */}
                  <div className="w-1/3 bg-slate-800/30 p-8 border-r border-slate-800/80">
                    <h3 className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-6">
                      All Resources
                    </h3>
                    <div className="space-y-2">
                      <Link href="https://www.getxeno.com/blog" target="_blank" className="flex items-center gap-4 p-2 rounded-xl hover:bg-slate-800/50 transition-colors group/item">
                        <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700/50 group-hover/item:border-orbit-blue/50 group-hover/item:text-orbit-blue text-slate-400 transition-colors">
                          <BookOpen className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-slate-200 group-hover/item:text-white transition-colors text-sm">Blogs</span>
                      </Link>
                      
                      <Link href="https://www.getxeno.com/guides-reports" target="_blank" className="flex items-center gap-4 p-2 rounded-xl hover:bg-slate-800/50 transition-colors group/item">
                        <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700/50 group-hover/item:border-orbit-purple/50 group-hover/item:text-orbit-purple text-slate-400 transition-colors">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-slate-200 group-hover/item:text-white transition-colors text-sm">Guides</span>
                      </Link>
                      
                      <Link href="https://www.getxeno.com/whitepapers" target="_blank" className="flex items-center gap-4 p-2 rounded-xl hover:bg-slate-800/50 transition-colors group/item">
                        <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700/50 group-hover/item:border-orbit-teal/50 group-hover/item:text-orbit-teal text-slate-400 transition-colors">
                          <BarChart className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-slate-200 group-hover/item:text-white transition-colors text-sm">Whitepapers</span>
                      </Link>
                      
                      <Link href="https://www.getxeno.com/xeno-pulse" target="_blank" className="flex items-center gap-4 p-2 rounded-xl hover:bg-slate-800/50 transition-colors group/item">
                        <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700/50 group-hover/item:border-fuchsia-500/50 group-hover/item:text-fuchsia-500 text-slate-400 transition-colors">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-slate-200 group-hover/item:text-white transition-colors text-sm">Xeno Pulse</span>
                      </Link>
                      
                      <Link href="https://www.getxeno.com/podcast" target="_blank" className="flex items-center gap-4 p-2 rounded-xl hover:bg-slate-800/50 transition-colors group/item">
                        <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700/50 group-hover/item:border-sky-500/50 group-hover/item:text-sky-500 text-slate-400 transition-colors">
                          <Mic className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-slate-200 group-hover/item:text-white transition-colors text-sm">Podcast</span>
                      </Link>
                    </div>
                  </div>

                  {/* Right Column - Cards */}
                  <div className="w-2/3 p-8 bg-slate-950/40 flex gap-6">
                    {/* Card 1 */}
                    <Link href="https://www.getxeno.com/guides/2026-retail-marketing-calendar-india" target="_blank" className="flex-1 group/card cursor-pointer block">
                      <div className="h-40 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 border border-amber-500/20 mb-4 overflow-hidden relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <CalendarDays className="w-16 h-16 text-amber-400/50 group-hover/card:scale-110 group-hover/card:text-amber-400 transition-all duration-500" />
                        </div>
                        <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-amber-950/80 to-transparent">
                          <span className="text-[10px] font-bold text-amber-300 tracking-wider uppercase">Marketing Calendar</span>
                        </div>
                      </div>
                      <h4 className="font-semibold text-sm text-slate-200 group-hover/card:text-amber-400 transition-colors leading-snug">
                        2026 Retail Marketing Calendar - India
                      </h4>
                    </Link>

                    {/* Card 2 */}
                    <Link href="https://www.getxeno.com/guides/2026-retail-marketing-calendar-middle-east" target="_blank" className="flex-1 group/card cursor-pointer block">
                      <div className="h-40 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/10 border border-emerald-500/20 mb-4 overflow-hidden relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <CalendarDays className="w-16 h-16 text-emerald-400/50 group-hover/card:scale-110 group-hover/card:text-emerald-400 transition-all duration-500" />
                        </div>
                        <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-emerald-950/80 to-transparent">
                          <span className="text-[10px] font-bold text-emerald-300 tracking-wider uppercase">Marketing Calendar</span>
                        </div>
                      </div>
                      <h4 className="font-semibold text-sm text-slate-200 group-hover/card:text-emerald-400 transition-colors leading-snug">
                        2026 Retail Marketing Calendar - Middle East
                      </h4>
                    </Link>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link 
              href="/login" 
              className="text-sm font-medium bg-white text-black px-5 py-2.5 rounded-full hover:bg-slate-200 transition-colors flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative pt-32 pb-20 px-6 overflow-hidden min-h-[90vh] flex flex-col justify-center">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orbit-purple/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orbit-blue/10 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Developer Profile Card (Right Side) */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center glass-dark p-5 rounded-[2rem] border border-slate-800 w-72 shadow-2xl z-20 group hover:border-orbit-purple/30 transition-all duration-500">
          <div className="w-32 h-32 mb-4 rounded-3xl overflow-hidden border-2 border-slate-700/50 shadow-2xl group-hover:scale-105 group-hover:border-orbit-purple/50 transition-all duration-500">
            <img src="/nandha-profile.png" alt="Mr.Nandha Kumar K" className="w-full h-full object-cover" />
          </div>
          <h4 className="text-white font-bold text-center text-lg leading-tight mb-2">Developed and Build By<br/>Mr.Nandha Kumar K</h4>
          <div className="flex flex-col items-center gap-1 mb-4">
            <span className="bg-slate-800/80 text-orbit-blue text-xs font-semibold px-3 py-1 rounded-full border border-slate-700/50">
              RA2311027010131
            </span>
            <span className="text-slate-400 text-xs text-center font-medium">CSE w/s in Big Data Analytics</span>
          </div>
          
          <div className="pt-4 border-t border-slate-800/80 w-full text-center">
            <p className="text-slate-500 text-[10px] leading-relaxed mb-3">
              SRM Institute of Science and Technology<br/>
              SRM Nagar, Potheri, Kattankulathur<br/>
              Chengalpattu District, Tamil Nadu – 603203 India
            </p>
            <div className="flex flex-col items-center gap-1">
              <a href="mailto:nandhakumar0242@gmail.com" className="text-slate-400 hover:text-white text-[10px] transition-colors bg-slate-800/50 px-3 py-1 rounded-full w-full">nandhakumar0242@gmail.com</a>
              <a href="mailto:nk8291@srmist.edu.in" className="text-slate-400 hover:text-white text-[10px] transition-colors bg-slate-800/50 px-3 py-1 rounded-full w-full">nk8291@srmist.edu.in</a>
              <a href="tel:+917010313612" className="text-slate-400 hover:text-white text-[10px] transition-colors bg-slate-800/50 px-3 py-1 rounded-full w-full">+91 7010313612</a>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark text-sm text-slate-300 animate-slideUp">
            <Sparkles className="w-4 h-4 text-orbit-purple" />
            <span>The Agentic Marketing Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white animate-slideUp" style={{ animationDelay: "0.1s" }}>
            AI Agents That Find, Engage, and <br />
            <span className="text-gradient-primary">Build Loyalty.</span>
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed animate-slideUp" style={{ animationDelay: "0.2s" }}>
            Xeno Mini CRM unifies your loyalty, campaigns & offers into one autonomous AI that drives measurable repeat revenue without the manual work.
          </p>

          <div className="flex flex-col items-center pt-8 animate-slideUp" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center bg-white rounded-full p-1.5 pl-6 shadow-xl shadow-orbit-blue/20 w-full max-w-md border border-slate-200">
              <Mail className="w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                placeholder="Enter Your Email" 
                className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-500 px-3 text-sm font-medium"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleContactSubmit()}
              />
              <button 
                onClick={handleContactSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-colors whitespace-nowrap text-sm"
              >
                Contact me <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center justify-center gap-4 mt-8">
              <Link 
                href="/login" 
                className="bg-gradient-to-r from-orbit-purple to-orbit-blue text-white px-8 py-4 rounded-full font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-orbit-purple/25"
              >
                Sign In <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/login" 
                className="glass-dark text-white px-8 py-4 rounded-full font-medium hover:bg-white/10 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Next-Gen CRM Capabilities</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Everything you need to turn one-time shoppers into lifelong brand advocates, powered by bleeding-edge AI.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className={`glass-dark p-8 rounded-3xl hover:-translate-y-1 transition-transform duration-300 group border-t ${f.accent.split(' ')[2]}`}>
                  <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${f.iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{f.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow Diagram */}
      <section id="workflow" className="py-24 px-6 relative z-10 bg-slate-950/50 border-y border-white/5 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">The Autonomous AI Engine for Retail</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">From raw data to personalized 1:1 engagement without the manual effort.</p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative">
            
            {/* Left - Data Sources */}
            <div className="flex-1 w-full text-center z-10">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6">Data & Ingestion</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Database, label: "API Integrations" },
                  { icon: FileText, label: "CSV Uploads" },
                  { icon: ShoppingBag, label: "Order History" },
                  { icon: Target, label: "Live Events" },
                  { icon: Ticket, label: "Support Tickets" },
                  { icon: Globe, label: "Product Catalog" },
                ].map((item, i) => (
                  <div key={i} className="glass-dark p-4 rounded-2xl flex flex-col items-center justify-center gap-3 border border-slate-800 hover:border-orbit-purple/50 transition-colors">
                    <item.icon className="w-6 h-6 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-300">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Connecting Line 1 */}
            <div className="hidden lg:block w-16 h-[2px] bg-gradient-to-r from-orbit-purple to-orbit-blue relative z-0">
              <ArrowRight className="absolute -right-3 top-1/2 -translate-y-1/2 text-orbit-blue w-5 h-5" />
            </div>

            {/* Center - AI Brain */}
            <div className="flex-1 w-full text-center z-10">
              <h3 className="text-sm font-bold text-orbit-purple uppercase tracking-widest mb-6">The AI Brain</h3>
              <div className="space-y-4">
                {/* Copilot Card */}
                <div className="glass-dark p-5 rounded-2xl border border-orbit-purple/30 text-left shadow-[0_0_30px_rgba(168,85,247,0.15)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orbit-purple/20 blur-3xl -z-10" />
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-orbit-purple/20 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-orbit-purple" />
                    </div>
                    <h4 className="font-bold text-white text-sm">AI Copilot</h4>
                  </div>
                  <div className="bg-slate-900/80 rounded-lg p-3 text-xs text-slate-300 border border-slate-800">
                    "Find our highest-value customers who haven't bought in 60 days and create a win-back email campaign."
                  </div>
                </div>

                {/* Strategist Card */}
                <div className="glass-dark p-5 rounded-2xl border border-orbit-blue/30 text-left shadow-[0_0_30px_rgba(59,130,246,0.15)] relative overflow-hidden translate-x-4">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orbit-blue/20 blur-3xl -z-10" />
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-orbit-blue/20 flex items-center justify-center">
                      <BrainCircuit className="w-4 h-4 text-orbit-blue" />
                    </div>
                    <h4 className="font-bold text-white text-sm">Strategist Engine</h4>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/80 rounded-lg p-3 border border-slate-800">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Predicted Churn</div>
                      <div className="text-rose-400 font-bold text-lg">14.2%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase">Recommendation</div>
                      <div className="text-emerald-400 font-semibold text-sm">Deploy 20% Offer</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Connecting Line 2 */}
            <div className="hidden lg:block w-16 h-[2px] bg-gradient-to-r from-orbit-blue to-teal-500 relative z-0">
              <ArrowRight className="absolute -right-3 top-1/2 -translate-y-1/2 text-teal-500 w-5 h-5" />
            </div>

            {/* Right - Engagement */}
            <div className="flex-1 w-full text-center z-10">
              <h3 className="text-sm font-bold text-teal-400 uppercase tracking-widest mb-6">Execution & Analytics</h3>
              <div className="space-y-4">
                <div className="glass-dark p-4 rounded-2xl border border-slate-800 flex items-center gap-4 hover:border-teal-500/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-teal-400">
                    <FileSearch className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] font-bold text-slate-500 tracking-wider">NATURAL LANGUAGE</div>
                    <div className="font-semibold text-white">Smart Segments</div>
                  </div>
                </div>

                <div className="glass-dark p-4 rounded-2xl border border-slate-800 flex items-center gap-4 hover:border-orbit-blue/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-orbit-blue">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] font-bold text-slate-500 tracking-wider">OMNICHANNEL</div>
                    <div className="font-semibold text-white">Automated Campaigns</div>
                  </div>
                </div>

                <div className="glass-dark p-4 rounded-2xl border border-slate-800 flex items-center gap-4 hover:border-fuchsia-500/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-fuchsia-500">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] font-bold text-slate-500 tracking-wider">REAL-TIME</div>
                    <div className="font-semibold text-white">Live Tracking & Reports</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Holistic Platform Section */}
      <section id="holistic-platform" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Everything You Need In One Holistic Platform</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: CRM */}
            <div className="glass-dark rounded-3xl border border-slate-800 overflow-hidden flex flex-col group hover:border-orbit-blue/50 transition-colors relative">
              <div className="p-8 pb-0 flex-1">
                <div className="inline-block px-3 py-1 rounded-full bg-orbit-blue/10 text-orbit-blue text-xs font-bold tracking-widest mb-6">CRM</div>
                <h3 className="text-2xl font-bold text-white mb-4 leading-snug">
                  Engage customers with personalised communications across multi-channels
                </h3>
                <Link href="#features" className="text-orbit-blue text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                  Learn More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="p-8 pt-10 relative h-64">
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-2xl relative z-10 translate-y-4 group-hover:-translate-y-2 transition-transform duration-500">
                  <div className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Choose the channel</div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="glass-dark border border-slate-700 rounded-lg flex flex-col items-center justify-center p-3 gap-2">
                      <MessageCircle className="w-5 h-5 text-green-400" />
                      <span className="text-[9px] text-slate-300">WhatsApp</span>
                    </div>
                    <div className="glass-dark border border-orbit-blue rounded-lg flex flex-col items-center justify-center p-3 gap-2 relative bg-orbit-blue/10">
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-orbit-blue rounded-full border-2 border-slate-900"></div>
                      <Mail className="w-5 h-5 text-white" />
                      <span className="text-[9px] text-white font-bold">Email</span>
                    </div>
                    <div className="glass-dark border border-slate-700 rounded-lg flex flex-col items-center justify-center p-3 gap-2">
                      <Smartphone className="w-5 h-5 text-slate-400" />
                      <span className="text-[9px] text-slate-300">SMS</span>
                    </div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[10px] text-slate-400 leading-relaxed shadow-inner">
                    <strong className="text-white block mb-1">Hey first_name!</strong>
                    Did you like your last purchase of <span className="bg-orbit-blue/20 text-orbit-blue px-1 rounded">last_product</span>? Then we bet you'll love this too!
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-orbit-blue/20 to-transparent blur-2xl -z-10" />
              </div>
            </div>

            {/* Card 2: LOYALTY */}
            <div className="glass-dark rounded-3xl border border-slate-800 overflow-hidden flex flex-col group hover:border-orbit-purple/50 transition-colors relative">
              <div className="p-8 pb-0 flex-1">
                <div className="inline-block px-3 py-1 rounded-full bg-orbit-purple/10 text-orbit-purple text-xs font-bold tracking-widest mb-6">LOYALTY</div>
                <h3 className="text-2xl font-bold text-white mb-4 leading-snug">
                  Delight your most valuable customers with autonomous AI-driven retention
                </h3>
                <Link href="#features" className="text-orbit-purple text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                  Learn More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="p-8 pt-10 relative h-64">
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-2xl relative z-10 translate-y-4 group-hover:-translate-y-2 transition-transform duration-500">
                  <div className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">AI Loyalty Triggers</div>
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-center text-[10px] border-b border-slate-800 pb-2">
                      <span className="text-slate-300">Top 5% Spenders</span>
                      <span className="text-orbit-purple font-bold">Upgrade to VIP</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] border-b border-slate-800 pb-2">
                      <span className="text-slate-300">High Churn Risk</span>
                      <span className="text-orbit-purple font-bold">Send 20% Offer</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-300">Missed 2nd Purchase</span>
                      <span className="text-orbit-purple font-bold">Nudge Campaign</span>
                    </div>
                  </div>
                  
                  {/* Floating Notification */}
                  <div className="absolute -bottom-6 -right-4 bg-slate-800 border border-slate-700 p-3 rounded-xl shadow-2xl flex gap-3 items-center transform rotate-3 w-52">
                    <div className="w-8 h-8 rounded-full bg-orbit-purple/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-orbit-purple" />
                    </div>
                    <div className="text-[9px] leading-tight text-slate-300">
                      <strong className="text-white block">AI Copilot</strong>
                      Identified 45 new VIPs and sent welcome rewards automatically!
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-orbit-purple/20 to-transparent blur-2xl -z-10" />
              </div>
            </div>

            {/* Card 3: OFFERS */}
            <div className="glass-dark rounded-3xl border border-slate-800 overflow-hidden flex flex-col group hover:border-teal-500/50 transition-colors relative">
              <div className="p-8 pb-0 flex-1">
                <div className="inline-block px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold tracking-widest mb-6">OFFERS</div>
                <h3 className="text-2xl font-bold text-white mb-4 leading-snug">
                  Acquire & retain customers with autonomous offers tailored to their behaviors
                </h3>
                <Link href="#features" className="text-teal-400 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                  Learn More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="p-8 pt-10 relative h-64">
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-2xl relative z-10 translate-y-4 group-hover:-translate-y-2 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-4">
                    <LayoutDashboard className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-bold text-slate-300">Offer Dashboard</span>
                  </div>
                  <div className="space-y-2 mb-8">
                    <div className="grid grid-cols-3 text-[8px] text-slate-500 uppercase tracking-widest mb-1">
                      <span>Code</span>
                      <span>Audience</span>
                      <span className="text-right">Status</span>
                    </div>
                    <div className="grid grid-cols-3 text-[10px] items-center bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="font-mono text-teal-400">FB20</span>
                      <span className="text-slate-300 truncate pr-2">Ad Campaign</span>
                      <span className="text-right text-emerald-400 font-bold">ACTIVE</span>
                    </div>
                    <div className="grid grid-cols-3 text-[10px] items-center bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="font-mono text-teal-400">WIN15</span>
                      <span className="text-slate-300 truncate pr-2">Win-back Flow</span>
                      <span className="text-right text-emerald-400 font-bold">ACTIVE</span>
                    </div>
                  </div>
                  
                  {/* Floating Notification */}
                  <div className="absolute -bottom-6 -left-4 bg-slate-800 border border-slate-700 p-3 rounded-xl shadow-2xl flex gap-3 items-center transform -rotate-2 w-56">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                      <UserCircle className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="text-[9px] leading-tight text-slate-300">
                      <strong className="text-orbit-blue text-xs block mb-0.5">Welcome William!</strong>
                      Here is your $10 Welcome discount code: <span className="text-white font-mono bg-slate-900 px-1 rounded">WILL10</span>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-teal-500/20 to-transparent blur-2xl -z-10" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Customer Feedback Marquee */}
      <section className="py-24 relative z-10 overflow-hidden border-t border-white/5 bg-[#030712]">
        <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Loved by Innovators</h2>
          <p className="text-slate-400">See what our users are saying about the AI engine.</p>
        </div>

        {/* Inline style for guaranteed animation without needing to restart tailwind */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes slide-train {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-train {
            animation: slide-train 40s linear infinite;
            display: flex;
            width: max-content;
          }
          .animate-train:hover {
            animation-play-state: paused;
          }
        `}} />

        {/* Marquee Container */}
        <div className="relative flex overflow-x-hidden group">
          <div className="animate-train whitespace-nowrap items-stretch">
            {/* Render two identical sets of reviews so translating by -50% creates a seamless loop */}
            {[0, 1].map((setIndex) => (
              <div key={setIndex} className="flex gap-6 items-stretch shrink-0 pr-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-6 items-stretch shrink-0">
                    {/* Review 1 */}
                    <div className="glass-dark p-6 rounded-3xl border border-slate-800 w-[450px] flex-shrink-0 flex flex-col whitespace-normal hover:border-orbit-blue/30 transition-colors">
                      <div className="flex gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed mb-6 flex-1">
                        "Amazing! A truly commendable AI-driven CRM platform that I recently came across. The way it leverages AI to streamline customer interactions, personalize communication, and optimize engagement across multiple channels is genuinely impressive. Congratulations to the developer team for building such an innovative and impactful platform!"
                      </p>
                      <div className="flex items-center gap-3 pt-4 border-t border-slate-800/50">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orbit-purple to-orbit-blue flex items-center justify-center text-white font-bold shadow-lg">
                          M
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-sm">Mega Varshan</h4>
                          <p className="text-xs text-slate-500">Founder & CTO, Foresight-X Research Labs</p>
                        </div>
                      </div>
                    </div>

                    {/* Review 2 */}
                    <div className="glass-dark p-6 rounded-3xl border border-slate-800 w-[450px] flex-shrink-0 flex flex-col whitespace-normal hover:border-orbit-purple/30 transition-colors">
                      <div className="flex gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed mb-6 flex-1">
                        "Helps and makes our jobs easier to run campaigns."
                      </p>
                      <div className="flex items-center gap-3 pt-4 border-t border-slate-800/50">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-lg">
                          H
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-sm">H.Divyan</h4>
                          <p className="text-xs text-slate-500">Student, SRM ACM SIGAPP</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Gradient Fades for edges */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#030712] to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#030712] to-transparent pointer-events-none" />
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20 px-6 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-around items-center gap-12 text-center">
          <div>
            <div className="text-4xl font-bold text-white mb-2">40%</div>
            <div className="text-slate-400">Average Revenue Uplift</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">10x</div>
            <div className="text-slate-400">Faster Campaign Creation</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">99.9%</div>
            <div className="text-slate-400">Platform Uptime</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-8">
          <div className="flex flex-col items-center md:items-start justify-self-center md:justify-self-start">
            <img 
              src="https://cdn.prod.website-files.com/620353a026ae70e21288308a/69e0a8442fde5f7cc3b2d3c6_newlogoxeno-blue11.png" 
              alt="Xeno Logo" 
              className="h-5 w-auto object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" 
            />
            <div className="flex items-center mt-0.5 ml-10 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
              <span className="text-slate-400 font-medium text-xs tracking-wide">mini CRM</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-4 justify-self-center">
            <div className="flex items-center justify-center gap-4">
              <a href="tel:+917010313612" className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-all">
                <Phone className="w-4 h-4" />
              </a>
              <a href="mailto:nandhakumar0242@gmail.com" className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all">
                <Mail className="w-4 h-4" />
              </a>
              <Link href="https://www.linkedin.com/in/nandha-kumar-k07" target="_blank" className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-orbit-blue hover:bg-slate-800 transition-all">
                <Linkedin className="w-4 h-4" />
              </Link>
              <Link href="https://www.instagram.com/nxndhuuuuuh?utm_source=qr&igsh=d3ExOTd1NHBhNm5i" target="_blank" className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-orbit-purple hover:bg-slate-800 transition-all">
                <Instagram className="w-4 h-4" />
              </Link>
            </div>
            
            <Link 
              href="/Xeno_Resume_NK.pdf" 
              target="_blank" 
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full bg-slate-800/50 text-slate-300 hover:text-white hover:bg-orbit-purple/20 border border-slate-700/50 hover:border-orbit-purple/50 transition-all"
            >
              <FileText className="w-4 h-4" />
              Resume
            </Link>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2 text-sm text-slate-400 justify-self-center md:justify-self-end text-center md:text-right">
            <a href="tel:+917010313612" className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone className="w-4 h-4" />
              +91 7010313612
            </a>
            <a href="mailto:nandhakumar0242@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail className="w-4 h-4" />
              nandhakumar0242@gmail.com
            </a>
            <div className="mt-2 pt-3 flex flex-col items-center md:items-end gap-0.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-400">Nandha Kumar K</span>
              <span>RA2311027010131</span>
              <span>CSE w/s in Big Data Analytics</span>
              <a href="mailto:nk8291@srmist.edu.in" className="hover:text-slate-300 transition-colors">
                nk8291@srmist.edu.in
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
