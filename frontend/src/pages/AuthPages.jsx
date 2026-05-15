import { useState } from 'react'
import { useRouter } from '../Router.jsx'
import { useAuth } from '../AppContext.jsx'
import { Button, Input, Card } from '../components/ui.jsx'
import { toast } from '../utils.js'
import { auth } from '../api.js'

function Logo({ className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20">
        F
      </div>
      <span className="font-bold text-2xl tracking-tight text-white">FinTrack</span>
    </div>
  )
}

function AuthLayout({ title, sub, children }) {
  const { navigate } = useRouter()
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-[420px] z-10 animate-fade-up">
        <div className="flex justify-center mb-12">
          <Logo />
        </div>

        <Card className="p-10 border-white/5 bg-white/[0.02] shadow-2xl">
          <h2 className="text-3xl font-black text-white mb-3 tracking-tight text-center">{title}</h2>
          <p className="text-sm font-medium text-slate-500 mb-10 leading-relaxed text-center">{sub}</p>
          
          {children}
          
          <button 
            onClick={() => navigate('/')} 
            className="mt-10 w-full text-center text-xs font-black uppercase tracking-[0.2em] text-slate-600 hover:text-emerald-500 transition-colors"
          >
            ← Back to Home
          </button>
        </Card>
      </div>
    </div>
  )
}

export function LoginPage() {
  const { navigate } = useRouter()
  const { login, verifyEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const [step, setStep] = useState('login') // 'login', 'verify', 'forgot', 'reset'
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const submitLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    const res = await login(email, password)
    setLoading(false)
    if (res.needsVerification) setStep('verify')
    else if (res.success) navigate('/dashboard')
  }

  const submitVerify = async (e) => {
    e.preventDefault()
    if (!otp) { toast.error('Please enter the OTP'); return }
    setLoading(true)
    const success = await verifyEmail(email, otp)
    setLoading(false)
    if (success) navigate('/dashboard')
  }

  const submitForgot = async (e) => {
    e.preventDefault()
    if (!email) { toast.error('Please enter your email address'); return }
    setLoading(true)
    try {
      await auth.forgotPassword(email)
      toast.success('If an account exists, an OTP was sent to your email.')
      setStep('reset')
    } catch (err) {
      toast.error('Failed to request password reset')
    }
    setLoading(false)
  }

  const submitReset = async (e) => {
    e.preventDefault()
    if (!otp || !newPassword) { toast.error('Please fill in all fields'); return }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await auth.resetPassword(email, otp, newPassword)
      toast.success('Password reset successful. You can now log in.')
      setStep('login')
      setPassword('')
      setOtp('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password')
    }
    setLoading(false)
  }

  if (step === 'verify') {
    return (
      <AuthLayout title="Verify Email" sub={`We've sent a 6-digit code to ${email}`}>
        <form onSubmit={submitVerify} className="space-y-6">
          <Input label="Verification Code" type="text" placeholder="000000"
            value={otp} onChange={e => setOtp(e.target.value)} required/>
          <Button type="submit" full loading={loading} size="lg">Verify & Continue</Button>
          <button type="button" onClick={() => setStep('login')} className="w-full text-center text-sm font-bold text-emerald-500 hover:text-emerald-400">
            Back to login
          </button>
        </form>
      </AuthLayout>
    )
  }

  if (step === 'forgot') {
    return (
      <AuthLayout title="Forgot Password" sub="Enter your email to receive a recovery code">
        <form onSubmit={submitForgot} className="space-y-6">
          <Input label="Email Address" type="email" placeholder="alex@example.com"
            value={email} onChange={e => setEmail(e.target.value)} required/>
          <Button type="submit" full loading={loading} size="lg">Send Code</Button>
          <button type="button" onClick={() => setStep('login')} className="w-full text-center text-sm font-bold text-emerald-500 hover:text-emerald-400">
            Back to login
          </button>
        </form>
      </AuthLayout>
    )
  }

  if (step === 'reset') {
    return (
      <AuthLayout title="New Password" sub="Enter the code and your new password">
        <form onSubmit={submitReset} className="space-y-6">
          <Input label="Verification Code" type="text" placeholder="000000"
            value={otp} onChange={e => setOtp(e.target.value)} required/>
          <Input label="New Password" type="password" placeholder="••••••••"
            value={newPassword} onChange={e => setNewPassword(e.target.value)} required/>
          <Button type="submit" full loading={loading} size="lg">Reset Password</Button>
          <button type="button" onClick={() => setStep('login')} className="w-full text-center text-sm font-bold text-emerald-500 hover:text-emerald-400">
            Back to login
          </button>
        </form>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Welcome back" sub="Log in to your account to continue managing your finances.">
      <form onSubmit={submitLogin} className="space-y-6">
        <Input label="Email address" type="email" placeholder="alex@example.com"
          value={email} onChange={e => setEmail(e.target.value)} required/>
        <Input label="Password" type="password" placeholder="••••••••"
          value={password} onChange={e => setPassword(e.target.value)} required/>
        <div className="text-right">
          <button type="button" onClick={() => setStep('forgot')} className="text-sm font-bold text-emerald-500 hover:text-emerald-400">Forgot password?</button>
        </div>
        <Button type="submit" full loading={loading} size="lg">Sign In</Button>
      </form>
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-white/5"/>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">New to FinTrack?</span>
        <div className="flex-1 h-px bg-white/5"/>
      </div>
      <Button variant="outline" full size="lg" onClick={() => navigate('/signup')}>Create Account</Button>
    </AuthLayout>
  )
}

