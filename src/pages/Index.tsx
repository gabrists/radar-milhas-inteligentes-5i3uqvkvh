import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Wallet,
  AlertTriangle,
  TrendingUp,
  Tag,
  ArrowRight,
  PlaneTakeoff,
  MapPin,
  Target,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface TravelGoal {
  id: string
  destination_name: string
  target_miles: number
  image_url: string | null
}

const programsList = [
  { name: 'Livelo', color: 'bg-pink-100 text-pink-700', icon: 'L' },
  { name: 'Esfera', color: 'bg-red-100 text-red-700', icon: 'E' },
  { name: 'Smiles', color: 'bg-orange-100 text-orange-700', icon: 'S' },
  { name: 'Latam Pass', color: 'bg-blue-100 text-blue-700', icon: 'LP' },
  { name: 'TudoAzul', color: 'bg-cyan-100 text-cyan-700', icon: 'TA' },
]

export default function Index() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [promo, setPromo] = useState<any>(null)
  const [goal, setGoal] = useState<TravelGoal | null>(null)
  const [balances, setBalances] = useState<Record<string, number>>({})

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState('')
  const [newBalance, setNewBalance] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function fetchData() {
      if (!user) return
      try {
        const [profileRes, promoRes, goalRes, balancesRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single(),
          supabase
            .from('active_promotions')
            .select('*')
            .order('bonus_percentage', { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from('travel_goals')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .maybeSingle(),
          supabase.from('loyalty_balances').select('*').eq('user_id', user.id),
        ])

        if (profileRes.data) setProfile(profileRes.data)
        if (promoRes.data) setPromo(promoRes.data)

        if (goalRes.data) {
          setGoal(goalRes.data)
        } else {
          const fallbackGoal = await supabase
            .from('travel_goals')
            .select('*')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle()
          if (fallbackGoal.data) setGoal(fallbackGoal.data)
        }

        const newBalances: Record<string, number> = {}
        programsList.forEach((p) => (newBalances[p.name] = 0))
        if (balancesRes.data) {
          balancesRes.data.forEach((b: any) => {
            newBalances[b.program_name] = b.balance
          })
        }
        setBalances(newBalances)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const totalBalance = Object.values(balances).reduce(
    (acc, curr) => acc + curr,
    0,
  )
  const estimatedValue = (totalBalance / 1000) * 20

  const goalTotal = goal?.target_miles || 100000
  const currentPercentage = goalTotal > 0 ? (totalBalance / goalTotal) * 100 : 0
  const goalImage =
    goal?.image_url ||
    `https://img.usecurling.com/p/800/600?q=${encodeURIComponent(goal?.destination_name || 'vacation')}&dpr=2`

  const handleOpenModal = (program: string) => {
    setSelectedProgram(program)
    setNewBalance(balances[program]?.toString() || '0')
    setIsModalOpen(true)
  }

  const handleSaveBalance = async () => {
    if (!user) return
    setIsSaving(true)
    try {
      const val = parseInt(newBalance, 10) || 0
      const { data: existing } = await supabase
        .from('loyalty_balances')
        .select('id')
        .eq('user_id', user.id)
        .eq('program_name', selectedProgram)
        .maybeSingle()

      if (existing) {
        await supabase
          .from('loyalty_balances')
          .update({ balance: val, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('loyalty_balances')
          .insert({
            user_id: user.id,
            program_name: selectedProgram,
            balance: val,
          })
      }

      setBalances((prev) => ({ ...prev, [selectedProgram]: val }))
      setIsModalOpen(false)
      toast({ title: 'Sucesso!', description: 'Saldo atualizado com sucesso.' })
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao tentar atualizar o saldo.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 md:space-y-8 pb-4">
        <Skeleton className="h-[200px] w-full rounded-2xl" />
        <Skeleton className="h-[140px] w-full rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 md:space-y-10 pb-6">
      <section className="animate-fade-in-up">
        <h2 className="text-2xl md:text-3xl font-bold text-secondary tracking-tight">
          Olá, {profile?.full_name || 'Viajante'}! 👋
        </h2>
        <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">
          Confira o resumo da sua carteira de milhas e as melhores oportunidades
          do momento.
        </p>
      </section>

      <div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-blue-800 p-6 md:p-8 text-white shadow-elevation animate-fade-in-up"
        style={{ animationDelay: '50ms' }}
      >
        <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/1200/400?q=airport%20lounge')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold shadow-sm border border-white/10">
              <Tag className="w-4 h-4" /> Hub de Promoções
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold leading-tight drop-shadow-md">
              {promo
                ? `🔥 ${promo.title}`
                : 'Fique por dentro das melhores ofertas!'}
            </h3>
            <p className="text-white/90 text-sm md:text-base font-medium">
              {promo
                ? `Transfira seus pontos com até ${promo.bonus_percentage}% de bônus e alcance seu próximo destino mais rápido.`
                : 'Aproveite bônus de transferência e acelere sua viagem.'}
            </p>
          </div>
          <Button
            asChild
            variant="secondary"
            size="lg"
            className="font-bold shadow-sm shrink-0"
          >
            <Link to="/promocoes">
              Ver todas as ofertas <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div
          className="lg:col-span-8 flex flex-col gap-8 animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          <Card className="shadow-elevation border-muted bg-white overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-primary" /> Patrimônio em
                    Milhas
                  </p>
                  <h2 className="text-4xl md:text-5xl font-black text-secondary tracking-tight">
                    {new Intl.NumberFormat('pt-BR').format(totalBalance)}{' '}
                    <span className="text-2xl text-muted-foreground font-semibold">
                      mi
                    </span>
                  </h2>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 mt-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <p className="text-emerald-700 font-bold text-sm">
                      Valor Estimado: ~{' '}
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(estimatedValue)}
                    </p>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex flex-col gap-2 w-full md:max-w-[280px]">
                  <div className="flex items-center gap-2 text-orange-800 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    Atenção aos Vencimentos
                  </div>
                  <p className="text-orange-700/90 text-sm font-medium leading-snug">
                    ⚠️ 5.000 pontos Livelo vencem em 15 dias. Transfira agora e
                    não perca!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <h3 className="text-xl font-bold text-secondary flex items-center gap-2">
              <Wallet className="w-6 h-6 text-primary" />
              Minha Carteira
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
              {programsList.map((prog) => (
                <Link
                  key={prog.name}
                  to={`/programa/${prog.name.toLowerCase().replace(/\s+/g, '')}`}
                  className="block"
                >
                  <Card className="shadow-sm border-muted transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-primary/30 h-full">
                    <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${prog.color}`}
                      >
                        {prog.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-secondary">
                          {prog.name}
                        </h4>
                        <p className="text-2xl font-bold text-primary mt-1">
                          {new Intl.NumberFormat('pt-BR').format(
                            balances[prog.name] || 0,
                          )}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs font-semibold text-muted-foreground hover:text-primary mt-2"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleOpenModal(prog.name)
                        }}
                      >
                        Atualizar saldo
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div
          className="lg:col-span-4 flex flex-col gap-6 animate-fade-in-up"
          style={{ animationDelay: '150ms' }}
        >
          <Card className="overflow-hidden border-none shadow-elevation relative group h-[300px] flex flex-col justify-between shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-700 opacity-95 z-0"></div>
            <div
              className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30 z-0 transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url('${goalImage}')` }}
            ></div>

            <CardHeader className="relative z-10 text-white pb-2">
              <div className="flex justify-between items-start mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium text-white shadow-sm border border-white/10">
                  <Target className="w-3.5 h-3.5" />
                  Progresso da Viagem
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm border border-white/10">
                  <MapPin className="w-3.5 h-3.5" /> Principal
                </span>
              </div>
              <CardTitle className="text-2xl font-bold leading-tight text-white drop-shadow-sm">
                {goal?.destination_name || 'Nenhuma meta definida'}
              </CardTitle>
            </CardHeader>

            <CardContent className="relative z-10 text-white pt-2 pb-6">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <div className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow-md">
                    {new Intl.NumberFormat('pt-BR').format(totalBalance)}
                  </div>
                  <div className="text-primary-foreground/90 text-sm font-medium drop-shadow-sm">
                    de {new Intl.NumberFormat('pt-BR').format(goalTotal)} milhas
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold drop-shadow-md">
                    {currentPercentage.toFixed(1)}%
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
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Atualizar Saldo: {selectedProgram}
            </DialogTitle>
            <DialogDescription>
              Insira o saldo atual consolidado que você possui no{' '}
              {selectedProgram}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label
              htmlFor="balance"
              className="mb-2 block font-semibold text-secondary"
            >
              Saldo de Milhas / Pontos
            </Label>
            <Input
              id="balance"
              type="number"
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
              className="h-12 text-lg focus-visible:ring-primary/20"
              placeholder="0"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveBalance} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Wallet className="w-4 h-4 mr-2" />
              )}
              Salvar Saldo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
