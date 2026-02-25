import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  Plane,
  LayoutDashboard,
  Target,
  History,
  Settings,
  Bell,
  LogOut,
  Tag,
  ShieldAlert,
  Calculator,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

export default function Layout() {
  const location = useLocation()
  const { signOut, user } = useAuth()
  const [recentPromos, setRecentPromos] = useState<any[]>([])
  const [profile, setProfile] = useState<{
    full_name: string
    plan_type?: string | null
  } | null>(null)

  useEffect(() => {
    const fetchPromos = async () => {
      const { data } = await supabase
        .from('active_promotions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3)
      if (data) setRecentPromos(data)
    }
    fetchPromos()
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('full_name, plan_type')
        .eq('id', user.id)
        .single()
      if (data) setProfile(data)
    }
    fetchProfile()
  }, [user])

  const userInitials = profile?.full_name
    ? profile.full_name.substring(0, 2).toUpperCase()
    : 'RM'

  return (
    <SidebarProvider>
      <Sidebar className="hidden md:flex border-r-0 shadow-sm z-20">
        <SidebarHeader className="p-4 border-b border-border/50">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Plane className="h-6 w-6" />
            <span>Radar Milhas</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2 pt-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/'}>
                <Link to="/">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === '/calculadora'}
              >
                <Link to="/calculadora">
                  <Calculator />
                  <span>Calculadora</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === '/objetivos'}
              >
                <Link to="/objetivos">
                  <Target />
                  <span>Meus Objetivos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === '/historico'}
              >
                <Link to="/historico">
                  <History />
                  <span>Histórico</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === '/promocoes'}
              >
                <Link to="/promocoes">
                  <Tag />
                  <span>Promoções</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === '/admin/promocoes'}
              >
                <Link to="/admin/promocoes">
                  <ShieldAlert />
                  <span>Admin Promoções</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === '/configuracoes'}
              >
                <Link to="/configuracoes">
                  <Settings />
                  <span>Configurações</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-border/50">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 w-[140px]">
              <Avatar className="h-10 w-10 border border-primary/20 shrink-0">
                <AvatarImage
                  src={`https://img.usecurling.com/ppl/thumbnail?gender=male&seed=${user?.id || 1}`}
                />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate">
                <span className="text-sm font-semibold text-secondary truncate">
                  {profile?.full_name || 'Viajante'}
                </span>
                <span className="text-xs text-muted-foreground font-medium capitalize">
                  {profile?.plan_type || 'Premium'}
                </span>
              </div>
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => signOut()}
              className="shrink-0 shadow-sm"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col min-h-screen pb-16 md:pb-0 relative w-full">
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 md:px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="md:hidden flex items-center gap-2 font-bold text-lg text-primary mr-2">
              <Plane className="h-6 w-6" />
            </div>
            <h1 className="text-lg md:text-xl font-bold text-secondary tracking-tight">
              Painel de Milhas
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-secondary hover:bg-muted/80 hover:text-primary transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {recentPromos.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white animate-pulse shadow-sm">
                      {recentPromos.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-80 p-0 shadow-elevation rounded-xl border-muted z-50"
              >
                <div className="p-3.5 border-b border-muted bg-muted/30 rounded-t-xl">
                  <h4 className="font-semibold text-sm text-secondary">
                    Notificações
                  </h4>
                </div>
                <div className="flex flex-col max-h-[320px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {recentPromos.length > 0 ? (
                    recentPromos.map((promo) => (
                      <Link
                        key={promo.id}
                        to="/promocoes"
                        className="p-3.5 hover:bg-muted/50 border-b border-muted/50 transition-colors flex flex-col gap-1.5 last:border-b-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/10">
                            🔥 {promo.bonus_percentage}% Bônus
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-secondary line-clamp-2 leading-tight">
                          {promo.title}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {promo.origin} → {promo.destination}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <div className="p-8 text-sm font-medium text-muted-foreground text-center">
                      Nenhuma promoção no momento.
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-muted bg-muted/10 rounded-b-xl">
                  <Button
                    variant="ghost"
                    className="w-full text-xs font-bold h-8 text-primary hover:text-primary/80"
                    asChild
                  >
                    <Link to="/promocoes">Ver todas as promoções</Link>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="destructive"
              size="icon"
              onClick={() => signOut()}
              className="md:hidden shadow-sm"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8 relative">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t flex justify-around items-center h-16 z-50 px-1 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Link
            to="/"
            className={cn(
              'flex flex-col items-center justify-center min-w-[64px] h-full space-y-1 text-[10px] font-medium transition-colors',
              location.pathname === '/'
                ? 'text-primary'
                : 'text-muted-foreground',
            )}
          >
            <LayoutDashboard
              className={cn(
                'h-5 w-5',
                location.pathname === '/' && 'fill-primary/20',
              )}
            />
            <span>Painel</span>
          </Link>
          <Link
            to="/calculadora"
            className={cn(
              'flex flex-col items-center justify-center min-w-[64px] h-full space-y-1 text-[10px] font-medium transition-colors',
              location.pathname === '/calculadora'
                ? 'text-primary'
                : 'text-muted-foreground',
            )}
          >
            <Calculator
              className={cn(
                'h-5 w-5',
                location.pathname === '/calculadora' && 'fill-primary/20',
              )}
            />
            <span>Simular</span>
          </Link>
          <Link
            to="/objetivos"
            className={cn(
              'flex flex-col items-center justify-center min-w-[64px] h-full space-y-1 text-[10px] font-medium transition-colors',
              location.pathname === '/objetivos'
                ? 'text-primary'
                : 'text-muted-foreground',
            )}
          >
            <Target
              className={cn(
                'h-5 w-5',
                location.pathname === '/objetivos' && 'fill-primary/20',
              )}
            />
            <span>Objetivos</span>
          </Link>
          <Link
            to="/promocoes"
            className={cn(
              'flex flex-col items-center justify-center min-w-[64px] h-full space-y-1 text-[10px] font-medium transition-colors',
              location.pathname === '/promocoes'
                ? 'text-primary'
                : 'text-muted-foreground',
            )}
          >
            <Tag
              className={cn(
                'h-5 w-5',
                location.pathname === '/promocoes' && 'fill-primary/20',
              )}
            />
            <span>Promoções</span>
          </Link>
          <Link
            to="/historico"
            className={cn(
              'flex flex-col items-center justify-center min-w-[64px] h-full space-y-1 text-[10px] font-medium transition-colors',
              location.pathname === '/historico'
                ? 'text-primary'
                : 'text-muted-foreground',
            )}
          >
            <History
              className={cn(
                'h-5 w-5',
                location.pathname === '/historico' && 'fill-primary/20',
              )}
            />
            <span>Histórico</span>
          </Link>
          <Link
            to="/configuracoes"
            className={cn(
              'flex flex-col items-center justify-center min-w-[64px] h-full space-y-1 text-[10px] font-medium transition-colors',
              location.pathname === '/configuracoes'
                ? 'text-primary'
                : 'text-muted-foreground',
            )}
          >
            <Settings
              className={cn(
                'h-5 w-5',
                location.pathname === '/configuracoes' && 'fill-primary/20',
              )}
            />
            <span>Ajustes</span>
          </Link>
        </nav>
      </SidebarInset>
    </SidebarProvider>
  )
}
