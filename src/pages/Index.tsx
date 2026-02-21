import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
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
import { Badge } from '@/components/ui/badge'
import {
  Wallet,
  MapPin,
  Target,
  Loader2,
  Edit2,
  Sparkles,
  Percent,
  ArrowRight,
  PlusCircle,
  Clock,
  ExternalLink,
  Tag,
  ArrowRightLeft,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'
import { useToast } from '@/hooks/use-toast'
import { TransactionModal } from '@/components/TransactionModal'

type ActivePromotion = Database['public']['Tables']['active_promotions']['Row']

interface TravelGoal {
  id: string
  destination_name: string
  target_miles: number
  current_miles: number
  image_url: string | null
}

const programsList = [
  { name: 'Livelo', query: 'gift', color: 'rose' },
  { name: 'Esfera', query: 'sphere', color: 'red' },
  { name: 'Smiles', query: 'smile', color: 'orange' },
  { name: 'Latam Pass', query: 'plane', color: 'blue' },
  { name: 'TudoAzul', query: 'plane', color: 'cyan' },
]

export default function Index() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [promo, setPromo] = useState<ActivePromotion | null>(null)
  const [goal, setGoal] = useState<TravelGoal | null>(null)
  const [balances, setBalances] = useState<Record<string, number>>({})
  const [allPromotions, setAllPromotions] = useState<ActivePromotion[]>([])

  const [refreshKey, setRefreshKey] = useState(0)
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState('')
  const [newBalance, setNewBalance] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function fetchData() {
      if (!user) return
      try {
        const [profileRes, promosRes, goalRes, balancesRes] = await Promise.all(
          [
            supabase
              .from('profiles')
              .select('full_name')
              .eq('id', user.id)
              .single(),
            supabase
              .from('active_promotions')
              .select('*')
              .order('created_at', { ascending: false }),
            supabase
              .from('travel_goals')
              .select('*')
              .eq('user_id', user.id)
              .eq('is_active', true)
              .maybeSingle(),
            supabase
              .from('loyalty_balances')
              .select('*')
              .eq('user_id', user.id),
          ],
        )

        if (profileRes.data) setProfile(profileRes.data)
        if (promosRes.data) {
          setAllPromotions(promosRes.data)
          if (promosRes.data.length > 0) {
            const bestPromo = promosRes.data.reduce(
              (prev, current) =>
                prev.bonus_percentage > current.bonus_percentage
                  ? prev
                  : current,
              promosRes.data[0],
            )
            setPromo(bestPromo)
          }
        }

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
  }, [user, refreshKey])

  const totalBalance = Object.values(balances).reduce(
    (acc, curr) => acc + curr,
    0,
  )
  const goalTotal = goal?.target_miles || 100000
  const currentMiles = goal?.current_miles || totalBalance
  const currentPercentage = goalTotal > 0 ? (currentMiles / goalTotal) * 100 : 0
  const goalImage =
    goal?.image_url ||
    `https://img.usecurling.com/p/800/600?q=${encodeURIComponent(goal?.destination_name || 'vacation')}&dpr=2`
  const promoImage = promo
    ? `https://img.usecurling.com/p/400/300?q=${encodeURIComponent(promo.destination)}&dpr=2`
    : `https://img.usecurling.com/p/400/300?q=airport&dpr=2`

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
        await supabase.from('loyalty_balances').insert({
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
      <div className="space-y-10 md:space-y-12 pb-8">
        <Skeleton className="h-8 w-48 rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[360px] w-full rounded-2xl lg:col-span-2" />
          <Skeleton className="h-[360px] w-full rounded-2xl lg:col-span-1" />
        </div>
        <div className="space-y-4 mt-8">
          <Skeleton className="h-8 w-48 rounded-md" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 md:space-y-12 pb-8">
      <section className="animate-fade-in-up">
        <h1 className="text-xl md:text-2xl font-bold text-secondary tracking-tight">
          Olá, {profile?.full_name?.split(' ')[0] || 'Viajante'}
        </h1>
      </section>

      <section
        className="animate-fade-in-up"
        style={{ animationDelay: '50ms' }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h2 className="text-xl font-bold text-secondary flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" /> Minha Carteira
          </h2>
          <Button
            onClick={() => setIsTransactionModalOpen(true)}
            className="font-bold shadow-sm rounded-full shrink-0 h-10 px-5"
          >
            <PlusCircle className="w-4 h-4 mr-2" /> Nova Movimentação
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {programsList.map((prog) => (
            <Card
              key={prog.name}
              className="flex items-center p-4 gap-4 group hover:shadow-md transition-all duration-200 border-muted hover:border-primary/20 cursor-pointer rounded-2xl bg-white"
              onClick={() =>
                navigate(
                  `/programa/${prog.name.toLowerCase().replace(/\s+/g, '')}`,
                )
              }
            >
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-muted/50 bg-muted/20 flex items-center justify-center">
                <img
                  src={`https://img.usecurling.com/i?q=${prog.name}&color=${prog.color}`}
                  alt={prog.name}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.parentElement!.innerHTML = `<span class="font-bold text-lg text-muted-foreground">${prog.name.charAt(0)}</span>`
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-muted-foreground truncate">
                  {prog.name}
                </h3>
                <p className="text-xl font-bold text-secondary truncate mt-0.5">
                  {new Intl.NumberFormat('pt-BR').format(
                    balances[prog.name] || 0,
                  )}
                </p>
              </div>

              <div
                className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:bg-primary/10 group-hover:text-primary transition-all shrink-0 z-10"
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenModal(prog.name)
                }}
              >
                <Edit2 className="w-4 h-4" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 animate-fade-in-up"
        style={{ animationDelay: '100ms' }}
      >
        <div className="lg:col-span-2 flex flex-col h-full">
          <h2 className="text-xl font-bold text-secondary mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" /> Meta Principal
          </h2>
          <Card
            className="flex-1 overflow-hidden border-none shadow-elevation relative group min-h-[320px] rounded-2xl cursor-pointer"
            onClick={() => navigate('/objetivos')}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/60 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-90"></div>
            <img
              src={goalImage}
              alt={goal?.destination_name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            <div className="absolute top-4 left-4 z-20">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white shadow-sm border border-white/20">
                <MapPin className="w-3.5 h-3.5" /> Destino Ativo
              </span>
            </div>

            <CardContent className="absolute bottom-0 left-0 right-0 z-20 p-6 md:p-8 text-white">
              <CardTitle className="text-3xl md:text-4xl font-black leading-tight drop-shadow-md mb-6">
                {goal?.destination_name || 'Nenhuma meta definida'}
              </CardTitle>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div className="font-medium text-white/90">
                    <span className="text-2xl font-bold text-white mr-1">
                      {new Intl.NumberFormat('pt-BR').format(currentMiles)}
                    </span>
                    <span className="text-sm">
                      / {new Intl.NumberFormat('pt-BR').format(goalTotal)} mi
                    </span>
                  </div>
                  <div className="text-xl font-bold text-primary-foreground drop-shadow-sm bg-primary/20 px-2 py-0.5 rounded backdrop-blur-sm">
                    {currentPercentage.toFixed(1)}%
                  </div>
                </div>

                <div className="relative h-3 bg-black/40 rounded-full overflow-hidden backdrop-blur-md border border-white/10 shadow-inner">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(currentPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 flex flex-col h-full">
          <h2 className="text-xl font-bold text-secondary mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" /> Oportunidade do Dia
          </h2>
          <Card className="flex-1 flex flex-col overflow-hidden shadow-sm border-muted transition-all duration-300 hover:shadow-elevation hover:border-primary/30 rounded-2xl group">
            <div className="h-40 relative overflow-hidden shrink-0 bg-muted">
              <img
                src={promoImage}
                alt="Promoção"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 to-transparent"></div>
              {promo && (
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-accent text-accent-foreground text-xs font-black shadow-sm">
                    <Percent className="w-3.5 h-3.5" /> {promo.bonus_percentage}
                    % BÔNUS
                  </span>
                </div>
              )}
            </div>
            <CardContent className="p-5 flex flex-col flex-1 gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-secondary text-lg leading-tight mb-2 line-clamp-2">
                  {promo
                    ? promo.title
                    : 'Fique por dentro das melhores ofertas!'}
                </h3>
                <p className="text-sm font-medium text-muted-foreground line-clamp-2">
                  {promo
                    ? `Transfira de ${promo.origin} para ${promo.destination} e ganhe bônus exclusivos.`
                    : 'Aproveite bônus de transferência para acelerar sua viagem.'}
                </p>
              </div>
              <Button
                asChild
                className="w-full font-bold shadow-sm"
                variant={promo ? 'default' : 'outline'}
              >
                <Link to={promo ? `/promocoes/${promo.id}` : '/promocoes'}>
                  {promo ? 'Ver Promoção' : 'Ver Promoções'}{' '}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section
        className="animate-fade-in-up"
        style={{ animationDelay: '150ms' }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h2 className="text-xl font-bold text-secondary flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" /> Promoções Ativas
          </h2>
        </div>

        {allPromotions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allPromotions.map((p) => (
              <Card
                key={p.id}
                className="flex flex-col p-5 gap-4 hover:shadow-md transition-all duration-200 border-muted hover:border-primary/20 rounded-2xl bg-white group"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3
                    className="font-bold text-secondary line-clamp-2"
                    title={p.title}
                  >
                    {p.title}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary hover:bg-primary/10 border-none font-bold shrink-0"
                  >
                    {p.bonus_percentage}% Bônus
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold text-secondary bg-muted/40 p-2.5 rounded-lg border border-muted/50">
                  <span
                    className="truncate flex-1 text-center"
                    title={p.origin}
                  >
                    {p.origin}
                  </span>
                  <ArrowRightLeft className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span
                    className="truncate flex-1 text-center"
                    title={p.destination}
                  >
                    {p.destination}
                  </span>
                </div>

                {p.rules_summary && (
                  <p
                    className="text-sm text-muted-foreground line-clamp-2"
                    title={p.rules_summary}
                  >
                    {p.rules_summary}
                  </p>
                )}

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
                  <div className="flex items-center text-xs text-muted-foreground font-medium">
                    <Clock className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                    {p.valid_until
                      ? new Date(p.valid_until).toLocaleDateString('pt-BR')
                      : 'Sem validade informada'}
                  </div>
                  <Button asChild size="sm" className="font-bold shadow-sm">
                    <a href={p.link} target="_blank" rel="noopener noreferrer">
                      Ver Promoção{' '}
                      <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center border-dashed rounded-2xl bg-muted/10">
            <Tag className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground font-medium">
              Nenhuma promoção ativa no momento.
            </p>
          </Card>
        )}
      </section>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Wallet className="w-5 h-5 text-primary" />
              Atualizar Saldo
            </DialogTitle>
            <DialogDescription className="text-base font-medium mt-2">
              Insira o saldo atual consolidado que você possui no{' '}
              <strong className="text-secondary">{selectedProgram}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <Label htmlFor="balance" className="font-semibold text-secondary">
              Saldo de Milhas / Pontos
            </Label>
            <div className="relative">
              <Input
                id="balance"
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                className="h-14 text-lg focus-visible:ring-primary/20 bg-muted/20 font-semibold pl-4"
                placeholder="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">
                pts
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              className="font-semibold"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveBalance}
              disabled={isSaving}
              className="font-bold shadow-sm"
            >
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

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  )
}
