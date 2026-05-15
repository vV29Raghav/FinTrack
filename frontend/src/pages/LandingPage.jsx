import { useRouter } from '../Router.jsx'
import { Button } from '../components/ui.jsx'

function Logo({ className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-500/20">
        F
      </div>
      <span className="font-bold text-xl tracking-tight text-white">FinTrack</span>
    </div>
  )
}

export default function LandingPage() {
  const { navigate } = useRouter()

  const FEATURES = [
    { icon: '💸', title: 'Smart Expense Tracking', desc: 'Log expenses instantly and categorize them automatically with our intelligent system.' },
    { icon: '👥', title: 'Seamless Group Splitting', desc: 'Share bills with friends or roommates and settle up without any awkward math.' },
    { icon: '📈', title: 'Financial Analytics', desc: 'Visualize your spending habits with clean, intuitive charts and reports.' },
    { icon: '🔒', title: 'Secure & Encrypted', desc: 'Your data is protected with bank-grade encryption and secure authentication.' },
    { icon: '📱', title: 'Anywhere Access', desc: 'Sync your data across all your devices and manage your budget on the go.' },
    { icon: '⚙️', title: 'Automated Workflows', desc: 'Set up recurring expenses and automated settlements for ultimate peace of mind.' }
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      
      {/* Mesh Gradient Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 w-full h-20 border-b border-white/5 bg-slate-950/80 backdrop-blur-md z-[100]">
        <div className="section-container h-full flex items-center justify-between">
          <Logo />
          
          <nav className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors">How it Works</a>
            <a href="#footer" className="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Log in
            </button>
            <Button 
              onClick={() => navigate('/signup')}
              size="sm"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-40 z-10">
        <div className="section-container text-center">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white mb-8 leading-[1.05]">
            Track, split, and <br/>
            <span className="text-emerald-400">save smarter</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-14 leading-relaxed font-medium">
            The all-in-one financial platform for modern teams and families. Manage shared expenses and stay on top of your budget with ease.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              onClick={() => navigate('/signup')}
              size="lg"
              className="w-full sm:w-auto"
            >
              Start Free Today
            </Button>
            <Button 
              onClick={() => navigate('/login')}
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Explore Dashboard
            </Button>
          </div>

          {/* Simple Hero Image Mockup */}
          <div className="mt-28 relative max-w-5xl mx-auto">
             <div className="absolute inset-0 bg-emerald-500/20 blur-[80px] rounded-[3rem] -z-10" />
             <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-3 shadow-2xl overflow-hidden">
                <div className="bg-slate-950 rounded-[2rem] aspect-[21/9] flex items-center justify-center relative border border-white/5">
                   <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-white text-3xl shadow-xl shadow-emerald-500/20">F</div>
                      <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Financial Intelligence</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-40 bg-slate-900/30 border-y border-white/5 relative z-10">
        <div className="section-container">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Designed for simplicity</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg font-medium">Everything you need to manage your personal and shared finances in one place.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {FEATURES.map((feature, i) => (
              <div key={i} className="bg-slate-900/50 p-10 rounded-[2.5rem] border border-white/5 hover:border-emerald-500/30 transition-all group">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-slate-400 text-base leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

{/* How It Works Section */}
<section
  id="how-it-works"
  className="relative z-10 py-24 md:py-32 overflow-hidden"
>
  {/* Background Glow */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.08),transparent_35%)] pointer-events-none" />

  <div className="section-container relative">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 xl:gap-28 items-center">
      
      {/* Left Content */}
      <div className="max-w-2xl">
        <span className="inline-flex items-center px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-sm font-semibold tracking-wide mb-8">
          HOW IT WORKS
        </span>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-14">
          Split bills in{" "}
          <span className="text-emerald-400 italic">
            three simple steps
          </span>
        </h2>

        <div className="space-y-10">
          {[
            {
              n: "01",
              t: "Create Your Group",
              d: "Invite friends, family, or teammates into a shared workspace for trips, rent, or daily expenses.",
            },
            {
              n: "02",
              t: "Add Expenses",
              d: "Log bills instantly while we automatically calculate who owes what with zero confusion.",
            },
            {
              n: "03",
              t: "Settle Up Fast",
              d: "Track balances in real-time and complete payments securely in just one tap.",
            },
          ].map((step, i) => (
            <div
              key={i}
              className="group flex gap-6 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 hover:border-emerald-500/20 hover:bg-white/[0.04] transition-all duration-300"
            >
              {/* Number */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl font-black text-emerald-400">
                    {step.n}
                  </span>
                </div>
              </div>

              {/* Text */}
              <div>
                <h4 className="text-2xl font-semibold text-white mb-2">
                  {step.t}
                </h4>
                <p className="text-slate-400 leading-relaxed text-base">
                  {step.d}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Card */}
      <div className="relative flex justify-center">
        {/* Glow */}
        <div className="absolute w-[450px] h-[450px] bg-emerald-500/15 blur-[120px] rounded-full" />

        <div className="relative w-full max-w-md rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-slate-500 text-sm mb-1">
                Total Balance
              </p>
              <h3 className="text-3xl font-bold text-white">
                ₹12,480
              </h3>
            </div>

            <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-emerald-400 text-sm font-semibold">
                +12%
              </span>
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-4">
            {[
              { name: "Goa Trip", amount: "- ₹2,400" },
              { name: "Apartment Rent", amount: "+ ₹8,000" },
              { name: "Dinner Split", amount: "- ₹980" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-800" />
                  <div>
                    <p className="text-white font-medium">
                      {item.name}
                    </p>
                    <p className="text-slate-500 text-sm">
                      Updated today
                    </p>
                  </div>
                </div>

                <span className="text-white font-semibold">
                  {item.amount}
                </span>
              </div>
            ))}
          </div>

          {/* Members */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-700" />
              <div className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-600" />
              <div className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-500" />
            </div>

            <button className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-all duration-200">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* CTA Section */}
<section className="relative z-10 py-24 lg:py-32 overflow-hidden">
  <div className="max-w-7xl mx-auto px-6 lg:px-10">
    
    <div className="relative rounded-[2.5rem] border border-white/10 bg-[#07111f] overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 py-20 md:px-16 md:py-24">
        
        {/* Badge */}
        <div className="inline-flex items-center px-5 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-sm font-semibold tracking-wide mb-8">
          START TODAY
        </div>

        {/* Heading */}
        <h2 className="max-w-4xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1] tracking-tight mb-8">
          Take control
          <br />
          of your budget.
        </h2>

        {/* Description */}
        <p className="max-w-2xl text-base md:text-xl text-slate-400 leading-relaxed mb-12">
          Manage shared and personal expenses effortlessly with a modern financial platform built for simplicity and speed.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          
          <Button
            onClick={() => navigate('/signup')}
            size="lg"
            className="sm:w-auto"
          >
            Get Started
          </Button>

          <Button
            onClick={() => navigate('/login')}
            variant="secondary"
            size="lg"
            className="sm:w-auto"
          >
            Explore Demo
          </Button>
        </div>
      </div>
    </div>
  </div>
</section>

{/* Footer */}
<footer
  id="footer"
  className="relative z-10 border-t border-white/5 bg-[#020617] py-20"
>
  <div className="max-w-7xl mx-auto px-6 lg:px-10">
    
    {/* Main Footer */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-14 lg:gap-20 pb-16 border-b border-white/5">
      
      {/* Brand */}
      <div className="lg:col-span-2">
        <Logo className="mb-6" />

        <p className="max-w-md text-slate-400 text-base leading-relaxed">
          The most intuitive platform for modern expense management.
          Built for seamless shared and personal budgeting.
        </p>

        {/* Social Icons */}
        <div className="flex items-center gap-4 mt-8">
          
          <button className="w-11 h-11 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300 text-slate-400 hover:text-white">
            ✕
          </button>

          <button className="w-11 h-11 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300 text-slate-400 hover:text-white">
            ◎
          </button>

          <button className="w-11 h-11 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300 text-slate-400 hover:text-white">
            ◉
          </button>
        </div>
      </div>

      {/* Footer Links */}
      {[
        {
          title: 'Platform',
          links: ['Features', 'Security', 'API'],
        },
        {
          title: 'Company',
          links: ['About Us', 'Privacy', 'Terms'],
        },
        {
          title: 'Support',
          links: ['Help Center', 'Contact', 'Status'],
        },
      ].map((section, i) => (
        <div key={i}>
          
          <h4 className="text-white text-sm font-bold uppercase tracking-[0.2em] mb-7">
            {section.title}
          </h4>

          <ul className="space-y-5">
            {section.links.map((link, idx) => (
              <li key={idx}>
                <a
                  href="#"
                  className="text-slate-500 hover:text-emerald-400 text-sm font-medium transition-colors duration-300"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    {/* Bottom Footer */}
    <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-5">
      
      <p className="text-sm text-slate-500 text-center md:text-left">
        © 2026 FinTrack Inc. All rights reserved.
      </p>

      <span className="text-xs uppercase tracking-[0.25em] text-slate-700 font-bold">
        Premium Dark Experience
      </span>
    </div>
  </div>
</footer>
</div>
  ) 
}