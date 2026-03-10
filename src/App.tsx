import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Twitter, Linkedin, Instagram, Video, Youtube, Facebook, Copy, Check, Sparkles, Crown, Star, Flame } from 'lucide-react'
import OpenAI from 'openai'

type ContentType = 'tweet' | 'linkedin' | 'instagram' | 'video' | 'youtube' | 'facebook'

interface GeneratedContent {
  id: number
  type: ContentType
  content: string
  timestamp: Date
  likes?: number
  comments?: number
}

const TESTIMONIALS = [
  { name: "Sarah K.", role: "Content Creator", text: "Generated 10 viral tweets in 5 minutes. Game changer!", avatar: "SK" },
  { name: "Mike R.", role: "Founder", text: "Saved 2 hours every day on content. Worth every penny.", avatar: "MR" },
  { name: "Lisa M.", role: "Social Media Manager", text: "My clients love the content quality. Highly recommend!", avatar: "LM" },
]

// Trending topics
const TRENDING_TOPICS = [
  { label: "AI Tools", emoji: "🤖" },
  { label: "Startup", emoji: "🚀" },
  { label: "Marketing", emoji: "📈" },
  { label: "Productivity", emoji: "⚡" },
  { label: "Growth", emoji: "📱" },
  { label: "Side Project", emoji: "💡" },
]

// Viral hooks
const VIRAL_HOOKS = [
  "I just made $X in 24 hours. Here's exactly how...",
  "Stop doing this if you want to grow...",
  "The 3 AM realization that changed my business...",
  "Hot take: Most people are wrong about...",
  "I spent $X on ads and here's what I learned...",
  "The secret nobody tells you about...",
]

