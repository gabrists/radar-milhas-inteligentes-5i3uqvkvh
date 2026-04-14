import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calculator } from 'lucide-react'
import { AcumuloCalculator } from '@/components/calculator/AcumuloCalculator'
import { EmissaoCalculator } from '@/components/calculator/EmissaoCalculator'

export default function CalculatorPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 pb-4">
      <section className="animate-fade-in-up">
        <h2 className="text-2xl md:text-3xl font-bold text-secondary tracking-tight flex items-center gap-2">
          <Calculator className="w-8 h-8 text-primary" />
          Calculadoras
        </h2>
        <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">
          Tome as melhores decisões para acumular e emitir com suas milhas.
        </p>
      </section>

      <Tabs
        defaultValue="emissao"
        className="w-full animate-fade-in-up"
        style={{ animationDelay: '100ms' }}
      >
        <TabsList className="grid w-full grid-cols-2 h-12 mb-6">
          <TabsTrigger
            value="emissao"
            className="text-sm sm:text-base font-semibold"
          >
            CPM de Emissão
          </TabsTrigger>
          <TabsTrigger
            value="acumulo"
            className="text-sm sm:text-base font-semibold"
          >
            Acúmulo Mágico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emissao" className="mt-0 outline-none">
          <EmissaoCalculator />
        </TabsContent>

        <TabsContent value="acumulo" className="mt-0 outline-none">
          <AcumuloCalculator />
        </TabsContent>
      </Tabs>
    </div>
  )
}
