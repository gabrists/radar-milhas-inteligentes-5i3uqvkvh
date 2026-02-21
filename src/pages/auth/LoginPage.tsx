import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plane, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const getErrorMessage = (error: any) => {
  if (!error) return 'Ocorreu um erro desconhecido.'
  const msg = error.message || ''
  if (msg.includes('Invalid login credentials'))
    return 'E-mail ou senha incorretos.'
  if (msg.includes('User already registered'))
    return 'Este e-mail já está em uso.'
  if (msg.includes('Email not confirmed'))
    return 'Por favor, confirme seu e-mail.'
  return msg
}

export default function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth()
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      toast({
        title: 'Erro ao entrar',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    }
    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível conectar com o Google.',
        variant: 'destructive',
      })
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-1/2 w-full h-[35vh] md:h-screen relative flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-primary/20 z-10 mix-blend-multiply" />
        <img
          src="https://img.usecurling.com/p/800/1200?q=modern airport terminal"
          alt="Aeroporto Moderno"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white p-8">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-full mb-6 shadow-elevation border border-white/10">
            <Plane className="w-10 h-10 md:w-14 md:h-14" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-center drop-shadow-lg mb-4">
            Radar Milhas
          </h1>
          <p className="text-base md:text-xl text-center text-white/90 font-medium max-w-md drop-shadow-md">
            O seu painel inteligente para gerenciar, simular e acelerar suas
            metas de viagem.
          </p>
        </div>
      </div>

      <div className="md:w-1/2 w-full flex items-center justify-center p-6 md:p-12 bg-background flex-1">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-secondary tracking-tight">
              Bem-vindo de volta
            </h2>
            <p className="text-muted-foreground mt-2 font-medium text-sm md:text-base">
              Acesse sua conta para continuar acumulando milhas e alcançando
              seus destinos.
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-5 mt-8">
            <div className="space-y-2.5">
              <Label htmlFor="email" className="font-semibold">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 focus-visible:ring-primary/20 transition-all bg-muted/20"
              />
            </div>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="font-semibold">
                  Senha
                </Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 focus-visible:ring-primary/20 transition-all bg-muted/20"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all mt-2"
              disabled={loading || googleLoading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground font-bold tracking-wider">
                Ou continue com
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base font-semibold bg-background hover:bg-muted/30 transition-colors"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Continuar com o Google
          </Button>

          <p className="text-center text-sm font-medium text-muted-foreground mt-8">
            Não tem conta?{' '}
            <Link
              to="/cadastro"
              className="text-primary hover:text-primary/80 font-bold transition-colors underline-offset-4 hover:underline"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
