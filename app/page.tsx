'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { FiCpu } from 'react-icons/fi'

import Sidebar from './sections/Sidebar'
import ProfileGoals from './sections/ProfileGoals'
import type { ProfileData } from './sections/ProfileGoals'
import CareerPlan from './sections/CareerPlan'
import MockInterview from './sections/MockInterview'
import type { InterviewSession } from './sections/MockInterview'
import InterviewHistory from './sections/InterviewHistory'

const CAREER_AGENT_ID = '69a279e699680de146f8c1b1'
const INTERVIEW_AGENT_ID = '69a279e6ad98307a3fb27904'

const STORAGE_KEY = 'careerpath_interview_history'

// --- Error Boundary ---
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button onClick={() => this.setState({ hasError: false, error: '' })} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// --- Parse agent response ---
function parseAgentResponse(result: any) {
  try {
    const data = result?.response?.result
    if (!data) return null
    if (typeof data === 'string') {
      try { return JSON.parse(data) } catch { return null }
    }
    return data
  } catch { return null }
}

// --- Sample Data ---
const SAMPLE_PROFILE: ProfileData = {
  skills: ['Python', 'Machine Learning', 'SQL', 'Data Visualization', 'Statistics'],
  experience: '3 years as a Data Analyst at a fintech startup. Led dashboard creation, built predictive models for churn, and automated ETL pipelines.',
  degree: 'BS Computer Science',
  institution: 'Stanford University',
  graduationYear: '2021',
  industry: 'Tech',
  desiredRole: 'Senior Data Scientist',
  timeline: '12',
}

const SAMPLE_CAREER_PLAN = {
  executive_summary: 'Based on your strong foundation in data analysis and machine learning, transitioning to a Senior Data Scientist role within 12 months is achievable. Focus on deepening your ML engineering skills, gaining experience with production-level deployments, and building a portfolio of impactful projects.',
  overall_timeline_months: 12,
  career_roadmap: [
    {
      milestone_number: 1,
      title: 'Strengthen ML Engineering Foundations',
      description: 'Deepen understanding of advanced ML algorithms, feature engineering, and model evaluation techniques.',
      timeline_months: 'Months 1-3',
      required_skills: ['Advanced ML Algorithms', 'Feature Engineering', 'Model Evaluation', 'Python OOP'],
      action_steps: ['Complete Andrew Ng Deep Learning Specialization', 'Build 2 end-to-end ML projects', 'Contribute to open-source ML libraries'],
    },
    {
      milestone_number: 2,
      title: 'Production ML & MLOps',
      description: 'Learn to deploy, monitor, and maintain ML models in production environments.',
      timeline_months: 'Months 3-6',
      required_skills: ['Docker', 'MLflow', 'CI/CD', 'Cloud Platforms (AWS/GCP)'],
      action_steps: ['Deploy a model using FastAPI + Docker', 'Set up MLflow experiment tracking', 'Complete AWS ML Specialty certification'],
    },
    {
      milestone_number: 3,
      title: 'Leadership & Communication',
      description: 'Develop skills to lead data science initiatives, mentor junior team members, and present findings to stakeholders.',
      timeline_months: 'Months 6-9',
      required_skills: ['Technical Presentation', 'Stakeholder Management', 'Mentoring', 'Project Scoping'],
      action_steps: ['Present at a local data science meetup', 'Mentor a junior analyst', 'Write 3 technical blog posts'],
    },
    {
      milestone_number: 4,
      title: 'Job Search & Interviews',
      description: 'Prepare for and execute a targeted job search for Senior Data Scientist positions.',
      timeline_months: 'Months 9-12',
      required_skills: ['System Design', 'Case Studies', 'Behavioral Interviewing'],
      action_steps: ['Update portfolio website', 'Practice 20 mock interviews', 'Apply to 15-20 targeted positions', 'Negotiate offers'],
    },
  ],
  skill_gaps: [
    {
      skill_name: 'Deep Learning',
      current_level: 'Beginner',
      required_level: 'Intermediate',
      importance: 'High',
      resources: [
        { name: 'Deep Learning Specialization (Coursera)', type: 'Course', description: 'Comprehensive deep learning course by Andrew Ng covering CNNs, RNNs, and transformers.' },
        { name: 'PyTorch Tutorials', type: 'Tutorial', description: 'Official PyTorch tutorials for hands-on deep learning implementation.' },
      ],
    },
    {
      skill_name: 'MLOps',
      current_level: 'None',
      required_level: 'Intermediate',
      importance: 'High',
      resources: [
        { name: 'Made With ML', type: 'Course', description: 'Free course on ML engineering and MLOps best practices.' },
        { name: 'AWS ML Specialty Cert', type: 'Certification', description: 'AWS certification validating ML deployment skills on cloud.' },
      ],
    },
    {
      skill_name: 'System Design',
      current_level: 'Beginner',
      required_level: 'Intermediate',
      importance: 'Medium',
      resources: [
        { name: 'Designing ML Systems (O\'Reilly)', type: 'Book', description: 'Practical guide to designing production ML systems by Chip Huyen.' },
      ],
    },
    {
      skill_name: 'Technical Communication',
      current_level: 'Intermediate',
      required_level: 'Advanced',
      importance: 'Medium',
      resources: [
        { name: 'Storytelling with Data', type: 'Book', description: 'Learn to communicate data insights effectively.' },
        { name: 'Toastmasters', type: 'Practice', description: 'Join a local chapter for regular public speaking practice.' },
      ],
    },
  ],
}

