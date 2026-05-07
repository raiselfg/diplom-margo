import React from 'react';
import { SidebarProvider } from '@/ui/components/ui/sidebar';

export default function RootGroupLayout({
  children,
  sidebar,
}: Readonly<{
  children: React.ReactNode;
  sidebar: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      {sidebar}
      <div className="flex min-h-full flex-1 flex-col">{children}</div>
    </SidebarProvider>
  );
}
