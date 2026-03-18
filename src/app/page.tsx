"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Battery, 
  BatteryLow, 
  BatteryMedium, 
  BatteryFull, 
  ChevronRight, 
  ArrowLeft, 
  MessageSquare, 
  BookOpen, 
  Sparkles,
  RefreshCw,
  Send,
  User,
  Coffee,
  Moon,
  Wind,
  Check,
  AlertCircle
} from 'lucide-react';
import { QuizData, SocialProfile, BoundaryScripts, Page } from '../types';
import { generateSocialProfile, generateBoundaryScripts, generateBlogPost } from '../services/gemini';

// --- Components ---

const SocialBattery = ({ level, status }: { level: number; status: string }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="w-[120px] flex flex-col items-center">
        <div className="w-[40px] h-[12px] bg-recharge-teal rounded-t-lg" />
        <div className="w-[80px] h-[160px] border-4 border-recharge-teal rounded-2xl relative p-1.5 bg-white/50 backdrop-blur-sm shadow-inner">
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: `${level}%` }}
            transition={{ duration: 1.8, ease: "circOut" }}
            className="w-full rounded-xl absolute bottom-1.5 left-0 right-0 px-1.5"
            style={{ 
              background: 'linear-gradient(to top, var(--color-recharge-amber), var(--color-recharge-gold))',
              height: `calc(${level}% - 12px)`,
              margin: '0 6px'
            }}
          />
        </div>
      </div>
      <p className="serif text-recharge-teal mt-6 font-medium text-lg italic">{status}</p>
    </div>
  );
};

