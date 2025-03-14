"use client"

import { useState } from "react"
import { Edit, Plus, Trash2 } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AddKidDialog } from "./add-kid-dialog"
import { Badge } from "@/components/ui/badge"

// Sample data for kids
const initialKids = [
  {
    id: 1,
    name: "Emma",
    age: 8,
    subjects: ["Math", "Science", "Reading"],
    progress: 75,
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Noah",
    age: 10,
    subjects: ["History", "Art", "Language"],
    progress: 60,
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Olivia",
    age: 6,
    subjects: ["Reading", "Writing", "Math"],
    progress: 40,
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
]

export function KidsPanel() {
  const [kids, setKids] = useState(initialKids)
  const [selectedKid, setSelectedKid] = useState(initialKids[0])

  const handleAddKid = (newKid: any) => {
    const newKidObj = {
      id: kids.length + 1,
      ...newKid,
      progress: 0,
      avatarUrl: "/placeholder.svg?height=40&width=40",
    }
    setKids([...kids, newKidObj])
  }

  const handleDeleteKid = (id: number) => {
    setKids(kids.filter((kid) => kid.id !== id))
    if (selectedKid.id === id) {
      setSelectedKid(kids.filter((kid) => kid.id !== id)[0] || null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Your Kids</h2>
        <AddKidDialog onAddKid={handleAddKid} />
      </div>

      <div className="space-y-4">
        {kids.map((kid) => (
          <KidCard
            key={kid.id}
            kid={kid}
            isSelected={selectedKid?.id === kid.id}
            onSelect={() => setSelectedKid(kid)}
            onDelete={() => handleDeleteKid(kid.id)}
          />
        ))}

        <Button
          variant="outline"
          className="flex h-24 w-full items-center justify-center border-dashed"
          onClick={() => document.getElementById("add-kid-trigger")?.click()}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Child
        </Button>
      </div>
    </div>
  )
}

interface KidCardProps {
  kid: any
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}

function KidCard({ kid, isSelected, onSelect, onDelete }: KidCardProps) {
  return (
    <Card
      className={`group transition-all hover:shadow-md ${
        isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/20"
      }`}
      onClick={onSelect}
    >
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-0">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 border-2 border-background">
            <AvatarImage src={kid.avatarUrl} alt={kid.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">{kid.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{kid.name}</h3>
            <p className="text-sm text-muted-foreground">{kid.age} years old</p>
          </div>
        </div>
        <div className="flex space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {kid.name}'s profile and all associated data. This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-3">
        <div className="flex flex-wrap gap-1 pb-2">
          {kid.subjects.map((subject: string) => (
            <Badge key={subject} variant="outline" className="bg-background">
              {subject}
            </Badge>
          ))}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Weekly Progress</span>
            <span className="font-medium">{kid.progress}%</span>
          </div>
          <Progress
            value={kid.progress}
            className={`h-2 [&>[role=progressbar]]:${kid.progress < 30 ? "bg-red-500" : kid.progress < 70 ? "bg-yellow-500" : "bg-green-500"}`}
          />
        </div>
      </CardContent>
    </Card>
  )
}

