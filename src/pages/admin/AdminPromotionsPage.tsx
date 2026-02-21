import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  ShieldAlert,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Link as LinkIcon,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Promotion {
  id: string
  title: string
  origin: string
  destination: string
  bonus_percentage: number
  link: string
  rules_summary?: string
  valid_until?: string
}

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    origin: '',
    destination: '',
    bonus_percentage: '',
    link: '',
    rules_summary: '',
    valid_until: '',
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('active_promotions')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) {
      setPromotions(data as Promotion[])
    }
    setLoading(false)
  }

  const formatDateForInput = (isoString?: string | null) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  const openCreate = () => {
    setEditingId(null)
    setFormData({
      title: '',
      origin: '',
      destination: '',
      bonus_percentage: '',
      link: '',
      rules_summary: '',
      valid_until: '',
    })
    setIsModalOpen(true)
  }

  const openEdit = (promo: Promotion) => {
    setEditingId(promo.id)
    setFormData({
      title: promo.title,
      origin: promo.origin,
      destination: promo.destination,
      bonus_percentage: promo.bonus_percentage.toString(),
      link: promo.link,
      rules_summary: promo.rules_summary || '',
      valid_until: formatDateForInput(promo.valid_until),
    })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (
      !formData.title ||
      !formData.origin ||
      !formData.destination ||
      !formData.bonus_percentage ||
      !formData.link
    ) {
      toast({
        title: 'Atenção',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    const payload = {
      title: formData.title,
      origin: formData.origin,
      destination: formData.destination,
      bonus_percentage: parseFloat(formData.bonus_percentage),
      link: formData.link,
      rules_summary: formData.rules_summary || '',
      valid_until: formData.valid_until
        ? new Date(formData.valid_until).toISOString()
        : null,
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('active_promotions')
          .update(payload)
          .eq('id', editingId)
        if (error) throw error
        toast({
          title: 'Sucesso',
          description: 'Promoção atualizada com sucesso!',
        })
      } else {
        const { error } = await supabase
          .from('active_promotions')
          .insert([payload])
        if (error) throw error
        toast({
          title: 'Sucesso',
          description: 'Promoção cadastrada com sucesso!',
        })
      }
      setIsModalOpen(false)
      fetchPromotions()
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      const { error } = await supabase
        .from('active_promotions')
        .delete()
        .eq('id', deletingId)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Promoção excluída com sucesso!' })
      fetchPromotions()
    } catch (err: any) {
      toast({
        title: 'Erro ao excluir',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-4 animate-fade-in-up">
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-secondary tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-primary" />
            Admin: Promoções
          </h2>
          <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">
            Gerencie as promoções ativas disponíveis no sistema.
          </p>
        </div>
        <Button
          className="w-full sm:w-auto font-semibold shadow-sm"
          onClick={openCreate}
        >
          <Plus className="w-5 h-5 mr-2" /> Nova Promoção
        </Button>
      </section>

      <Card className="shadow-elevation border-muted">
        <CardHeader className="border-b border-muted/50 pb-4">
          <CardTitle>Promoções Cadastradas</CardTitle>
          <CardDescription>
            Lista completa de todas as promoções disponíveis para os usuários.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead className="text-center">Bônus (%)</TableHead>
                <TableHead className="text-right pr-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : promotions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-muted-foreground font-medium"
                  >
                    Nenhuma promoção cadastrada no momento.
                  </TableCell>
                </TableRow>
              ) : (
                promotions.map((promo) => (
                  <TableRow
                    key={promo.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell
                      className="font-medium text-secondary max-w-[200px] truncate"
                      title={promo.title}
                    >
                      {promo.title}
                    </TableCell>
                    <TableCell>{promo.origin}</TableCell>
                    <TableCell>{promo.destination}</TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                        {promo.bonus_percentage}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(promo)}
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingId(promo.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Promoção' : 'Nova Promoção'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Título da Promoção</Label>
              <Input
                placeholder="Ex: Transferência Livelo para Smiles"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Programa de Origem</Label>
                <Input
                  placeholder="Ex: Livelo"
                  value={formData.origin}
                  onChange={(e) =>
                    setFormData({ ...formData, origin: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Programa de Destino</Label>
                <Input
                  placeholder="Ex: Smiles"
                  value={formData.destination}
                  onChange={(e) =>
                    setFormData({ ...formData, destination: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bônus (%)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 100"
                  value={formData.bonus_percentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bonus_percentage: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Validade (Opcional)</Label>
                <Input
                  type="datetime-local"
                  value={formData.valid_until}
                  onChange={(e) =>
                    setFormData({ ...formData, valid_until: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Link Oficial</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="https://..."
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Regras e Detalhes (Opcional)</Label>
              <Textarea
                placeholder="Descreva os detalhes e regulamentos importantes da promoção..."
                value={formData.rules_summary}
                onChange={(e) =>
                  setFormData({ ...formData, rules_summary: e.target.value })
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingId ? 'Salvar Alterações' : 'Salvar Promoção'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação de Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta promoção do sistema? Esta ação
              não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
            >
              Excluir Promoção
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
