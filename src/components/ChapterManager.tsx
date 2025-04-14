'use client'

import { useState, useEffect } from 'react'
import { DrawingBoard } from './DrawingBoard'
import { PlusCircle, Edit2, Trash2, Check, X } from 'lucide-react'
import { chaptersService } from '@/utils/supabase/chapters'
import { createClient } from '@/utils/supabase/client'
import type { Chapter } from '@/types/supabase'

interface ChapterManagerProps {
  classId: string
}

export function ChapterManager({ classId }: ChapterManagerProps) {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [isAddingChapter, setIsAddingChapter] = useState(false)
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null)
  const [newChapterTitle, setNewChapterTitle] = useState('')
  const [newChapterSubtitle, setNewChapterSubtitle] = useState('')
  const [isLoading, setIsLoading] = useState(false) // Changed to false initially
  const [error, setError] = useState<string | null>(null)

  const startEditingChapter = (chapter: Chapter) => {
    setEditingChapterId(chapter.id)
    setNewChapterTitle(chapter.title)
    setNewChapterSubtitle(chapter.subtitle || '')
  }

  const cancelEditing = () => {
    setEditingChapterId(null)
    setNewChapterTitle('')
    setNewChapterSubtitle('')
  }

  useEffect(() => {
    console.log('ChapterManager mounted/updated with classId:', classId)
    loadChapters()
    
    const supabase = createClient()
    const channel = supabase
      .channel(`chapters_changes_${classId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'chapters',
          filter: `class_id=eq.${classId}`
        }, 
        async (payload) => {
          console.log('Realtime update received:', payload)
          // Always reload chapters on any change
          await loadChapters()
        }
      )
      .subscribe()

    return () => {
      console.log('Cleaning up subscription')
      supabase.removeChannel(channel)
    }
  }, [classId])

  const loadChapters = async () => {
    try {
      console.log('Loading chapters for classId:', classId)
      const data = await chaptersService.getChapters(classId)
      console.log('Loaded chapters:', data)
      const sortedChapters = (data || []).sort((a, b) => a.order_index - b.order_index)
      setChapters(sortedChapters)
    } catch (err) {
      console.error('Error in loadChapters:', err)
      setChapters([])
    }
  }

  const addChapter = async () => {
    if (!newChapterTitle.trim()) return

    try {
      setIsLoading(true)
      const nextOrderIndex = chapters.length > 0 
        ? Math.max(...chapters.map(ch => ch.order_index)) + 1 
        : 0

      console.log('Adding new chapter with order_index:', nextOrderIndex)
      
      const newChapter = await chaptersService.addChapter({
        class_id: classId,
        title: newChapterTitle.trim(),
        subtitle: newChapterSubtitle.trim(),
        order_index: nextOrderIndex
      })

      console.log('New chapter added:', newChapter)

      // Reload chapters instead of updating state directly
      await loadChapters()
      
      // Reset form
      setNewChapterTitle('')
      setNewChapterSubtitle('')
      setIsAddingChapter(false)
    } catch (error) {
      console.error('Error adding chapter:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveChapterEdit = async (id: string) => {
    try {
      await chaptersService.updateChapter(id, {
        title: newChapterTitle.trim(),
        subtitle: newChapterSubtitle.trim()
      })
      
      setEditingChapterId(null)
      setNewChapterTitle('')
      setNewChapterSubtitle('')
    } catch (err) {
      console.error('Error updating chapter:', err)
      setError('Failed to update chapter')
    }
  }

  const deleteChapter = async (id: string) => {
    try {
      await chaptersService.deleteChapter(id)
      // Immediately update the local state by filtering out the deleted chapter
      setChapters(prevChapters => prevChapters.filter(chapter => chapter.id !== id))
    } catch (err) {
      console.error('Error deleting chapter:', err)
      setError('Failed to delete chapter')
    }
  }

  // Add a debug render to see current state
  console.log('Current chapters state:', chapters)

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
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

      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {chapters.map((chapter) => (
            <div 
              key={chapter.id}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">
                    Chapter {chapter.order_index + 1}: {chapter.title}
                  </h3>
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
            
            {/* DrawingBoard component for each chapter */}
            <div className="border-t border-gray-200 pt-4">
              <DrawingBoard 
                chapterId={chapter.id}
                classId={classId}
                key={chapter.id} 
                title={chapter.title} 
                subtitle={chapter.subtitle || ''} 
              />
            </div>
          </div>
          ))}
          
          {chapters.length === 0 && !isAddingChapter && (
            <div className="text-center py-8 text-gray-500">
              No chapters yet. Click "Add Chapter" to create your first chapter.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
