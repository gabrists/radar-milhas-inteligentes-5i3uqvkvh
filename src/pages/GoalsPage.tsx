import { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  MapPin,
  Target,
  CheckCircle2,
  PlaneTakeoff,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

type Goal = {
  id: string
  destination_name: string
  target_miles: number
  current_miles: number
  image_url: string | null
  is_active: boolean
}

export default function GoalsPage() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null)
  const [formData, setFormData] = useState({ title: '', target: '', image: '' })
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      supabase
        .from('travel_goals')
        .select('*')
        .then(({ data }) => {
          if (data)
            setGoals(
              (data as unknown as Goal[]).sort((a, b) =>
                a.destination_name.localeCompare(b.destination_name),
              ),
            )
        })
    }
  }, [user])

  const handleSetActive = async (id: string) => {
    if (!user) return
    setGoals(goals.map((g) => ({ ...g, is_active: g.id === id })))
    await supabase
      .from('travel_goals')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .neq('id', id)
    await supabase.from('travel_goals').update({ is_active: true }).eq('id', id)
  }

  const openCreate = () => {
    setEditingId(null)
    setFormData({ title: '', target: '', image: '' })
    setIsModalOpen(true)
  }

  const openEdit = (goal: Goal) => {
    setEditingId(goal.id)
    setFormData({
      title: goal.destination_name,
      target: goal.target_miles.toString(),
      image: goal.image_url || '',
    })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.target || !user) return
    const target_miles = parseInt(formData.target) || 0
    if (editingId) {
      const { error } = await supabase
        .from('travel_goals')
        .update({
          destination_name: formData.title,
          target_miles,
          image_url: formData.image || null,
        })
        .eq('id', editingId)
      if (!error) {
        setGoals(
          goals.map((g) =>
            g.id === editingId
              ? {
                  ...g,
                  destination_name: formData.title,
                  target_miles,
                  image_url: formData.image || null,
                }
              : g,
          ),
        )
        toast({
          title: 'Sucesso!',
          description: 'Objetivo atualizado com sucesso!',
        })
      }
    } else {
      const { data, error } = await supabase
        .from('travel_goals')
        .insert({
          user_id: user.id,
          destination_name: formData.title,
          target_miles,
          image_url: formData.image || null,
          is_active: goals.length === 0,
        })
        .select()
        .single()
      if (!error && data) {
        setGoals([...goals, data as unknown as Goal])
        toast({
          title: 'Sucesso!',
          description: 'Objetivo criado com sucesso!',
        })
      }
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!deletingGoal) return
    const { error } = await supabase
      .from('travel_goals')
      .delete()
      .eq('id', deletingGoal.id)
    if (!error) {
      setGoals(goals.filter((g) => g.id !== deletingGoal.id))
      toast({
        title: 'Sucesso!',
        description: 'Objetivo excluído com sucesso!',
      })
    }
    setDeletingGoal(null)
  }

  const getImageUrl = (url: string | null, fallback: string) => {
    if (!url)
      return `https://img.usecurling.com/p/600/300?q=${encodeURIComponent(fallback)}&dpr=2`
    return url.startsWith('http')
      ? url
      : `https://img.usecurling.com/p/600/300?q=${encodeURIComponent(url)}&dpr=2`
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-4 animate-fade-in-up">
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-secondary tracking-tight flex items-center gap-2">
            <Target className="w-8 h-8 text-primary" /> Meus Objetivos
          </h2>
          <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">
            Gerencie suas metas de viagem e defina qual é a sua prioridade.
          </p>
        </div>
        <Button
          className="w-full sm:w-auto font-semibold shadow-sm"
          onClick={openCreate}
        >
          <Plus className="w-5 h-5 mr-2" /> Criar Novo Objetivo
        </Button>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal, i) => {
          const percentage =
            goal.target_miles > 0
              ? Math.min((goal.current_miles / goal.target_miles) * 100, 100)
              : 0
          return (
            <Card
              key={goal.id}
              className={cn(
                'overflow-hidden flex flex-col transition-all duration-300 shadow-sm hover:shadow-md animate-fade-in-up',
                goal.is_active
                  ? 'border-primary ring-1 ring-primary/20'
                  : 'border-muted',
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="h-36 relative w-full overflow-hidden bg-muted">
                <img
                  src={getImageUrl(goal.image_url, goal.destination_name)}
                  alt={goal.destination_name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {goal.is_active && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Principal
                  </div>
                )}

                <div className="absolute top-2 right-2 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:bg-black/20 focus-visible:ring-0 focus-visible:ring-offset-0 bg-black/20 backdrop-blur-sm rounded-full"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(goal)}>
                        <Edit2 className="w-4 h-4 mr-2" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                        onClick={() => setDeletingGoal(goal)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-bold text-lg leading-tight flex items-start gap-1.5 drop-shadow-md">
                    <MapPin className="w-4 h-4 mt-1 shrink-0 text-primary" />{' '}
                    <span className="line-clamp-2">
                      {goal.destination_name}
                    </span>
                  </h3>
                </div>
              </div>

              <CardContent className="pt-5 flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-end text-sm">
                    <span className="font-semibold text-secondary">
                      Progresso
                    </span>{' '}
                    <span className="font-bold text-primary">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2.5" />
                  <div className="flex justify-between text-xs font-medium text-muted-foreground pt-1">
                    <span>
                      {new Intl.NumberFormat('pt-BR').format(
                        goal.current_miles,
                      )}{' '}
                      mi
                    </span>{' '}
                    <span>
                      {new Intl.NumberFormat('pt-BR').format(goal.target_miles)}{' '}
                      mi
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-5 px-5">
                <Button
                  variant={goal.is_active ? 'secondary' : 'outline'}
                  className={cn(
                    'w-full font-semibold',
                    goal.is_active &&
                      'bg-secondary/10 text-secondary hover:bg-secondary/20',
                  )}
                  disabled={goal.is_active}
                  onClick={() => handleSetActive(goal.id)}
                >
                  {goal.is_active ? 'Meta Ativa' : 'Tornar Meta Principal'}{' '}
                  {!goal.is_active && <PlaneTakeoff className="w-4 h-4 ml-2" />}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Objetivo' : 'Qual é o seu próximo destino?'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="space-y-2">
              <Label>Nome do Destino</Label>
              <Input
                placeholder="Ex: Paris, França"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Meta de Milhas</Label>
              <Input
                type="number"
                placeholder="Ex: 150000"
                value={formData.target}
                onChange={(e) =>
                  setFormData({ ...formData, target: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>URL da Imagem de Fundo (Opcional)</Label>
              <Input
                placeholder="https://exemplo.com/imagem.jpg"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.title || !formData.target}
            >
              {editingId ? 'Salvar Alterações' : 'Salvar Objetivo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingGoal}
        onOpenChange={(open) => !open && setDeletingGoal(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Objetivo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o objetivo '
              {deletingGoal?.destination_name}'? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
