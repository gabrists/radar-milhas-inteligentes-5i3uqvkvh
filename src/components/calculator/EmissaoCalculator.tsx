import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Share2, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

export function EmissaoCalculator() {
  const { toast } = useToast()
  const [cashPrice, setCashPrice] = useState<string>('')
  const [milesRequired, setMilesRequired] = useState<string>('')
  const [fees, setFees] = useState<string>('')
  const [milesCost, setMilesCost] = useState<string>('35.00')

  const numCash = parseFloat(cashPrice) || 0
  const numMiles = parseFloat(milesRequired) || 0
  const numFees = parseFloat(fees) || 0
  const numCost = parseFloat(milesCost) || 0

  const { cpm, isWorth, savings, hasValues } = useMemo(() => {
    if (!numCash || !numMiles)
      return { cpm: 0, isWorth: false, savings: 0, hasValues: false }

    const calculatedCpm = (numCash - numFees) / (numMiles / 1000)
    const totalEmissionCost = (numMiles / 1000) * numCost + numFees
    const calculatedSavings = numCash - totalEmissionCost

    return {
      cpm: calculatedCpm,
      isWorth: calculatedSavings >= 0,
      savings: Math.abs(calculatedSavings),
      hasValues: true,
    }
  }, [numCash, numMiles, numFees, numCost])

  let verdictColor = 'bg-red-500'
  let verdictText = 'Péssimo'
  let textColor = 'text-red-600'
  let progressValue = 0

  if (hasValues) {
    if (cpm >= 70) {
      verdictColor = 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
      verdictText = 'Excelente'
      textColor = 'text-emerald-600'
      progressValue = 100
    } else if (cpm >= 50) {
      verdictColor = 'bg-green-400'
      verdictText = 'Bom'
      textColor = 'text-green-500'
      progressValue = 80
    } else if (cpm >= 35) {
      verdictColor = 'bg-yellow-400'
      verdictText = 'OK'
      textColor = 'text-yellow-600'
      progressValue = 60
    } else if (cpm >= 20) {
      verdictColor = 'bg-orange-400'
      verdictText = 'Ruim'
      textColor = 'text-orange-500'
      progressValue = 40
    } else {
      verdictColor = 'bg-red-500'
      verdictText = 'Péssimo'
      textColor = 'text-red-600'
      progressValue = 20
    }
  }

  const handleClear = () => {
    setCashPrice('')
    setMilesRequired('')
    setFees('')
    setMilesCost('35.00')
  }

  const handleShare = () => {
    if (!hasValues) return
    const formatCurrency = (val: number) =>
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(val)

    const text = `✈️ Simulação de Emissão:\n\n💵 Preço: ${formatCurrency(numCash)}\n🛫 Milhas: ${numMiles}\n💸 Taxas: ${formatCurrency(numFees)}\n💰 Custo do Milheiro: ${formatCurrency(numCost)}\n\n📊 Valor da Milha (CPM): ${formatCurrency(cpm)}\n🎯 Veredito: ${verdictText}!\n\n${isWorth ? `✅ Economia de ${formatCurrency(savings)} usando milhas!` : `❌ Prejuízo de ${formatCurrency(savings)}. Pague em dinheiro!`}`

    if (navigator.share) {
      navigator
        .share({ title: 'Veredito de Emissão', text })
        .catch(console.error)
    } else {
      navigator.clipboard.writeText(text)
      toast({
        title: 'Copiado!',
        description: 'Resultado copiado para a área de transferência.',
      })
    }
  }

  return (
    <Card className="shadow-elevation border-muted h-full flex flex-col">
      <CardContent className="p-6 md:p-8 flex-1 flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2.5">
            <Label
              htmlFor="cash-price"
              className="text-secondary font-semibold"
            >
              Preço da Passagem (R$)
            </Label>
            <Input
              id="cash-price"
              type="number"
              placeholder="Ex: 1500"
              value={cashPrice}
              onChange={(e) => setCashPrice(e.target.value)}
              className="h-12 bg-muted/30"
            />
          </div>
          <div className="space-y-2.5">
            <Label
              htmlFor="miles-required"
              className="text-secondary font-semibold"
            >
              Quantidade de Milhas
            </Label>
            <Input
              id="miles-required"
              type="number"
              placeholder="Ex: 30000"
              value={milesRequired}
              onChange={(e) => setMilesRequired(e.target.value)}
              className="h-12 bg-muted/30"
            />
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="fees" className="text-secondary font-semibold">
              Taxas de Embarque (R$)
            </Label>
            <Input
              id="fees"
              type="number"
              placeholder="Ex: 150"
              value={fees}
              onChange={(e) => setFees(e.target.value)}
              className="h-12 bg-muted/30"
            />
          </div>
          <div className="space-y-2.5">
            <Label
              htmlFor="miles-cost"
              className="text-secondary font-semibold"
            >
              Custo do Milheiro (R$)
            </Label>
            <Input
              id="miles-cost"
              type="number"
              placeholder="Ex: 35.00"
              value={milesCost}
              onChange={(e) => setMilesCost(e.target.value)}
              className="h-12 bg-muted/30"
            />
          </div>
        </div>

        {hasValues && (
          <div className="mt-4 p-5 rounded-xl border bg-muted/20 space-y-5 animate-fade-in-up">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="font-semibold text-secondary">
                  Medidor de Oportunidade
                </span>
                <span className={cn('text-xl font-bold', textColor)}>
                  {verdictText}
                </span>
              </div>
              <div className="h-4 w-full bg-secondary/10 rounded-full overflow-hidden border border-border/50">
                <div
                  className={cn(
                    'h-full transition-all duration-1000 ease-out',
                    verdictColor,
                  )}
                  style={{ width: `${progressValue}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                O valor gerado pelas suas milhas nesta emissão é de{' '}
                <strong className="text-secondary">R$ {cpm.toFixed(2)}</strong>{' '}
                por milheiro.
              </p>
            </div>

            <div
              className={cn(
                'p-4 rounded-lg flex items-start gap-3 border',
                isWorth
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-red-50 border-red-200',
              )}
            >
              {isWorth ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h4
                  className={cn(
                    'font-bold',
                    isWorth ? 'text-emerald-800' : 'text-red-800',
                  )}
                >
                  {isWorth
                    ? 'Vale a pena emitir com milhas!'
                    : 'Pague em dinheiro!'}
                </h4>
                <p
                  className={cn(
                    'text-sm mt-1 leading-snug',
                    isWorth ? 'text-emerald-700' : 'text-red-700',
                  )}
                >
                  {isWorth
                    ? `Você está economizando R$ ${savings.toFixed(2)} em relação ao preço em dinheiro.`
                    : `Suas milhas valem mais do que essa emissão. Prejuízo de R$ ${savings.toFixed(2)}. Guarde-as para uma oportunidade melhor.`}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Button
            variant="outline"
            onClick={handleClear}
            className="w-full sm:w-1/3 h-12 font-semibold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar
          </Button>
          <Button
            onClick={handleShare}
            disabled={!hasValues}
            className="w-full sm:w-2/3 h-12 font-semibold shadow-md"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar Resultado
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
