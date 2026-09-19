"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Users, AlertTriangle, CheckCircle2, Tag, 
  ClipboardList, Sparkles, Clock, CreditCard, ChevronRight, 
  ArrowRight, Code, PenTool, Palette, Layout, ShoppingBag, 
  Store, Smartphone, Search, Megaphone, MessageCircle, 
  Video, MonitorPlay, FileSignature, Edit3, Hexagon, 
  Target, Bot, Zap, BarChart3, Database, Presentation, 
  Building2, Home, Box, Globe, Headset, Briefcase, 
  Table, Brush, Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

const STEPS = [
  { icon: FileText, label: "Requirements", sublabel: "Analyzing scope...", bgColor: "bg-blue-50", color: "text-blue-600" },
  { icon: Users, label: "Client", sublabel: "Checking history...", bgColor: "bg-slate-100", color: "text-slate-600" },
  { icon: AlertTriangle, label: "Risk", sublabel: "Assessing risks...", bgColor: "bg-red-50", color: "text-red-600" },
  { icon: CheckCircle2, label: "Match", sublabel: "Comparing skills...", bgColor: "bg-green-50", color: "text-green-600" },
  { icon: Tag, label: "Pricing", sublabel: "Estimating range...", bgColor: "bg-purple-50", color: "text-purple-600" },
  { icon: ClipboardList, label: "Proposal", sublabel: "Generating draft...", bgColor: "bg-orange-50", color: "text-orange-600" },
];

