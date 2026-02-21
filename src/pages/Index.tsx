import { useState, useMemo, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Target,
  Sparkles,
  MapPin,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  PlaneTakeoff,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

interface Profile {
  full_name: string
}

interface TravelGoal {
  destination_name: string
  target_miles: number
  current_miles: number
}

export default function Index() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [goal, setGoal] = useState<TravelGoal | null>(null)

  const [productName, setProductName] = useState('')
  const [productValue, setProductValue] = useState<string>('5000')
  const [pointsPerReal, setPointsPerReal] = useState<string>('10')
  const [transferBonus, setTransferBonus] = useState<number[]>([100])

  useEffect(() => {
    async function fetchData() {
      if (!user) return
      try {
        const [profileRes, goalsRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single(),
          supabase
            .from('travel_goals')
            .select('*')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle(),
        ])

        if (profileRes.data) setProfile(profileRes.data)
        if (goalsRes.data) setGoal(goalsRes.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const goalTotal = goal?.target_miles || 120000
  const currentMiles = goal?.current_miles || 0
  const currentPercentage = goalTotal > 0 ? (currentMiles / goalTotal) * 100 : 0

  const numericValue = parseFloat(productValue) || 0
  const numericMultiplier = parseFloat(pointsPerReal) || 0
  const bonusPercentage = transferBonus[0] || 0

  const generatedMiles = useMemo(() => {
    return Math.floor(
      numericValue * numericMultiplier * (1 + bonusPercentage / 100),
    )
  }, [numericValue, numericMultiplier, bonusPercentage])

  const percentageOfGoal = useMemo(() => {
    return goalTotal > 0
      ? ((generatedMiles / goalTotal) * 100).toFixed(1)
      : '0.0'
  }, [generatedMiles, goalTotal])

  const [animatedMiles, setAnimatedMiles] = useState(0)

  useEffect(() => {
    let start = animatedMiles
    const end = generatedMiles
    if (start === end) return
    const duration = 500
    const incrementTime = 20
    const steps = duration / incrementTime
    const stepValue = (end - start) / steps

    const timer = setInterval(() => {
      start += stepValue
      if ((stepValue > 0 && start >= end) || (stepValue < 0 && start <= end)) {
        setAnimatedMiles(end)
        clearInterval(timer)
      } else {
        setAnimatedMiles(Math.floor(start))
      }
    }, incrementTime)

    return () => clearInterval(timer)
  }, [generatedMiles])

  if (loading) {
    return (
      <div className="space-y-6 md:space-y-8 pb-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Skeleton className="h-[300px] w-full rounded-xl" />
            <Skeleton className="h-[140px] w-full rounded-xl" />
          </div>
          <div className="lg:col-span-7">
            <Skeleton className="h-[460px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  const isHighValue = parseFloat(percentageOfGoal) >= 10

  return (
    <div className="space-y-6 md:space-y-8 pb-4">
      <section className="animate-fade-in-up">
        <h2 className="text-2xl md:text-3xl font-bold text-secondary tracking-tight">
          Olá, {profile?.full_name || 'Viajante'}! 👋
        </h2>
        <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">
          {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(
            new Date(),
          )}
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Goal Card */}
        <div
          className="lg:col-span-5 flex flex-col gap-6 animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          <Card className="overflow-hidden border-none shadow-elevation relative group h-[300px] flex flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-700 opacity-95 z-0"></div>
            <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/800/600?q=orlando%20disney')] bg-cover bg-center mix-blend-overlay opacity-30 z-0 transition-transform duration-700 group-hover:scale-105"></div>

            <CardHeader className="relative z-10 text-white pb-2">
              <div className="flex justify-between items-start mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium text-white shadow-sm border border-white/10">
                  <Target className="w-3.5 h-3.5" />
                  Meta Ativa
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm border border-white/10">
                  <MapPin className="w-3.5 h-3.5" /> Viagem
                </span>
              </div>
              <CardTitle className="text-2xl font-bold leading-tight text-white drop-shadow-sm">
                {goal?.destination_name || 'Nenhuma meta definida'}
              </CardTitle>
              <CardDescription className="text-primary-foreground/90 text-sm font-medium drop-shadow-sm">
                Acompanhe o seu progresso
              </CardDescription>
            </CardHeader>

            <CardContent className="relative z-10 text-white pt-2 pb-6">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <div className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow-md">
                    {new Intl.NumberFormat('pt-BR').format(currentMiles)}
                  </div>
                  <div className="text-primary-foreground/90 text-sm font-medium drop-shadow-sm">
                    de {new Intl.NumberFormat('pt-BR').format(goalTotal)} milhas
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold drop-shadow-md">
                    {currentPercentage.toFixed(1)}%
                  </div>
                  <div className="text-primary-foreground/90 text-[10px] uppercase tracking-wider font-bold drop-shadow-sm">
                    Concluído
                  </div>
                </div>
              </div>

              <div className="relative h-4 mt-6 bg-black/20 rounded-full overflow-hidden backdrop-blur-md border border-white/10 shadow-inner">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent to-orange-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  style={{ width: `${Math.min(currentPercentage, 100)}%` }}
                ></div>
                <PlaneTakeoff
                  className="absolute top-1/2 -translate-y-1/2 text-white drop-shadow-lg w-5 h-5 transition-all duration-1000 ease-out"
                  style={{
                    left: `calc(${Math.min(currentPercentage, 100)}% - 10px)`,
                  }}
                />
              </div>

              <div className="mt-5 flex items-center justify-between text-xs text-primary-foreground bg-black/20 px-3.5 py-2.5 rounded-xl backdrop-blur-md border border-white/10 shadow-sm">
                <span className="flex items-center gap-1.5 font-medium">
                  <TrendingUp className="w-3.5 h-3.5 text-success" /> Em bom
                  ritmo
                </span>
                <span className="font-medium">Faltam ~3 meses</span>
              </div>
            </CardContent>
          </Card>

          {/* Dicas do Radar */}
          <Card className="bg-primary/5 border-primary/10 shadow-sm transition-all duration-300 hover:bg-primary/10">
            <CardContent className="p-5 flex gap-4 items-start">
              <div className="bg-primary/10 p-2.5 rounded-full text-primary shrink-0 mt-0.5">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-secondary text-sm mb-1.5">
                  Dica do Radar
                </h4>
                <p className="text-secondary/80 text-sm leading-relaxed font-medium">
                  Transfira seus pontos com{' '}
                  <strong className="text-primary">100% de bônus</strong> na
                  Livelo hoje! A promoção é válida até amanhã às 23:59.
                </p>
                <button className="mt-3 text-primary text-sm font-bold flex items-center gap-1.5 hover:text-primary/80 transition-colors group">
                  Ver detalhes{' '}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Magic Calculator */}
        <div
          className="lg:col-span-7 animate-fade-in-up"
          style={{ animationDelay: '200ms' }}
        >
          <Card className="shadow-elevation border-muted h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:border-primary/20">
            <CardHeader className="pb-5 border-b border-muted">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-bold text-xs tracking-wider uppercase text-muted-foreground">
                  Simulador
                </span>
              </div>
              <CardTitle className="text-2xl md:text-3xl text-secondary font-bold tracking-tight">
                A Calculadora Mágica
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base font-medium">
                Descubra quantas milhas a sua próxima compra pode render.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-8 flex-1 flex flex-col gap-6">
              <div className="space-y-6">
                <div className="space-y-2.5">
                  <Label
                    htmlFor="product-name"
                    className="text-secondary font-semibold"
                  >
                    O que você vai comprar?
                  </Label>
                  <Input
                    id="product-name"
                    placeholder="Ex: iPhone 15 Pro, Geladeira..."
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="h-12 bg-muted/30 border-muted focus:bg-background transition-colors text-base font-medium shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2.5">
                    <Label
                      htmlFor="product-value"
                      className="text-secondary font-semibold"
                    >
                      Valor do produto (R$)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                        R$
                      </span>
                      <Input
                        id="product-value"
                        type="number"
                        placeholder="0.00"
                        value={productValue}
                        onChange={(e) => setProductValue(e.target.value)}
                        className={cn(
                          'pl-10 h-12 bg-muted/30 border-muted focus:bg-background text-base font-medium transition-colors shadow-sm',
                          productValue
                            ? 'border-primary/30 ring-primary/10'
                            : '',
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <Label
                      htmlFor="points-multiplier"
                      className="text-secondary font-semibold"
                    >
                      Pontos por Real
                    </Label>
                    <div className="relative">
                      <Input
                        id="points-multiplier"
                        type="number"
                        placeholder="Ex: 10"
                        value={pointsPerReal}
                        onChange={(e) => setPointsPerReal(e.target.value)}
                        className={cn(
                          'pr-14 h-12 bg-muted/30 border-muted focus:bg-background text-base font-medium transition-colors shadow-sm',
                          pointsPerReal
                            ? 'border-primary/30 ring-primary/10'
                            : '',
                        )}
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">
                        pts/R$
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 pt-5 border-t border-muted/50">
                  <div className="flex justify-between items-center">
                    <Label className="text-secondary font-semibold">
                      Bônus de Transferência
                    </Label>
                    <span className="font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg shadow-sm">
                      {transferBonus[0]}%
                    </span>
                  </div>
                  <Slider
                    value={transferBonus}
                    onValueChange={setTransferBonus}
                    max={150}
                    step={10}
                    className="py-3 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground font-bold">
                    <span>0%</span>
                    <span>150%</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="p-6 md:p-8 bg-muted/30 border-t border-muted rounded-b-xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="w-full sm:w-auto">
                  <p className="text-muted-foreground font-semibold text-sm mb-1 text-center sm:text-left uppercase tracking-wider">
                    Milhas Geradas
                  </p>
                  <div className="text-5xl md:text-6xl font-extrabold text-secondary tracking-tighter text-center sm:text-left transition-all duration-200">
                    <span className="bg-clip-text text-transparent bg-gradient-to-br from-primary to-blue-600 drop-shadow-sm">
                      {new Intl.NumberFormat('pt-BR').format(animatedMiles)}
                    </span>
                  </div>
                </div>

                <div
                  className={cn(
                    'p-4 rounded-xl border max-w-[280px] w-full text-center sm:text-left transition-all duration-500',
                    isHighValue
                      ? 'bg-emerald-50 border-emerald-200 shadow-[0_4px_20px_rgba(16,185,129,0.15)] scale-105'
                      : 'bg-card border-border shadow-sm',
                  )}
                >
                  <p
                    className={cn(
                      'text-sm font-medium leading-relaxed',
                      isHighValue ? 'text-emerald-800' : 'text-secondary/80',
                    )}
                  >
                    Com essa compra, você garante{' '}
                    <strong
                      className={cn(
                        'text-xl block mt-1 font-black',
                        isHighValue ? 'text-emerald-600' : 'text-primary',
                      )}
                    >
                      {percentageOfGoal}%
                    </strong>{' '}
                    da sua passagem!
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