const DEMO_CONTENT: Record<ContentType, string[]> = {
  tweet: [
    "Just launched a new AI tool in 48 hours. Here's what I learned:\n\n1. Speed > perfection\n2. Talk to users daily\n3. Ship early, iterate fast\n\nThe best time to start was yesterday.",
    "Hot take: Most people overthink their business ideas.\n\nThe truth: You don't need the perfect product. You need the perfect launch.\n\nHere's a framework that works",
    "5 AI tools I use daily:\n\n1. ChatGPT - writing\n2. Midjourney - images\n3. ElevenLabs - voice\n4. Runway - video\n5. Velocity - content\n\nGame changer? Velocity.",
    "The 3 AM realization that changed my business:\n\nMost expensive thing isn't the tools.\nIt's the time spent NOT making money.\n\nAutomation > Optimization.\n\nBuild systems that work while you sleep.",
    "Here's a viral tweet formula that works every time:\n\n1. Hook (controversial statement)\n2. Story (personal experience)\n3. Value (actionable tips)\n4. CTA (engagement)\n\nSave this. You'll thank me later."
  ],
  linkedin: [
    "Something strange happened last week.\n\nI launched a new product with ZERO marketing budget.\n\nIn 7 days: 247 signups, 31 paid customers, $2,340 in revenue.\n\nHere's what I learned:\n\n- Content > Ads\n- Community > Marketing\n- Value > Sales\n\nWhat's been your experience with organic growth?",
    "After 10 years in tech, here's what I wish I knew earlier:\n\n1. Your network IS your net worth - but not how you think\n2. The best time to pitch was 2 years ago. The second best time is NOW\n3. Every 'no' gets you closer to 'yes'\n\nPick one platform. Dominate it.\n\nWhat's been your biggest lesson?",
    "The algorithm changed. Again.\n\nBut here's what STILL works for LinkedIn:\n\n- Authentic stories over polished posts\n- Value first, pitch later\n- Engagement > reach\n- Consistency > virality\n\nSave this post. You'll need it."
  ],
  instagram: [
    "Social Media Content System\n\n1/ Stop guessing what to post\n2/ Use templates that work\n3/ Batch create content in 1 hour\n4/ Track what converts\n5/ Repeat & scale\n\nSave for later!",
    "POV: You just discovered the viral formula\n\nHook: 2 seconds\nContent: Value bomb\nFormat: Carousel\nCTA: Save/Comment\n\nThat's it. That's the entire algorithm.\n\nFollow for more marketing tips!",
    "The content creator transformation:\n\nBEFORE:\n- Posting randomly\n- Zero strategy\n- 23 followers\n\nAFTER:\n- System in place\n- 10k+ reach\n- Monetizing\n\nHere's the exact system"
  ],
  video: [
    "INTRO:\nHook - 'You think you know how to go viral? Think again.'\n\nBODY:\n1. The Hook (0:15) - Grab attention immediately\n2. The Problem (0:45) - Relate to your audience's pain\n3. The Solution (1:15) - Give actionable advice\n4. The CTA (1:45) - Like, comment, follow\n\nOUTRO:\n'If this helped, smash that like button!'",
    "Viral Script: How to 10x Your Productivity\n\n[0-3s] Hook: 'You're doing it wrong.'\n[3-15s] Problem: Most people waste 3 hours/day\n[15-45s] Solution: The 2-hour deep work block\n[45-60s] CTA: 'What's YOUR biggest productivity struggle?'\n\nSave this script!",
    "Script for Reels/TikTok:\n\nHook (3s): 'Stop doing this if you want to grow!'\n\nPoint 1: Stop posting randomly\nPoint 2: Start batching content\nPoint 3: Use trends strategically\n\nCall to Action: 'Follow for more tips!'"
  ],
  youtube: [
    "VIDEO TITLE: 'I Tried AI Content For 30 Days - Here's What Happened'\n\n[INTRO - 0:00]\n'What if you could create a week's content in just 2 hours?'\n\n[HOOK - 0:15]\nMost people are spending WRONG on content creation.\n\n[BODY - 0:45]\nDay 1-7: Testing different tools\nDay 8-14: Finding what works\nDay 15-21: Scaling the system\nDay 22-30: Results and revenue\n\n[CTA - 2:30]\n'Subscribe and hit the bell for part 2!'",
    "TITLE: 'The $0 to $10K Content Strategy'\n\nTimestamps:\n0:00 - Why traditional marketing is dead\n2:30 - The content funnel\n5:00 - Tools I use (free)\n8:00 - My content system\n12:00 - Results after 90 days\n\nLike and subscribe if this helps!",
  ],
  facebook: [
    "ATTENTION BUSINESS OWNERS!\n\nAre you tired of spending hours on content that gets no engagement?\n\nHere's what actually works in 2024:\n\n1. Video first\n2. Personal stories\n3. Value + entertainment\n4. Consistent posting\n\nDrop a comment if you want more tips!",
    "POV: You just discovered the content hack that 99% of marketers don't know about...\n\nIt's simpler than you think.\n\nRead below\n\nDrop a comment if this was helpful!"
  ]
}

