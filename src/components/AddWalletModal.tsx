import { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Search,
  Loader2,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
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
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth)
    }
  }

  useEffect(() => {
    if (isOpen) {
      setTimeout(checkScroll, 100)
    }
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [isOpen])

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === 'left' ? -200 : 200,
        behavior: 'smooth',
      })
    }
  }

  const filteredPrograms = AIRLINE_PROGRAMS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.airline.toLowerCase().includes(searchQuery.toLowerCase())
    return (
      matchesSearch &&
      (selectedContinent === 'Todos' || p.continent === selectedContinent)
    )
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
        const { error } = await supabase
          .from('loyalty_balances')
          .insert({ user_id: user.id, program_name: program.name, balance: 0 })
        if (error) throw error
      }

      toast({
        title: 'Sucesso!',
        description: `${program.name} adicionado à sua carteira.`,
      })
      onSuccess()
      onClose()
    } catch {
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
      <DialogContent className="sm:max-w-[520px] flex flex-col h-[70vh] max-h-[90vh] p-0 overflow-hidden gap-0 rounded-2xl border-none shadow-elevation">
        <DialogHeader className="p-6 pb-4 text-left shrink-0">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Adicionar Programa
          </DialogTitle>
          <DialogDescription className="sr-only">
            Busque e selecione um programa de fidelidade.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-2 space-y-6 shrink-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar programa ou companhia..."
              className="pl-12 h-14 bg-muted/60 border-transparent hover:bg-muted/80 focus-visible:bg-muted focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl text-base transition-colors placeholder:text-muted-foreground/70"
            />
          </div>

          <div className="relative -mx-2 px-2">
            <div
              className={cn(
                'absolute left-0 top-0 bottom-4 w-16 bg-gradient-to-r from-background to-transparent z-10 flex items-center pl-2 pointer-events-none transition-opacity duration-200',
                canScrollLeft ? 'opacity-100' : 'opacity-0',
              )}
            >
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className="w-8 h-8 rounded-full bg-background border shadow-sm flex items-center justify-center text-foreground hover:bg-muted pointer-events-auto transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <div
              ref={scrollRef}
              onScroll={checkScroll}
              className="flex flex-nowrap gap-2 overflow-x-auto pb-4 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {CONTINENTS.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedContinent(c)}
                  className={cn(
                    'px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border shrink-0',
                    selectedContinent === c
                      ? 'bg-primary text-primary-foreground border-transparent shadow-sm'
                      : 'bg-background text-muted-foreground border-border/60 hover:bg-muted/50 hover:text-foreground',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>

            <div
              className={cn(
                'absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-background to-transparent z-10 flex items-center justify-end pr-2 pointer-events-none transition-opacity duration-200',
                canScrollRight ? 'opacity-100' : 'opacity-0',
              )}
            >
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className="w-8 h-8 rounded-full bg-background border shadow-sm flex items-center justify-center text-foreground hover:bg-muted pointer-events-auto transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6 space-y-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent relative">
          {isSaving && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-b-2xl">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {filteredPrograms.length > 0 ? (
            filteredPrograms.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelect(p)}
                disabled={isSaving}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-border/40 bg-card hover:border-border/80 hover:shadow-sm hover:bg-muted/30 transition-all text-left disabled:opacity-50 group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-full border border-border/40 bg-background flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    <img
                      src={p.logoUrl}
                      alt={p.name}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {p.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {p.airline}
                    </p>
                  </div>
                </div>
                <PlusCircle className="w-5 h-5 text-primary opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all shrink-0 ml-4" />
              </button>
            ))
          ) : (
            <div className="py-12 text-center text-muted-foreground font-medium">
              Nenhum programa encontrado.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
