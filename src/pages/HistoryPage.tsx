import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ShoppingBag,
  Hotel,
  Plane,
  CreditCard,
  Laptop,
  History,
} from 'lucide-react'

const transactions = [
  {
    id: 1,
    icon: ShoppingBag,
    desc: 'Compra de Celular na Amazon',
    miles: 45000,
    multiplier: '10x',
    date: '15/10/2026',
  },
  {
    id: 2,
    icon: Hotel,
    desc: 'Reserva de Hotel - Copacabana',
    miles: 12000,
    multiplier: '4x',
    date: '02/10/2026',
  },
  {
    id: 3,
    icon: Laptop,
    desc: 'Assinatura de Software',
    miles: 1500,
    multiplier: '2x',
    date: '28/09/2026',
  },
  {
    id: 4,
    icon: CreditCard,
    desc: 'Fatura Cartão Black',
    miles: 8500,
    multiplier: '2.2x',
    date: '15/09/2026',
  },
  {
    id: 5,
    icon: Plane,
    desc: 'Passagem São Paulo - Miami',
    miles: 6000,
    multiplier: '1x',
    date: '01/09/2026',
  },
]

export default function HistoryPage() {
  return (
    <div className="space-y-6 md:space-y-8 pb-4 animate-fade-in-up">
      <section>
        <h2 className="text-2xl md:text-3xl font-bold text-secondary tracking-tight flex items-center gap-2">
          <History className="w-8 h-8 text-primary" />
          Histórico de Milhas
        </h2>
        <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">
          Acompanhe todas as suas atividades e acúmulos recentes.
        </p>
      </section>

      <Card className="shadow-elevation border-muted">
        <CardHeader className="border-b border-muted/50 pb-4">
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>
            Suas últimas compras simuladas e milhas adicionadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[60px] text-center">Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Milhas Geradas</TableHead>
                <TableHead className="text-center">Multiplicador</TableHead>
                <TableHead className="text-right pr-6">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => {
                const Icon = tx.icon
                return (
                  <TableRow
                    key={tx.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="text-center">
                      <div className="inline-flex items-center justify-center p-2 rounded-full bg-primary/10 text-primary">
                        <Icon className="w-4 h-4" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-secondary">
                      {tx.desc}
                    </TableCell>
                    <TableCell className="text-right font-bold text-success">
                      +{new Intl.NumberFormat('pt-BR').format(tx.miles)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex px-2 py-1 rounded-md text-xs font-semibold bg-accent/10 text-accent-foreground border border-accent/20">
                        {tx.multiplier}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground pr-6">
                      {tx.date}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