const SAMPLE_SESSIONS: InterviewSession[] = [
  {
    id: 'sample_1',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Technical',
    difficulty: 'Medium',
    targetRole: 'Senior Data Scientist',
    messages: [
      { role: 'agent', content: 'Welcome! Let us start with a technical question. Can you explain the bias-variance tradeoff in machine learning?', timestamp: '', questionNumber: 1, questionCategory: 'ML Fundamentals', difficultyLevel: 'Medium' },
      { role: 'user', content: 'The bias-variance tradeoff describes the balance between a model\'s ability to fit training data (low bias) versus generalizing to new data (low variance). High bias means underfitting, high variance means overfitting.', timestamp: '' },
      { role: 'agent', content: 'Great explanation! Now, describe a situation where you had to choose between model interpretability and performance.', timestamp: '', questionNumber: 2, questionCategory: 'ML Strategy', difficultyLevel: 'Medium', feedback: { score: 8, strengths: 'Clear and concise explanation with correct terminology', improvements: 'Could include practical examples of managing the tradeoff', tip: 'Mention techniques like cross-validation and regularization' } },
    ],
    performanceSummary: { overall_score: 78, total_questions: 5, strengths: ['Strong ML fundamentals', 'Clear communication'], improvement_areas: ['System design depth', 'Real-world examples'], tips: ['Practice explaining complex concepts to non-technical stakeholders'], confidence_assessment: 'Good confidence, could be more assertive in answers' },
  },
  {
    id: 'sample_2',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Behavioral',
    difficulty: 'Easy',
    targetRole: 'Senior Data Scientist',
    messages: [
      { role: 'agent', content: 'Tell me about a time you led a project that had a significant impact on your team.', timestamp: '', questionNumber: 1, questionCategory: 'Leadership', difficultyLevel: 'Easy' },
      { role: 'user', content: 'I led a churn prediction project that reduced customer churn by 15% and saved $2M annually.', timestamp: '' },
    ],
    performanceSummary: { overall_score: 72, total_questions: 4, strengths: ['Good use of metrics', 'Results-oriented'], improvement_areas: ['STAR method structure', 'More detail on challenges'], tips: ['Use the STAR format consistently'], confidence_assessment: 'Moderate confidence, room for growth' },
  },
]

