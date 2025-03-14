"use client"

import { useState } from "react"
import { ChevronDown, Clock, Edit, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddLessonDialog } from "./add-lesson-dialog"

// Sample data for weekly schedule
const weeklySchedule = [
  {
    day: "Monday",
    date: "March 15",
    completed: "3/5",
    lessons: [
      {
        id: 1,
        subject: "Math",
        title: "Addition and Subtraction",
        resource: "https://www.khanacademy.org/math/arithmetic",
        duration: "45 min",
        completed: true,
      },
      {
        id: 2,
        subject: "Science",
        title: "Plant Life Cycles",
        resource: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "30 min",
        completed: true,
      },
      {
        id: 3,
        subject: "Reading",
        title: "Charlotte's Web - Chapter 3",
        resource: "/resources/charlottes-web.pdf",
        duration: "40 min",
        completed: true,
      },
      {
        id: 4,
        subject: "History",
        title: "Ancient Egypt",
        resource: "https://www.natgeokids.com/uk/discover/history/egypt/ten-facts-about-ancient-egypt/",
        duration: "35 min",
        completed: false,
      },
      {
        id: 5,
        subject: "Art",
        title: "Watercolor Painting",
        resource: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "50 min",
        completed: false,
      },
    ],
  },
  {
    day: "Tuesday",
    date: "March 16",
    completed: "2/4",
    lessons: [
      {
        id: 6,
        subject: "Math",
        title: "Multiplication Tables",
        resource: "https://www.multiplication.com/",
        duration: "40 min",
        completed: true,
      },
      {
        id: 7,
        subject: "Language",
        title: "Grammar Basics",
        resource: "https://www.grammarly.com/",
        duration: "35 min",
        completed: true,
      },
      {
        id: 8,
        subject: "Science",
        title: "States of Matter",
        resource: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "45 min",
        completed: false,
      },
      {
        id: 9,
        subject: "Physical Education",
        title: "Yoga for Kids",
        resource: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "30 min",
        completed: false,
      },
    ],
  },
  {
    day: "Wednesday",
    date: "March 17",
    completed: "0/3",
    lessons: [
      {
        id: 10,
        subject: "Reading",
        title: "Charlotte's Web - Chapter 4",
        resource: "/resources/charlottes-web.pdf",
        duration: "40 min",
        completed: false,
      },
      {
        id: 11,
        subject: "Math",
        title: "Fractions Introduction",
        resource: "https://www.khanacademy.org/math/arithmetic/fraction-arithmetic",
        duration: "45 min",
        completed: false,
      },
      {
        id: 12,
        subject: "Art",
        title: "Drawing Animals",
        resource: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "50 min",
        completed: false,
      },
    ],
  },
  {
    day: "Thursday",
    date: "March 18",
    completed: "0/4",
    lessons: [
      {
        id: 13,
        subject: "Science",
        title: "Simple Machines",
        resource: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "45 min",
        completed: false,
      },
      {
        id: 14,
        subject: "History",
        title: "Native Americans",
        resource: "https://www.natgeokids.com/uk/discover/history/general-history/native-americans/",
        duration: "40 min",
        completed: false,
      },
      {
        id: 15,
        subject: "Math",
        title: "Geometry Basics",
        resource: "https://www.khanacademy.org/math/basic-geo",
        duration: "45 min",
        completed: false,
      },
      {
        id: 16,
        subject: "Music",
        title: "Introduction to Rhythm",
        resource: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "30 min",
        completed: false,
      },
    ],
  },
  {
    day: "Friday",
    date: "March 19",
    completed: "0/3",
    lessons: [
      {
        id: 17,
        subject: "Reading",
        title: "Charlotte's Web - Chapter 5",
        resource: "/resources/charlottes-web.pdf",
        duration: "40 min",
        completed: false,
      },
      {
        id: 18,
        subject: "Math",
        title: "Word Problems",
        resource: "https://www.khanacademy.org/math/arithmetic/arith-review-add-subtract",
        duration: "45 min",
        completed: false,
      },
      {
        id: 19,
        subject: "Science",
        title: "Weather Patterns",
        resource: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "40 min",
        completed: false,
      },
    ],
  },
]

interface Lesson {
  id: number
  subject: string
  title: string
  resource: string
  duration: string
  completed: boolean
}

interface DaySchedule {
  day: string
  date: string
  completed: string
  lessons: Lesson[]
}

export function WeeklySchedule() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(weeklySchedule)
  const [openDays, setOpenDays] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState("thisWeek")

  const toggleDay = (day: string) => {
    setOpenDays((prev) => ({ ...prev, [day]: !prev[day] }))
  }

  const toggleLessonCompletion = (dayIndex: number, lessonId: number) => {
    setSchedule((prevSchedule) => {
      const newSchedule = [...prevSchedule]
      const day = newSchedule[dayIndex]
      const lessonIndex = day.lessons.findIndex((lesson) => lesson.id === lessonId)
      
      if (lessonIndex !== -1) {
        day.lessons[lessonIndex].completed = !day.lessons[lessonIndex].completed
        
        // Update completed count
        const completedCount = day.lessons.filter((lesson) => lesson.completed).length
        day.completed = `${completedCount}/${day.lessons.length}`
      }
      
      return newSchedule
    })
  }

  const handleAddLesson = (dayIndex: number, newLesson: Omit<Lesson, 'id' | 'completed'>) => {
    setSchedule((prevSchedule) => {
      const newSchedule = [...prevSchedule]
      const day = newSchedule[dayIndex]
      
      // Generate a new unique ID
      const maxId = Math.max(...day.lessons.map((lesson) => lesson.id), 0)
      const newLessonWithId: Lesson = {
        ...newLesson,
        id: maxId + 1,
        completed: false
      }
      
      day.lessons.push(newLessonWithId)
      day.completed = `${day.lessons.filter((lesson) => lesson.completed).length}/${day.lessons.length}`
      
      return newSchedule
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Schedule</CardTitle>
        <CardDescription>Manage your weekly learning schedule</CardDescription>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="thisWeek">This Week</TabsTrigger>
            <TabsTrigger value="nextWeek">Next Week</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="grid gap-6">
        {schedule.map((day, dayIndex) => (
          <Collapsible key={day.day} open={openDays[day.day]} onOpenChange={() => toggleDay(day.day)}>
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-sm font-medium leading-none">{day.day}</p>
                  <p className="text-sm text-muted-foreground">{day.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{day.completed} Completed</Badge>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <ChevronDown className="h-4 w-4" />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
            <CollapsibleContent className="mt-4 space-y-4">
              {day.lessons.map((lesson) => (
                <div key={lesson.id} className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-sm font-medium leading-none">{lesson.title}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{lesson.subject}</Badge>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{lesson.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLessonCompletion(dayIndex, lesson.id)}
                    >
                      {lesson.completed ? "Mark Incomplete" : "Mark Complete"}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {lesson.resource && (
                          <DropdownMenuItem asChild>
                            <a href={lesson.resource} target="_blank" rel="noopener noreferrer">
                              View Resource
                            </a>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              <AddLessonDialog onAddLesson={(newLesson) => handleAddLesson(dayIndex, newLesson)} day={day.day} />
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">Last updated: Today at 9:00 AM</p>
      </CardFooter>
    </Card>
  )
}

