'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Flame, Trophy, Target, Sparkles, BarChart2, PieChart, Activity, Brain, X, Calendar, Clock, Award, BookOpen, Zap, Lightbulb, TrendingUp, BarChart4 } from 'lucide-react'
import gsap from 'gsap'
import { getUserSettings } from '@/utils/supabase/user-settings'
import { getPersonalization } from '@/utils/supabase/database'

// Add these imports for charts
import { Bar, Pie, Line, Radar, Chart } from 'react-chartjs-2'
import { Chart as ChartJS, registerables } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

// Register ChartJS components
if (typeof window !== 'undefined') {
  ChartJS.register(...registerables, ChartDataLabels)
}

interface YubiStats {
  name: string
  streak: number
  lastStudied: string
  totalHours: number
  level: number
  mood: 'happy' | 'proud' | 'encouraging' | 'sleepy'
  goals: {
    daily: number
    weekly: number
  }
  personalization?: {
    learningStyle: string
    interests: string[]
    communicationStyle: string
    motivationType: string
    customPrompts: {
      question: string
      response: string
    }[]
  }
  userSettings?: {
    display_name: string
    age_group: string
    education_level: string
    study_goals: string[]
  }
}

export default function YubiCompanion() {
  const [stats, setStats] = useState<YubiStats>(() => ({
    name: '',
    streak: 12,  // Changed from 0 to 12
    lastStudied: new Date().toISOString(),
    totalHours: 42,  // Changed from 0 to 42
    level: 5,  // Changed from 1 to 5
    mood: 'happy',
    goals: {
      daily: 2,
      weekly: 10
    }
  }))

  const [isFirstTime, setIsFirstTime] = useState(true)
  const [showSetup, setShowSetup] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  
  // Mock data for learning analytics
  const learningStyleData = {
    labels: ['Visual', 'Auditory', 'Reading/Writing', 'Kinesthetic'],
    datasets: [{
      label: 'Learning Style Analysis',
      data: [65, 40, 85, 30],
      backgroundColor: ['#4285F4', '#34A853', '#FBBC05', '#EA4335'],
      borderWidth: 0,
    }]
  }
  
  const weeklyProgressData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Study Hours',
      data: [2.5, 3, 1.5, 4, 2, 3.5, 2],
      borderColor: '#4285F4',
      backgroundColor: 'rgba(66, 133, 244, 0.2)',
      tension: 0.4,
      fill: true
    }]
  }
  
  const topicMasteryData = {
    labels: ['Algebra', 'Calculus', 'Statistics', 'Geometry', 'Trigonometry', 'Logic'],
    datasets: [{
      label: 'Mastery Level',
      data: [80, 65, 90, 75, 60, 85],
      backgroundColor: 'rgba(52, 168, 83, 0.2)',
      borderColor: '#34A853',
      pointBackgroundColor: '#34A853',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#34A853'
    }]
  }

  // Add these additional mock datasets
  const studyTimeDistributionData = {
    labels: ['Morning', 'Afternoon', 'Evening', 'Night'],
    datasets: [{
      label: 'Study Time Distribution',
      data: [15, 30, 40, 15],
      backgroundColor: ['#34A853', '#4285F4', '#FBBC05', '#EA4335'],
      borderWidth: 0,
    }]
  }

  const focusMetricsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Focus Score',
      data: [75, 82, 68, 90, 85, 78, 88],
      borderColor: '#34A853',
      backgroundColor: 'rgba(52, 168, 83, 0.1)',
      borderWidth: 2,
      tension: 0.3,
      fill: true
    }]
  }

  const conceptRetentionData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'New Concepts',
      data: [20, 25, 18, 30],
      backgroundColor: '#4285F4',
      borderColor: '#4285F4',
      borderWidth: 1
    }, {
      label: 'Retained Concepts',
      data: [18, 21, 15, 27],
      backgroundColor: '#34A853',
      borderColor: '#34A853',
      borderWidth: 1
    }]
  }

  const learningGoalsData = {
    labels: ['Complete Calculus', 'Master Statistics', 'Learn Python', 'Finish Project'],
    datasets: [{
      label: 'Progress',
      data: [75, 60, 85, 40],
      backgroundColor: [
        'rgba(66, 133, 244, 0.7)',
        'rgba(52, 168, 83, 0.7)',
        'rgba(251, 188, 5, 0.7)',
        'rgba(234, 67, 53, 0.7)'
      ],
      borderColor: [
        'rgb(66, 133, 244)',
        'rgb(52, 168, 83)',
        'rgb(251, 188, 5)',
        'rgb(234, 67, 53)'
      ],
      borderWidth: 1
    }]
  }

  const skillProgressionData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Problem Solving',
      data: [30, 45, 58, 65, 78, 90],
      borderColor: '#4285F4',
      backgroundColor: 'rgba(66, 133, 244, 0.1)',
      borderWidth: 2,
      tension: 0.3,
      fill: true
    }, {
      label: 'Critical Thinking',
      data: [25, 40, 52, 60, 75, 85],
      borderColor: '#34A853',
      backgroundColor: 'rgba(52, 168, 83, 0.1)',
      borderWidth: 2,
      tension: 0.3,
      fill: true
    }]
  }

  const studyEfficiencyData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [{
      label: 'Study Time (hours)',
      data: [15, 18, 14, 20, 16, 22],
      backgroundColor: 'rgba(66, 133, 244, 0.5)',
      borderColor: '#4285F4',
      borderWidth: 1,
      yAxisID: 'y'
    }, {
      label: 'Concepts Mastered',
      data: [5, 8, 7, 12, 10, 15],
      backgroundColor: 'rgba(251, 188, 5, 0.5)',
      borderColor: '#FBBC05',
      borderWidth: 1,
      type: 'line',
      yAxisID: 'y1'
    }]
  }

  const learningNetworkData = {
    labels: ['Core Concepts', 'Related Topics', 'Applications', 'Advanced Theory', 'Practical Skills', 'Interdisciplinary'],
    datasets: [{
      label: 'Knowledge Network',
      data: [85, 65, 75, 55, 70, 60],
      backgroundColor: 'rgba(234, 67, 53, 0.2)',
      borderColor: '#EA4335',
      pointBackgroundColor: '#EA4335',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#EA4335'
    }]
  }

  const studyHabitData = {
    labels: ['Consistent Schedule', 'Active Recall', 'Spaced Repetition', 'Deep Work', 'Group Study', 'Teaching Others'],
    datasets: [{
      label: 'Frequency',
      data: [80, 65, 90, 75, 40, 55],
      backgroundColor: [
        'rgba(66, 133, 244, 0.7)',
        'rgba(52, 168, 83, 0.7)',
        'rgba(251, 188, 5, 0.7)',
        'rgba(234, 67, 53, 0.7)',
        'rgba(103, 58, 183, 0.7)',
        'rgba(0, 188, 212, 0.7)'
      ],
      borderWidth: 1
    }]
  }

  useEffect(() => {
    const hasVisited = localStorage.getItem('yubiInitialized')
    if (!hasVisited) {
      setShowSetup(true)
      localStorage.setItem('yubiInitialized', 'true')
    }
  }, [])

  useEffect(() => {
    // Animate Yubi's presence
    gsap.to('.yubi-companion', {
      y: 10,
      rotation: 3,
      duration: 2,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1
    })

    // Animate fire streak
    gsap.to('.streak-fire', {
      scale: 1.1,
      duration: 0.5,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1
    })
  }, [])

  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const settings = await getUserSettings()
        if (settings) {
          setStats(prev => ({
            ...prev,
            name: settings.display_name,
            userSettings: settings
          }))
        }
      } catch (error) {
        console.error('Error loading user settings:', error)
      }
    }
    
    loadUserSettings()
  }, [])

  useEffect(() => {
    const loadPersonalization = async () => {
      try {
        const personalizationData = await getPersonalization()
        if (personalizationData) {
          setStats(prev => ({
            ...prev,
            personalization: {
              learningStyle: personalizationData.learning_style,
              interests: personalizationData.interests,
              communicationStyle: personalizationData.communication_style,
              motivationType: personalizationData.motivation_type,
              customPrompts: personalizationData.custom_prompts
            }
          }))
        }
      } catch (error) {
        console.error('Error loading personalization:', error)
      }
    }

    loadPersonalization()
  }, [])

  const completeSetup = (name: string) => {
    setStats(prev => ({
      ...prev,
      name
    }))
    setShowSetup(false)
    localStorage.setItem('yubiStats', JSON.stringify({
      ...stats,
      name
    }))
  }

  const getYubiMood = () => {
    const hour = new Date().getHours()
    if (hour < 6) return 'sleepy'
    if (stats.streak > 5) return 'proud'
    if (stats.streak > 0) return 'happy'
    return 'encouraging'
  }

  const getYubiResponse = (message: string) => {
    const personalization = stats?.personalization
    const userSettings = stats?.userSettings
    
    // Include user's name and education level in the response context
    const userName = userSettings?.display_name || stats.name
    const educationLevel = userSettings?.education_level
    const studyGoals = userSettings?.study_goals || []
    
    console.log('Generating response with user context:', {
      name: userName,
      educationLevel,
      studyGoals
    })

    // Check for custom prompts first
    const customPrompt = personalization?.customPrompts.find(
      p => message.toLowerCase().includes(p.question.toLowerCase())
    )
    if (customPrompt) {
      console.log('Found matching custom prompt:', customPrompt);
      return customPrompt.response;
    }

    // Otherwise generate contextual response based on personalization
    const style = personalization?.communicationStyle || 'Encouraging & Supportive'
    const interests = personalization?.interests || []
    
    console.log('Using communication style:', style);
    console.log('Available interests:', interests);
    
    // Add personality to responses based on communication style
    switch (style) {
      case 'Encouraging & Supportive':
        return `You're doing great! Let's keep learning about ${interests[0] || 'this topic'}! 💪`
      case 'Direct & Concise':
        return `Focus on the key concepts. Ready to continue?`
      case 'Humorous & Playful':
        return `Hey there! Did you hear about the math book that was sad? It had too many problems! 😄`
      case 'Socratic & Questioning':
        return `What aspects of ${interests[0] || 'this topic'} interest you the most? Let's explore deeper!`
      default:
        return `Let's keep learning together!`
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {showSetup ? (
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 w-80">
          <h3 className="text-xl font-bold mb-4 gradient-text">Welcome to StudyBuddy!</h3>
          <p className="text-gray-600 mb-4">Let's personalize your experience with Yubi!</p>
          <input
            type="text"
            placeholder="What should Yubi call you?"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 mb-4"
            onChange={(e) => completeSetup(e.target.value)}
          />
        </div>
      ) : showAnalytics ? (
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 w-[700px] max-h-[85vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold gradient-text">Learning Analytics Dashboard</h3>
            <button 
              onClick={() => setShowAnalytics(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-blue-50 p-3 rounded-xl flex flex-col items-center">
              <Calendar className="text-blue-500 mb-1" size={20} />
              <p className="text-xs text-gray-600">Study Streak</p>
              <p className="font-bold text-lg">{stats.streak} days</p>
            </div>
            <div className="bg-green-50 p-3 rounded-xl flex flex-col items-center">
              <Clock className="text-green-500 mb-1" size={20} />
              <p className="text-xs text-gray-600">Total Hours</p>
              <p className="font-bold text-lg">{stats.totalHours}h</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-xl flex flex-col items-center">
              <Award className="text-yellow-500 mb-1" size={20} />
              <p className="text-xs text-gray-600">Level</p>
              <p className="font-bold text-lg">{stats.level}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-xl flex flex-col items-center">
              <Zap className="text-purple-500 mb-1" size={20} />
              <p className="text-xs text-gray-600">Focus Score</p>
              <p className="font-bold text-lg">92%</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Learning Style Analysis */}
            <div className="bg-white/80 rounded-xl p-4 shadow-md">
              <div className="flex items-center mb-2">
                <Brain className="text-blue-500 mr-2" size={20} />
                <h4 className="text-lg font-semibold text-gray-800">Your Learning Style</h4>
              </div>
              <div className="h-64">
                <Pie 
                  data={learningStyleData} 
                  options={{
                    plugins: {
                      datalabels: {
                        formatter: (value, ctx) => {
                          return `${value}%`;
                        },
                        color: '#fff',
                        font: {
                          weight: 'bold'
                        }
                      },
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                You're primarily a <span className="font-bold text-blue-600">Reading/Writing</span> learner, 
                with strong <span className="font-bold text-blue-600">Visual</span> tendencies.
              </p>
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <Lightbulb className="inline text-blue-500 mr-1" size={16} /> 
                  <span className="font-semibold">Recommendation:</span> Try using written summaries and visual diagrams to maximize your learning efficiency.
                </p>
              </div>
            </div>
            
            {/* Weekly Progress */}
            <div className="bg-white/80 rounded-xl p-4 shadow-md">
              <div className="flex items-center mb-2">
                <TrendingUp className="text-green-500 mr-2" size={20} />
                <h4 className="text-lg font-semibold text-gray-800">Weekly Study Progress</h4>
              </div>
              <div className="h-64">
                <Line 
                  data={weeklyProgressData}
                  options={{
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Hours'
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-600">Weekly total: <span className="font-bold">18.5 hrs</span></p>
                <p className="text-sm text-green-600 font-semibold">+12% from last week</p>
              </div>
            </div>
            
            {/* Topic Mastery */}
            <div className="bg-white/80 rounded-xl p-4 shadow-md">
              <div className="flex items-center mb-2">
                <BookOpen className="text-purple-500 mr-2" size={20} />
                <h4 className="text-lg font-semibold text-gray-800">Subject Mastery</h4>
              </div>
              <div className="h-64">
                <Radar 
                  data={topicMasteryData}
                  options={{
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          stepSize: 20
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Strongest in <span className="font-bold text-green-600">Statistics</span> and 
                <span className="font-bold text-green-600"> Logic</span>. Consider focusing more on 
                <span className="font-bold text-orange-500"> Trigonometry</span>.
              </p>
            </div>
            
            {/* Study Time Distribution */}
            <div className="bg-white/80 rounded-xl p-4 shadow-md">
              <div className="flex items-center mb-2">
                <Clock className="text-yellow-500 mr-2" size={20} />
                <h4 className="text-lg font-semibold text-gray-800">Study Time Distribution</h4>
              </div>
              <div className="h-64">
                <Pie 
                  data={studyTimeDistributionData} 
                  options={{
                    plugins: {
                      datalabels: {
                        formatter: (value, ctx) => {
                          return `${value}%`;
                        },
                        color: '#fff',
                        font: {
                          weight: 'bold'
                        }
                      },
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </div>
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <Lightbulb className="inline text-yellow-500 mr-1" size={16} /> 
                  <span className="font-semibold">Insight:</span> You're most productive in the evening. Consider scheduling complex topics during this time.
                </p>
              </div>
            </div>
            
            {/* Focus Metrics */}
            <div className="bg-white/80 rounded-xl p-4 shadow-md">
              <div className="flex items-center mb-2">
                <Target className="text-green-500 mr-2" size={20} />
                <h4 className="text-lg font-semibold text-gray-800">Focus Metrics</h4>
              </div>
              <div className="h-64">
                <Line 
                  data={focusMetricsData}
                  options={{
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                          display: true,
                          text: 'Focus Score'
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
              <div className="mt-3 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <Lightbulb className="inline text-green-500 mr-1" size={16} /> 
                  <span className="font-semibold">Achievement:</span> Your focus score peaked on Thursday at 90%. What techniques worked well that day?
                </p>
              </div>
            </div>
            
            {/* Concept Retention */}
            <div className="bg-white/80 rounded-xl p-4 shadow-md">
              <div className="flex items-center mb-2">
                <BarChart4 className="text-blue-500 mr-2" size={20} />
                <h4 className="text-lg font-semibold text-gray-800">Concept Retention</h4>
              </div>
              <div className="h-64">
                <Bar 
                  data={conceptRetentionData}
                  options={{
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Number of Concepts'
                        }
                      }
                    }
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Your concept retention rate is <span className="font-bold text-green-600">90%</span>, which is excellent! 
                Continue using spaced repetition to maintain this high retention rate.
              </p>
            </div>
            
            {/* Learning Goals Progress */}
            <div className="bg-white/80 rounded-xl p-4 shadow-md">
              <div className="flex items-center mb-2">
                <Target className="text-red-500 mr-2" size={20} />
                <h4 className="text-lg font-semibold text-gray-800">Learning Goals Progress</h4>
              </div>
              <div className="h-64">
                <Bar 
                  data={learningGoalsData}
                  options={{
                    indexAxis: 'y',
                    scales: {
                      x: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                          display: true,
                          text: 'Completion %'
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      },
                      datalabels: {
                        formatter: (value) => {
                          return `${value}%`;
                        },
                        color: '#fff',
                        anchor: 'end',
                        align: 'start',
                        font: {
                          weight: 'bold'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
            
            {/* AI Recommendations */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 shadow-md border border-blue-100">
              <div className="flex items-center mb-3">
                <Sparkles className="text-purple-500 mr-2" size={20} />
                <h4 className="text-lg font-semibold text-gray-800">AI Learning Recommendations</h4>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 p-2 bg-white/80 rounded-lg">
                  <Lightbulb className="text-yellow-500 mt-0.5 flex-shrink-0" size={18} />
                  <div>
                    <p className="font-medium text-sm">Try the Pomodoro Technique</p>
                    <p className="text-xs text-gray-600">Based on your focus patterns, 25-minute focused sessions with 5-minute breaks may improve your productivity.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 p-2 bg-white/80 rounded-lg">
                  <Lightbulb className="text-green-500 mt-0.5 flex-shrink-0" size={18} />
                  <div>
                    <p className="font-medium text-sm">Review Trigonometry Concepts</p>
                    <p className="text-xs text-gray-600">Your mastery in this area is lower. Consider dedicating 30 minutes daily to strengthen these skills.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 p-2 bg-white/80 rounded-lg">
                  <Lightbulb className="text-blue-500 mt-0.5 flex-shrink-0" size={18} />
                  <div>
                    <p className="font-medium text-sm">Create Visual Summaries</p>
                    <p className="text-xs text-gray-600">Given your learning style, try creating mind maps or diagrams to summarize complex topics.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Skill Progression */}
            <div className="bg-white/80 rounded-xl p-4 shadow-md">
              <div className="flex items-center mb-2">
                <TrendingUp className="text-blue-500 mr-2" size={20} />
                <h4 className="text-lg font-semibold text-gray-800">Skill Progression</h4>
              </div>
              <div className="h-64">
                <Line 
                  data={skillProgressionData}
                  options={{
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                          display: true,
                          text: 'Proficiency Level'
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <Lightbulb className="inline text-blue-500 mr-1" size={16} /> 
                  <span className="font-semibold">Growth Insight:</span> Your problem-solving skills have improved by 60% over the last 6 months!
                </p>
              </div>
            </div>

            {/* Study Efficiency */}
            <div className="bg-white/80 rounded-xl p-4 shadow-md">
              <div className="flex items-center mb-2">
                <Activity className="text-green-500 mr-2" size={20} />
                <h4 className="text-lg font-semibold text-gray-800">Study Efficiency</h4>
              </div>
              <div className="h-64">
                <Chart 
                  type="bar"
                  data={{
                    labels: studyEfficiencyData.labels,
                    datasets: [
                      {
                        label: studyEfficiencyData.datasets[0].label,
                        data: studyEfficiencyData.datasets[0].data,
                        backgroundColor: studyEfficiencyData.datasets[0].backgroundColor,
                        borderColor: studyEfficiencyData.datasets[0].borderColor,
                        borderWidth: studyEfficiencyData.datasets[0].borderWidth,
                        yAxisID: studyEfficiencyData.datasets[0].yAxisID
                      },
                      {
                        label: studyEfficiencyData.datasets[1].label,
                        data: studyEfficiencyData.datasets[1].data,
                        backgroundColor: studyEfficiencyData.datasets[1].backgroundColor,
                        borderColor: studyEfficiencyData.datasets[1].borderColor,
                        borderWidth: studyEfficiencyData.datasets[1].borderWidth,
                        yAxisID: studyEfficiencyData.datasets[1].yAxisID
                      }
                    ]
                  }}
                  options={{
                    scales: {
                      y: {
                        beginAtZero: true,
                        position: 'left',
                        title: {
                          display: true,
                          text: 'Study Hours'
                        }
                      },
                      y1: {
                        beginAtZero: true,
                        position: 'right',
                        grid: {
                          drawOnChartArea: false
                        },
                        title: {
                          display: true,
                          text: 'Concepts Mastered'
                        }
                      }
                    }
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Your efficiency ratio is <span className="font-bold text-green-600">0.68 concepts/hour</span>, which is 
                <span className="font-bold text-green-600"> 15% higher</span> than the average student.
              </p>
            </div>

            {/* Knowledge Network */}
            <div className="bg-white/80 rounded-xl p-4 shadow-md">
              <div className="flex items-center mb-2">
                <Brain className="text-purple-500 mr-2" size={20} />
                <h4 className="text-lg font-semibold text-gray-800">Knowledge Network</h4>
              </div>
              <div className="h-64">
                <Radar 
                  data={learningNetworkData}
                  options={{
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          stepSize: 20
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
              <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <Lightbulb className="inline text-purple-500 mr-1" size={16} /> 
                  <span className="font-semibold">Insight:</span> Your knowledge is well-balanced across core concepts and applications. Consider exploring more interdisciplinary connections.
                </p>
              </div>
            </div>

            {/* Study Habits */}
            <div className="bg-white/80 rounded-xl p-4 shadow-md">
              <div className="flex items-center mb-2">
                <Clock className="text-orange-500 mr-2" size={20} />
                <h4 className="text-lg font-semibold text-gray-800">Study Habit Analysis</h4>
              </div>
              <div className="h-64">
                <Bar 
                  data={studyHabitData}
                  options={{
                    indexAxis: 'y',
                    scales: {
                      x: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                          display: true,
                          text: 'Frequency (%)'
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
              <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <Lightbulb className="inline text-orange-500 mr-1" size={16} /> 
                  <span className="font-semibold">Recommendation:</span> Your use of spaced repetition is excellent! Try incorporating more teaching to others, which can boost retention by up to 90%.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-end space-y-4">
          {/* Stats Card - Enhanced version */}
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/20 w-72">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500 streak-fire" />
                <span className="font-bold text-lg">{stats.streak} day streak!</span>
              </div>
              <button 
                onClick={() => setShowAnalytics(true)}
                className="text-blue-500 hover:text-blue-700 transition-colors"
                title="View Learning Analytics"
              >
                <BarChart2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-yellow-500" />
                  Level {stats.level}
                </span>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${(stats.totalHours % 10) * 10}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4 text-green-500" />
                  Daily Goal
                </span>
                <span>{stats.totalHours % 3}/{stats.goals.daily}hrs</span>
              </div>
            </div>
          </div>

          {/* Yubi Character */}
          <div className="relative group">
            <div className="absolute -top-16 right-0 bg-white/90 backdrop-blur-lg rounded-xl p-3 shadow-lg border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-48">
              <p className="text-sm text-gray-600">
                {stats.name && `Hey ${stats.name}! `}
                {getYubiMood() === 'proud' && "You're doing amazing! Check your analytics to see your progress! 📊"}
                {getYubiMood() === 'happy' && "Want to see how you're learning? Click the chart icon! 📈"}
                {getYubiMood() === 'encouraging' && "Let's analyze your learning style! Click the chart icon above. 📊"}
                {getYubiMood() === 'sleepy' && "Even late at night, your stats look impressive! 📈"}
              </p>
            </div>
            <div className="yubi-companion relative">
              <Image
                src={`/Yubi-${getYubiMood()}.svg`}
                alt="Yubi"
                width={80}
                height={80}
                className="cursor-pointer hover:scale-110 transition-transform duration-300"
                onClick={() => setShowAnalytics(true)}
              />
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
