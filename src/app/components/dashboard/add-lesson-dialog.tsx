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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddLessonDialogProps {
  onAddLesson: (lesson: {
    subject: string
    title: string
    resource: string
    duration: string
  }) => void
  day: string
}

export function AddLessonDialog({ onAddLesson, day }: AddLessonDialogProps) {
  const [open, setOpen] = useState(false)
  const [newLesson, setNewLesson] = useState({
    subject: "",
    title: "",
    resource: "",
    duration: "30 min",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newLesson.subject && newLesson.title) {
      onAddLesson(newLesson)
      setNewLesson({
        subject: "",
        title: "",
        resource: "",
        duration: "30 min",
      })
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Custom Lesson
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          <DialogHeader className="flex-none pb-6">
            <DialogTitle className="text-center">Add Custom Lesson</DialogTitle>
            <DialogDescription className="text-center">Add a custom lesson to {day}'s schedule.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-6 px-1">
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={newLesson.subject}
                onValueChange={(value: string) => setNewLesson({ ...newLesson, subject: value })}
                required
              >
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Math">Math</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="Reading">Reading</SelectItem>
                  <SelectItem value="Writing">Writing</SelectItem>
                  <SelectItem value="History">History</SelectItem>
                  <SelectItem value="Art">Art</SelectItem>
                  <SelectItem value="Music">Music</SelectItem>
                  <SelectItem value="Physical Education">Physical Education</SelectItem>
                  <SelectItem value="Language">Language</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Lesson Title</Label>
              <Input
                id="title"
                value={newLesson.title}
                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                placeholder="Enter lesson title"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="resource">Resource URL (optional)</Label>
              <Input
                id="resource"
                value={newLesson.resource}
                onChange={(e) => setNewLesson({ ...newLesson, resource: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration</Label>
              <Select
                value={newLesson.duration}
                onValueChange={(value: string) => setNewLesson({ ...newLesson, duration: value })}
              >
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15 min">15 minutes</SelectItem>
                  <SelectItem value="30 min">30 minutes</SelectItem>
                  <SelectItem value="45 min">45 minutes</SelectItem>
                  <SelectItem value="60 min">1 hour</SelectItem>
                  <SelectItem value="90 min">1.5 hours</SelectItem>
                  <SelectItem value="120 min">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Lesson</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

