'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { FiSend, FiPlay, FiSquare, FiAward, FiAlertCircle, FiChevronDown, FiChevronUp, FiHeart, FiStar, FiMessageSquare } from 'react-icons/fi'

export interface ChatMessage {
  role: 'user' | 'agent'
  content: string
  timestamp: string
  feedback?: {
    score?: number
    strengths?: string
    improvements?: string
    tip?: string
  } | null
  anxietyTip?: string
  questionNumber?: number
  questionCategory?: string
  difficultyLevel?: string
  messageType?: string
  performanceSummary?: {
    overall_score?: number
    total_questions?: number
    strengths?: string[]
    improvement_areas?: string[]
    tips?: string[]
    confidence_assessment?: string
  } | null
}

export interface InterviewSession {
  id: string
  date: string
  type: string
  difficulty: string
  messages: ChatMessage[]
  performanceSummary?: ChatMessage['performanceSummary']
  targetRole?: string
}

interface MockInterviewProps {
  profileData: {
    skills: string[]
    industry: string
    desiredRole: string
    experience: string
  }
  onCallAgent: (message: string, sessionId: string) => Promise<any>
  loading: boolean
  onSaveSession: (session: InterviewSession) => void
}

const interviewTypes = ['Technical', 'Behavioral', 'Mixed']
const difficulties = ['Easy', 'Medium', 'Hard']

