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
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'

export default function Layout() {
  const location = useLocation()
  const { signOut } = useAuth()

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
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-primary/20">
                <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1" />
                <AvatarFallback>VT</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-secondary">
                  Viajante
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Premium
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
              className="text-muted-foreground hover:text-destructive shrink-0"
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
            <Button
              variant="ghost"
              size="icon"
              className="relative text-secondary hover:bg-muted/80 hover:text-primary transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-destructive border border-card"></span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
              className="md:hidden text-muted-foreground hover:text-destructive"
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

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t flex justify-around items-center h-16 z-50 px-1 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] overflow-x-auto">
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
