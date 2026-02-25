import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardTitle,
  CardHeader,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import {
  Target,
  PlusCircle,
  ArrowRightLeft,
  AlertTriangle,
  TrendingUp,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import {
  TransactionModal,
  TransactionType,
} from '@/components/TransactionModal'
import { cn } from '@/lib/utils'

const PROGRAMS = ['Livelo', 'Esfera', 'Smiles', 'Latam Pass', 'TudoAzul']

const programColors: Record<string, string> = {
  Livelo: '#e11d48',
  Esfera: '#dc2626',
  Smiles: '#f97316',
  'Latam Pass': '#2563eb',
  TudoAzul: '#0891b2',
}

const chartConfig = {
  value: { label: 'Milhas' },
  Livelo: { label: 'Livelo', color: '#e11d48' },
  Esfera: { label: 'Esfera', color: '#dc2626' },
  Smiles: { label: 'Smiles', color: '#f97316' },
  'Latam Pass': { label: 'Latam Pass', color: '#2563eb' },
  TudoAzul: { label: 'TudoAzul', color: '#0891b2' },
}

export default function Index() {
  const { user } = useAuth()

  const [profile, setProfile] = useState<any>(null)
  const [balances, setBalances] = useState<any[]>([])
  const [totalBalance, setTotalBalance] = useState(0)
  const [expiringPoints, setExpiringPoints] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [goal, setGoal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const [transactionModalOpen, setTransactionModalOpen] = useState(false)
  const [defaultTxProgram, setDefaultTxProgram] = useState<string>('')
  const [defaultTxType, setDefaultTxType] = useState<TransactionType>('acumulo')

  const [txFilterProgram, setTxFilterProgram] = useState('all')
  const [txFilterType, setTxFilterType] = useState('all')

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      try {
        const [profileRes, balancesRes, expRes, txRes, goalRes] =
          await Promise.all([
            supabase
              .from('profiles')
              .select('full_name')
              .eq('id', user.id)
              .single(),
            supabase
              .from('loyalty_balances')
              .select('*')
              .eq('user_id', user.id),
            supabase
              .from('expiring_points' as any)
              .select('*, loyalty_balances(program_name, user_id)'),
            supabase
              .from('transactions')
              .select('*')
              .eq('user_id', user.id)
              .order('transaction_date', { ascending: false }),
            supabase
              .from('travel_goals')
              .select('*')
              .eq('user_id', user.id)
              .eq('is_active', true)
              .maybeSingle(),
          ])

        if (profileRes.data) setProfile(profileRes.data)

        if (balancesRes.data) {
          setBalances(balancesRes.data)
          setTotalBalance(
            balancesRes.data.reduce((acc, curr) => acc + curr.balance, 0),
          )
        }

        if (expRes.data) {
          const userExp = expRes.data.filter(
            (e: any) => e.loyalty_balances?.user_id === user.id,
          )
          setExpiringPoints(userExp)
        }

        if (txRes.data) setTransactions(txRes.data)

        if (goalRes.data) {
          setGoal(goalRes.data)
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
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user, refreshKey])

  const next60Days = new Date()
  next60Days.setDate(next60Days.getDate() + 60)

  const expiringSoon = expiringPoints.filter((ep) => {
    const expDate = new Date(ep.expiration_date)
    return expDate <= next60Days && expDate >= new Date()
  })

  const chartData = balances.map((b) => ({
    name: b.program_name,
    value: b.balance,
    fill: programColors[b.program_name] || '#94a3b8',
  }))

  const goalTotal = goal?.target_miles || 120000
  const currentMiles = goal?.current_miles || 0
  const goalPercentage = goalTotal > 0 ? (currentMiles / goalTotal) * 100 : 0

  const filteredTx = transactions.filter((tx) => {
    if (
      txFilterProgram !== 'all' &&
      tx.origin_program !== txFilterProgram &&
      tx.destination_program !== txFilterProgram
    )
      return false
    if (txFilterType !== 'all' && tx.type !== txFilterType) return false
    return true
  })

  const handleOpenTransaction = (prog: string, type: TransactionType) => {
    setDefaultTxProgram(prog)
    setDefaultTxType(type)
    setTransactionModalOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-6 md:space-y-8 pb-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(350px,1fr))]">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[180px] w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-8">
      {expiringSoon.length > 0 && (
        <Alert
          variant="destructive"
          className="mb-6 animate-in slide-in-from-top-4 border-red-200 bg-red-50 text-red-800 shadow-sm"
        >
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-bold text-lg">Atenção!</AlertTitle>
          <AlertDescription className="font-medium mt-1">
            Você tem pontos expirando nos próximos 60 dias! Revise suas
            carteiras para não perder suas milhas.
          </AlertDescription>
        </Alert>
      )}

      <section className="animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold text-secondary tracking-tight">
          Carteira de Milhas
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">
          Olá, {profile?.full_name?.split(' ')[0] || 'Viajante'}. Acompanhe seu
          portfólio de pontos, metas e movimentações.
        </p>
      </section>

      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up"
        style={{ animationDelay: '50ms' }}
      >
        <Card className="col-span-1 shadow-elevation border-muted">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-secondary">
              Saldo Consolidado
            </CardTitle>
            <CardDescription>
              Total de pontos em todos os programas
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-primary to-blue-600 tracking-tighter">
              {new Intl.NumberFormat('pt-BR').format(totalBalance)}
            </div>
            <p className="text-sm font-semibold text-muted-foreground mt-2 uppercase tracking-widest">
              Milhas Totais
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-elevation border-muted">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-secondary">
              Distribuição
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[180px] pb-4 relative flex items-center justify-center">
            {balances.filter((b) => b.balance > 0).length > 0 ? (
              <ChartContainer
                config={chartConfig}
                className="h-full w-full max-h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.filter((d) => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData
                        .filter((d) => d.value > 0)
                        .map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <ChartTooltip
                      content={<ChartTooltipContent nameKey="name" />}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="text-muted-foreground text-sm font-medium">
                Nenhum saldo registrado
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm border-muted flex flex-col justify-center bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-secondary">
              <Target className="w-5 h-5 text-primary" /> Progresso de Meta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-bold text-secondary text-xl leading-tight mb-1 line-clamp-2">
                {goal?.destination_name || 'Nenhuma meta definida'}
              </h3>
              <p className="text-sm font-medium text-muted-foreground">
                Acompanhe a sua próxima grande aventura!
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-2xl font-black text-primary">
                  {new Intl.NumberFormat('pt-BR').format(currentMiles)}{' '}
                  <span className="text-sm font-semibold text-muted-foreground">
                    / {new Intl.NumberFormat('pt-BR').format(goalTotal)} mi
                  </span>
                </span>
                <span className="font-bold text-secondary bg-background px-2 py-0.5 rounded shadow-sm border">
                  {goalPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress value={goalPercentage} className="h-3" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div
        className="grid gap-4 grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] animate-fade-in-up"
        style={{ animationDelay: '100ms' }}
      >
        {PROGRAMS.map((progName) => {
          const balanceRecord = balances.find(
            (b) => b.program_name === progName,
          )
          const balance = balanceRecord?.balance || 0
          const progExp = expiringPoints.filter(
            (ep) => ep.loyalty_balances?.program_name === progName,
          )
          const nextExp = progExp.sort(
            (a, b) =>
              new Date(a.expiration_date).getTime() -
              new Date(b.expiration_date).getTime(),
          )[0]

          return (
            <Card
              key={progName}
              className="flex flex-col shadow-sm border-muted hover:shadow-md hover:border-primary/20 transition-all rounded-2xl"
            >
              <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3 space-y-0">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-muted bg-muted/20 flex items-center justify-center shadow-inner">
                  <span
                    className="font-bold text-lg drop-shadow-sm"
                    style={{ color: programColors[progName] }}
                  >
                    {progName.charAt(0)}
                  </span>
                </div>
                <CardTitle className="text-base truncate">{progName}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2 pb-3 flex-1 flex flex-col justify-center">
                <div className="text-2xl font-black text-secondary tracking-tight">
                  {new Intl.NumberFormat('pt-BR').format(balance)}
                </div>
                {nextExp ? (
                  <div className="mt-1.5 text-xs font-semibold text-destructive flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {new Intl.NumberFormat('pt-BR').format(nextExp.amount)} em{' '}
                      {new Date(nextExp.expiration_date).toLocaleDateString(
                        'pt-BR',
                        { day: '2-digit', month: '2-digit' },
                      )}
                    </span>
                  </div>
                ) : (
                  <div className="mt-1.5 text-xs font-medium text-muted-foreground flex items-center gap-1.5 opacity-70">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    Sem expirações próximas
                  </div>
                )}
              </CardContent>
              <div className="p-3 border-t border-muted/50 bg-muted/10 grid grid-cols-3 gap-1.5 rounded-b-2xl">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 px-0 shadow-sm bg-background"
                  onClick={() => handleOpenTransaction(progName, 'acumulo')}
                >
                  Adicionar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[11px] font-bold text-blue-700 hover:bg-blue-100 hover:text-blue-800 px-0 shadow-sm bg-background"
                  onClick={() =>
                    handleOpenTransaction(progName, 'transferencia')
                  }
                >
                  Transferir
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[11px] font-bold text-red-700 hover:bg-red-100 hover:text-red-800 px-0 shadow-sm bg-background"
                  onClick={() => handleOpenTransaction(progName, 'resgate')}
                >
                  Resgatar
                </Button>
              </div>
            </Card>
          )
        })}

        <Card
          className="flex flex-col shadow-sm border-muted border-dashed border-2 hover:shadow-md hover:border-primary/40 hover:bg-primary/5 transition-all rounded-2xl cursor-pointer min-h-[160px]"
          onClick={() => handleOpenTransaction('', 'acumulo')}
        >
          <CardContent className="flex flex-col items-center justify-center h-full p-6 text-muted-foreground hover:text-primary transition-colors gap-3">
            <PlusCircle className="w-10 h-10 opacity-80" />
            <span className="font-bold text-lg">Adicionar Programa</span>
          </CardContent>
        </Card>
      </div>

      <Card
        className="shadow-elevation border-muted mt-8 animate-fade-in-up"
        style={{ animationDelay: '150ms' }}
      >
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4 border-b border-muted/50">
          <div>
            <CardTitle className="text-xl text-secondary">
              Extrato Dinâmico
            </CardTitle>
            <CardDescription>
              Todas as suas entradas e saídas de milhas
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={txFilterProgram} onValueChange={setTxFilterProgram}>
              <SelectTrigger className="w-[160px] bg-muted/20">
                <SelectValue placeholder="Programa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Programas</SelectItem>
                {PROGRAMS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={txFilterType} onValueChange={setTxFilterType}>
              <SelectTrigger className="w-[160px] bg-muted/20">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Tipos</SelectItem>
                <SelectItem value="Acúmulo">Acúmulo</SelectItem>
                <SelectItem value="Compra">Compra</SelectItem>
                <SelectItem value="Resgate">Resgate</SelectItem>
                <SelectItem value="Transferência">Transferência</SelectItem>
                <SelectItem value="Expiração">Expiração</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filteredTx.length > 0 ? (
              filteredTx.map((tx) => {
                let color = 'text-primary'
                let icon = <PlusCircle className="w-5 h-5" />
                let bg = 'bg-primary/10'
                let sign = '+'

                if (tx.type === 'Resgate' || tx.type === 'Expiração') {
                  color = 'text-destructive'
                  icon = <AlertTriangle className="w-5 h-5" />
                  bg = 'bg-destructive/10'
                  sign = '-'
                } else if (tx.type === 'Transferência') {
                  color = 'text-blue-600'
                  icon = <ArrowRightLeft className="w-5 h-5" />
                  bg = 'bg-blue-100'
                  sign = '-'
                } else if (tx.type === 'Acúmulo' || tx.type === 'Compra') {
                  color = 'text-emerald-600'
                  icon = <TrendingUp className="w-5 h-5" />
                  bg = 'bg-emerald-100'
                  sign = '+'
                }

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 sm:px-6 hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className={cn('p-2.5 rounded-full shrink-0', bg, color)}
                      >
                        {icon}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-secondary text-sm md:text-base truncate">
                          {tx.description || tx.type}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-xs font-medium text-muted-foreground">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>
                            {new Date(tx.transaction_date).toLocaleDateString(
                              'pt-BR',
                            )}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className="truncate">
                            {tx.origin_program}{' '}
                            {tx.destination_program
                              ? `→ ${tx.destination_program}`
                              : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        'font-black text-base md:text-lg whitespace-nowrap pl-4',
                        color,
                      )}
                    >
                      {sign}{' '}
                      {new Intl.NumberFormat('pt-BR').format(tx.points_amount)}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-8 text-center text-muted-foreground font-medium">
                Nenhuma movimentação encontrada.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <TransactionModal
        isOpen={transactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        onSuccess={() => setRefreshKey((k) => k + 1)}
        defaultProgram={defaultTxProgram}
        defaultType={defaultTxType}
      />
    </div>
  )
}
