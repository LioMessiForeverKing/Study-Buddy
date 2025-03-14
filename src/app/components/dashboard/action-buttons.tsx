import type React from "react"
import { Calendar, FileText, LayoutGrid, LineChart } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function ActionButtons() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <ActionCard
        icon={<Calendar className="h-6 w-6" />}
        title="View Full Schedule"
        description="See your entire month's learning plan"
        href="/dashboard/schedule"
        variant="default"
      />
      <ActionCard
        icon={<LayoutGrid className="h-6 w-6" />}
        title="Quick Reschedule"
        description="Bulk move lessons if life gets in the way"
        href="/dashboard/reschedule"
        variant="outline"
      />
      <ActionCard
        icon={<FileText className="h-6 w-6" />}
        title="Add Extra Learning"
        description="AI suggests extra lessons based on progress"
        href="/dashboard/suggestions"
        variant="outline"
      />
      <ActionCard
        icon={<LineChart className="h-6 w-6" />}
        title="View Progress Report"
        description="See your child's weekly/monthly progress"
        href="/dashboard/progress"
        variant="outline"
      />
    </div>
  )
}

interface ActionCardProps {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  variant?: "default" | "outline"
}

function ActionCard({ icon, title, description, href, variant = "default" }: ActionCardProps) {
  return (
    <Card
      className={`overflow-hidden transition-all hover:shadow-md ${
        variant === "default" ? "bg-primary text-primary-foreground" : ""
      }`}
    >
      <CardHeader className="pb-2">
        <div
          className={`rounded-full p-2 w-fit ${
            variant === "default" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
          }`}
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className={variant === "default" ? "text-primary-foreground/80" : ""}>
          {description}
        </CardDescription>
      </CardContent>
      <CardFooter>
        <Button asChild variant={variant === "default" ? "secondary" : "default"} className="w-full">
          <Link href={href}>Get Started</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

