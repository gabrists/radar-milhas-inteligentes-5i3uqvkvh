import { useState, useEffect } from 'react'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tag,
  ArrowRightLeft,
  Percent,
  Calculator,
  ExternalLink,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Link } from 'react-router-dom'

interface Promotion {
  id: string
  title: string
  origin: string
  destination: string
  bonus_percentage: number
  link: string
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [originFilter, setOriginFilter] = useState('all')
  const [destinationFilter, setDestinationFilter] = useState('all')

  useEffect(() => {
    async function fetchPromotions() {
      const { data, error } = await supabase
        .from('active_promotions')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) {
        setPromotions(data as Promotion[])
      }
      setLoading(false)
    }
    fetchPromotions()
  }, [])

  const origins = Array.from(new Set(promotions.map((p) => p.origin)))
  const destinations = Array.from(new Set(promotions.map((p) => p.destination)))

  const filteredPromotions = promotions.filter((p) => {
    if (originFilter !== 'all' && p.origin !== originFilter) return false
    if (destinationFilter !== 'all' && p.destination !== destinationFilter)
      return false
    return true
  })

  return (
    <div className="space-y-6 md:space-y-8 pb-4 animate-fade-in-up">
      <section>
        <h2 className="text-2xl md:text-3xl font-bold text-secondary tracking-tight flex items-center gap-2">
          <Tag className="w-8 h-8 text-primary" />
          Promoções Ativas
        </h2>
        <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">
          Aproveite as melhores oportunidades para transferir seus pontos com
          bônus.
        </p>
      </section>

      <div className="flex flex-col sm:flex-row gap-4 bg-muted/30 p-4 rounded-xl border border-muted">
        <div className="flex-1 space-y-1.5">
          <label className="text-sm font-semibold text-secondary">Origem</label>
          <Select value={originFilter} onValueChange={setOriginFilter}>
            <SelectTrigger className="bg-background shadow-sm h-11">
              <SelectValue placeholder="Todas as origens" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as origens</SelectItem>
              {origins.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-1.5">
          <label className="text-sm font-semibold text-secondary">
            Destino
          </label>
          <Select
            value={destinationFilter}
            onValueChange={setDestinationFilter}
          >
            <SelectTrigger className="bg-background shadow-sm h-11">
              <SelectValue placeholder="Todos os destinos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os destinos</SelectItem>
              {destinations.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[240px] w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredPromotions.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed rounded-xl bg-muted/10">
          <Tag className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-secondary">
            Nenhuma promoção encontrada
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            Tente ajustar os filtros de origem e destino.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromotions.map((promo, i) => (
            <Card
              key={promo.id}
              className="overflow-hidden border-muted shadow-elevation hover:shadow-lg transition-all duration-300 group flex flex-col"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 border-b border-primary/10 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-150"></div>
                <div className="flex justify-between items-start relative z-10">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold shadow-sm border border-primary/20">
                    <Percent className="w-3.5 h-3.5" /> Até{' '}
                    {promo.bonus_percentage}% Bônus
                  </span>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <div className="text-center flex-1">
                    <p className="text-sm font-bold text-secondary truncate px-2">
                      {promo.origin}
                    </p>
                  </div>
                  <div className="bg-background rounded-full p-2 shadow-sm border border-muted z-10 relative">
                    <ArrowRightLeft className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-sm font-bold text-secondary truncate px-2">
                      {promo.destination}
                    </p>
                  </div>
                </div>
              </div>
              <CardHeader className="pb-4 pt-5">
                <CardTitle className="text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                  {promo.title}
                </CardTitle>
                <CardDescription className="text-xs font-medium mt-2 text-muted-foreground">
                  Oportunidade de transferência
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-0 pb-5 px-6 gap-3 mt-auto">
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 text-xs font-semibold h-10 shadow-sm hover:bg-secondary/5"
                >
                  <Link to="/">
                    <Calculator className="w-4 h-4 mr-1.5" />
                    Simular
                  </Link>
                </Button>
                <Button
                  asChild
                  className="flex-1 text-xs font-semibold h-10 shadow-sm"
                >
                  <a
                    href={promo.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Aproveitar <ExternalLink className="w-4 h-4 ml-1.5" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