const PLANS = [
  { id: 'free', name: 'Free', price: 0, period: 'forever', features: ['5 generations/day', 'All content types', 'Basic templates'], popular: false },
  { id: 'pro', name: 'Pro', price: 19, period: 'month', features: ['Unlimited generations', 'Save templates', 'Priority support', 'Custom templates'], popular: true }
]

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
  const [saved, setSaved] = useState<number[]>([])
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('openai_api_key') || '')

  const saveApiKey = () => {
    localStorage.setItem('openai_api_key', apiKey)
    setShowApiKey(false)
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
    setGenerating(true)
    setShowDemo(false)
    
    let content = ''
    
    // Try to use OpenAI if API key is available
    const apiKey = localStorage.getItem('openai_api_key')
    if (apiKey && topic.trim()) {
      try {
        const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })
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
          messages: [{
            role: 'user',
            content: `Write a viral ${platformNames[contentType]} post about "${topic}". Make it engaging, use appropriate formatting with line breaks. Don't use emojis. Just write compelling content.`
          }],
          max_tokens: 500
        })
        content = response.choices[0]?.message?.content || ''
      } catch (e) {
        console.log('OpenAI error, using demo content')
      }
    }
    
    // Fall back to demo content if no API key or generation failed
    if (!content.trim()) {
      await new Promise(r => setTimeout(r, 1500))
      const demos = DEMO_CONTENT[contentType]
      content = demos[Math.floor(Math.random() * demos.length)]
    }
    
    const newContent: GeneratedContent = { 
      id: Date.now(), 
      type: contentType, 
      content, 
      timestamp: new Date(),
      likes: Math.floor(Math.random() * 500) + 50,
      comments: Math.floor(Math.random() * 50) + 5
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
  
  const toggleSave = (id: number) => {
    if (!isPremium) { setShowUpgrade(true); return }
    setSaved(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id])
  }
  
  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') { setIsPremium(false); setShowUpgrade(false); return }
    setProcessingPayment(true)
    await new Promise(r => setTimeout(r, 2000))
    setIsPremium(true); setProcessingPayment(false); setPaymentSuccess(true); setShowUpgrade(false)
    setTimeout(() => setPaymentSuccess(false), 5000)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {paymentSuccess && (<motion.div initial={{opacity:0,y:-100}} animate={{opacity:1,y:0}} className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 bg-green-500/20 border border-green-500/50 rounded-xl flex items-center gap-3"><Check className="w-5 h-5 text-green-400"/><span>Welcome to Pro!</span></motion.div>)}
      
      <header className="border-b border-[#1e1e2e] bg-[#12121a]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><Zap className="w-6 h-6 text-white"/></div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Velocity</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={()=>setShowApiKey(true)} className="text-gray-400 hover:text-white text-sm">API Key</button>
            <button onClick={()=>setShowPricing(true)} className="text-gray-400 hover:text-white text-sm">Pricing</button>
            {!isPremium && <button onClick={()=>setShowUpgrade(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg font-medium text-sm"><Crown className="w-4 h-4"/>Upgrade</button>}
            {isPremium && <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg font-medium text-sm"><Crown className="w-4 h-4"/>Pro</div>}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-6"><Sparkles className="w-4 h-4"/>AI-Powered Content Generator</motion.div>
          <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="text-5xl md:text-6xl font-bold mb-6">Create viral content in <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">seconds</span></motion.h1>
          <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">Stop staring at blank screens. Generate scroll-stopping content for Twitter, LinkedIn, Instagram, YouTube, and more.</motion.p>
          {!isPremium && <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#12121a] rounded-full border border-[#1e1e2e] text-sm"><span className="text-gray-400">Free:</span><span className="text-indigo-400 font-medium">{dailyLimit} left</span></div>}
          {isPremium && <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-sm"><Sparkles className="w-4 h-4 text-amber-400"/><span className="text-amber-400 font-medium">Unlimited</span></div>}
        </div>

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.25}} className="flex flex-wrap justify-center gap-8 mb-12">
          <div className="text-center"><div className="text-3xl font-bold text-indigo-400">10K+</div><div className="text-gray-500 text-sm">Active Users</div></div>
          <div className="text-center"><div className="text-3xl font-bold text-purple-400">500K+</div><div className="text-gray-500 text-sm">Content Generated</div></div>
          <div className="text-center"><div className="text-3xl font-bold text-pink-400">98%</div><div className="text-gray-500 text-sm">Satisfaction</div></div>
        </motion.div>

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="flex flex-wrap justify-center gap-3 mb-6">
          {contentTypes.map(t => (<button key={t.id} onClick={()=>setContentType(t.id as ContentType)} className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all ${contentType===t.id?'bg-indigo-500/20 border-indigo-500 text-white':'bg-[#12121a] border-[#1e1e2e] text-gray-400'}`}><t.icon className={`w-5 h-5 ${t.color}`}/><span className="font-medium">{t.label}</span></button>))}
        </motion.div>

        {/* Trending Topics */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.35}} className="flex flex-wrap justify-center gap-2 mb-6">
          <div className="flex items-center gap-2 text-gray-500 text-sm mr-2"><Flame className="w-4 h-4 text-orange-400"/>Trending:</div>
          {TRENDING_TOPICS.map(t => (<button key={t.label} onClick={()=>setTopic(t.label)} className="px-3 py-1 rounded-full bg-[#12121a] border border-[#1e1e2e] text-gray-400 text-sm hover:border-indigo-500 hover:text-white transition-all">{t.emoji} {t.label}</button>))}
        </motion.div>

        {/* Viral Hooks */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.37}} className="max-w-2xl mx-auto mb-6">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2"><Sparkles className="w-4 h-4 text-amber-400"/>Or try a viral hook:</div>
          <div className="flex flex-wrap gap-2 justify-center">
            {VIRAL_HOOKS.slice(0,4).map((hook,i) => (<button key={i} onClick={()=>setTopic(hook)} className="px-3 py-2 rounded-lg bg-[#12121a] border border-[#1e1e2e] text-gray-400 text-xs hover:border-pink-500 hover:text-pink-400 transition-all text-left">{hook.slice(0,40)}...</button>))}
          </div>
        </motion.div>

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}} className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input type="text" value={topic} onChange={e=>setTopic(e.target.value)} placeholder="What do you want to write about?" className="w-full px-6 py-4 bg-[#12121a] border border-[#1e1e2e] rounded-2xl text-lg placeholder-gray-500 focus:outline-none focus:border-indigo-500 pr-36" onKeyDown={e=>e.key==='Enter'&&generateContent()}/>
            <button onClick={generateContent} disabled={generating} className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-medium hover:from-indigo-400 hover:to-purple-500 transition-all disabled:opacity-50 flex items-center gap-2">
              {generating?(<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Generating...</>):(<><Zap className="w-4 h-4"/>Generate</>)}
            </button>
          </div>
        </motion.div>

        {showDemo && (<motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="max-w-2xl mx-auto mb-12"><div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-6"><div className="flex items-center gap-2 text-amber-400 mb-4"><Sparkles className="w-4 h-4"/><span className="text-sm font-medium">Try it! Click Generate</span></div><div className="space-y-4">{DEMO_CONTENT.tweet.slice(0,2).map((c,i)=>(<div key={i} className="p-4 bg-[#0a0a0f] rounded-xl border border-[#1e1e2e]"><p className="text-gray-300 text-sm whitespace-pre-wrap">{c}</p></div>))}</div></div></motion.div>)}

        {generated.length > 0 && (
          <div className="max-w-2xl mx-auto space-y-4">
            {generated.map(item => (
              <div key={item.id} className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-6" style={{overflow: 'visible'}}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {item.type === 'tweet' && <Twitter className="w-4 h-4 text-blue-400"/>}
                    {item.type === 'linkedin' && <Linkedin className="w-4 h-4 text-blue-600"/>}
                    {item.type === 'instagram' && <Instagram className="w-4 h-4 text-pink-400"/>}
                    {item.type === 'video' && <Video className="w-4 h-4 text-purple-400"/>}
                    {item.type === 'youtube' && <Youtube className="w-4 h-4 text-red-400"/>}
                    {item.type === 'facebook' && <Facebook className="w-4 h-4 text-blue-500"/>}
                    <span className="text-gray-400 text-sm capitalize">{item.type}</span>
                  </div>
                  {item.likes && <div className="flex items-center gap-1 text-gray-500 text-sm"><span>♥</span>{item.likes}</div>}
                </div>
                <div className="text-white whitespace-pre-wrap mb-4" style={{wordBreak: 'break-word'}}>{item.content}</div>
                <div className="flex items-center gap-2 pt-4 border-t border-[#1e1e2e]">
                  <button onClick={()=>copyToClipboard(item.content,item.id)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e] text-gray-400 text-sm hover:text-white">
                    {copied === item.id ? <><Check className="w-4 h-4 text-green-400"/>Copied!</> : <><Copy className="w-4 h-4"/>Copy</>}
                  </button>
                  <button onClick={()=>toggleSave(item.id)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e] text-gray-400 text-sm hover:text-white">
                    <span className={saved.includes(item.id) ? 'text-amber-400' : ''}>★</span>
                    {saved.includes(item.id) ? 'Saved' : 'Save'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <section className="py-20 bg-[#0d0d12]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Loved by <span className="text-indigo-400">10,000+</span> creators</h2>
          <div className="grid md:grid-cols-3 gap-6">{TESTIMONIALS.map((t,i)=>(<div key={i} className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-6"><div className="flex gap-1 mb-4">{[...Array(5)].map((_,i)=><Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400"/>)}</div><p className="text-gray-300 mb-4">"{t.text}"</p><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold">{t.avatar}</div><div><div className="font-medium">{t.name}</div><div className="text-gray-500 text-sm">{t.role}</div></div></div></div>))}</div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-3xl p-12">
            <h2 className="text-4xl font-bold mb-4">Ready to go <span className="text-indigo-400">pro</span>?</h2>
            <p className="text-gray-400 text-lg mb-8">Unlock unlimited generations and premium features.</p>
            <button onClick={()=>setShowUpgrade(true)} className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold text-lg hover:from-amber-400 hover:to-orange-400 inline-flex items-center gap-2"><Crown className="w-5 h-5"/>Upgrade - $19/mo</button>
          </div>
        </div>
      </section>

      {showPricing && (<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6" onClick={()=>setShowPricing(false)}>
        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-3xl p-8 max-w-4xl w-full" onClick={e=>e.stopPropagation()}>
          <h2 className="text-3xl font-bold text-center mb-8">Simple Pricing</h2>
          <div className="grid md:grid-cols-2 gap-6">{PLANS.map(p=>(<div key={p.id} className={`relative bg-[#0a0a0f] border rounded-2xl p-6 ${p.popular?'border-indigo-500':'border-[#1e1e2e]'}`}>{p.popular&&<div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-500 rounded-full text-xs font-medium">Most Popular</div>}<h3 className="text-xl font-bold mb-2">{p.name}</h3><div className="mb-6"><span className="text-4xl font-bold">${p.price}</span><span className="text-gray-400">/{p.period}</span></div><ul className="space-y-3 mb-6">{p.features.map((f,i)=><li key={i} className="flex items-center gap-2 text-gray-300"><Check className="w-4 h-4 text-green-400"/>{f}</li>)}</ul><button onClick={()=>handleSubscribe(p.id)} disabled={processingPayment} className={`w-full py-3 rounded-xl font-medium ${processingPayment?'bg-gray-700':p.popular?'bg-gradient-to-r from-indigo-500 to-purple-500':'bg-[#1e1e2e]'}`}>{processingPayment?'Processing...':p.price===0?'Get Started':'Subscribe'}</button></div>))}</div>
        </div>
      </div>)}

      {showUpgrade && (<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6" onClick={()=>setShowUpgrade(false)}>
        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-3xl p-8 max-w-md w-full text-center" onClick={e=>e.stopPropagation()}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4"><Crown className="w-8 h-8 text-white"/></div>
          <h2 className="text-2xl font-bold mb-2">Upgrade to Pro</h2>
          <p className="text-gray-400 mb-6">$19/month for unlimited everything</p>
          <button onClick={()=>handleSubscribe('pro')} disabled={processingPayment} className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold">{processingPayment?'Processing...':'Upgrade Now - $19/mo'}</button>
          <button onClick={()=>setShowUpgrade(false)} className="w-full mt-4 text-gray-400">Maybe later</button>
        </div>
      </div>)}

      {showApiKey && (<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6" onClick={()=>setShowApiKey(false)}>
        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-3xl p-8 max-w-md w-full" onClick={e=>e.stopPropagation()}>
          <h2 className="text-2xl font-bold mb-2">OpenAI API Key</h2>
          <p className="text-gray-400 mb-4 text-sm">Enter your OpenAI API key to enable AI-generated content. Get one at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">platform.openai.com</a></p>
          <input 
            type="password" 
            value={apiKey} 
            onChange={e=>setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl text-white mb-4"
          />
          <button onClick={saveApiKey} className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl font-bold mb-2">Save Key</button>
          <button onClick={()=>setShowApiKey(false)} className="w-full text-gray-400">Cancel</button>
        </div>
      </div>)}

      <footer className="border-t border-[#1e1e2e] py-8 mt-20"><div className="max-w-6xl mx-auto px-6 text-center text-gray-500 text-sm"><p>2024 Velocity. AI Content Generator.</p></div></footer>
    </div>
  )
}

export default App
