"use client"

import { DashboardHeader } from "../components/dashboard/dashboard-header"
import { KidsPanel } from "../components/dashboard/kids-panel"
import { WeeklySchedule } from "../components/dashboard/weekly-schedule"
import { ActionButtons } from "../components/dashboard/action-buttons"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <DashboardHeader />
      <main className="container px-4 py-8 md:px-6">
        <div className="mb-8 max-w-4xl">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your homeschool curriculum and track your children's progress
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {/* Left Column - Kids Profiles */}
          <div className="md:col-span-1">
            <KidsPanel />
          </div>

          {/* Right Column - Weekly Plan */}
          <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
            <div className="space-y-8">
              <WeeklySchedule />
              <ActionButtons />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}