export function SignupPage() {
  const { navigate } = useRouter()
  const { signup, verifyEmail } = useAuth()
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  
  const [step, setStep] = useState('signup') // 'signup' or 'verify'
  const [otp, setOtp] = useState('')

  const submitSignup = async (e) => {
    e.preventDefault()
    if (!form.firstName || !form.email || !form.password) { toast.error('Please fill in all fields'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    const res = await signup({
      name: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email,
      password: form.password
    })
    setLoading(false)
    if (res.needsVerification) {
      setStep('verify')
    }
  }

  const submitVerify = async (e) => {
    e.preventDefault()
    if (!otp) { toast.error('Please enter the OTP'); return }
    setLoading(true)
    const success = await verifyEmail(form.email, otp)
    setLoading(false)
    if (success) {
      toast.success(`Welcome, ${form.firstName}! 🎉`)
      navigate('/dashboard')
    }
  }

  if (step === 'verify') {
    return (
      <AuthLayout title="Verify Email" sub={`A code has been sent to ${form.email}`}>
        <form onSubmit={submitVerify} className="space-y-6">
          <Input label="Verification Code" type="text" placeholder="000000"
            value={otp} onChange={e => setOtp(e.target.value)} required/>
          <Button type="submit" full loading={loading} size="lg">Verify & Join</Button>
        </form>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Create account" sub="Start managing shared and personal expenses with ease today.">
      <form onSubmit={submitSignup} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Input label="First name" placeholder="Alex" value={form.firstName} onChange={e => set('firstName', e.target.value)} required/>
          <Input label="Last name"  placeholder="Johnson" value={form.lastName} onChange={e => set('lastName', e.target.value)}/>
        </div>
        <Input label="Email address" type="email" placeholder="alex@example.com"
          value={form.email} onChange={e => set('email', e.target.value)} required/>
        <Input label="Password" type="password" placeholder="Min 6 characters"
          value={form.password} onChange={e => set('password', e.target.value)} required/>
        <Button type="submit" full loading={loading} size="lg">Create Account</Button>
      </form>
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-white/5"/>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Already a member?</span>
        <div className="flex-1 h-px bg-white/5"/>
      </div>
      <Button variant="outline" full size="lg" onClick={() => navigate('/login')}>Sign In</Button>
    </AuthLayout>
  )
}
