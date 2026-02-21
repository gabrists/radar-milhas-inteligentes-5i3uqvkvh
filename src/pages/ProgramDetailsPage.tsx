import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Minus, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'

const mockTransactions = [
  {
    id: 1,
    date: '21 Fev 2026',
    type: 'accumulate',
    desc: 'Compra Casas Bahia',
    amount: 5000,
  },
  {
    id: 2,
    date: '15 Fev 2026',
    type: 'transfer',
    desc: 'Transferência para Smiles',
    amount: -10000,
  },
  {
    id: 3,
    date: '10 Fev 2026',
    type: 'expire',
    desc: 'Pontos Expirados',
    amount: -500,
  },
  {
    id: 4,
    date: '01 Fev 2026',
    type: 'accumulate',
    desc: 'Fatura Cartão Black',
    amount: 12500,
  },
]

export default function ProgramDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const programNames: Record<string, string> = {
    livelo: 'Livelo',
    esfera: 'Esfera',
    smiles: 'Smiles',
    latampass: 'Latam Pass',
    tudoazul: 'TudoAzul',
  }

  const programName = id
    ? programNames[id] || id.charAt(0).toUpperCase() + id.slice(1)
    : 'Programa'

  useEffect(() => {
    async function fetchBalance() {
      if (!user) return
      try {
        const { data } = await supabase
          .from('loyalty_balances')
          .select('balance')
          .eq('user_id', user.id)
          .eq('program_name', programName)
          .maybeSingle()
        setBalance(data?.balance || 0)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchBalance()
  }, [user, programName])

  const renderBadge = (type: string) => {
    switch (type) {
      case 'accumulate':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none font-bold shadow-none">
            <Plus className="w-3 h-3 mr-1" /> Acúmulo
          </Badge>
        )
      case 'transfer':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none font-bold shadow-none">
            <Minus className="w-3 h-3 mr-1" /> Transferência/Gasto
          </Badge>
        )
      case 'expire':
        return (
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none font-bold shadow-none">
            <AlertTriangle className="w-3 h-3 mr-1" /> Vencimento
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-8 animate-fade-in-up">
      <Button
        variant="ghost"
        asChild
        className="pl-0 text-muted-foreground hover:text-secondary -ml-2 mb-2"
      >
        <Link to="/">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Link>
      </Button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-secondary tracking-tight">
            {programName}
          </h1>
          <div className="mt-2 text-xl font-medium text-muted-foreground">
            Saldo Atual:{' '}
            {loading ? (
              <Skeleton className="h-6 w-24 inline-block align-middle" />
            ) : (
              <span className="font-bold text-primary">
                {new Intl.NumberFormat('pt-BR').format(balance || 0)} pts
              </span>
            )}
          </div>
        </div>
        <Button className="font-bold shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Nova Movimentação
        </Button>
      </div>

      <Card className="shadow-elevation border-muted overflow-hidden">
        <div className="hidden md:block">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[150px]">Data</TableHead>
                <TableHead className="w-[220px]">Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((tx, index) => (
                <TableRow
                  key={tx.id}
                  className={index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}
                >
                  <TableCell className="font-medium text-secondary">
                    {tx.date}
                  </TableCell>
                  <TableCell>{renderBadge(tx.type)}</TableCell>
                  <TableCell className="text-secondary">{tx.desc}</TableCell>
                  <TableCell
                    className={`text-right font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-secondary'}`}
                  >
                    {tx.amount > 0 ? '+' : '-'}{' '}
                    {new Intl.NumberFormat('pt-BR').format(Math.abs(tx.amount))}{' '}
                    pts
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="md:hidden divide-y divide-border">
          {mockTransactions.map((tx, index) => (
            <div
              key={tx.id}
              className={`p-4 flex flex-col gap-3 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">
                  {tx.date}
                </span>
                {renderBadge(tx.type)}
              </div>
              <div className="flex justify-between items-end">
                <span className="font-semibold text-secondary text-sm leading-tight max-w-[200px]">
                  {tx.desc}
                </span>
                <span
                  className={`font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-secondary'}`}
                >
                  {tx.amount > 0 ? '+' : '-'}{' '}
                  {new Intl.NumberFormat('pt-BR').format(Math.abs(tx.amount))}{' '}
                  pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
