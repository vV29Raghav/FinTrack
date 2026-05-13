import { useRouter } from '../Router.jsx'
import { Button } from '../components/ui.jsx'

const FEATURES = [
  {
    icon: '⚡',
    title: 'Instant Expense Sync',
    desc: 'Expenses update live across all devices without refreshing.',
  },
  {
    icon: '🧮',
    title: 'Smart Balance Settlement',
    desc: 'Automatically reduces unnecessary transactions between members.',
  },
  {
    icon: '📊',
    title: 'Expense Insights',
    desc: 'View spending trends, charts, and category-wise breakdowns.',
  },
  {
    icon: '🔒',
    title: 'Secure Authentication',
    desc: 'Protected using JWT auth, bcrypt encryption, and secure APIs.',
  },
  {
    icon: '📱',
    title: 'Responsive Design',
    desc: 'Smooth experience across mobile, tablet, and desktop devices.',
  },
  {
    icon: '🌍',
    title: 'Multiple Currencies',
    desc: 'Supports INR, USD, EUR, and many other global currencies.',
  },
]

export default function LandingPage() {
  const { navigate } = useRouter()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">

        {/* Logo */}
        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
            S
          </div>

          <div>
            <h1 className="font-extrabold text-lg text-slate-900 dark:text-white">
              SplitWise Pro
            </h1>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Expense Manager
            </p>
          </div>

        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">

          <Button
            variant="secondary"
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>

          <Button
            onClick={() => navigate('/signup')}
          >
            Get Started
          </Button>

        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">

        <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-5 py-2 rounded-full text-sm font-semibold mb-8 shadow-sm">
          🚀 Used by 50,000+ users worldwide
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-tight mb-7">

          Split expenses
          <br />

          <span className="text-emerald-500">
            without the stress.
          </span>

        </h1>

        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Easily manage shared expenses, split bills fairly,
          and keep track of balances with friends, family,
          roommates, and teams.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">

          <Button
            size="lg"
            onClick={() => navigate('/signup')}
          >
            Start Free →
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/login')}
          >
            Explore Demo
          </Button>

        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-20">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {FEATURES.map(feature => (

            <div
              key={feature.title}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all duration-200"
            >

              <div className="text-4xl mb-4">
                {feature.icon}
              </div>

              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                {feature.title}
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {feature.desc}
              </p>

            </div>

          ))}

        </div>

      </section>
    </div>
  )
}