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
  Wind
} from 'lucide-react';
import { QuizData, SocialProfile, BoundaryScripts, Page } from './types';
import { generateSocialProfile, generateBoundaryScripts, generateBlogPost } from './services/gemini';

// --- Components ---

const SocialBattery = ({ level, status }: { level: number; status: string }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="w-[100px] flex flex-col items-center">
        <div className="w-[30px] h-[10px] bg-recharge-teal rounded-t-lg" />
        <div className="w-[60px] h-[120px] border-4 border-recharge-teal rounded-lg relative p-1 bg-white/50">
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: `${level}%` }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="w-full rounded-sm absolute bottom-1 left-0 right-0 px-1"
            style={{ 
              background: 'linear-gradient(to top, var(--color-recharge-amber), var(--color-recharge-gold))',
              height: `calc(${level}% - 8px)`,
              margin: '0 4px'
            }}
          />
        </div>
      </div>
      <p className="serif text-recharge-teal mt-4 font-medium">{status}</p>
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
        {/* Depleted Level with Flicker */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 bg-recharge-amber" 
          initial={{ height: "15%" }}
          animate={{ 
            height: ["15%", "18%", "15%", "12%", "15%"],
            opacity: [0.7, 0.4, 0.8, 0.5, 0.7]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            times: [0, 0.2, 0.4, 0.6, 1],
            ease: "easeInOut" 
          }}
        />
        
        {/* Subtle Diagonal Strike (Depleted indicator) */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center opacity-20"
          animate={{ opacity: [0.1, 0.3, 0.1] }}
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
  <nav className="fixed top-0 left-0 right-0 h-16 bg-recharge-paper/80 backdrop-blur-md border-b border-recharge-teal/10 z-50 flex items-center justify-between px-6">
    <div 
      className="cursor-pointer" 
      onClick={() => setPage('home')}
    >
      <Logo />
    </div>
    <div className="flex gap-6 text-sm font-medium">
      <button onClick={() => setPage('boundary')} className={`hover:text-recharge-amber transition-colors ${currentPage === 'boundary' ? 'text-recharge-amber' : ''}`}>Boundaries</button>
      <button onClick={() => setPage('blog')} className={`hover:text-recharge-amber transition-colors ${currentPage === 'blog' ? 'text-recharge-amber' : ''}`}>Library</button>
    </div>
  </nav>
);

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [quizData, setQuizData] = useState<QuizData>({
    user_name: '',
    email: '',
    primary_drain: '',
    social_style: '',
    current_battery: '20%',
    recovery_preference: '',
    age_group: '18-29'
  });
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [boundarySituation, setBoundarySituation] = useState('');
  const [boundaryEmail, setBoundaryEmail] = useState('');
  const [scripts, setScripts] = useState<BoundaryScripts | null>(null);
  const [blogPost, setBlogPost] = useState<string>('');

  const handleQuizSubmit = async () => {
    setLoading(true);
    setPage('result');
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const result = await generateSocialProfile(quizData);
      setProfile(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBoundarySubmit = async () => {
    setLoading(true);
    try {
      const result = await generateBoundaryScripts(boundarySituation, boundaryEmail);
      setScripts(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (page === 'blog' && !blogPost) {
      const fetchBlog = async () => {
        const post = await generateBlogPost();
        setBlogPost(post);
      };
      fetchBlog();
    }
  }, [page]);

  return (
    <div className="min-h-screen pt-16 pb-12">
      <Navbar currentPage={page} setPage={setPage} />
      
      <main className="max-w-4xl mx-auto px-6">
        <AnimatePresence mode="wait">
          {page === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <div className="mb-12">
                <SocialBattery level={30} status="Status: Critically Drained" />
              </div>
              <h1 className="serif text-5xl md:text-6xl font-light mb-6 leading-tight">
                Your social energy is <br />
                <span className="italic">a finite resource.</span>
              </h1>
              <p className="text-lg text-recharge-teal/70 max-w-xl mx-auto mb-10 leading-relaxed">
                Social exhaustion isn't a flaw; it's a signal. We help you listen to it, 
                manage it, and find your way back to calm.
              </p>
              <button 
                onClick={() => setPage('quiz')}
                className="bg-recharge-teal text-recharge-paper px-8 py-4 rounded-full font-medium hover:bg-recharge-teal/90 transition-all flex items-center gap-2 mx-auto group shadow-lg shadow-recharge-teal/10"
              >
                Check Your Battery
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {page === 'quiz' && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-12 max-w-2xl mx-auto"
            >
              <button onClick={() => setPage('home')} className="flex items-center gap-2 text-recharge-teal/50 hover:text-recharge-teal mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              
              <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-recharge-teal/5 border border-recharge-teal/5">
                <h2 className="serif text-3xl mb-8">Let's check in.</h2>
                
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-medium mb-2 opacity-60">What should I call you?</label>
                      <input 
                        type="text" 
                        placeholder="Your name"
                        className="w-full bg-recharge-paper border-b border-recharge-teal/20 py-3 focus:border-recharge-amber outline-none transition-colors"
                        value={quizData.user_name}
                        onChange={e => setQuizData({...quizData, user_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 opacity-60">Your age group</label>
                      <div className="flex gap-4">
                        {['18-29', '30+'].map(age => (
                          <button 
                            key={age}
                            onClick={() => setQuizData({...quizData, age_group: age as any})}
                            className={`flex-1 py-3 rounded-xl border transition-all text-sm ${quizData.age_group === age ? 'border-recharge-amber bg-recharge-amber/5 text-recharge-amber' : 'border-recharge-teal/10'}`}
                          >
                            {age}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 opacity-60">Email (Optional - to receive your profile)</label>
                    <input 
                      type="email" 
                      placeholder="you@example.com"
                      className="w-full bg-recharge-paper border-b border-recharge-teal/20 py-3 focus:border-recharge-amber outline-none transition-colors"
                      value={quizData.email}
                      onChange={e => setQuizData({...quizData, email: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-4 opacity-60">What's draining you most right now?</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {['Open-plan office noise', 'Back-to-back meetings', 'Small talk with strangers', 'Family obligations', 'Digital noise/Social media'].map(option => (
                        <button 
                          key={option}
                          onClick={() => setQuizData({...quizData, primary_drain: option})}
                          className={`text-left p-4 rounded-xl border transition-all ${quizData.primary_drain === option ? 'border-recharge-amber bg-recharge-amber/5 text-recharge-amber' : 'border-recharge-teal/10 hover:border-recharge-teal/30'}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-4 opacity-60">How would you describe your social style?</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {['Deep one-on-one sessions', 'Small, familiar groups', 'The observer in the back', 'The occasional social butterfly'].map(option => (
                        <button 
                          key={option}
                          onClick={() => setQuizData({...quizData, social_style: option})}
                          className={`text-left p-4 rounded-xl border transition-all ${quizData.social_style === option ? 'border-recharge-amber bg-recharge-amber/5 text-recharge-amber' : 'border-recharge-teal/10 hover:border-recharge-teal/30'}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-4 opacity-60">How does your battery feel right now?</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      step="5"
                      className="w-full accent-recharge-amber"
                      value={parseInt(quizData.current_battery)}
                      onChange={e => setQuizData({...quizData, current_battery: `${e.target.value}%`})}
                    />
                    <div className="flex justify-between text-xs opacity-40 mt-2">
                      <span>Empty</span>
                      <span>{quizData.current_battery}</span>
                      <span>Full</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleQuizSubmit}
                    disabled={!quizData.user_name || !quizData.primary_drain}
                    className="w-full bg-recharge-teal text-recharge-paper py-4 rounded-xl font-medium hover:bg-recharge-teal/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed mt-4"
                  >
                    Generate My Energy Profile
                  </button>
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
              className="py-12"
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <RefreshCw className="w-12 h-12 text-recharge-amber animate-spin mb-6" />
                  <h2 className="serif text-2xl animate-pulse">Generating your energy profile...</h2>
                  <p className="text-recharge-teal/50 mt-2">Gemini is analyzing your patterns.</p>
                </div>
              ) : profile ? (
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-12">
                    <span className="text-xs uppercase tracking-widest text-recharge-amber font-semibold mb-2 block">Your Profile</span>
                    <h2 className="serif text-5xl mb-6">{profile.type}</h2>
                    <div className="w-24 h-1 bg-recharge-amber/20 mx-auto rounded-full" />
                  </div>

                  <div className="space-y-12">
                    <div className="prose prose-recharge text-lg leading-relaxed text-recharge-teal/80">
                      {profile.validation.split('\n\n').map((p, i) => (
                        <p key={i} className="mb-4">{p}</p>
                      ))}
                    </div>

                    <div className="bg-recharge-teal text-recharge-paper p-8 rounded-3xl">
                      <h3 className="serif text-2xl mb-6 flex items-center gap-2">
                        <Coffee className="w-6 h-6" />
                        Micro-Recoveries
                      </h3>
                      <div className="space-y-4">
                        {profile.microRecoveries.map((recovery, i) => (
                          <div key={i} className="flex gap-4 items-start bg-white/10 p-4 rounded-xl">
                            <span className="bg-recharge-amber text-recharge-teal w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                              {i + 1}
                            </span>
                            <p className="text-sm opacity-90">{recovery}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-center bg-recharge-amber/5 border border-recharge-amber/20 p-8 rounded-3xl">
                      <p className="serif text-2xl mb-4 italic">{profile.invitation}</p>
                      <p className="text-sm text-recharge-teal/60 mb-8 max-w-md mx-auto">
                        Join the Pro Plan to receive automated, personalized ideas on how to avoid social exhaustion before it hits.
                      </p>
                      <button className="bg-recharge-amber text-white px-8 py-3 rounded-full font-medium hover:bg-recharge-amber/90 transition-all">
                        Start 14-Day Pro Plan
                      </button>
                      <p className="text-xs opacity-40 mt-4">No credit card required to start.</p>
                    </div>

                    <div className="flex justify-center pt-8">
                      <button 
                        onClick={() => {
                          const url = import.meta.env.VITE_APP_URL || window.location.origin;
                          navigator.clipboard.writeText(`I just got my Social Exhaustion Profile: ${profile.type}. Check yours at ${url}`);
                          alert("Link copied to clipboard!");
                        }}
                        className="flex items-center gap-2 text-recharge-teal/60 hover:text-recharge-amber transition-colors text-sm font-medium"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Share this tool
                      </button>
                    </div>
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
              className="py-12 max-w-2xl mx-auto"
            >
              <div className="text-center mb-12">
                <h2 className="serif text-4xl mb-4">Boundary Builder</h2>
                <p className="text-recharge-teal/60">Protect your energy with kind but firm scripts.</p>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-xl shadow-recharge-teal/5 border border-recharge-teal/5 mb-8">
                <label className="block text-sm font-medium mb-4 opacity-60">What's the situation?</label>
                <textarea 
                  placeholder="e.g., A friend wants me to go to a loud concert tonight, but I'm empty."
                  className="w-full bg-recharge-paper border border-recharge-teal/10 rounded-2xl p-4 h-32 focus:border-recharge-amber outline-none transition-colors resize-none mb-6"
                  value={boundarySituation}
                  onChange={e => setBoundarySituation(e.target.value)}
                />
                
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 opacity-60">Email (Optional - to receive your scripts)</label>
                  <input 
                    type="email" 
                    placeholder="you@example.com"
                    className="w-full bg-recharge-paper border-b border-recharge-teal/20 py-3 focus:border-recharge-amber outline-none transition-colors"
                    value={boundaryEmail}
                    onChange={e => setBoundaryEmail(e.target.value)}
                  />
                </div>

                <button 
                  onClick={handleBoundarySubmit}
                  disabled={!boundarySituation || loading}
                  className="w-full bg-recharge-teal text-recharge-paper py-4 rounded-xl font-medium hover:bg-recharge-teal/90 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Generate Scripts
                </button>
              </div>

              {scripts && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-2xl border border-recharge-teal/5 shadow-sm"
                  >
                    <div className="flex items-center gap-2 text-recharge-amber mb-4">
                      <Wind className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">The Gentle Script</span>
                    </div>
                    <p className="text-sm italic text-recharge-teal/80 leading-relaxed">"{scripts.gentle}"</p>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-2xl border border-recharge-teal/5 shadow-sm"
                  >
                    <div className="flex items-center gap-2 text-recharge-teal mb-4">
                      <Moon className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">The Direct Script</span>
                    </div>
                    <p className="text-sm italic text-recharge-teal/80 leading-relaxed">"{scripts.direct}"</p>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-2xl border border-recharge-teal/5 shadow-sm"
                  >
                    <div className="flex items-center gap-2 text-recharge-teal mb-4">
                      <User className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">The Business Script</span>
                    </div>
                    <p className="text-sm italic text-recharge-teal/80 leading-relaxed">"{scripts.business}"</p>
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
              className="py-12 max-w-3xl mx-auto"
            >
              {blogPost ? (
                <article className="prose prose-recharge max-w-none">
                  <div className="text-center mb-16">
                    <span className="text-xs uppercase tracking-widest text-recharge-amber font-semibold mb-4 block">Cornerstone Content</span>
                    <h1 className="serif text-5xl mb-8">The Science of the Social Battery: Why Your Brain Feels Fried</h1>
                    <div className="flex items-center justify-center gap-4 text-sm opacity-50">
                      <span>12 min read</span>
                      <span>•</span>
                      <span>By Recharge AI Guide</span>
                    </div>
                  </div>
                  
                  <div className="whitespace-pre-wrap text-lg leading-relaxed text-recharge-teal/90">
                    {blogPost}
                  </div>
                </article>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <RefreshCw className="w-12 h-12 text-recharge-amber animate-spin mb-6" />
                  <h2 className="serif text-2xl">Curating the library...</h2>
                </div>
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
