'use client'

import { useState, useEffect } from 'react'
import { DrawingBoard } from './DrawingBoard'
import { PlusCircle, Edit2, Trash2, Check, X } from 'lucide-react'

interface Chapter {
  id: string
  title: string
  subtitle: string
}

interface ChapterManagerProps {
  classId: string
}

export function ChapterManager({ classId }: ChapterManagerProps) {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [isAddingChapter, setIsAddingChapter] = useState(false)
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null)
  const [newChapterTitle, setNewChapterTitle] = useState('')
  const [newChapterSubtitle, setNewChapterSubtitle] = useState('')

  // Generate a unique ID for new chapters
  const generateId = () => {
    return Date.now().toString()
  }

  // Load chapters from local storage on component mount
  useEffect(() => {
    const savedChapters = localStorage.getItem(`chapters-${classId}`)
    if (savedChapters) {
      setChapters(JSON.parse(savedChapters))
    } else {
      // Initialize with a default chapter if none exist
      const defaultChapter = { id: '1', title: 'Chapter 1', subtitle: 'Introduction' }
      setChapters([defaultChapter])
      localStorage.setItem(`chapters-${classId}`, JSON.stringify([defaultChapter]))
    }
  }, [classId])

  // Save chapters to local storage whenever they change
  useEffect(() => {
    if (chapters.length > 0) {
      localStorage.setItem(`chapters-${classId}`, JSON.stringify(chapters))
    }
  }, [chapters, classId])

  // Add a new chapter
  const addChapter = () => {
    if (newChapterTitle.trim() === '') return
    
    const newChapter: Chapter = {
      id: generateId(),
      title: newChapterTitle,
      subtitle: newChapterSubtitle
    }
    
    setChapters([...chapters, newChapter])
    setNewChapterTitle('')
    setNewChapterSubtitle('')
    setIsAddingChapter(false)
  }

  // Start editing a chapter
  const startEditingChapter = (chapter: Chapter) => {
    setEditingChapterId(chapter.id)
    setNewChapterTitle(chapter.title)
    setNewChapterSubtitle(chapter.subtitle)
  }

  // Save chapter edits
  const saveChapterEdit = (id: string) => {
    setChapters(chapters.map(chapter => 
      chapter.id === id 
        ? { ...chapter, title: newChapterTitle, subtitle: newChapterSubtitle } 
        : chapter
    ))
    setEditingChapterId(null)
    setNewChapterTitle('')
    setNewChapterSubtitle('')
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingChapterId(null)
    setNewChapterTitle('')
    setNewChapterSubtitle('')
  }

  // Delete a chapter
  const deleteChapter = (id: string) => {
    setChapters(chapters.filter(chapter => chapter.id !== id))
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 
          className="text-4xl font-bold" 
          style={{
            background: 'linear-gradient(to right, #4285F4, #34A853, #FBBC05, #EA4335)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          My Chapters
        </h1>
        
        {!isAddingChapter ? (
          <button
            onClick={() => setIsAddingChapter(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#4285F4] to-[#34A853] text-white rounded-lg hover:from-[#FBBC05] hover:to-[#EA4335] transition-all"
          >
            <PlusCircle size={18} />
            Add Chapter
          </button>
        ) : (
          <div className="flex items-end gap-2">
            <div className="space-y-1">
              <label htmlFor="chapterTitle" className="block text-sm font-medium text-gray-700">
                Chapter Title
              </label>
              <input
                type="text"
                id="chapterTitle"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                placeholder="Enter chapter title"
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="chapterSubtitle" className="block text-sm font-medium text-gray-700">
                Subtitle
              </label>
              <input
                type="text"
                id="chapterSubtitle"
                value={newChapterSubtitle}
                onChange={(e) => setNewChapterSubtitle(e.target.value)}
                placeholder="Enter subtitle"
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={addChapter}
              disabled={!newChapterTitle.trim()}
              className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check size={18} />
            </button>
            <button
              onClick={() => setIsAddingChapter(false)}
              className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {chapters.map((chapter) => (
          <div key={chapter.id} className="space-y-2">
            {editingChapterId === chapter.id ? (
              <div className="flex items-center gap-2 mb-4">
                <div className="space-y-1">
                  <label htmlFor={`editTitle-${chapter.id}`} className="block text-sm font-medium text-gray-700">
                    Chapter Title
                  </label>
                  <input
                    type="text"
                    id={`editTitle-${chapter.id}`}
                    value={newChapterTitle}
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor={`editSubtitle-${chapter.id}`} className="block text-sm font-medium text-gray-700">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    id={`editSubtitle-${chapter.id}`}
                    value={newChapterSubtitle}
                    onChange={(e) => setNewChapterSubtitle(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <button
                    onClick={() => saveChapterEdit(chapter.id)}
                    disabled={!newChapterTitle.trim()}
                    className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-2xl font-bold">{chapter.title}</h2>
                  <p className="text-gray-600">{chapter.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEditingChapter(chapter)}
                    className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => deleteChapter(chapter.id)}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-4">
              <DrawingBoard key={chapter.id} title={chapter.title} subtitle={chapter.subtitle} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}