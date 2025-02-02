'use client'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { NavigationProvider } from '@/lib/context/navigation' // 대시보드의 컴포넌트들에서는 mobile nav 관련 컨텍스트를 사용할 수 있게 됨
import { Authenticated } from 'convex/react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NavigationProvider>
      <div className="flex h-screen">
        <Authenticated>
          <Sidebar />
        </Authenticated>

        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </NavigationProvider>
  )
}
