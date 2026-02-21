import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  ExternalLink,
  Calculator,
  Clock,
  AlertCircle,
  FileText,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Promotion {
  id: string
  title: string
  origin: string
  destination: string
  bonus_percentage: number
  link: string
  rules_summary?: string | null
  valid_until?: string | null
}

export default function PromotionDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [promo, setPromo] = useState<Promotion | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPromo() {
      if (!id) return
      const { data, error } = await supabase
        .from('active_promotions')
        .select('*')
        .eq('id', id)
        .single()

      if (!error && data) {
        setPromo(data as Promotion)
      }
      setLoading(false)
    }
    fetchPromo()
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6 md:space-y-8 pb-8 animate-fade-in-up">
        <Skeleton className="h-10 w-24 mb-2" />
        <Skeleton className="h-[250px] w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
          <div>
            <Skeleton className="h-[150px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!promo) {
    return (
      <div className="text-center py-16 px-4 border border-dashed rounded-xl bg-muted/10 animate-fade-in-up">
        <AlertCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-secondary">
          Promoção não encontrada ou expirada
        </h3>
        <p className="text-muted-foreground mt-2 mb-6">
          A promoção que você tentou acessar não está mais disponível.
        </p>
        <Button onClick={() => navigate('/promocoes')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Promoções
        </Button>
      </div>
    )
  }

  let isExpiringSoon = false
  let validityText = 'Validade não informada'
  if (promo.valid_until) {
    const validDate = new Date(promo.valid_until)
    const now = new Date()
    const diffHours = (validDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    isExpiringSoon = diffHours > 0 && diffHours <= 24

    if (diffHours < 0) {
      validityText = 'Promoção expirada'
    } else {
      validityText = `Válido até ${validDate.toLocaleDateString('pt-BR')} às ${validDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    }
  }

  const handleApplyCalculator = () => {
    navigate('/', { state: { applyBonus: promo.bonus_percentage } })
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-8 animate-fade-in-up">
      <Button
        variant="ghost"
        onClick={() => navigate('/promocoes')}
        className="pl-0 text-muted-foreground hover:text-secondary -ml-2 mb-2"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Button>

      <div className="bg-gradient-to-br from-primary/10 to-blue-600/5 rounded-2xl p-6 md:p-10 border border-primary/10 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-bold shadow-sm border border-primary/20">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              {promo.bonus_percentage}% de Bônus
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-secondary tracking-tight leading-tight">
              {promo.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-1.5 bg-background/60 px-3 py-1.5 rounded-lg border border-muted backdrop-blur-sm">
                <span className="font-bold text-secondary">{promo.origin}</span>
                <ArrowRight className="w-4 h-4 text-primary" />
                <span className="font-bold text-secondary">
                  {promo.destination}
                </span>
              </div>

              {promo.valid_until && (
                <div
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border backdrop-blur-sm',
                    isExpiringSoon
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : 'bg-background/60 text-secondary border-muted',
                  )}
                >
                  <Clock className="w-4 h-4" />
                  <span
                    className={cn(
                      'font-bold',
                      isExpiringSoon && 'animate-pulse',
                    )}
                  >
                    {validityText}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <Button
              size="lg"
              className="w-full sm:w-auto font-bold shadow-md h-12"
              asChild
            >
              <a href={promo.link} target="_blank" rel="noopener noreferrer">
                Acessar Oferta Oficial <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto font-bold shadow-sm h-12"
              onClick={handleApplyCalculator}
            >
              <Calculator className="w-4 h-4 mr-2" />
              Aplicar na Calculadora
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-elevation border-muted">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-bold text-secondary mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Regras e Detalhes
              </h2>

              <div className="prose prose-sm md:prose-base max-w-none prose-p:text-muted-foreground prose-li:text-muted-foreground prose-headings:text-secondary">
                {promo.rules_summary ? (
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {promo.rules_summary}
                  </div>
                ) : (
                  <p className="italic text-muted-foreground/70">
                    Nenhum detalhe adicional informado. Consulte o site oficial
                    para ler o regulamento completo.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm border-muted bg-muted/20">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-secondary flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" />
                Dica do Radar
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Antes de transferir seus pontos, verifique se você possui o
                cadastro ativo na promoção através do link oficial. A maioria
                dos programas exige o "opt-in" prévio.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
