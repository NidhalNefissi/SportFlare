import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { GymOwnerNav } from "@/components/gym-owner-nav"

export const dynamic = "force-dynamic"

export default async function GymOwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== 'gym') {
    redirect("/unauthorized")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={session.user} />
      <div className="flex-1">
        <div className="border-b">
          <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
            <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 border-r border-border/40 bg-background/95 backdrop-blur md:sticky md:block">
              <div className="h-full px-3 py-6">
                <div className="space-y-1">
                  <GymOwnerNav />
                </div>
              </div>
            </aside>
            <main className="flex w-full flex-col overflow-hidden py-6 pl-1 pr-1 md:pl-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
