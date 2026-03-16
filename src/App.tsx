import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Twitter, Linkedin, Instagram, Video, Youtube, Facebook, Copy, Check, Sparkles, Crown, Star, Flame, Sun, Moon } from 'lucide-react'
import OpenAI from 'openai'

type ContentType = 'tweet' | 'linkedin' | 'instagram' | 'video' | 'youtube' | 'facebook'

interface GeneratedContent {
  id: number
  type: ContentType
  content: string
  timestamp: Date
  likes?: number
}

const DEMO_CONTENT: Record<ContentType, string[]> = {
  tweet: ["Just launched a new AI tool in 48 hours. Here's what I learned:\n\n1. Speed > perfection\n2. Talk to users daily\n3. Ship early, iterate fast\n\nThe best time to start was yesterday.", "Hot take: Most people overthink their business ideas.\n\nThe truth: You don't need the perfect product. You need the perfect launch.\n\nHere's a framework that works", "5 AI tools I use daily:\n\n1. ChatGPT - writing\n2. Midjourney - images\n3. ElevenLabs - voice\n4. Runway - video\n5. Velocity - content\n\nGame changer? Velocity."],
  linkedin: ["Something strange happened last week.\n\nI launched a new product with ZERO marketing budget.\n\nIn 7 days: 247 signups, 31 paid customers, \$2,340 in revenue.\n\nHere's what I learned:\n\n- Content > Ads\n- Community > Marketing\n- Value > Sales\n\nWhat's been your experience with organic growth?", "After 10 years in tech, here's what I wish I knew earlier:\n\n1. Your network IS your net worth\n2. The best time to pitch was 2 years ago. The second best time is NOW\n3. Every 'no' gets you closer to 'yes'\n\nPick one platform. Dominate it."],
  instagram: ["Social Media Content System\n\n1/ Stop guessing what to post\n2/ Use templates that work\n3/ Batch create content in 1 hour\n4/ Track what converts\n5/ Repeat & scale\n\nSave for later!", "POV: You just discovered the viral formula\n\nHook: 2 seconds\nContent: Value bomb\nFormat: Carousel\nCTA: Save/Comment\n\nThat's it. That's the entire algorithm.\n\nFollow for more!"],
  video: ["INTRO:\nHook - 'You think you know how to go viral? Think again.'\n\nBODY:\n1. The Hook (0:15) - Grab attention immediately\n2. The Problem (0:45) - Relate to your audience's pain\n3. The Solution (1:15) - Give actionable advice\n4. The CTA (1:45) - Like, comment, follow\n\nOUTRO:\n'If this helped, smash that like button!'", "Viral Script: How to 10x Your Productivity\n\n[0-3s] Hook: 'You're doing it wrong.'\n[3-15s] Problem: Most people waste 3 hours/day\n[15-45s] Solution: The 2-hour deep work block\n[45-60s] CTA: 'What's YOUR biggest productivity struggle?'"],
  youtube: ["VIDEO TITLE: 'I Tried AI Content For 30 Days - Here's What Happened'\n\n[INTRO - 0:00]\n'What if you could create a week's content in just 2 hours?'\n\n[HOOK - 0:15]\nMost people are spending WRONG on content creation.\n\n[BODY - 0:45]\nDay 1-7: Testing different tools\nDay 8-14: Finding what works\nDay 15-21: Scaling the system\n\n[CTA - 2:30]\n'Subscribe and hit the bell!'"],
  facebook: ["ATTENTION BUSINESS OWNERS!\n\nAre you tired of spending hours on content that gets no engagement?\n\nHere's what actually works in 2024:\n\n1. Video first\n2. Personal stories\n3. Value + entertainment\n4. Consistent posting\n\nDrop a comment if you want more tips!"]
}

