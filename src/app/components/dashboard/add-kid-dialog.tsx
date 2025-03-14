"use client"

import type React from "react"

import { useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface AddKidDialogProps {
  onAddKid: (kid: {
    name: string
    age: number
    subjects: string[]
  }) => void
}

export function AddKidDialog({ onAddKid }: AddKidDialogProps) {
  const [open, setOpen] = useState(false)
  const [newKid, setNewKid] = useState({
    name: "",
    age: "",
    subjects: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newKid.name && newKid.age && newKid.subjects) {
      onAddKid({
        name: newKid.name,
        age: Number.parseInt(newKid.age),
        subjects: newKid.subjects.split(",").map((s) => s.trim()),
      })
      setNewKid({ name: "", age: "", subjects: "" })
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" id="add-kid-trigger">
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add a new child</DialogTitle>
            <DialogDescription>Enter your child's information to create their homeschool profile.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newKid.name}
                onChange={(e) => setNewKid({ ...newKid, name: e.target.value })}
                placeholder="Enter child's name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min="1"
                max="18"
                value={newKid.age}
                onChange={(e) => setNewKid({ ...newKid, age: e.target.value })}
                placeholder="Enter child's age"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subjects">Subjects (comma separated)</Label>
              <Textarea
                id="subjects"
                value={newKid.subjects}
                onChange={(e) => setNewKid({ ...newKid, subjects: e.target.value })}
                placeholder="Math, Science, Reading, Art..."
                className="resize-none"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Child</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

