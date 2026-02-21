import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  PlusCircle,
  ArrowRightLeft,
  CreditCard,
  Plane,
  CalendarIcon,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

type TransactionType = 'acumulo' | 'transferencia' | 'compra' | 'resgate'

const PROGRAMS = ['Livelo', 'Esfera', 'Smiles', 'Latam Pass', 'TudoAzul']
const REASONS = [
  'Emissão de Passagem',
  'Hospedagem',
  'Troca por Produto',
  'Pontos Expirados',
  'Outros',
]
const TYPES = [
  { id: 'acumulo', label: 'Acúmulo', icon: PlusCircle },
  { id: 'transferencia', label: 'Transferência', icon: ArrowRightLeft },
  { id: 'compra', label: 'Compra', icon: CreditCard },
  { id: 'resgate', label: 'Resgate', icon: Plane },
] as const

export function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const { user } = useAuth()
  const { toast } = useToast()

  const [type, setType] = useState<TransactionType>('acumulo')
  const [isSaving, setIsSaving] = useState(false)
  const [program, setProgram] = useState('')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [amount, setAmount] = useState('')
  const [bonus, setBonus] = useState([0])
  const [reason, setReason] = useState('')
  const [amountPaid, setAmountPaid] = useState('')
  const [date, setDate] = useState<Date | undefined>(new Date())

  const isTransfer = type === 'transferencia'
  const isPurchase = type === 'compra'
  const isResgate = type === 'resgate'
  const destAmt = Math.floor(Number(amount || 0) * (1 + bonus[0] / 100))

  const handleSave = async () => {
    if (!user || !amount) return
    setIsSaving(true)
    try {
      const updateBalance = async (prog: string, diff: number) => {
        if (!prog) return
        const { data: existing } = await supabase
          .from('loyalty_balances')
          .select('id, balance')
          .eq('user_id', user.id)
          .eq('program_name', prog)
          .maybeSingle()
        const newBal = (existing?.balance || 0) + diff
        if (existing) {
          await supabase
            .from('loyalty_balances')
            .update({ balance: newBal })
            .eq('id', existing.id)
        } else {
          await supabase
            .from('loyalty_balances')
            .insert({ user_id: user.id, program_name: prog, balance: newBal })
        }
      }

      const amt = Number(amount)
      if (isTransfer) {
        await updateBalance(origin, -amt)
        await updateBalance(destination, destAmt)
      } else if (isResgate) {
        await updateBalance(program, -amt)
      } else {
        await updateBalance(program, amt)
      }

      toast({ title: 'Sucesso!', description: 'Saldo atualizado com sucesso!' })

      setAmount('')
      setReason('')
      setAmountPaid('')
      setBonus([0])

      onSuccess()
      onClose()
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar movimentação.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden gap-0 rounded-2xl">
        <div className="p-6 pb-4">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Registrar Movimentação
            </DialogTitle>
            <DialogDescription>
              Mantenha seu saldo atualizado adicionando uma nova transação.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-2 overflow-y-auto max-h-[60vh] space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={cn(
                  'flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2',
                  type === t.id
                    ? 'bg-primary/10 border-primary text-primary shadow-sm'
                    : 'bg-card border-border hover:border-primary/50 text-muted-foreground hover:text-foreground',
                )}
              >
                <t.icon className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {t.label}
                </span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {isTransfer ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Origem</Label>
                  <Select value={origin} onValueChange={setOrigin}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROGRAMS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Destino</Label>
                  <Select value={destination} onValueChange={setDestination}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROGRAMS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Programa</Label>
                <Select value={program} onValueChange={setProgram}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o programa" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAMS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>
                {isTransfer ? 'Pontos Transferidos' : 'Quantidade de Pontos'}
              </Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ex: 10000"
              />
            </div>

            {isTransfer && (
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                  <Label>Bônus de Transferência</Label>
                  <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-sm">
                    {bonus[0]}%
                  </span>
                </div>
                <Slider
                  value={bonus}
                  onValueChange={setBonus}
                  max={150}
                  step={5}
                />
                <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl text-center">
                  <span className="text-sm font-medium text-emerald-700">
                    Você receberá{' '}
                    <strong className="text-emerald-600 text-lg">
                      {new Intl.NumberFormat('pt-BR').format(destAmt)}
                    </strong>{' '}
                    pontos no Destino
                  </span>
                </div>
              </div>
            )}

            {isPurchase && (
              <div className="space-y-2">
                <Label>Valor Pago R$</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                    R$
                  </span>
                  <Input
                    type="number"
                    className="pl-9"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}

            {!isTransfer && (
              <div className="space-y-2">
                <Label>
                  {isResgate ? 'Motivo do Resgate' : 'Motivo / Origem'}
                </Label>
                {isResgate ? (
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o motivo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {REASONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ex: Cartão de Crédito, Uber..."
                  />
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Data da Movimentação</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                      date.toLocaleDateString('pt-BR')
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="p-6 pt-4 border-t bg-muted/10">
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isSaving}
              className="font-semibold"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !amount}
              className="font-bold shadow-sm"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Salvar Movimentação
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