const PROJECTS = [
  {
    title: "Build a modern business website for a growing brand",
    category: "Web Development",
    icon: Code,
    posted: "2 days ago",
    budget: "$800 – $1,500",
    proposals: "24",
    insight: "This project aligns well with your web development experience and portfolio. The scope is clear, but the timeline should be clarified before applying.",
    score: "82%",
    risk: "Low",
    quote: "$900 – $1.4K",
    rec: "Good Match",
    recColor: "text-green-700 bg-green-50 border-green-200/50",
    recDot: "bg-green-600"
  },
  {
    title: "Design a clean mobile app experience for a fintech startup",
    category: "UI/UX Design",
    icon: PenTool,
    posted: "1 day ago",
    budget: "$1,000 – $2,000",
    proposals: "31",
    insight: "Your product-design experience matches the project well. The client has a clear feature list, but a few UX requirements need clarification.",
    score: "88%",
    risk: "Medium",
    quote: "$1.2K – $1.8K",
    rec: "Good Match",
    recColor: "text-green-700 bg-green-50 border-green-200/50",
    recDot: "bg-green-600"
  },
  {
    title: "Create a premium brand identity for a new fashion label",
    category: "Graphic Design",
    icon: Palette,
    posted: "3 days ago",
    budget: "$600 – $1,200",
    proposals: "18",
    insight: "Your portfolio contains relevant branding work. The budget is reasonable, although the number of requested brand assets should be confirmed.",
    score: "79%",
    risk: "Low",
    quote: "$700 – $1.1K",
    rec: "Good Match",
    recColor: "text-green-700 bg-green-50 border-green-200/50",
    recDot: "bg-green-600"
  },
  {
    title: "Redesign and optimize an existing WordPress website",
    category: "WordPress",
    icon: Layout,
    posted: "5 hours ago",
    budget: "$400 – $900",
    proposals: "45",
    insight: "High competition on this post. The client mentions performance issues, so emphasizing your technical optimization skills will help you stand out.",
    score: "71%",
    risk: "Medium",
    quote: "$600 – $800",
    rec: "Maybe",
    recColor: "text-yellow-700 bg-yellow-50 border-yellow-200/50",
    recDot: "bg-yellow-600"
  },
  {
    title: "Build a conversion-focused Shopify store for a clothing brand",
    category: "Shopify",
    icon: ShoppingBag,
    posted: "Just now",
    budget: "$1,500 – $3,000",
    proposals: "5",
    insight: "Excellent opportunity. The client has a high budget and clear requirements. Apply quickly before proposal volume increases.",
    score: "94%",
    risk: "Low",
    quote: "$2.0K – $2.8K",
    rec: "Good Match",
    recColor: "text-green-700 bg-green-50 border-green-200/50",
    recDot: "bg-green-600"
  },
  {
    title: "Develop an online store for a premium skincare business",
    category: "E-commerce",
    icon: Store,
    posted: "2 days ago",
    budget: "$2,000 – $4,000",
    proposals: "22",
    insight: "The scope is slightly vague regarding payment gateways. Needs clarification, but the budget strongly justifies a discovery call.",
    score: "85%",
    risk: "Medium",
    quote: "$2.5K – $3.5K",
    rec: "Review Needed",
    recColor: "text-orange-700 bg-orange-50 border-orange-200/50",
    recDot: "bg-orange-600"
  },
  {
    title: "Build an iOS and Android app for a local services platform",
    category: "Mobile Development",
    icon: Smartphone,
    posted: "1 week ago",
    budget: "$5,000+",
    proposals: "50+",
    insight: "Your React Native experience is a perfect fit, but risk is high due to the large scope and lack of detailed specs.",
    score: "65%",
    risk: "High",
    quote: "$6.0K+",
    rec: "Review Needed",
    recColor: "text-orange-700 bg-orange-50 border-orange-200/50",
    recDot: "bg-orange-600"
  },
  {
    title: "Improve organic traffic and rankings for a SaaS website",
    category: "SEO",
    icon: Search,
    posted: "yesterday",
    budget: "$500 – $1,500",
    proposals: "42",
    insight: "The project fits your SEO experience, but expected traffic growth and the current site authority should be clarified.",
    score: "74%",
    risk: "Medium",
    quote: "$700 – $1.2K",
    rec: "Maybe",
    recColor: "text-yellow-700 bg-yellow-50 border-yellow-200/50",
    recDot: "bg-yellow-600"
  },
  {
    title: "Manage Meta and Google Ads for an e-commerce brand",
    category: "Digital Marketing",
    icon: Megaphone,
    posted: "3 hours ago",
    budget: "$1,000/mo",
    proposals: "12",
    insight: "Retainer opportunity. The client has an established ad spend history. A strong case study from your portfolio will likely win this.",
    score: "89%",
    risk: "Low",
    quote: "$1,000/mo",
    rec: "Good Match",
    recColor: "text-green-700 bg-green-50 border-green-200/50",
    recDot: "bg-green-600"
  },
  {
    title: "Create and manage Instagram content for a personal brand",
    category: "Social Media",
    icon: MessageCircle,
    posted: "1 day ago",
    budget: "$400 – $600/mo",
    proposals: "55",
    insight: "Extremely high competition and budget is slightly below your usual rate. Consider passing unless you have a highly relevant template.",
    score: "55%",
    risk: "Low",
    quote: "$600/mo",
    rec: "Maybe",
    recColor: "text-yellow-700 bg-yellow-50 border-yellow-200/50",
    recDot: "bg-yellow-600"
  },
  {
    title: "Edit short-form videos for a growing YouTube channel",
    category: "Video Editing",
    icon: Video,
    posted: "4 hours ago",
    budget: "$300 – $800",
    proposals: "16",
    insight: "The workload appears manageable and aligns with your editing experience. Confirm the expected number of videos per week.",
    score: "91%",
    risk: "Low",
    quote: "$400 – $700",
    rec: "Good Match",
    recColor: "text-green-700 bg-green-50 border-green-200/50",
    recDot: "bg-green-600"
  },
  {
    title: "Create animated product videos for a SaaS startup",
    category: "Motion Design",
    icon: MonitorPlay,
    posted: "6 hours ago",
    budget: "$1,200 – $2,500",
    proposals: "8",
    insight: "Client is well-funded but lacks a clear storyboard. You will need to factor in concept development time into your quote.",
    score: "78%",
    risk: "Medium",
    quote: "$1.8K – $2.5K",
    rec: "Review Needed",
    recColor: "text-orange-700 bg-orange-50 border-orange-200/50",
    recDot: "bg-orange-600"
  },
  {
    title: "Write SEO-focused articles for a technology company",
    category: "Content Writing",
    icon: FileSignature,
    posted: "1 day ago",
    budget: "$100/article",
    proposals: "29",
    insight: "Consistent ongoing work. The technical requirements match your background perfectly. Recommend providing a direct writing sample.",
    score: "85%",
    risk: "Low",
    quote: "$150/article",
    rec: "Good Match",
    recColor: "text-green-700 bg-green-50 border-green-200/50",
    recDot: "bg-green-600"
  },
  {
    title: "Write landing-page copy for a new SaaS product",
    category: "Copywriting",
    icon: Edit3,
    posted: "3 days ago",
    budget: "$500 – $1,000",
    proposals: "14",
    insight: "Client has a low hire rate (30%), which is a slight red flag. Ensure milestone payments are strictly defined before starting.",
    score: "62%",
    risk: "High",
    quote: "$800",
    rec: "Review Needed",
    recColor: "text-orange-700 bg-orange-50 border-orange-200/50",
    recDot: "bg-orange-600"
  },
  {
    title: "Design a memorable logo for a new food brand",
    category: "Logo Design",
    icon: Hexagon,
    posted: "2 hours ago",
    budget: "$300 – $600",
    proposals: "48",
    insight: "Standard logo package request. High proposal volume, so apply quickly with a highly tailored portfolio link.",
    score: "75%",
    risk: "Low",
    quote: "$500",
    rec: "Maybe",
    recColor: "text-yellow-700 bg-yellow-50 border-yellow-200/50",
    recDot: "bg-yellow-600"
  },
  {
    title: "Develop a complete brand strategy for a startup",
    category: "Brand Strategy",
    icon: Target,
    posted: "12 hours ago",
    budget: "$2,000 – $4,000",
    proposals: "9",
    insight: "Low competition. The client has clearly defined their target audience but needs positioning help. This is a highly profitable match.",
    score: "92%",
    risk: "Low",
    quote: "$3.5K",
    rec: "Good Match",
    recColor: "text-green-700 bg-green-50 border-green-200/50",
    recDot: "bg-green-600"
  },
  {
    title: "Build an AI assistant for a customer support platform",
    category: "AI Development",
    icon: Bot,
    posted: "Just now",
    budget: "$3,000 – $6,000",
    proposals: "3",
    insight: "Emerging category with low proposals. The OpenAI integration requirements match your recent projects exactly.",
    score: "96%",
    risk: "Low",
    quote: "$4.5K – $5.5K",
    rec: "Good Match",
    recColor: "text-green-700 bg-green-50 border-green-200/50",
    recDot: "bg-green-600"
  },
  {
    title: "Automate business workflows using APIs and no-code tools",
    category: "Automation",
    icon: Zap,
    posted: "1 day ago",
    budget: "$500 – $1,200",
    proposals: "17",
    insight: "Make/Zapier scope is straightforward. Client communication seems disorganized based on the brief. Pad your quote for revision time.",
    score: "68%",
    risk: "Medium",
    quote: "$900 – $1.2K",
    rec: "Review Needed",
    recColor: "text-orange-700 bg-orange-50 border-orange-200/50",
    recDot: "bg-orange-600"
  },
  {
    title: "Analyze sales data and create an interactive dashboard",
    category: "Data Analysis",
    icon: BarChart3,
    posted: "3 days ago",
    budget: "$1,000 – $2,500",
    proposals: "11",
    insight: "Client expects a Tableau/PowerBI deliverable. Data cleanliness is unknown, which introduces scope creep risk.",
    score: "73%",
    risk: "High",
    quote: "$2.0K",
    rec: "Maybe",
    recColor: "text-yellow-700 bg-yellow-50 border-yellow-200/50",
    recDot: "bg-yellow-600"
  },
  {
    title: "Organize and clean a large business dataset",
    category: "Data Entry",
    icon: Database,
    posted: "5 hours ago",
    budget: "$200 – $400",
    proposals: "60+",
    insight: "Very high competition and low budget relative to the required hours. Suggest passing on this opportunity.",
    score: "45%",
    risk: "Low",
    quote: "$400",
    rec: "Review Needed",
    recColor: "text-orange-700 bg-orange-50 border-orange-200/50",
    recDot: "bg-orange-600"
  },
  {
    title: "Create a professional investor pitch deck",
    category: "Presentation Design",
    icon: Presentation,
    posted: "1 day ago",
    budget: "$800 – $1,500",
    proposals: "21",
    insight: "Client needs both copy refinement and design. If you offer copy services, bundle it for a higher quote.",
    score: "81%",
    risk: "Low",
    quote: "$1.2K – $1.5K",
    rec: "Good Match",
    recColor: "text-green-700 bg-green-50 border-green-200/50",
    recDot: "bg-green-600"
  },
  {
    title: "Create architectural plans and 3D visualizations",
    category: "Architecture",
    icon: Building2,
    posted: "4 days ago",
    budget: "$2,000 – $5,000",
    proposals: "14",
    insight: "Requires specialized software expertise mentioned in your profile. Budget is healthy and client has 5-star history.",
    score: "88%",
    risk: "Low",
    quote: "$3.5K – $4.5K",
    rec: "Good Match",
    recColor: "text-green-700 bg-green-50 border-green-200/50",
    recDot: "bg-green-600"
  },
  {
    title: "Design a modern interior concept for a commercial space",
    category: "Interior Design",
    icon: Home,
    posted: "2 days ago",
    budget: "$1,500 – $3,000",
    proposals: "25",
    insight: "The brief lacks square footage details. You must ask for floor plans before finalizing your quote.",
    score: "70%",
    risk: "Medium",
    quote: "$2.5K",
    rec: "Maybe",
    recColor: "text-yellow-700 bg-yellow-50 border-yellow-200/50",
    recDot: "bg-yellow-600"
  },
  {
    title: "Design a physical product concept and 3D renders",
    category: "Product Design",
    icon: Box,
    posted: "8 hours ago",
    budget: "$1,000 – $2,500",
    proposals: "12",
    insight: "Client is an established brand looking for fresh concepts. High potential for follow-up work.",
    score: "86%",
    risk: "Low",
    quote: "$1.8K – $2.2K",
    rec: "Good Match",
    recColor: "text-green-700 bg-green-50 border-green-200/50",
    recDot: "bg-green-600"
  },
  {
    title: "Translate and localize website content for multiple markets",
    category: "Translation",
    icon: Globe,
    posted: "1 day ago",
    budget: "$500 – $1,000",
    proposals: "38",
    insight: "Standard translation work. Competition is high, so highlight your localization and cultural adaptation skills.",
    score: "76%",
    risk: "Low",
    quote: "$800",
    rec: "Maybe",
    recColor: "text-yellow-700 bg-yellow-50 border-yellow-200/50",
    recDot: "bg-yellow-600"
  },
  {
    title: "Manage research, scheduling, and daily business tasks",
    category: "Virtual Assistant",
    icon: Headset,
    posted: "12 hours ago",
    budget: "$15 – $25/hr",
    proposals: "50+",
    insight: "Long-term hourly contract. Budget aligns with your rate, but time-zone overlap requirements need checking.",
    score: "80%",
    risk: "Low",
    quote: "$25/hr",
    rec: "Good Match",
    recColor: "text-green-700 bg-green-50 border-green-200/50",
    recDot: "bg-green-600"
  },
  {
    title: "Develop a growth strategy for an early-stage startup",
    category: "Business Consulting",
    icon: Briefcase,
    posted: "2 days ago",
    budget: "$2,000 – $5,000",
    proposals: "19",
    insight: "The client lacks clear KPIs. Highly recommended to structure this as a paid discovery phase first.",
    score: "72%",
    risk: "High",
    quote: "$2.5K",
    rec: "Review Needed",
    recColor: "text-orange-700 bg-orange-50 border-orange-200/50",
    recDot: "bg-orange-600"
  },
  {
    title: "Build an automated reporting system in Excel",
    category: "Excel / Automation",
    icon: Table,
    posted: "1 day ago",
    budget: "$300 – $600",
    proposals: "33",
    insight: "Scope is clearly defined and matches your VBA/Macro expertise. A straightforward win if you apply quickly.",
    score: "89%",
    risk: "Low",
    quote: "$450 – $550",
    rec: "Good Match",
    recColor: "text-green-700 bg-green-50 border-green-200/50",
    recDot: "bg-green-600"
  },
  {
    title: "Create custom illustrations for a children's education brand",
    category: "Illustration",
    icon: Brush,
    posted: "4 days ago",
    budget: "$1,000 – $2,000",
    proposals: "27",
    insight: "Client references a style that perfectly matches your Behance portfolio. Highly recommended to apply.",
    score: "93%",
    risk: "Low",
    quote: "$1.5K – $1.8K",
    rec: "Good Match",
    recColor: "text-green-700 bg-green-50 border-green-200/50",
    recDot: "bg-green-600"
  },
  {
    title: "Create a promotional video for a new product launch",
    category: "Video Production",
    icon: Camera,
    posted: "6 hours ago",
    budget: "$1,500 – $3,500",
    proposals: "15",
    insight: "Budget is great, but the brief doesn't specify if they are providing the raw footage. Needs clarification.",
    score: "77%",
    risk: "Medium",
    quote: "$2.5K",
    rec: "Maybe",
    recColor: "text-yellow-700 bg-yellow-50 border-yellow-200/50",
    recDot: "bg-yellow-600"
  }
];

