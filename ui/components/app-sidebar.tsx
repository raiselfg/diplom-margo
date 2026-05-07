'use client';

import * as React from 'react';
import Link from 'next/link';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/ui/components/ui/sidebar';
import { usePathname } from 'next/navigation';

const data = {
  navMain: [
    {
      title: 'Getting Started',
      url: '#',
      items: [
        {
          title: 'Инвентарь',
          url: '/inventor',
        },
        {
          title: 'Project Structure',
          url: '#',
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar {...props}>
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((subItem) => {
                  const isActive = pathname?.startsWith(subItem.url) || false;
                  return (
                    <SidebarMenuItem key={subItem.title}>
                      <SidebarMenuButton
                        isActive={isActive}
                        render={<Link href={subItem.url} />}
                      >
                        {subItem.title}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
