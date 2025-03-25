"use client"

import { Canvas } from "./Canvas"

export function DrawingBoard() {
  return (
    <div className="p-6 bg-card rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Drawing Board</h2>
      <Canvas />
    </div>
  )
}