export function AnalysisCardMockup() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { currency } = useUserPreferences();
  const currSymbol = currency === "INR" ? "₹" : "$";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PROJECTS.length);
    }, 4500); // 4.5 seconds
    return () => clearInterval(timer);
  }, []);

  const project = PROJECTS[currentIndex];
  const CategoryIcon = project.icon;

  const animationVariants = {
    initial: { opacity: 0, scale: 0.99 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5, 
        ease: "easeOut",
        staggerChildren: 0.05
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.99,
      transition: { duration: 0.35, ease: "easeIn" } 
    }
  };

  const childVariants = {
    initial: { opacity: 0, y: 5 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-xl border border-border/60 bg-white shadow-2xl overflow-hidden flex flex-col h-auto md:h-[460px]">
      {/* Mac Header - Stationary */}
      <div className="bg-slate-50/80 border-b border-border/50 px-4 py-2.5 flex items-center gap-2 shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
      </div>

      <div className="relative flex-1 bg-white min-h-[500px] md:min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            variants={animationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col gap-6 md:gap-7 absolute inset-0 p-4 sm:p-5 md:p-6 overflow-y-auto md:overflow-visible no-scrollbar"
          >
            {/* Top Header */}
            <motion.div variants={childVariants} className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-0">
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-primary font-medium bg-primary/5 px-2.5 py-1 rounded-md w-fit text-xs border border-primary/10">
                  <CategoryIcon className="w-3.5 h-3.5" />
                  {project.category}
                </div>
                <h3 className="text-lg md:text-xl font-bold tracking-tight text-foreground line-clamp-2 md:line-clamp-1 leading-snug">{project.title}</h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] md:text-[13px] text-muted-foreground font-medium">
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {project.posted}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> {project.budget.replace(/\$/g, currSymbol)}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {project.proposals} proposals</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0 w-full md:w-auto">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${project.recColor}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${project.recDot}`} />
                  {project.rec}
                </div>
                <Button size="sm" className="rounded-full text-xs font-medium shadow-sm h-8 px-3 shrink-0 ml-auto md:ml-0">
                  View Full Analysis <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </motion.div>

            {/* Pipeline Steps */}
            <motion.div variants={childVariants} className="flex items-center md:justify-between px-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 gap-4 md:gap-0 no-scrollbar">
              {STEPS.map((step, index) => (
                <div key={step.label} className="flex items-center gap-2 md:gap-3 shrink-0 md:w-full md:shrink">
                  <div className="flex flex-col items-center gap-2.5 w-24 md:w-full">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center ${step.bgColor} ${step.color}`}>
                      <step.icon className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-[13px] md:text-sm text-foreground">{step.label}</div>
                      <div className="text-[11px] md:text-[12px] text-muted-foreground mt-0.5 hidden md:block">{step.sublabel}</div>
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground/30 -mt-6 md:-mt-8 shrink-0" />
                  )}
                </div>
              ))}
            </motion.div>

            {/* AI Insight Footer */}
            <motion.div variants={childVariants} className="rounded-xl border border-border/60 bg-slate-50/50 p-4 md:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 lg:gap-6 mt-2 md:mt-0">
              <div className="flex items-start gap-3.5 w-full lg:flex-1">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <CategoryIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <div className="font-bold text-foreground text-[14px] md:text-[15px]">AI Insight</div>
                  <div className="text-[12px] md:text-[13px] text-muted-foreground leading-relaxed max-w-lg">
                    {project.insight}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex items-center gap-4 lg:gap-8 lg:pl-8 border-t lg:border-t-0 lg:border-l border-border/60 shrink-0 w-full lg:w-auto pt-4 lg:pt-0">
                <div className="flex flex-col gap-1">
                  <div className="font-bold text-[15px] md:text-lg text-foreground">{project.score}</div>
                  <div className="text-[11px] md:text-[12px] text-muted-foreground font-medium">Match Score</div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className={`font-bold text-[15px] md:text-lg ${project.risk === 'Low' ? 'text-green-600' : project.risk === 'Medium' ? 'text-yellow-600' : 'text-red-600'}`}>
                    {project.risk}
                  </div>
                  <div className="text-[11px] md:text-[12px] text-muted-foreground font-medium">Risk Level</div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="font-bold text-[15px] md:text-lg text-foreground">{project.quote.replace(/\$/g, currSymbol)}</div>
                  <div className="text-[11px] md:text-[12px] text-muted-foreground font-medium">Est. Value</div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className={`font-bold text-[15px] md:text-lg ${project.rec === 'Good Match' ? 'text-green-600' : project.rec === 'Maybe' ? 'text-yellow-600' : 'text-orange-600'}`}>
                    {project.rec}
                  </div>
                  <div className="text-[11px] md:text-[12px] text-muted-foreground font-medium">Rec.</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
