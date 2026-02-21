import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Settings, User, CreditCard, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState({
    name: 'Viajante Premium',
    email: 'viajante@example.com',
  })

  const [programs, setPrograms] = useState({
    livelo: true,
    esfera: false,
    smiles: true,
    latampass: true,
    tudoazul: false,
  })

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: 'Configurações salvas',
        description:
          'Seu perfil e programas de fidelidade foram atualizados com sucesso.',
      })
    }, 800)
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-4 animate-fade-in-up">
      <section>
        <h2 className="text-2xl md:text-3xl font-bold text-secondary tracking-tight flex items-center gap-2">
          <Settings className="w-8 h-8 text-primary" />
          Configurações
        </h2>
        <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">
          Gerencie seu perfil e suas contas de programas de fidelidade.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <Card className="shadow-elevation border-muted h-fit">
          <CardHeader className="border-b border-muted/50 pb-5">
            <div className="flex items-center gap-2 text-primary mb-1">
              <User className="w-5 h-5" />
              <CardTitle className="text-xl">Meu Perfil</CardTitle>
            </div>
            <CardDescription>
              Atualize suas informações pessoais.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="space-y-2.5">
              <Label htmlFor="name" className="text-secondary font-semibold">
                Nome Completo
              </Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                className="h-11 bg-muted/30 focus:bg-background transition-colors"
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-secondary font-semibold">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                className="h-11 bg-muted/30 focus:bg-background transition-colors"
              />
            </div>
          </CardContent>
          <CardFooter className="pt-2 pb-6 px-6">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto font-semibold"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-elevation border-muted h-fit">
          <CardHeader className="border-b border-muted/50 pb-5">
            <div className="flex items-center gap-2 text-primary mb-1">
              <CreditCard className="w-5 h-5" />
              <CardTitle className="text-xl">
                Meus Programas de Fidelidade
              </CardTitle>
            </div>
            <CardDescription>
              Selecione os programas que você utiliza para transferências.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card shadow-sm hover:bg-muted/20 transition-colors">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold text-secondary cursor-pointer">
                  Livelo
                </Label>
                <p className="text-xs text-muted-foreground font-medium">
                  Programa de pontos do Bradesco e BB
                </p>
              </div>
              <Switch
                checked={programs.livelo}
                onCheckedChange={(v) => setPrograms({ ...programs, livelo: v })}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card shadow-sm hover:bg-muted/20 transition-colors">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold text-secondary cursor-pointer">
                  Esfera
                </Label>
                <p className="text-xs text-muted-foreground font-medium">
                  Programa de pontos do Santander
                </p>
              </div>
              <Switch
                checked={programs.esfera}
                onCheckedChange={(v) => setPrograms({ ...programs, esfera: v })}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card shadow-sm hover:bg-muted/20 transition-colors">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold text-secondary cursor-pointer">
                  Smiles
                </Label>
                <p className="text-xs text-muted-foreground font-medium">
                  Programa de fidelidade da GOL
                </p>
              </div>
              <Switch
                checked={programs.smiles}
                onCheckedChange={(v) => setPrograms({ ...programs, smiles: v })}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card shadow-sm hover:bg-muted/20 transition-colors">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold text-secondary cursor-pointer">
                  Latam Pass
                </Label>
                <p className="text-xs text-muted-foreground font-medium">
                  Programa de fidelidade da LATAM
                </p>
              </div>
              <Switch
                checked={programs.latampass}
                onCheckedChange={(v) =>
                  setPrograms({ ...programs, latampass: v })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card shadow-sm hover:bg-muted/20 transition-colors">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold text-secondary cursor-pointer">
                  TudoAzul
                </Label>
                <p className="text-xs text-muted-foreground font-medium">
                  Programa de fidelidade da Azul
                </p>
              </div>
              <Switch
                checked={programs.tudoazul}
                onCheckedChange={(v) =>
                  setPrograms({ ...programs, tudoazul: v })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
