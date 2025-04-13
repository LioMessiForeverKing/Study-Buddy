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
  const [isLoading, setIsLoading] = useState(true)
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
    loadChapters()
    setupRealtimeSubscription()
  }, [classId])

  const setupRealtimeSubscription = () => {
    const supabase = createClient()
    
    const channel = supabase
      .channel('chapters_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'chapters',
          filter: `class_id=eq.${classId}`
        }, 
        () => {
          loadChapters()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const loadChapters = async () => {
    try {
      setIsLoading(true)
      const data = await chaptersService.getChapters(classId)
      setChapters(data)
      setError(null)
    } catch (err) {
      console.error('Error loading chapters:', err)
      setError('Failed to load chapters')
    } finally {
      setIsLoading(false)
    }
  }

  const addChapter = async () => {
    if (newChapterTitle.trim() === '') return
    
    try {
      const newChapter = await chaptersService.addChapter({
        class_id: classId,
        title: newChapterTitle.trim(),
        subtitle: newChapterSubtitle.trim(),
        order_index: chapters.length
      })
      
      setNewChapterTitle('')
      setNewChapterSubtitle('')
      setIsAddingChapter(false)
    } catch (err) {
      console.error('Error adding chapter:', err)
      setError('Failed to add chapter')
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
    } catch (err) {
      console.error('Error deleting chapter:', err)
      setError('Failed to delete chapter')
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading chapters...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
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
      </div>
    </div>
  )
}
