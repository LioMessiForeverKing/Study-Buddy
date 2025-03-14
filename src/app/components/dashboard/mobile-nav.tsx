"use client"

import { Calendar, LayoutDashboard, LineChart, Settings, Users } from "lucide-react"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MobileNavProps {
  setOpen: (open: boolean) => void
}

export function MobileNav({ setOpen }: MobileNavProps) {
  return (
    <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
      <div className="flex flex-col space-y-3">
        <Link
          href="/dashboard"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
        <Link
          href="/dashboard/kids"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <Users className="h-4 w-4" />
          <span>Kids</span>
        </Link>
        <Link
          href="/dashboard/schedule"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <Calendar className="h-4 w-4" />
          <span>Schedule</span>
        </Link>
        <Link
          href="/dashboard/progress"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <LineChart className="h-4 w-4" />
          <span>Progress</span>
        </Link>
        <Link
          href="/dashboard/settings"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>
      </div>
    </ScrollArea>
  )
}

