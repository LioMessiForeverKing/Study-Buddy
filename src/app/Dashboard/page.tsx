"use client"

import { DrawingBoard } from "@/components/DrawingBoard"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <DrawingBoard />
    </div>
  )
}