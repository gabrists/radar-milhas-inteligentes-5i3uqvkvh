import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Search, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { AIRLINE_PROGRAMS } from '@/lib/constants'

interface AddWalletModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const CONTINENTS = [
  'Todos',
  'América do Norte',
  'América Central',
  'América do Sul',
  'Europa',
  'Oriente Médio',
  'Ásia',
  'África',
]

export function AddWalletModal({
  isOpen,
  onClose,
  onSuccess,
}: AddWalletModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContinent, setSelectedContinent] = useState('Todos')
  const [isSaving, setIsSaving] = useState(false)

  const filteredPrograms = AIRLINE_PROGRAMS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.airline.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesContinent =
      selectedContinent === 'Todos' || p.continent === selectedContinent
    return matchesSearch && matchesContinent
  })

  const handleSelect = async (program: (typeof AIRLINE_PROGRAMS)[0]) => {
    if (!user) return
    setIsSaving(true)

    try {
      const { data: existing } = await supabase
        .from('loyalty_balances')
        .select('id')
        .eq('user_id', user.id)
        .eq('program_name', program.name)
        .maybeSingle()

      if (!existing) {
        const { error } = await supabase.from('loyalty_balances').insert({
          user_id: user.id,
          program_name: program.name,
          balance: 0,
        })
        if (error) throw error
      }

      toast({
        title: 'Sucesso!',
        description: `${program.name} adicionado à sua carteira.`,
      })
      onSuccess()
      onClose()
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o programa.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden gap-0 rounded-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Adicionar Novo Programa</DialogTitle>
          <DialogDescription>
            Busque e selecione um programa de fidelidade para adicionar à sua
            carteira.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 border-b space-y-4 bg-muted/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar programa ou companhia..."
              className="pl-10 h-12 bg-background border-muted-foreground/20 rounded-xl text-base focus-visible:ring-primary/20"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {CONTINENTS.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedContinent(c)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border',
                  selectedContinent === c
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:bg-muted',
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto max-h-[50vh] p-2 relative">
          {isSaving && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {filteredPrograms.length > 0 ? (
            filteredPrograms.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelect(p)}
                disabled={isSaving}
                className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left disabled:opacity-50"
              >
                <div className="w-12 h-12 rounded-full border border-muted-foreground/20 bg-background flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                  <img
                    src={p.logoUrl}
                    alt={p.name}
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-secondary truncate">{p.name}</p>
                  <p className="text-sm font-medium text-muted-foreground truncate">
                    {p.airline}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground font-medium">
              Nenhum programa encontrado.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
