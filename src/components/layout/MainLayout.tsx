import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      {/* Skip Link for Keyboard Users - WCAG 2.4.1 */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader />
          
          <main 
            id="main-content"
            className="flex-1 p-6 overflow-auto"
            role="main"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