export default function MockInterview({ profileData, onCallAgent, loading, onSaveSession }: MockInterviewProps) {
  const [interviewType, setInterviewType] = useState('Mixed')
  const [difficulty, setDifficulty] = useState('Medium')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [sessionActive, setSessionActive] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [expandedFeedback, setExpandedFeedback] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  const parseAgentResponse = (result: any) => {
    try {
      const data = result?.response?.result
      if (!data) return null
      if (typeof data === 'string') {
        try { return JSON.parse(data) } catch { return null }
      }
      return data
    } catch { return null }
  }

  const startInterview = async () => {
    setError(null)
    const newSessionId = generateSessionId()
    setSessionId(newSessionId)
    setSessionActive(true)
    setMessages([])

    const startMessage = `Interview type: ${interviewType}, Difficulty: ${difficulty}, Target role: ${profileData.desiredRole || 'General'}, Industry: ${profileData.industry || 'General'}, Skills: ${profileData.skills.length > 0 ? profileData.skills.join(', ') : 'Not specified'}, Experience: ${profileData.experience || 'Not specified'}. Please start the mock interview.`

    const result = await onCallAgent(startMessage, newSessionId)

    if (result?.success) {
      const parsed = parseAgentResponse(result)
      if (parsed) {
        const agentMsg: ChatMessage = {
          role: 'agent',
          content: parsed?.question ?? parsed?.message ?? 'Let us begin the interview.',
          timestamp: new Date().toISOString(),
          feedback: parsed?.feedback ?? null,
          anxietyTip: parsed?.anxiety_tip ?? '',
          questionNumber: parsed?.question_number,
          questionCategory: parsed?.question_category,
          difficultyLevel: parsed?.difficulty_level,
          messageType: parsed?.message_type,
          performanceSummary: parsed?.performance_summary ?? null,
        }
        setMessages([agentMsg])
      }
    } else {
      setError(result?.error ?? 'Failed to start interview')
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || loading || !sessionActive) return
    setError(null)

    const userMsg: ChatMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setInputValue('')

    const result = await onCallAgent(inputValue.trim(), sessionId)

    if (result?.success) {
      const parsed = parseAgentResponse(result)
      if (parsed) {
        const isSummary = (parsed?.message_type ?? '').toLowerCase().includes('summary') || (parsed?.message_type ?? '').toLowerCase().includes('end')
        const agentMsg: ChatMessage = {
          role: 'agent',
          content: parsed?.question ?? parsed?.message ?? (isSummary ? 'Interview complete! Here is your performance summary.' : 'Thank you for your answer.'),
          timestamp: new Date().toISOString(),
          feedback: parsed?.feedback ?? null,
          anxietyTip: parsed?.anxiety_tip ?? '',
          questionNumber: parsed?.question_number,
          questionCategory: parsed?.question_category,
          difficultyLevel: parsed?.difficulty_level,
          messageType: parsed?.message_type,
          performanceSummary: parsed?.performance_summary ?? null,
        }
        setMessages(prev => [...prev, agentMsg])

        if (isSummary) {
          endSession([...messages, userMsg, agentMsg], parsed?.performance_summary)
        }
      }
    } else {
      setError(result?.error ?? 'Failed to get response')
    }
  }

  const endSession = (finalMessages?: ChatMessage[], summary?: any) => {
    const allMessages = finalMessages ?? messages
    setSessionActive(false)
    const lastAgentMsg = [...allMessages].reverse().find(m => m.role === 'agent')
    const perf = summary ?? lastAgentMsg?.performanceSummary ?? null

    const session: InterviewSession = {
      id: sessionId,
      date: new Date().toISOString(),
      type: interviewType,
      difficulty,
      messages: allMessages,
      performanceSummary: perf,
      targetRole: profileData.desiredRole,
    }
    onSaveSession(session)
  }

  const handleEndClick = async () => {
    setError(null)
    const endMsg = 'Please end the interview and provide a comprehensive performance summary.'
    const userMsg: ChatMessage = {
      role: 'user',
      content: endMsg,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])

    const result = await onCallAgent(endMsg, sessionId)

    if (result?.success) {
      const parsed = parseAgentResponse(result)
      if (parsed) {
        const agentMsg: ChatMessage = {
          role: 'agent',
          content: parsed?.question ?? parsed?.message ?? 'Interview complete! Here is your performance summary.',
          timestamp: new Date().toISOString(),
          feedback: parsed?.feedback ?? null,
          anxietyTip: parsed?.anxiety_tip ?? '',
          messageType: 'summary',
          performanceSummary: parsed?.performance_summary ?? null,
        }
        setMessages(prev => [...prev, agentMsg])
        endSession([...messages, userMsg, agentMsg], parsed?.performance_summary)
      } else {
        endSession()
      }
    } else {
      endSession()
    }
  }

  const toggleFeedback = (idx: number) => {
    setExpandedFeedback(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Not started state
  if (!sessionActive && messages.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <FiMessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Mock Interview</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">Practice with an AI interview coach tailored to your target role.</p>
          </div>
        </div>

        <Card className="bg-card border border-border/60 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-7 space-y-6">
            {/* Interview Type */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Interview Type</p>
              <div className="flex gap-2.5">
                {interviewTypes.map(t => (
                  <button
                    key={t}
                    onClick={() => setInterviewType(t)}
                    className={cn(
                      'flex-1 px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-200',
                      interviewType === t
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                        : 'bg-background text-foreground border-border/60 hover:border-indigo-300 hover:bg-indigo-50/50'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Difficulty</p>
              <div className="flex gap-2.5">
                {difficulties.map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={cn(
                      'flex-1 px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-200',
                      difficulty === d
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                        : 'bg-background text-foreground border-border/60 hover:border-indigo-300 hover:bg-indigo-50/50'
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Context */}
            <div className="rounded-xl bg-gradient-to-br from-indigo-50/80 to-violet-50/50 p-5 border border-indigo-200/40">
              <p className="text-[11px] text-indigo-500 font-semibold uppercase tracking-widest mb-1.5">Interview Context</p>
              <p className="text-sm text-foreground leading-relaxed">
                {profileData.desiredRole ? `Role: ${profileData.desiredRole}` : 'No role specified'}
                {profileData.industry ? ` | Industry: ${profileData.industry}` : ''}
                {profileData.skills.length > 0 ? ` | Skills: ${profileData.skills.slice(0, 3).join(', ')}${profileData.skills.length > 3 ? '...' : ''}` : ''}
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-50 border border-red-200/60 text-red-700 text-sm">
                <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <Button
              onClick={startInterview}
              disabled={loading}
              className="w-full h-14 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 gap-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Starting Interview...
                </>
              ) : (
                <>
                  <FiPlay className="w-4 h-4" />
                  Start Mock Interview
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Active or completed session
  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      {/* Top bar */}
      <div className="flex items-center justify-between py-3 px-1 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
            <FiMessageSquare className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">Mock Interview</h2>
          <Badge className="rounded-lg text-xs bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-medium">{interviewType}</Badge>
          <Badge variant="outline" className="rounded-lg text-xs border-border/60">{difficulty}</Badge>
        </div>
        {sessionActive && (
          <Button variant="destructive" size="sm" onClick={handleEndClick} disabled={loading} className="rounded-xl text-xs gap-1.5 shadow-sm">
            <FiSquare className="w-3 h-3" />
            End Session
          </Button>
        )}
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 py-4 px-1">
        {messages.map((msg, idx) => (
          <div key={idx} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn('max-w-[80%] space-y-2.5')}>
              {/* Message bubble */}
              <div className={cn(
                'px-5 py-4 rounded-2xl text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-br-md shadow-md shadow-indigo-500/15'
                  : 'bg-card border border-border/60 shadow-sm text-foreground rounded-bl-md'
              )}>
                {msg.role === 'agent' && msg.questionNumber && (
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="rounded-lg text-[10px] px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-semibold">Q{msg.questionNumber}</Badge>
                    {msg.questionCategory && <Badge variant="outline" className="rounded-lg text-[10px] px-2 py-0.5 border-border/60">{msg.questionCategory}</Badge>}
                    {msg.difficultyLevel && <Badge variant="outline" className="rounded-lg text-[10px] px-2 py-0.5 border-border/60">{msg.difficultyLevel}</Badge>}
                  </div>
                )}
                {msg.content}
              </div>

              {/* Feedback panel */}
              {msg.role === 'agent' && msg.feedback && (msg.feedback.score != null || msg.feedback.strengths || msg.feedback.improvements) && (
                <div className="ml-2">
                  <button
                    onClick={() => toggleFeedback(idx)}
                    className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
                  >
                    <FiStar className="w-3 h-3" />
                    {msg.feedback.score != null && <span>Score: {msg.feedback.score}/10</span>}
                    <span>View Feedback</span>
                    {expandedFeedback.has(idx) ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />}
                  </button>
                  {expandedFeedback.has(idx) && (
                    <Card className="mt-2.5 bg-card border border-border/60 shadow-sm rounded-xl">
                      <CardContent className="p-4 space-y-3 text-xs">
                        {msg.feedback.strengths && (
                          <div>
                            <span className="font-semibold text-emerald-600">Strengths:</span>
                            <p className="text-foreground mt-0.5 leading-relaxed">{msg.feedback.strengths}</p>
                          </div>
                        )}
                        {msg.feedback.improvements && (
                          <div>
                            <span className="font-semibold text-amber-600">Improvements:</span>
                            <p className="text-foreground mt-0.5 leading-relaxed">{msg.feedback.improvements}</p>
                          </div>
                        )}
                        {msg.feedback.tip && (
                          <div>
                            <span className="font-semibold text-indigo-600">Tip:</span>
                            <p className="text-foreground mt-0.5 leading-relaxed">{msg.feedback.tip}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Anxiety tip */}
              {msg.role === 'agent' && msg.anxietyTip && (
                <div className="ml-2 flex items-start gap-2.5 p-4 rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50/80 border border-violet-200/40 text-xs text-violet-700">
                  <FiHeart className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-violet-500" />
                  <span className="leading-relaxed">{msg.anxietyTip}</span>
                </div>
              )}

              {/* Performance Summary */}
              {msg.role === 'agent' && msg.performanceSummary && (msg.performanceSummary.overall_score != null || (Array.isArray(msg.performanceSummary.strengths) && msg.performanceSummary.strengths.length > 0)) && (
                <Card className="ml-2 bg-gradient-to-br from-indigo-50/80 via-violet-50/40 to-card border border-indigo-200/30 shadow-md rounded-2xl overflow-hidden">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                        <FiAward className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-bold text-sm tracking-tight text-foreground">Performance Summary</h4>
                    </div>
                    <div className="flex items-center gap-6">
                      {msg.performanceSummary.overall_score != null && (
                        <div className="text-center">
                          <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{msg.performanceSummary.overall_score}</div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">Overall Score</div>
                        </div>
                      )}
                      {msg.performanceSummary.total_questions != null && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">{msg.performanceSummary.total_questions}</div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">Questions</div>
                        </div>
                      )}
                    </div>
                    {Array.isArray(msg.performanceSummary.strengths) && msg.performanceSummary.strengths.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold text-emerald-600 mb-2 uppercase tracking-widest">Strengths</p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.performanceSummary.strengths.map((s, i) => (
                            <Badge key={i} className="rounded-lg text-xs bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium">{String(s)}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {Array.isArray(msg.performanceSummary.improvement_areas) && msg.performanceSummary.improvement_areas.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold text-amber-600 mb-2 uppercase tracking-widest">Areas for Improvement</p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.performanceSummary.improvement_areas.map((s, i) => (
                            <Badge key={i} className="rounded-lg text-xs bg-amber-50 text-amber-700 border border-amber-200/60 font-medium">{String(s)}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {Array.isArray(msg.performanceSummary.tips) && msg.performanceSummary.tips.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold text-indigo-600 mb-2 uppercase tracking-widest">Tips</p>
                        <ul className="space-y-1.5">
                          {msg.performanceSummary.tips.map((t, i) => (
                            <li key={i} className="text-xs text-foreground flex items-start gap-2">
                              <span className="text-indigo-400 mt-0.5 font-bold">-</span>
                              {String(t)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {msg.performanceSummary.confidence_assessment && (
                      <div className="text-xs p-3 rounded-xl bg-muted/30 border border-border/40">
                        <span className="font-semibold text-muted-foreground">Confidence: </span>
                        <span className="text-foreground">{msg.performanceSummary.confidence_assessment}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border/60 shadow-sm rounded-2xl rounded-bl-md px-5 py-4">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400/50 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-indigo-400/50 animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-2 h-2 rounded-full bg-indigo-400/50 animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-1 py-2 text-red-600 text-xs font-medium">
          <FiAlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Input bar */}
      {sessionActive && (
        <div className="flex gap-2.5 py-4 px-1 flex-shrink-0 border-t border-border/50">
          <Input
            placeholder="Type your answer..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="flex-1 rounded-xl h-12 border-border/60 focus:border-indigo-400 focus:ring-indigo-400/20"
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !inputValue.trim()}
            size="icon"
            className="rounded-xl flex-shrink-0 w-12 h-12 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-md shadow-indigo-500/20"
          >
            <FiSend className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Session ended */}
      {!sessionActive && messages.length > 0 && (
        <div className="py-5 px-1 flex-shrink-0 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground mb-3 font-medium">Interview session ended</p>
          <Button onClick={() => { setMessages([]); setError(null) }} variant="outline" className="rounded-xl text-sm gap-2 border-border/60 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700">
            <FiPlay className="w-3.5 h-3.5" />
            New Interview
          </Button>
        </div>
      )}
    </div>
  )
}