const Logo = () => (
  <div className="flex items-center gap-3 group select-none">
    <motion.div 
      className="relative w-9 h-11 flex flex-col items-center"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {/* Battery Top */}
      <div className="w-4 h-1 bg-recharge-teal rounded-t-sm opacity-80" />
      
      {/* Battery Body */}
      <div className="w-8 h-10 border-2 border-recharge-teal rounded-md relative p-0.5 bg-white shadow-sm overflow-hidden">
        {/* Animated Level */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0" 
          initial={{ height: "15%", backgroundColor: "#F27D26" }}
          animate={{ 
            height: ["15%", "80%", "40%", "95%", "15%"],
            backgroundColor: ["#F27D26", "#10B981", "#FBBF24", "#10B981", "#F27D26"],
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        
        {/* Subtle Diagonal Strike (Depleted indicator) */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center opacity-10"
          animate={{ opacity: [0.05, 0.2, 0.05] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="w-full h-0.5 bg-recharge-teal rotate-45" />
        </motion.div>
      </div>
    </motion.div>
    
    {/* Brand Text */}
    <div className="flex flex-col -space-y-1">
      <span className="serif text-2xl font-semibold tracking-tight text-recharge-teal group-hover:text-recharge-amber transition-colors duration-500">
        Social
      </span>
      <span className="serif text-2xl font-light tracking-wide text-recharge-teal/80 group-hover:text-recharge-amber transition-colors duration-700">
        Exhaustion
      </span>
    </div>
  </div>
);

const Navbar = ({ currentPage, setPage }: { currentPage: Page; setPage: (p: Page) => void }) => (
  <nav className="fixed top-0 left-0 right-0 h-20 bg-recharge-paper/80 backdrop-blur-md border-b border-recharge-teal/5 z-50 flex items-center justify-between px-8">
    <div 
      className="cursor-pointer" 
      onClick={() => setPage('home')}
    >
      <Logo />
    </div>
    <div className="flex gap-8 text-sm font-medium tracking-wide uppercase">
      <button 
        onClick={() => setPage('boundary')} 
        className={`hover:text-recharge-amber transition-all duration-300 relative py-1 ${currentPage === 'boundary' ? 'text-recharge-amber' : 'text-recharge-teal/60'}`}
      >
        Boundaries
        {currentPage === 'boundary' && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-recharge-amber" />}
      </button>
      <button 
        onClick={() => setPage('blog')} 
        className={`hover:text-recharge-amber transition-all duration-300 relative py-1 ${currentPage === 'blog' ? 'text-recharge-amber' : 'text-recharge-teal/60'}`}
      >
        Library
        {currentPage === 'blog' && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-recharge-amber" />}
      </button>
    </div>
  </nav>
);

export default function Home() {
  const [page, setPage] = useState<Page>('home');
  const [mounted, setMounted] = useState(false);
  const [quizData, setQuizData] = useState<QuizData>({
    user_name: '',
    email: '',
    primary_drain: '',
    social_style: '',
    current_battery: '20%',
    recovery_preference: '',
    age_group: '18-29'
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [boundarySituation, setBoundarySituation] = useState('');

  const [scripts, setScripts] = useState<BoundaryScripts | null>(null);
  const [blogPost, setBlogPost] = useState<string>('');
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState({ a: 0, b: 0 });
  const [subscribed, setSubscribed] = useState(false);
  const [submittingPro, setSubmittingPro] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  const COMMON_SCENARIOS = [
    "A coworker wants to 'hop on a quick call' but I'm in deep focus mode.",
    "A friend invited me to a loud concert tonight, but my battery is at 5%.",
    "Family members are asking when I'm coming over for a long weekend visit.",
    "Someone is asking for 'just 15 minutes' of my time to pick my brain.",
    "I'm at a party and I need to leave early without feeling like a buzzkill.",
    "A neighbor wants to chat in the hallway but I just got home and need quiet.",
    "Group chat is blowing up and I need to mute it without being rude."
  ];

  const giveMeIdeas = () => {
    const random = COMMON_SCENARIOS[Math.floor(Math.random() * COMMON_SCENARIOS.length)];
    setBoundarySituation(random);
  };

  const sendEmail = async (to: string, subject: string, html: string) => {
    setEmailStatus(null);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send email');
      }
      setEmailStatus({ type: 'success', message: `Profile sent to ${to}` });
      return true;
    } catch (err: any) {
      console.error('Email error:', err);
      setEmailStatus({ type: 'error', message: `Failed to send email: ${err.message}` });
      return false;
    }
  };

  const handleQuizSubmit = async () => {
    setLoading(true);
    setError(null);
    setPage('result');
    try {
      const result = await generateSocialProfile(quizData);
      setProfile(result);
      
      // Update the blog post based on the new profile
      const newBlogPost = await generateBlogPost(quizData);
      setBlogPost(newBlogPost);

      if (quizData.email) {
        await sendEmail(
          quizData.email,
          `Your Social Energy Profile: ${result.type}`,
          `<h1>Hello ${quizData.user_name}</h1>
           <p>Here is your Social Energy Profile: <strong>${result.type}</strong></p>
           <p>${result.validation}</p>
           <h3>Micro-Recoveries:</h3>
           <ul>${result.microRecoveries.map(r => `<li>${r}</li>`).join('')}</ul>`
        );
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while generating your profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleBoundarySubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateBoundaryScripts(boundarySituation);
      setScripts(result);
      if (quizData.email) {
        await sendEmail(
          quizData.email,
          'Your Boundary Scripts',
          `<h3>Situation: ${boundarySituation}</h3>
           <p><strong>Gentle:</strong> ${result.gentle}</p>
           <p><strong>Direct:</strong> ${result.direct}</p>
           <p><strong>Business:</strong> ${result.business}</p>`
        );
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate boundary scripts.");
    } finally {
      setLoading(false);
    }
  };

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion({ a, b });
    setShowCaptcha(true);
  };

  const handleProSubscribe = async () => {
    if (parseInt(captchaAnswer) !== captchaQuestion.a + captchaQuestion.b) {
      alert("Incorrect CAPTCHA answer. Please try again.");
      generateCaptcha();
      return;
    }

    const email = quizData.email;
    if (!email) {
      alert("Please provide an email address first.");
      return;
    }

    setSubmittingPro(true);
    try {
      await sendEmail(
        email,
        'Welcome to the 14-Day Pro Plan',
        `<h1>Welcome to your 14-Day Pro Plan!</h1>
         <p>You will receive one email every day for the next 14 days with personalized recovery strategies.</p>
         <p>Day 1: Focus on breathing and light movement.</p>`
      );
      setSubscribed(true);
      setShowCaptcha(false);
    } catch (err) {
      alert("Failed to subscribe. Please try again.");
    } finally {
      setSubmittingPro(false);
    }
  };

  useEffect(() => {
    if (page === 'blog' && !blogPost && !selectedArticle) {
      const fetchBlog = async () => {
        const post = await generateBlogPost();
        setBlogPost(post);
      };
      fetchBlog();
    }
  }, [page, blogPost, selectedArticle]);

  const handleArticleSelect = async (topic: string) => {
    setLoading(true);
    setSelectedArticle(topic);
    setBlogPost('');
    try {
      const post = await generateBlogPost({ primary_drain: topic } as any);
      setBlogPost(post);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (p: Page) => {
    setPage(p);
    if (p !== 'blog') {
      setSelectedArticle(null);
    }
    // If navigating to home, we might want to reset other things too
    if (p === 'home') {
      setSelectedArticle(null);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen pt-16 pb-12">
      <Navbar currentPage={page} setPage={navigateTo} />
      
      <main className="max-w-4xl mx-auto px-6">
        <AnimatePresence mode="wait">
          {page === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center py-20"
            >
              <div className="mb-16">
                <SocialBattery level={30} status="Status: Critically Drained" />
              </div>
              <h1 className="serif text-6xl md:text-8xl font-light mb-8 leading-[0.9] tracking-tight">
                Your social energy is <br />
                <span className="italic text-recharge-amber">a finite resource.</span>
              </h1>
              <p className="text-xl text-recharge-teal/60 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                Social exhaustion isn&apos;t a flaw; it&apos;s a signal. We help you listen to it, 
                manage it, and find your way back to calm.
              </p>
              
              <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigateTo('quiz')}
                  className="bg-recharge-teal text-recharge-paper px-10 py-5 rounded-full font-medium hover:bg-recharge-teal/90 transition-all flex items-center gap-3 group shadow-2xl shadow-recharge-teal/20 text-lg w-full md:w-auto justify-center"
                >
                  Check Your Battery
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigateTo('boundary')}
                  className="bg-white border-2 border-recharge-teal/10 text-recharge-teal px-10 py-5 rounded-full font-medium hover:border-recharge-teal/30 transition-all flex items-center gap-3 group text-lg w-full md:w-auto justify-center"
                >
                  Set Your Boundary
                  <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigateTo('blog')}
                  className="bg-recharge-amber/10 border-2 border-recharge-amber/20 text-recharge-amber px-10 py-5 rounded-full font-medium hover:bg-recharge-amber/20 transition-all flex items-center gap-3 group text-lg w-full md:w-auto justify-center"
                >
                  Get lost in the library
                  <BookOpen className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {page === 'quiz' && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="py-16 max-w-2xl mx-auto"
            >
              <button onClick={() => setPage('home')} className="flex items-center gap-2 text-recharge-teal/40 hover:text-recharge-teal mb-10 transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                <span className="text-sm font-medium uppercase tracking-widest">Back to Home</span>
              </button>
              
              <div className="bg-white p-10 md:p-16 rounded-[2.5rem] shadow-2xl shadow-recharge-teal/5 border border-recharge-teal/5">
                <h2 className="serif text-4xl mb-10 tracking-tight">Let&apos;s check in.</h2>
                
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-widest opacity-40">What should I call you?</label>
                      <input 
                        type="text" 
                        placeholder="Your name"
                        className="w-full bg-transparent border-b-2 border-recharge-teal/10 py-4 focus:border-recharge-amber outline-none transition-all text-xl serif italic"
                        value={quizData.user_name}
                        onChange={e => setQuizData({...quizData, user_name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-widest opacity-40">Your age group</label>
                      <div className="flex gap-4">
                        {['18-29', '30+'].map(age => (
                          <button 
                            key={age}
                            onClick={() => setQuizData({...quizData, age_group: age as any})}
                            className={`flex-1 py-4 rounded-2xl border-2 transition-all text-sm font-bold ${quizData.age_group === age ? 'border-recharge-amber bg-recharge-amber/5 text-recharge-amber' : 'border-recharge-teal/5 hover:border-recharge-teal/20'}`}
                          >
                            {age}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-40">Email (Optional - to receive your profile)</label>
                    <input 
                      type="email" 
                      placeholder="you@example.com"
                      className="w-full bg-transparent border-b-2 border-recharge-teal/10 py-4 focus:border-recharge-amber outline-none transition-all text-xl serif italic"
                      value={quizData.email}
                      onChange={e => setQuizData({...quizData, email: e.target.value})}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-40">What&apos;s draining you most right now?</label>
                    <div className="grid grid-cols-1 gap-3">
                      {['Open-plan office noise', 'Back-to-back meetings', 'Small talk with strangers', 'Family obligations', 'Digital noise/Social media'].map(option => (
                        <button 
                          key={option}
                          onClick={() => setQuizData({...quizData, primary_drain: option})}
                          className={`text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${quizData.primary_drain === option ? 'border-recharge-amber bg-recharge-amber/5 text-recharge-amber' : 'border-recharge-teal/5 hover:border-recharge-teal/20'}`}
                        >
                          <span className="font-medium">{option}</span>
                          <div className={`w-2 h-2 rounded-full transition-all ${quizData.primary_drain === option ? 'bg-recharge-amber scale-125' : 'bg-recharge-teal/10'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-40">How would you describe your social style?</label>
                    <div className="grid grid-cols-1 gap-3">
                      {['Deep one-on-one sessions', 'Small, familiar groups', 'The observer in the back', 'The occasional social butterfly'].map(option => (
                        <button 
                          key={option}
                          onClick={() => setQuizData({...quizData, social_style: option})}
                          className={`text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${quizData.social_style === option ? 'border-recharge-amber bg-recharge-amber/5 text-recharge-amber' : 'border-recharge-teal/5 hover:border-recharge-teal/20'}`}
                        >
                          <span className="font-medium">{option}</span>
                          <div className={`w-2 h-2 rounded-full transition-all ${quizData.social_style === option ? 'bg-recharge-amber scale-125' : 'bg-recharge-teal/10'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-40">How does your battery feel right now?</label>
                    <div className="px-2">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="5"
                        className="w-full h-1.5 bg-recharge-teal/10 rounded-lg appearance-none cursor-pointer accent-recharge-amber"
                        value={parseInt(quizData.current_battery)}
                        onChange={e => setQuizData({...quizData, current_battery: `${e.target.value}%`})}
                      />
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-30 mt-4">
                        <span>Empty</span>
                        <span className="text-recharge-amber opacity-100 text-sm">{quizData.current_battery}</span>
                        <span>Full</span>
                      </div>
                    </div>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleQuizSubmit}
                    disabled={!quizData.user_name || !quizData.primary_drain}
                    className="w-full bg-recharge-teal text-recharge-paper py-5 rounded-2xl font-bold text-lg hover:bg-recharge-teal/90 transition-all disabled:opacity-20 disabled:cursor-not-allowed mt-6 shadow-xl shadow-recharge-teal/10"
                  >
                    Generate My Energy Profile
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {page === 'result' && (
            <motion.div 
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20"
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <div className="relative w-20 h-20 mb-10">
                    <RefreshCw className="w-full h-full text-recharge-amber animate-spin opacity-20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-recharge-amber animate-pulse" />
                    </div>
                  </div>
                  <h2 className="serif text-4xl animate-pulse tracking-tight">Generating your energy profile...</h2>
                  <p className="text-recharge-teal/40 mt-4 font-medium tracking-wide uppercase text-xs">Gemini is analyzing your patterns</p>
                </div>
              ) : error ? (
                <div className="max-w-md mx-auto text-center py-32">
                  <div className="bg-red-50 text-red-600 p-8 rounded-[2rem] border border-red-100 mb-8 shadow-sm">
                    <h3 className="serif text-2xl mb-3">Something went wrong</h3>
                    <p className="text-sm opacity-80 leading-relaxed">{error}</p>
                  </div>
                  <button 
                    onClick={() => setPage('quiz')}
                    className="text-recharge-teal font-bold uppercase tracking-widest text-xs hover:text-recharge-amber transition-colors flex items-center gap-2 mx-auto"
                  >
                    <ArrowLeft className="w-4 h-4" /> Try the quiz again
                  </button>
                </div>
              ) : profile ? (
                <div className="max-w-3xl mx-auto">
                  <div className="text-center mb-20">
                    <motion.span 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs uppercase tracking-[0.3em] text-recharge-amber font-bold mb-4 block"
                    >
                      Your Energy Signature
                    </motion.span>
                    <motion.h2 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="serif text-6xl md:text-7xl mb-8 tracking-tight"
                    >
                      {profile.type}
                    </motion.h2>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: 80 }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                      className="h-1 bg-recharge-amber/30 mx-auto rounded-full" 
                    />
                    {emailStatus && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 ${emailStatus.type === 'success' ? 'text-recharge-teal' : 'text-red-500'}`}
                      >
                        {emailStatus.type === 'success' ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {emailStatus.message}
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-20">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="prose prose-recharge prose-xl max-w-none serif italic leading-relaxed text-recharge-teal/70 text-center px-4"
                    >
                      {profile.validation.split('\n\n').map((p, i) => (
                        <p key={i} className="mb-8">{p}</p>
                      ))}
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-recharge-teal text-recharge-paper p-12 md:p-16 rounded-[3rem] shadow-2xl shadow-recharge-teal/20"
                    >
                      <h3 className="serif text-4xl mb-10 flex items-center gap-4">
                        <Coffee className="w-8 h-8 text-recharge-amber" />
                        Micro-Recoveries
                      </h3>
                      <div className="grid grid-cols-1 gap-6">
                        {profile.microRecoveries.map((recovery, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + (i * 0.1) }}
                            className="flex gap-6 items-start bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors group"
                          >
                            <span className="bg-recharge-amber text-recharge-teal w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                              {i + 1}
                            </span>
                            <p className="text-lg opacity-80 leading-relaxed">{recovery}</p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2 }}
                      className="text-center bg-recharge-amber/5 border-2 border-recharge-amber/10 p-12 md:p-16 rounded-[3rem] relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Sparkles className="w-32 h-32 text-recharge-amber" />
                      </div>
                      
                      {subscribed ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center py-8"
                        >
                          <div className="w-20 h-20 bg-recharge-teal rounded-full flex items-center justify-center mb-6 shadow-xl">
                            <Check className="w-10 h-10 text-recharge-paper" />
                          </div>
                          <h3 className="serif text-3xl mb-2">You&apos;re subscribed!</h3>
                          <p className="text-recharge-teal/60">Check your inbox for Day 1 of your Pro Plan.</p>
                        </motion.div>
                      ) : (
                        <>
                          <p className="serif text-3xl md:text-4xl mb-6 italic text-recharge-teal leading-tight">{profile.invitation}</p>
                          <p className="text-base text-recharge-teal/50 mb-10 max-w-lg mx-auto leading-relaxed">
                            Join the Pro Plan to receive automated, personalized ideas on how to avoid social exhaustion before it hits.
                          </p>
                          
                          {showCaptcha ? (
                            <div className="max-w-xs mx-auto bg-white p-8 rounded-3xl shadow-lg border border-recharge-teal/5">
                              <p className="text-sm font-bold uppercase tracking-widest opacity-40 mb-4">Confirm you&apos;re human</p>
                              <div className="text-2xl serif italic mb-6">
                                What is {captchaQuestion.a} + {captchaQuestion.b}?
                              </div>
                              <input 
                                type="number"
                                className="w-full bg-recharge-paper border-b-2 border-recharge-teal/10 py-3 focus:border-recharge-amber outline-none transition-all text-center text-xl mb-6"
                                value={captchaAnswer}
                                onChange={e => setCaptchaAnswer(e.target.value)}
                                placeholder="Answer"
                              />
                              <div className="flex gap-3">
                                <button 
                                  onClick={() => setShowCaptcha(false)}
                                  className="flex-1 py-3 rounded-xl font-bold text-sm border-2 border-recharge-teal/5 hover:border-recharge-teal/10 transition-all"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={handleProSubscribe}
                                  disabled={submittingPro || !captchaAnswer}
                                  className="flex-1 bg-recharge-teal text-recharge-paper py-3 rounded-xl font-bold text-sm hover:bg-recharge-teal/90 transition-all disabled:opacity-50"
                                >
                                  {submittingPro ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : "Confirm"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button 
                              onClick={generateCaptcha}
                              className="bg-recharge-amber text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-recharge-amber/90 transition-all shadow-xl shadow-recharge-amber/20 hover:shadow-2xl hover:-translate-y-1"
                            >
                              Start 14-Day Pro Plan
                            </button>
                          )}
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30 mt-6">No credit card required to start</p>
                        </>
                      )}
                    </motion.div>
                  </div>
                </div>
              ) : null}
            </motion.div>
          )}

          {page === 'boundary' && (
            <motion.div 
              key="boundary"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="py-16 max-w-2xl mx-auto"
            >
              <div className="text-center mb-16">
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs uppercase tracking-[0.3em] text-recharge-amber font-bold mb-4 block"
                >
                  Energy Protection
                </motion.span>
                <h2 className="serif text-5xl mb-6 tracking-tight">Boundary Builder</h2>
                <p className="text-recharge-teal/50 text-lg font-light leading-relaxed">Protect your energy with kind but firm scripts.</p>
              </div>

              <div className="bg-white p-10 md:p-16 rounded-[2.5rem] shadow-2xl shadow-recharge-teal/5 border border-recharge-teal/5 mb-12">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="block text-xs font-bold uppercase tracking-widest opacity-40">What&apos;s the situation?</label>
                      <button 
                        onClick={giveMeIdeas}
                        className="text-[10px] font-bold uppercase tracking-widest text-recharge-amber hover:text-recharge-amber/80 transition-colors flex items-center gap-1.5 group"
                      >
                        <Sparkles className="w-3 h-3 group-hover:rotate-12 transition-transform" />
                        I&apos;m stuck, help me out
                      </button>
                    </div>
                    <textarea 
                      placeholder="e.g., A friend wants me to go to a loud concert tonight, but I&apos;m empty."
                      className="w-full bg-recharge-paper border-2 border-recharge-teal/5 rounded-[1.5rem] p-6 h-40 focus:border-recharge-amber outline-none transition-all resize-none text-lg serif italic leading-relaxed"
                      value={boundarySituation}
                      onChange={e => setBoundarySituation(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-40">Email (Optional - to receive your scripts)</label>
                    <input 
                      type="email" 
                      placeholder="you@example.com"
                      className="w-full bg-transparent border-b-2 border-recharge-teal/10 py-4 focus:border-recharge-amber outline-none transition-all text-xl serif italic"
                      value={quizData.email}
                      onChange={e => setQuizData({...quizData, email: e.target.value})}
                    />
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleBoundarySubmit}
                    disabled={!boundarySituation || loading}
                    className="w-full bg-recharge-teal text-recharge-paper py-5 rounded-2xl font-bold text-lg hover:bg-recharge-teal/90 transition-all flex items-center justify-center gap-3 shadow-xl shadow-recharge-teal/10 disabled:opacity-20"
                  >
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    Generate Scripts
                  </motion.button>
                </div>

                {emailStatus && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 ${emailStatus.type === 'success' ? 'text-recharge-teal' : 'text-red-500'}`}
                  >
                    {emailStatus.type === 'success' ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {emailStatus.message}
                  </motion.div>
                )}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-100 font-medium"
                  >
                    {error}
                  </motion.div>
                )}
              </div>

              {scripts && (
                <div className="grid grid-cols-1 gap-8">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-10 rounded-[2rem] border border-recharge-teal/5 shadow-lg relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-recharge-amber opacity-30" />
                    <div className="flex items-center gap-3 text-recharge-amber mb-6">
                      <Wind className="w-5 h-5" />
                      <span className="text-xs font-black uppercase tracking-[0.2em]">The Gentle Script</span>
                    </div>
                    <p className="text-xl serif italic text-recharge-teal/80 leading-relaxed">&quot;{scripts.gentle}&quot;</p>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-10 rounded-[2rem] border border-recharge-teal/5 shadow-lg relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-recharge-teal opacity-30" />
                    <div className="flex items-center gap-3 text-recharge-teal mb-6">
                      <Moon className="w-5 h-5" />
                      <span className="text-xs font-black uppercase tracking-[0.2em]">The Direct Script</span>
                    </div>
                    <p className="text-xl serif italic text-recharge-teal/80 leading-relaxed">&quot;{scripts.direct}&quot;</p>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-10 rounded-[2rem] border border-recharge-teal/5 shadow-lg relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-recharge-teal opacity-60" />
                    <div className="flex items-center gap-3 text-recharge-teal mb-6">
                      <User className="w-5 h-5" />
                      <span className="text-xs font-black uppercase tracking-[0.2em]">The Business Script</span>
                    </div>
                    <p className="text-xl serif italic text-recharge-teal/80 leading-relaxed">&quot;{scripts.business}&quot;</p>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}

          {page === 'blog' && (
            <motion.div 
              key="blog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 max-w-4xl mx-auto"
            >
              {!selectedArticle ? (
                <div className="text-center mb-16">
                  <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs uppercase tracking-[0.3em] text-recharge-amber font-bold mb-6 block"
                  >
                    The Library
                  </motion.span>
                  <h2 className="serif text-5xl mb-12 tracking-tight">Deep Dives into the Drains</h2>
                  <p className="text-recharge-teal/60 mb-12 max-w-xl mx-auto">Select a topic to understand the science behind your specific social exhaustion patterns.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
                    {[
                      'Open-plan office noise', 
                      'Back-to-back meetings', 
                      'Small talk with strangers', 
                      'Family obligations', 
                      'Digital noise/Social media'
                    ].map((topic) => (
                      <motion.button
                        key={topic}
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleArticleSelect(topic)}
                        className="bg-white p-8 rounded-[2rem] border border-recharge-teal/5 shadow-lg text-left group hover:border-recharge-amber/20 transition-all"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-recharge-amber/5 rounded-xl text-recharge-amber group-hover:bg-recharge-amber group-hover:text-white transition-colors">
                            <BookOpen className="w-6 h-6" />
                          </div>
                          <ChevronRight className="w-5 h-5 text-recharge-teal/20 group-hover:text-recharge-amber group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="serif text-2xl mb-2 text-recharge-teal group-hover:text-recharge-amber transition-colors">{topic}</h3>
                        <p className="text-sm text-recharge-teal/40 font-medium tracking-wide uppercase">Read the deep dive</p>
                      </motion.button>
                    ))}
                  </div>

                  {blogPost && !loading && (
                    <div className="mt-20 border-t border-recharge-teal/5 pt-20">
                      <h3 className="serif text-3xl mb-12">Featured: The Science of the Social Battery</h3>
                      <article className="prose prose-recharge prose-xl max-w-none text-left bg-white p-12 rounded-[3rem] shadow-sm border border-recharge-teal/5">
                        <div className="whitespace-pre-wrap text-lg leading-relaxed text-recharge-teal/80 serif italic">
                          {blogPost}
                        </div>
                      </article>
                    </div>
                  )}
                </div>
              ) : loading ? (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <RefreshCw className="w-16 h-16 text-recharge-amber animate-spin mb-10 opacity-20" />
                  <h2 className="serif text-4xl tracking-tight">Curating the library...</h2>
                  <p className="text-recharge-teal/40 mt-4 font-medium tracking-wide uppercase text-xs">Preparing deep-dive insights</p>
                </div>
              ) : (
                <article className="prose prose-recharge prose-xl max-w-none">
                  <button 
                    onClick={() => { setSelectedArticle(null); }}
                    className="flex items-center gap-2 text-recharge-teal/40 hover:text-recharge-teal mb-12 transition-colors group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                    <span className="text-sm font-medium uppercase tracking-widest">Back to Library</span>
                  </button>

                  <div className="text-center mb-24">
                    <motion.span 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs uppercase tracking-[0.3em] text-recharge-amber font-bold mb-6 block"
                    >
                      The Science of {selectedArticle}
                    </motion.span>
                    <h1 className="serif text-5xl md:text-7xl mb-10 leading-tight tracking-tight">
                      Understanding the {selectedArticle} Drain
                    </h1>
                    <div className="flex items-center justify-center gap-6 text-sm font-bold uppercase tracking-widest opacity-30">
                      <span>12 min read</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-recharge-teal" />
                      <span>By Recharge AI Guide</span>
                    </div>
                  </div>
                  
                  <div className="whitespace-pre-wrap text-xl leading-relaxed text-recharge-teal/80 serif italic px-4">
                    {blogPost}
                  </div>
                </article>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-24 border-t border-recharge-teal/5 py-12 text-center text-sm text-recharge-teal/40">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-4 h-4" />
          <span className="serif font-medium">Recharge</span>
        </div>
        <p>© 2026 Recharge AI. Built for the quiet ones.</p>
      </footer>
    </div>
  );
}
