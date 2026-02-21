import { useState } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { MapPin, Target, CheckCircle2, PlaneTakeoff } from 'lucide-react'
import { cn } from '@/lib/utils'

const initialGoals = [
  {
    id: 1,
    title: 'Orlando (Disney/Universal)',
    current: 85000,
    target: 120000,
    image: 'orlando disney',
    active: true,
  },
  {
    id: 2,
    title: 'Canadá (Toronto, Montreal e Quebec)',
    current: 45000,
    target: 180000,
    image: 'canada toronto',
    active: false,
  },
  {
    id: 3,
    title: 'Hungria',
    current: 15000,
    target: 200000,
    image: 'budapest hungary',
    active: false,
  },
]

export default function GoalsPage() {
  const [goals, setGoals] = useState(initialGoals)

  const handleSetActive = (id: number) => {
    setGoals(goals.map((g) => ({ ...g, active: g.id === id })))
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-4 animate-fade-in-up">
      <section>
        <h2 className="text-2xl md:text-3xl font-bold text-secondary tracking-tight flex items-center gap-2">
          <Target className="w-8 h-8 text-primary" />
          Meus Objetivos
        </h2>
        <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">
          Gerencie suas metas de viagem e defina qual é a sua prioridade.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal, index) => {
          const percentage = Math.min((goal.current / goal.target) * 100, 100)

          return (
            <Card
              key={goal.id}
              className={cn(
                'overflow-hidden flex flex-col transition-all duration-300 shadow-sm hover:shadow-md animate-fade-in-up',
                goal.active
                  ? 'border-primary ring-1 ring-primary/20'
                  : 'border-muted',
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="h-36 relative w-full overflow-hidden bg-muted">
                <img
                  src={`https://img.usecurling.com/p/600/300?q=${encodeURIComponent(goal.image)}&dpr=2`}
                  alt={goal.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                {goal.active && (
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Principal
                  </div>
                )}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-bold text-lg leading-tight flex items-start gap-1.5 drop-shadow-md">
                    <MapPin className="w-4 h-4 mt-1 shrink-0 text-primary" />
                    <span className="line-clamp-2">{goal.title}</span>
                  </h3>
                </div>
              </div>

              <CardContent className="pt-5 flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-end text-sm">
                    <span className="font-semibold text-secondary">
                      Progresso
                    </span>
                    <span className="font-bold text-primary">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2.5" />
                  <div className="flex justify-between text-xs font-medium text-muted-foreground pt-1">
                    <span>
                      {new Intl.NumberFormat('pt-BR').format(goal.current)} mi
                    </span>
                    <span>
                      {new Intl.NumberFormat('pt-BR').format(goal.target)} mi
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0 pb-5 px-5">
                <Button
                  variant={goal.active ? 'secondary' : 'outline'}
                  className={cn(
                    'w-full font-semibold',
                    goal.active
                      ? 'bg-secondary/10 text-secondary hover:bg-secondary/20'
                      : '',
                  )}
                  disabled={goal.active}
                  onClick={() => handleSetActive(goal.id)}
                >
                  {goal.active ? 'Meta Ativa' : 'Tornar Meta Principal'}
                  {!goal.active && <PlaneTakeoff className="w-4 h-4 ml-2" />}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
