import { useState, useMemo, useEffect } from 'react'
import { Search, ExternalLink, ShoppingBag, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import azulLogo from '@/assets/azul-39f96.svg'
import latamLogo from '@/assets/latam-13e30.svg'
import smilesLogo from '@/assets/smiles-3b02a.svg'
import esferaLogo from '@/assets/esfera-1668b.png'
import liveloLogo from '@/assets/livelo-398a4.svg'

interface PartnerOffer {
  id: string
  store_name: string
  category: string
  points_per_real: number
  program: string
  link: string
}

const mockPartners: PartnerOffer[] = [
  {
    id: '1',
    store_name: 'Amazon',
    category: 'Eletrônicos',
    points_per_real: 5,
    program: 'Livelo',
    link: '#',
  },
  {
    id: '2',
    store_name: 'Amazon',
    category: 'Eletrônicos',
    points_per_real: 8,
    program: 'Esfera',
    link: '#',
  },
  {
    id: '3',
    store_name: 'Magalu',
    category: 'Casa',
    points_per_real: 10,
    program: 'TudoAzul',
    link: '#',
  },
  {
    id: '4',
    store_name: 'Magalu',
    category: 'Casa',
    points_per_real: 4,
    program: 'Smiles',
    link: '#',
  },
  {
    id: '5',
    store_name: 'Renner',
    category: 'Moda',
    points_per_real: 4,
    program: 'Smiles',
    link: '#',
  },
  {
    id: '6',
    store_name: 'Renner',
    category: 'Moda',
    points_per_real: 10,
    program: 'Livelo',
    link: '#',
  },
  {
    id: '7',
    store_name: 'Dafiti',
    category: 'Moda',
    points_per_real: 12,
    program: 'Latam Pass',
    link: '#',
  },
  {
    id: '8',
    store_name: 'Booking.com',
    category: 'Viagens',
    points_per_real: 6,
    program: 'Livelo',
    link: '#',
  },
  {
    id: '9',
    store_name: 'Sephora',
    category: 'Beleza',
    points_per_real: 5,
    program: 'Esfera',
    link: '#',
  },
  {
    id: '10',
    store_name: 'C&A',
    category: 'Moda',
    points_per_real: 8,
    program: 'Smiles',
    link: '#',
  },
  {
    id: '11',
    store_name: 'Fast Shop',
    category: 'Eletrônicos',
    points_per_real: 3,
    program: 'TudoAzul',
    link: '#',
  },
  {
    id: '12',
    store_name: 'Casas Bahia',
    category: 'Casa',
    points_per_real: 7,
    program: 'Livelo',
    link: '#',
  },
]

const programLogos: Record<string, string> = {
  Livelo: liveloLogo,
  Esfera: esferaLogo,
  Smiles: smilesLogo,
  'Latam Pass': latamLogo,
  TudoAzul: azulLogo,
}

const categories = ['Todos', 'Eletrônicos', 'Moda', 'Viagens', 'Casa', 'Beleza']

export default function PartnersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [partners, setPartners] = useState<PartnerOffer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPartners = async () => {
      // Data should be fetched from a mock array structured to facilitate a future migration to a Supabase SELECT query
      setTimeout(() => {
        setPartners(mockPartners)
        setLoading(false)
      }, 500)
    }
    fetchPartners()
  }, [])

  const filteredPartners = useMemo(() => {
    return partners
      .filter((p) => {
        const matchSearch =
          p.store_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
        const matchCategory =
          selectedCategory === 'Todos' || p.category === selectedCategory
        return matchSearch && matchCategory
      })
      .sort((a, b) => b.points_per_real - a.points_per_real)
  }, [partners, searchQuery, selectedCategory])

  const maxPointsByStore = useMemo(() => {
    const map: Record<string, number> = {}
    partners.forEach((p) => {
      if (!map[p.store_name] || p.points_per_real > map[p.store_name]) {
        map[p.store_name] = p.points_per_real
      }
    })
    return map
  }, [partners])

  const storeOfferCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    partners.forEach((p) => {
      counts[p.store_name] = (counts[p.store_name] || 0) + 1
    })
    return counts
  }, [partners])

  return (
    <div className="space-y-6 md:space-y-8 pb-4 animate-fade-in-up">
      <section>
        <h2 className="text-2xl md:text-3xl font-bold text-secondary tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-8 h-8 text-primary" />
          Onde Comprar
        </h2>
        <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">
          Encontre a melhor pontuação para sua próxima compra.
        </p>
      </section>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Busque por loja ou produto (ex: Amazon, iPhone...)"
            className="pl-11 h-12 text-base shadow-sm bg-background border-muted focus-visible:ring-primary/20 rounded-xl"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              className={cn(
                'rounded-full px-5 font-semibold shrink-0 shadow-sm transition-colors',
                selectedCategory === cat
                  ? 'shadow-md'
                  : 'bg-background hover:bg-muted/50',
              )}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-[210px] w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredPartners.length === 0 ? (
        <div className="text-center py-16 px-4 bg-muted/10 border border-dashed border-muted rounded-2xl">
          <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-bold text-secondary">
            Nenhum parceiro encontrado
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            Tente buscar por outro termo ou categoria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPartners.map((p) => {
            const isBestOffer =
              storeOfferCounts[p.store_name] > 1 &&
              p.points_per_real === maxPointsByStore[p.store_name]

            return (
              <Card
                key={p.id}
                className="relative overflow-hidden hover:shadow-elevation transition-all duration-300 bg-white border-muted rounded-2xl flex flex-col group"
              >
                {isBestOffer && (
                  <div className="absolute top-0 left-0 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-[10px] font-black px-2.5 py-1 rounded-br-lg z-10 flex items-center gap-1 shadow-sm uppercase tracking-wide">
                    <Star className="w-3 h-3 fill-amber-950" /> Melhor Oferta
                  </div>
                )}
                <CardContent className="p-5 flex flex-col flex-1 pt-6">
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <div className="w-14 h-14 rounded-xl border border-muted/50 bg-muted/20 flex items-center justify-center p-2.5 shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={`https://img.usecurling.com/i?q=${encodeURIComponent(p.store_name.toLowerCase())}&shape=outline&color=solid-black`}
                        alt={p.store_name}
                        className="w-full h-full object-contain mix-blend-multiply opacity-80"
                      />
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <Badge className="bg-primary/10 text-primary border-primary/20 font-extrabold text-sm px-2.5 py-1 flex items-center gap-1.5 whitespace-nowrap shadow-sm">
                        <img
                          src={programLogos[p.program]}
                          alt={p.program}
                          className="w-3.5 h-3.5 object-contain"
                        />
                        {p.points_per_real} pts / R$
                      </Badge>
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        {p.program}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-secondary line-clamp-1 group-hover:text-primary transition-colors">
                      {p.store_name}
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground mt-0.5">
                      {p.category}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full font-bold shadow-sm mt-5 group/btn"
                    asChild
                  >
                    <a href={p.link} target="_blank" rel="noopener noreferrer">
                      Ir para a Loja{' '}
                      <ExternalLink className="w-4 h-4 ml-2 text-muted-foreground group-hover/btn:text-primary transition-colors" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
