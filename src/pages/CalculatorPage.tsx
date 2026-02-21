import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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
import { Button } from '@/components/ui/button'
import { Sparkles, PlaneTakeoff, Loader2, Calculator } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface TravelGoal {
  id: string
  destination_name: string
  target_miles: number
  current_miles: number
}

export default function CalculatorPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const location = useLocation()
  const navigate = useNavigate()

  const calculatorRef = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [goal, setGoal] = useState<TravelGoal | null>(null)

  const [productName, setProductName] = useState('')
  const [productValue, setProductValue] = useState<string>('5000')
  const [pointsPerReal, setPointsPerReal] = useState<string>('10')
  const [transferBonus, setTransferBonus] = useState<number[]>([100])

  useEffect(() => {
    async function fetchData() {
      if (!user) return
      try {
        const goalsRes = await supabase
          .from('travel_goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle()

        if (goalsRes.data) {
          setGoal(goalsRes.data)
        } else {
          const fallback = await supabase
            .from('travel_goals')
            .select('*')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle()
          if (fallback.data) setGoal(fallback.data)
        }
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

  const handleSaveMiles = async () => {
    if (!user || !goal) return

    setIsSaving(true)
    try {
      const newTotalMiles = currentMiles + generatedMiles

      const { error } = await supabase
        .from('travel_goals')
        .update({ current_miles: newTotalMiles })
        .eq('id', goal.id)

      if (error) throw error

      setGoal((prev) =>
        prev ? { ...prev, current_miles: newTotalMiles } : null,
      )

      toast({
        title: 'Sucesso!',
        description:
          'Simulação registrada e milhas adicionadas com sucesso à sua meta!',
      })

      setProductName('')
      setProductValue('')
    } catch (error) {
      console.error('Error saving miles:', error)
      toast({
        title: 'Erro ao salvar',
        description:
          'Ocorreu um erro ao tentar adicionar as milhas. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const applyPromo = useCallback(
    (bonus: number) => {
      setTransferBonus([bonus])
      setTimeout(() => {
        calculatorRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 100)
      toast({
        title: 'Bônus Aplicado!',
        description: `A calculadora foi ajustada para ${bonus}% de bônus automaticamente.`,
      })
    },
    [toast],
  )

  useEffect(() => {
    if (location.state?.applyBonus) {
      applyPromo(location.state.applyBonus)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, navigate, location.pathname, applyPromo])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 pb-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex flex-col gap-6 md:gap-8">
          <div>
            <Skeleton className="h-[460px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  const isHighValue = parseFloat(percentageOfGoal) >= 10
  const isFormValid = numericValue > 0 && numericMultiplier > 0

  return (
    <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 pb-4">
      <section className="animate-fade-in-up">
        <h2 className="text-2xl md:text-3xl font-bold text-secondary tracking-tight flex items-center gap-2">
          <Calculator className="w-8 h-8 text-primary" />
          Calculadora Mágica
        </h2>
        <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">
          Simule quantas milhas a sua próxima compra pode render e projete na
          sua meta.
        </p>
      </section>

      <div className="flex flex-col gap-6 md:gap-8">
        <div
          ref={calculatorRef}
          className="animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          <Card className="shadow-elevation border-muted h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:border-primary/20 scroll-mt-24">
            <CardHeader className="pb-5 border-b border-muted">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-bold text-xs tracking-wider uppercase text-muted-foreground">
                  Simulador de Ganhos
                </span>
              </div>
              <CardTitle className="text-2xl md:text-3xl text-secondary font-bold tracking-tight">
                Calculadora Mágica
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base font-medium">
                Insira o valor da compra e descubra quantas milhas renderá.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-8 flex-1 flex flex-col gap-6">
              <div className="space-y-6">
                <div className="space-y-2.5">
                  <Label
                    htmlFor="product-name"
                    className="text-secondary font-semibold"
                  >
                    O que você vai simular?
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

                <div className="pt-2">
                  <Button
                    onClick={handleSaveMiles}
                    disabled={isSaving || !isFormValid || !goal}
                    className="w-full h-12 text-base font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />A
                        guardar...
                      </>
                    ) : (
                      <>
                        <PlaneTakeoff className="w-5 h-5 mr-2" />
                        Adicionar à minha Meta
                      </>
                    )}
                  </Button>
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
