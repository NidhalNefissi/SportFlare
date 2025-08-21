import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Calendar, CheckCircle, BarChart2, Megaphone } from "lucide-react"

export function GymOwnerNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()

  const items = [
    {
      href: "/gym-owner/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/gym-owner/manage-classes",
      label: "Manage Classes",
      icon: Calendar,
    },
    {
      href: "/gym-owner/check-ins",
      label: "Check-ins",
      icon: CheckCircle,
    },
    {
      href: "/gym-owner/analytics",
      label: "Analytics",
      icon: BarChart2,
    },
    {
      href: "/gym-owner/promotions",
      label: "Promotions",
      icon: Megaphone,
    },
  ]

  return (
    <nav
      className={cn("flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1", className)}
      {...props}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md",
            pathname === item.href
              ? "bg-muted hover:bg-muted"
              : "hover:bg-accent hover:text-accent-foreground",
            "transition-colors"
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
