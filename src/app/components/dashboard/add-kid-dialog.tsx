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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddKidDialogProps {
  onAddKid: (kid: {
    name: string
    age: number
    subjects: string[]
    learningStyle: string
    difficultyLevel: string
    learningPace: string
    interests: string[]
    gradeLevel: string
    state: string
  }) => void
}

export function AddKidDialog({ onAddKid }: AddKidDialogProps) {
  const [open, setOpen] = useState(false)
  const [newKid, setNewKid] = useState({
    name: "",
    age: "",
    subjects: "",
    learningStyle: "visual",
    difficultyLevel: "beginner",
    learningPace: "standard",
    interests: "",
    gradeLevel: "kindergarten",
    state: "AL"
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newKid.name && newKid.age && newKid.subjects) {
      onAddKid({
        name: newKid.name,
        age: Number.parseInt(newKid.age),
        subjects: newKid.subjects.split(",").map((s) => s.trim()),
        learningStyle: newKid.learningStyle,
        difficultyLevel: newKid.difficultyLevel,
        learningPace: newKid.learningPace,
        interests: newKid.interests.split(",").map((s) => s.trim()),
        gradeLevel: newKid.gradeLevel,
        state: newKid.state
      })
      setNewKid({
        name: "",
        age: "",
        subjects: "",
        learningStyle: "visual",
        difficultyLevel: "beginner",
        learningPace: "standard",
        interests: "",
        gradeLevel: "kindergarten",
        state: "AL"
      })
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
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          <DialogHeader className="flex-none pb-6">
            <DialogTitle className="text-center">Add a new child</DialogTitle>
            <DialogDescription className="text-center">Enter your child's information to create their homeschool profile.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-6 px-1">
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
            <div className="grid gap-2">
              <Label htmlFor="learningStyle">Learning Style</Label>
              <Select

                value={newKid.learningStyle}
                onValueChange={(value: string) => setNewKid({ ...newKid, learningStyle: value })}
              >
                <SelectTrigger id="learningStyle">
                  <SelectValue placeholder="Select learning style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visual">Visual</SelectItem>
                  <SelectItem value="auditory">Auditory</SelectItem>
                  <SelectItem value="reading">Reading/Writing</SelectItem>
                  <SelectItem value="kinesthetic">Kinesthetic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="difficultyLevel">Initial Difficulty Level</Label>
              <Select
                value={newKid.difficultyLevel}
                onValueChange={(value: string) => setNewKid({ ...newKid, difficultyLevel: value })}
              >
                <SelectTrigger id="difficultyLevel">
                  <SelectValue placeholder="Select difficulty level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="learningPace">Learning Pace</Label>
              <Select
                value={newKid.learningPace}
                onValueChange={(value: string) => setNewKid({ ...newKid, learningPace: value })}
              >
                <SelectTrigger id="learningPace">
                  <SelectValue placeholder="Select learning pace" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relaxed">Relaxed</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="accelerated">Accelerated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="interests">Interests (comma separated)</Label>
              <Textarea
                id="interests"
                value={newKid.interests}
                onChange={(e) => setNewKid({ ...newKid, interests: e.target.value })}
                placeholder="Science experiments, Drawing, Music..."
                className="resize-none"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gradeLevel">Grade Level</Label>
              <Select
                value={newKid.gradeLevel}
                onValueChange={(value: string) => setNewKid({ ...newKid, gradeLevel: value })}
              >
                <SelectTrigger id="gradeLevel">
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre-k">Pre-K</SelectItem>
                  <SelectItem value="kindergarten">Kindergarten</SelectItem>
                  <SelectItem value="1st">1st Grade</SelectItem>
                  <SelectItem value="2nd">2nd Grade</SelectItem>
                  <SelectItem value="3rd">3rd Grade</SelectItem>
                  <SelectItem value="4th">4th Grade</SelectItem>
                  <SelectItem value="5th">5th Grade</SelectItem>
                  <SelectItem value="6th">6th Grade</SelectItem>
                  <SelectItem value="7th">7th Grade</SelectItem>
                  <SelectItem value="8th">8th Grade</SelectItem>
                  <SelectItem value="9th">9th Grade</SelectItem>
                  <SelectItem value="10th">10th Grade</SelectItem>
                  <SelectItem value="11th">11th Grade</SelectItem>
                  <SelectItem value="12th">12th Grade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Select
                value={newKid.state}
                onValueChange={(value: string) => setNewKid({ ...newKid, state: value })}
              >
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AL">Alabama</SelectItem>
                  <SelectItem value="AK">Alaska</SelectItem>
                  <SelectItem value="AZ">Arizona</SelectItem>
                  <SelectItem value="AR">Arkansas</SelectItem>
                  <SelectItem value="CA">California</SelectItem>
                  <SelectItem value="CO">Colorado</SelectItem>
                  <SelectItem value="CT">Connecticut</SelectItem>
                  <SelectItem value="DE">Delaware</SelectItem>
                  <SelectItem value="FL">Florida</SelectItem>
                  <SelectItem value="GA">Georgia</SelectItem>
                  <SelectItem value="HI">Hawaii</SelectItem>
                  <SelectItem value="ID">Idaho</SelectItem>
                  <SelectItem value="IL">Illinois</SelectItem>
                  <SelectItem value="IN">Indiana</SelectItem>
                  <SelectItem value="IA">Iowa</SelectItem>
                  <SelectItem value="KS">Kansas</SelectItem>
                  <SelectItem value="KY">Kentucky</SelectItem>
                  <SelectItem value="LA">Louisiana</SelectItem>
                  <SelectItem value="ME">Maine</SelectItem>
                  <SelectItem value="MD">Maryland</SelectItem>
                  <SelectItem value="MA">Massachusetts</SelectItem>
                  <SelectItem value="MI">Michigan</SelectItem>
                  <SelectItem value="MN">Minnesota</SelectItem>
                  <SelectItem value="MS">Mississippi</SelectItem>
                  <SelectItem value="MO">Missouri</SelectItem>
                  <SelectItem value="MT">Montana</SelectItem>
                  <SelectItem value="NE">Nebraska</SelectItem>
                  <SelectItem value="NV">Nevada</SelectItem>
                  <SelectItem value="NH">New Hampshire</SelectItem>
                  <SelectItem value="NJ">New Jersey</SelectItem>
                  <SelectItem value="NM">New Mexico</SelectItem>
                  <SelectItem value="NY">New York</SelectItem>
                  <SelectItem value="NC">North Carolina</SelectItem>
                  <SelectItem value="ND">North Dakota</SelectItem>
                  <SelectItem value="OH">Ohio</SelectItem>
                  <SelectItem value="OK">Oklahoma</SelectItem>
                  <SelectItem value="OR">Oregon</SelectItem>
                  <SelectItem value="PA">Pennsylvania</SelectItem>
                  <SelectItem value="RI">Rhode Island</SelectItem>
                  <SelectItem value="SC">South Carolina</SelectItem>
                  <SelectItem value="SD">South Dakota</SelectItem>
                  <SelectItem value="TN">Tennessee</SelectItem>
                  <SelectItem value="TX">Texas</SelectItem>
                  <SelectItem value="UT">Utah</SelectItem>
                  <SelectItem value="VT">Vermont</SelectItem>
                  <SelectItem value="VA">Virginia</SelectItem>
                  <SelectItem value="WA">Washington</SelectItem>
                  <SelectItem value="WV">West Virginia</SelectItem>
                  <SelectItem value="WI">Wisconsin</SelectItem>
                  <SelectItem value="WY">Wyoming</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-none mt-4 pt-4 border-t">
            <Button type="submit">Add Child</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