function App() {
  const [contentType, setContentType] = useState<ContentType>('tweet')
  const [topic, setTopic] = useState('')
  const [generated, setGenerated] = useState<GeneratedContent[]>([])
  const [copied, setCopied] = useState<number | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showPricing, setShowPricing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [dailyLimit, setDailyLimit] = useState(5)
  const [showDemo, setShowDemo] = useState(true)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_api_key') || ''
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    }
    return 'dark'
  })

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const contentTypes = [
    { id: 'tweet', icon: Twitter, label: 'Tweet', color: 'text-blue-400' },
    { id: 'linkedin', icon: Linkedin, label: 'LinkedIn', color: 'text-blue-600' },
    { id: 'instagram', icon: Instagram, label: 'Instagram', color: 'text-pink-400' },
    { id: 'video', icon: Video, label: 'Reels/TikTok', color: 'text-purple-400' },
    { id: 'youtube', icon: Youtube, label: 'YouTube', color: 'text-red-400' },
    { id: 'facebook', icon: Facebook, label: 'Facebook', color: 'text-blue-500' },
  ]
  const generateContent = async () => {
    if (!isPremium && dailyLimit <= 0) { setShowUpgrade(true); return }
    const key = import.meta.env.VITE_OPENAI_API_KEY || apiKey;
    
    setGenerating(true)
    setShowDemo(false)
    
    let content = ''
    
    if (key && topic.trim()) {
      try {
        const openai = new OpenAI({ apiKey: key, dangerouslyAllowBrowser: true })
        const platformNames: Record<ContentType, string> = {
          tweet: 'Twitter/X (280 chars)',
          linkedin: 'LinkedIn',
          instagram: 'Instagram',
          video: 'Reels/TikTok script',
          youtube: 'YouTube video script',
          facebook: 'Facebook post'
        }
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: `Write a viral ${platformNames[contentType]} post about "${topic}". Make it engaging, use appropriate formatting with line breaks. Don't use emojis. Just write compelling content.` }],
          max_tokens: 500
        })
        content = response.choices[0]?.message?.content || ''
      } catch (e) { 
        console.error('OpenAI error:', e)
      }
    }
    
    if (!content.trim()) {
      await new Promise(r => setTimeout(r, 1500))
      const demos = DEMO_CONTENT[contentType]
      content = demos[Math.floor(Math.random() * demos.length)]
    }
    
    const newContent: GeneratedContent = { 
      id: Date.now(), type: contentType, content, timestamp: new Date(),
      likes: Math.floor(Math.random() * 500) + 50
    }
    setGenerated([newContent, ...generated])
    if (!isPremium) setDailyLimit(p => p - 1)
    setGenerating(false)
  }

  const copyToClipboard = (content: string, id: number) => { 
    navigator.clipboard.writeText(content)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }
  

  const viralHooks = [
    "I just made $X in 24 hours. Here's exact...",
    "Stop doing this if you want to grow...",
    "The 3 AM realization that changed my bus...",
    "Hot take: Most people are wrong about..."
  ]

  const testimonials = [
    { name: "Sarah K.", role: "Content Creator", content: "Generated 10 viral tweets in 5 minutes. Game changer!", avatar: "SK" },
    { name: "Mike R.", role: "Founder", content: "Saved 2 hours every day on content. Worth every penny.", avatar: "MR" },
    { name: "Lisa M.", role: "Social Media Manager", content: "My clients love the content quality. Highly recommend!", avatar: "LM" }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-indigo-500/30 transition-colors duration-300">
      {paymentSuccess && (<motion.div initial={{opacity:0,y:-100}} animate={{opacity:1,y:0}} className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 bg-green-500/20 border border-green-500/50 rounded-xl flex items-center gap-3"><Check className="w-5 h-5 text-green-400"/><span>Welcome to Pro!</span></motion.div>)}
      
      <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50 transition-colors">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><Zap className="w-6 h-6 text-white"/></div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Velocity</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-lg bg-card text-muted hover:text-indigo-500 transition-colors">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button onClick={()=>setShowPricing(true)} className="text-muted hover:text-indigo-500 text-sm font-medium">Pricing</button>
            {!isPremium && <button onClick={()=>setShowUpgrade(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg font-medium text-sm text-white transition-transform active:scale-95 shadow-lg shadow-orange-500/20"><Crown className="w-4 h-4"/>Upgrade</button>}
            {isPremium && <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg font-medium text-sm text-white"><Crown className="w-4 h-4"/>Pro</div>}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-6"><Sparkles className="w-4 h-4"/>AI-Powered Content Generator</motion.div>
          <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">Create viral content in <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">seconds</span></motion.h1>
          <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="text-xl text-muted max-w-2xl mx-auto mb-8">Stop staring at blank screens. Generate scroll-stopping content for Twitter, LinkedIn, Instagram, YouTube, and more.</motion.p>
          
          <div className="flex flex-col items-center gap-6">
            {!isPremium && <div className="inline-flex items-center gap-2 px-3 py-1 bg-card rounded-full border border-border text-[10px] uppercase tracking-wider"><span className="text-muted">Free:</span><span className="text-indigo-400 font-bold">{dailyLimit} left</span></div>}
            {isPremium && <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-sm"><Sparkles className="w-4 h-4 text-amber-400"/><span className="text-amber-400 font-medium">Unlimited</span></div>}
            
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.25}} className="flex flex-wrap justify-center gap-12">
              <div className="text-center"><div className="text-4xl font-bold mb-1">10K+</div><div className="text-muted text-xs uppercase tracking-widest">Active Users</div></div>
              <div className="text-center"><div className="text-4xl font-bold mb-1">500K+</div><div className="text-muted text-xs uppercase tracking-widest">Content Generated</div></div>
              <div className="text-center"><div className="text-4xl font-bold mb-1">98%</div><div className="text-muted text-xs uppercase tracking-widest">Satisfaction</div></div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mb-20">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="flex flex-wrap justify-center gap-3 mb-10">
            {contentTypes.map(t => (<button key={t.id} onClick={()=>setContentType(t.id as ContentType)} className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all duration-300 ${contentType===t.id?'bg-indigo-500/10 border-indigo-500/50 text-foreground shadow-[0_0_20px_rgba(99,102,241,0.15)]':'bg-card border-border text-muted hover:border-indigo-500/30 hover:text-foreground'}`}><t.icon className={`w-5 h-5 ${t.color}`}/><span className="font-semibold text-sm">{t.label}</span></button>))}
          </motion.div>

          <div className="space-y-10">
              <div className="flex items-center gap-2 text-muted text-[10px] font-bold uppercase tracking-widest"><Flame className="w-4 h-4 text-orange-400"/>Trending:</div>
              {['AI Tools', 'Startup', 'Marketing', 'Productivity', 'Growth', 'Side Project'].map(t => (<button key={t} onClick={()=>setTopic(t)} className="px-4 py-1.5 rounded-full bg-card border border-border text-muted text-xs hover:border-indigo-500/50 hover:text-foreground transition-all">{t}</button>))}

            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.38}} className="text-center">
              <div className="flex items-center justify-center gap-2 text-muted text-[10px] font-bold uppercase mb-4 tracking-widest"><Sparkles className="w-3 h-3 text-amber-400"/> Or try a viral hook:</div>
              <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                {viralHooks.map(h => (
                  <button key={h} onClick={()=>setTopic(h)} className="px-5 py-2.5 rounded-xl bg-card border border-border text-muted text-[11px] hover:border-indigo-500/50 hover:text-foreground transition-all italic hover:bg-white/5">"{h}"</button>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}} className="relative group">
              <input type="text" value={topic} onChange={e=>setTopic(e.target.value)} placeholder="What do you want to write about?" className="w-full px-8 py-5 bg-card border border-border rounded-3xl text-lg placeholder-muted focus:outline-none focus:border-indigo-500 transition-all pr-44 shadow-2xl group-hover:border-indigo-500/30" onKeyDown={e=>e.key==='Enter'&&generateContent()}/>
              <button onClick={generateContent} disabled={generating} className="absolute right-3 top-1/2 -translate-y-1/2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl font-bold hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all disabled:opacity-50 flex items-center gap-2 active:scale-95">
                {generating?(<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Generating...</>):(<><Zap className="w-4 h-4"/>Generate</>)}
              </button>
            </motion.div>
          </div>
        </div>

        {showDemo && (<motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="max-w-2xl mx-auto mb-32"><div className="bg-card/50 border border-border rounded-3xl p-8 backdrop-blur-sm"><div className="flex items-center gap-2 text-amber-400 mb-6"><Sparkles className="w-4 h-4"/><span className="text-xs font-bold uppercase tracking-widest">Try it! Click Generate</span></div><div className="space-y-6">{DEMO_CONTENT.tweet.slice(0,2).map((c,i)=>(<div key={i} className="p-6 bg-background rounded-2xl border border-border"><p className="text-muted text-sm leading-relaxed whitespace-pre-wrap">{c}</p></div>))}</div></div></motion.div>)}

        {generated.length > 0 && (
          <div className="max-w-2xl mx-auto space-y-6 mb-32">
            {generated.map(item => (
              <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} key={item.id} className="bg-card border border-border rounded-3xl p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center">
                      {item.type === 'tweet' && <Twitter className="w-4 h-4 text-blue-400"/>}
                      {item.type === 'linkedin' && <Linkedin className="w-4 h-4 text-blue-600"/>}
                      {item.type === 'instagram' && <Instagram className="w-4 h-4 text-pink-400"/>}
                      {item.type === 'video' && <Video className="w-4 h-4 text-purple-400"/>}
                      {item.type === 'youtube' && <Youtube className="w-4 h-4 text-red-400"/>}
                      {item.type === 'facebook' && <Facebook className="w-4 h-4 text-blue-500"/>}
                    </div>
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{item.type}</span>
                  </div>
                  {item.likes && <div className="flex items-center gap-1.5 text-muted text-xs"><span>❤</span>{item.likes}</div>}
                </div>
                <div className="text-foreground text-base leading-relaxed whitespace-pre-wrap mb-6">{item.content}</div>
                <div className="flex items-center gap-3 pt-6 border-t border-border">
                  <button onClick={()=>copyToClipboard(item.content,item.id)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border text-muted text-xs font-semibold hover:text-foreground hover:border-indigo-500/30 transition-all">
                    {copied === item.id ? <><Check className="w-3.5 h-3.5 text-green-400"/>Copied!</> : <><Copy className="w-3.5 h-3.5"/>Copy</>}
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border text-muted text-xs font-semibold hover:text-foreground transition-all"><Star className="w-3.5 h-3.5"/>Save</button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Testimonials */}
        <div className="mb-32">
          <h2 className="text-2xl font-bold text-center mb-12">Loved by <span className="text-indigo-400">10,000+</span> creators</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t,i) => (
              <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}} key={i} className="bg-card border border-border rounded-3xl p-8">
                <div className="flex gap-1 text-amber-400 mb-4">{[...Array(5)].map((_,j)=>(<Star key={j} className="w-4 h-4 fill-current"/>))}</div>
                <p className="text-muted text-sm italic mb-8 leading-relaxed">"{t.content}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">{t.avatar}</div>
                  <div>
                    <div className="text-sm font-bold">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pro CTA */}
        <motion.div initial={{opacity:0,scale:0.95}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} className="max-w-4xl mx-auto rounded-[3rem] bg-card border border-indigo-500/20 p-12 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
          <h2 className="text-4xl font-bold mb-4 relative z-10">Ready to go <span className="text-indigo-400">pro?</span></h2>
          <p className="text-muted mb-10 relative z-10">Unlock unlimited generations and premium features.</p>
          <button onClick={()=>setShowUpgrade(true)} className="px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl font-black uppercase tracking-widest text-sm relative z-10 hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all active:scale-95 flex items-center gap-3 mx-auto"><Crown className="w-5 h-5"/>Upgrade - $19/mo</button>
        </motion.div>
      </main>

      {showPricing && (<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6" onClick={()=>setShowPricing(false)}>
        <div className="bg-card border border-border rounded-3xl p-8 max-w-4xl w-full" onClick={e=>e.stopPropagation()}>
          <h2 className="text-3xl font-bold text-center mb-8">Simple Pricing</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-background border border-border rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <div className="mb-6"><span className="text-4xl font-bold">\$0</span><span className="text-gray-400">/forever</span></div>
              <ul className="space-y-3 mb-6"><li className="flex items-center gap-2 text-gray-300"><Check className="w-4 h-4 text-green-400"/>5 generations/day</li><li className="flex items-center gap-2 text-gray-300"><Check className="w-4 h-4 text-green-400"/>All content types</li></ul>
            </div>
            <div className="bg-background border border-indigo-500 rounded-2xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-500 rounded-full text-xs font-medium">Most Popular</div>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <div className="mb-6"><span className="text-4xl font-bold">\$19</span><span className="text-gray-400">/month</span></div>
              <ul className="space-y-3 mb-6"><li className="flex items-center gap-2 text-gray-300"><Check className="w-4 h-4 text-green-400"/>Unlimited generations</li><li className="flex items-center gap-2 text-gray-300"><Check className="w-4 h-4 text-green-400"/>Save templates</li></ul>
              <button onClick={()=>{setShowPricing(false); setShowUpgrade(true)}} className="w-full py-3 rounded-xl font-medium bg-gradient-to-r from-indigo-500 to-purple-500">Subscribe</button>
            </div>
          </div>
        </div>
      </div>)}

      {showUpgrade && (<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6" onClick={()=>setShowUpgrade(false)}>
        <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full text-center" onClick={e=>e.stopPropagation()}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4"><Crown className="w-8 h-8 text-white"/></div>
          <h2 className="text-2xl font-bold mb-2">Upgrade to Pro</h2>
          <p className="text-muted mb-6">\$19/month for unlimited everything</p>
          <button onClick={()=>{setIsPremium(true); setShowUpgrade(false); setPaymentSuccess(true); setTimeout(()=>setPaymentSuccess(false),5000)}} className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold">Upgrade Now - \$19/mo</button>
          <button onClick={()=>setShowUpgrade(false)} className="w-full mt-4 text-gray-400">Maybe later</button>
        </div>
      </div>)}
      <footer className="border-t border-border py-12 mt-20 bg-card/50 transition-colors">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center"><Zap className="w-3.5 h-3.5 text-indigo-400"/></div>
            <span className="text-sm font-bold text-muted">Velocity</span>
          </div>
          <p className="text-muted text-[10px] uppercase tracking-[0.2em]">2024 Velocity. AI Content Generator.</p>
          
          <div className="flex items-center gap-2 text-[10px] text-muted bg-card px-4 py-2 rounded-full border border-border shadow-sm group hover:border-indigo-500/20 transition-all">
            <span className="opacity-60">Created by</span>
            <span className="font-bold text-foreground group-hover:text-indigo-500 transition-colors">AI Microtechlink</span>
            <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse"/>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
