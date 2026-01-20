import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { MobileBlocker } from '@/components/MobileBlocker';

export function AppLayout() {
  return (
    <>
      <MobileBlocker />
      
      <SidebarProvider defaultOpen={true}>
        <div className="hidden min-h-screen w-full lg:flex">
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="flex-1" />
              <span className="font-mono text-xs text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </header>
            <main className="flex-1 overflow-auto p-4">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </>
  );
}
