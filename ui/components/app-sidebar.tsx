'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, CalendarDays, Tags } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/ui/components/ui/sidebar';
import { ThemeToggle } from './theme-toggle';

const navItems = [
  {
    title: 'Дашборд',
    url: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Инвентарь',
    url: '/inventory',
    icon: Package,
  },
  {
    title: 'Категории',
    url: '/categories',
    icon: Tags,
  },
  {
    title: 'Мероприятия',
    url: '/events',
    icon: CalendarDays,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar {...props}>
      <SidebarContent>
        <SidebarGroup>
          <div className="mb-3 flex items-center justify-between">
            <SidebarGroupLabel>Учет инвентаря</SidebarGroupLabel>
            <ThemeToggle />
          </div>

          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive =
                  item.url === '/'
                    ? pathname === '/'
                    : pathname?.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      render={<Link href={item.url} />}
                    >
                      <item.icon data-icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