// --- Main Page ---
export default function Page() {
  const [activeScreen, setActiveScreen] = useState('profile')
  const [profileData, setProfileData] = useState<ProfileData>({
    skills: [], experience: '', degree: '', institution: '', graduationYear: '', industry: '', desiredRole: '', timeline: '12',
  })
  const [careerPlan, setCareerPlan] = useState<any>(null)
  const [careerLoading, setCareerLoading] = useState(false)
  const [careerError, setCareerError] = useState<string | null>(null)
  const [careerSuccess, setCareerSuccess] = useState(false)
  const [interviewLoading, setInterviewLoading] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [sampleMode, setSampleMode] = useState(false)

  // Load sessions from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setSessions(parsed)
        }
      }
    } catch { /* ignore */ }
  }, [])

  // Save sessions to localStorage
  const saveSessions = useCallback((updatedSessions: InterviewSession[]) => {
    setSessions(updatedSessions)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions))
    } catch { /* ignore */ }
  }, [])

  // Handle sample toggle
  const handleSampleToggle = (on: boolean) => {
    setSampleMode(on)
    if (on) {
      setProfileData(SAMPLE_PROFILE)
      setCareerPlan(SAMPLE_CAREER_PLAN)
      setSessions(prev => prev.length === 0 ? SAMPLE_SESSIONS : prev)
    } else {
      setProfileData({ skills: [], experience: '', degree: '', institution: '', graduationYear: '', industry: '', desiredRole: '', timeline: '12' })
      setCareerPlan(null)
      setCareerSuccess(false)
    }
  }

  // Generate career plan
  const handleGeneratePlan = async () => {
    setCareerLoading(true)
    setCareerError(null)
    setCareerSuccess(false)
    setActiveAgentId(CAREER_AGENT_ID)

    const message = [
      `I am seeking a career transition plan.`,
      `Skills: ${profileData.skills.join(', ')}`,
      profileData.experience ? `Experience: ${profileData.experience}` : '',
      profileData.degree ? `Education: ${profileData.degree}${profileData.institution ? ` from ${profileData.institution}` : ''}${profileData.graduationYear ? ` (${profileData.graduationYear})` : ''}` : '',
      profileData.industry ? `Target Industry: ${profileData.industry}` : '',
      `Desired Role: ${profileData.desiredRole}`,
      profileData.timeline ? `Timeline: ${profileData.timeline} months` : '',
      `Please generate a comprehensive career roadmap with milestones, skill gap analysis, and actionable steps.`,
    ].filter(Boolean).join('\n')

    try {
      const result = await callAIAgent(message, CAREER_AGENT_ID)
      if (result?.success) {
        const parsed = parseAgentResponse(result)
        if (parsed) {
          setCareerPlan(parsed)
          setCareerSuccess(true)
          setTimeout(() => setActiveScreen('career-plan'), 1200)
        } else {
          setCareerError('Could not parse career plan response. Please try again.')
        }
      } else {
        setCareerError(result?.error ?? 'Failed to generate career plan. Please try again.')
      }
    } catch (err: any) {
      setCareerError(err?.message ?? 'Network error. Please try again.')
    } finally {
      setCareerLoading(false)
      setActiveAgentId(null)
    }
  }

  // Interview agent call
  const handleInterviewCall = async (message: string, sessionId: string) => {
    setInterviewLoading(true)
    setActiveAgentId(INTERVIEW_AGENT_ID)
    try {
      const result = await callAIAgent(message, INTERVIEW_AGENT_ID, { session_id: sessionId })
      return result
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Network error' }
    } finally {
      setInterviewLoading(false)
      setActiveAgentId(null)
    }
  }

  // Save interview session
  const handleSaveSession = (session: InterviewSession) => {
    const updated = [session, ...sessions.filter(s => s.id !== session.id)]
    saveSessions(updated)
  }

  // Delete interview session
  const handleDeleteSession = (id: string) => {
    saveSessions(sessions.filter(s => s.id !== id))
  }

  // Render active screen
  const renderScreen = () => {
    switch (activeScreen) {
      case 'profile':
        return (
          <ProfileGoals
            profileData={profileData}
            onProfileChange={setProfileData}
            onGeneratePlan={handleGeneratePlan}
            loading={careerLoading}
            error={careerError}
            success={careerSuccess}
          />
        )
      case 'career-plan':
        return (
          <CareerPlan
            data={careerPlan}
            onRegenerate={handleGeneratePlan}
            onStartInterview={() => setActiveScreen('mock-interview')}
            loading={careerLoading}
          />
        )
      case 'mock-interview':
        return (
          <MockInterview
            profileData={profileData}
            onCallAgent={handleInterviewCall}
            loading={interviewLoading}
            onSaveSession={handleSaveSession}
          />
        )
      case 'history':
        return (
          <InterviewHistory
            sessions={sessions}
            onDeleteSession={handleDeleteSession}
            onStartInterview={() => setActiveScreen('mock-interview')}
          />
        )
      default:
        return null
    }
  }

  const agents = [
    { id: CAREER_AGENT_ID, name: 'Career Strategist', purpose: 'Generates personalized career roadmaps' },
    { id: INTERVIEW_AGENT_ID, name: 'Interview Coach', purpose: 'Conducts mock interviews with feedback' },
  ]

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-blue-50/30 text-foreground">
        {/* Sidebar */}
        <Sidebar
          activeScreen={activeScreen}
          onNavigate={setActiveScreen}
          hasCareerPlan={careerPlan != null}
        />

        {/* Main content */}
        <main className="md:ml-64 min-h-screen">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Top bar with sample toggle */}
            <div className="flex items-center justify-end mb-6 gap-3">
              <Label htmlFor="sample-toggle" className="text-xs text-muted-foreground font-medium cursor-pointer">Sample Data</Label>
              <Switch
                id="sample-toggle"
                checked={sampleMode}
                onCheckedChange={handleSampleToggle}
              />
            </div>

            {/* Screen content */}
            {renderScreen()}

            {/* Agent Status */}
            <div className="mt-8 pt-6 border-t border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <FiCpu className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Agents</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs backdrop-blur-md border transition-all duration-200',
                      activeAgentId === agent.id
                        ? 'bg-primary/10 border-primary/30 shadow-sm'
                        : 'bg-white/50 border-white/20'
                    )}
                  >
                    <div className={cn(
                      'w-2 h-2 rounded-full flex-shrink-0',
                      activeAgentId === agent.id ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'
                    )} />
                    <div>
                      <span className="font-medium text-foreground">{agent.name}</span>
                      <span className="text-muted-foreground ml-1.5">{agent.purpose}</span>
                    </div>
                    {activeAgentId === agent.id && (
                      <Badge variant="secondary" className="rounded-full text-[10px] px-1.5 py-0 ml-1 animate-pulse">
                        Active
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}
