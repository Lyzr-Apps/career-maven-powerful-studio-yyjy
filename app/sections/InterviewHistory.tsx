'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { FiClock, FiMessageSquare, FiChevronDown, FiChevronUp, FiAward, FiTrendingUp, FiTrendingDown, FiTrash2, FiFilter } from 'react-icons/fi'

import type { InterviewSession, ChatMessage } from './MockInterview'

interface InterviewHistoryProps {
  sessions: InterviewSession[]
  onDeleteSession: (id: string) => void
  onStartInterview: () => void
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return dateStr
  }
}

export default function InterviewHistory({ sessions, onDeleteSession, onStartInterview }: InterviewHistoryProps) {
  const [expandedSession, setExpandedSession] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>('All')

  const filterTypes = ['All', 'Technical', 'Behavioral', 'Mixed']
  const filteredSessions = filterType === 'All'
    ? sessions
    : sessions.filter(s => s.type === filterType)

  // Score trend
  const getScoreTrend = () => {
    if (sessions.length < 2) return null
    const lastScore = sessions[0]?.performanceSummary?.overall_score
    const prevScore = sessions[1]?.performanceSummary?.overall_score
    if (lastScore == null || prevScore == null) return null
    if (lastScore > prevScore) return 'up'
    if (lastScore < prevScore) return 'down'
    return 'same'
  }

  const trend = getScoreTrend()

  if (sessions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Interview History</h2>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">Review past mock interviews and track your improvement.</p>
        </div>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <FiClock className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground mb-2">No Interviews Yet</h3>
          <p className="text-muted-foreground text-sm max-w-md leading-relaxed mb-6">Start practicing to build your interview history and track improvement over time.</p>
          <Button onClick={onStartInterview} className="rounded-xl gap-2">
            <FiMessageSquare className="w-4 h-4" />
            Start Mock Interview
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Interview History</h2>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} completed
            {trend === 'up' && (
              <span className="inline-flex items-center gap-1 ml-2 text-green-600">
                <FiTrendingUp className="w-3.5 h-3.5" /> Improving
              </span>
            )}
            {trend === 'down' && (
              <span className="inline-flex items-center gap-1 ml-2 text-amber-600">
                <FiTrendingDown className="w-3.5 h-3.5" /> Needs practice
              </span>
            )}
          </p>
        </div>
        <Button onClick={onStartInterview} size="sm" className="rounded-xl gap-1.5 text-xs">
          <FiMessageSquare className="w-3.5 h-3.5" />
          New Interview
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <FiFilter className="w-3.5 h-3.5 text-muted-foreground" />
        <div className="flex gap-1.5">
          {filterTypes.map(f => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
                filterType === f
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/60'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions list */}
      <ScrollArea className="h-[calc(100vh-14rem)]">
        <div className="space-y-3 pr-4">
          {filteredSessions.map((session) => {
            const isExpanded = expandedSession === session.id
            const score = session.performanceSummary?.overall_score

            return (
              <Card key={session.id} className="backdrop-blur-md bg-white/75 border-white/20 shadow-md rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                  className="w-full text-left p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge variant="secondary" className="rounded-full text-xs">{session.type}</Badge>
                        <Badge variant="outline" className="rounded-full text-xs">{session.difficulty}</Badge>
                        {session.targetRole && (
                          <span className="text-xs text-muted-foreground truncate">{session.targetRole}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        {formatDate(session.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {score != null && (
                        <div className="text-center">
                          <div className="text-xl font-bold text-primary">{score}</div>
                          <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Score</div>
                        </div>
                      )}
                      {isExpanded ? <FiChevronUp className="w-4 h-4 text-muted-foreground" /> : <FiChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <CardContent className="px-4 pb-4 pt-0 space-y-4">
                    {/* Performance Summary */}
                    {session.performanceSummary && (
                      <div className="rounded-xl bg-muted/40 p-4 border border-border/50 space-y-3">
                        <div className="flex items-center gap-2">
                          <FiAward className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold tracking-tight text-foreground">Performance Summary</span>
                        </div>
                        {Array.isArray(session.performanceSummary.strengths) && session.performanceSummary.strengths.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-green-600 mb-1">Strengths</p>
                            <div className="flex flex-wrap gap-1.5">
                              {session.performanceSummary.strengths.map((s, i) => (
                                <Badge key={i} variant="secondary" className="rounded-full text-xs bg-green-50 text-green-700">{String(s)}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {Array.isArray(session.performanceSummary.improvement_areas) && session.performanceSummary.improvement_areas.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-amber-600 mb-1">Areas for Improvement</p>
                            <div className="flex flex-wrap gap-1.5">
                              {session.performanceSummary.improvement_areas.map((s, i) => (
                                <Badge key={i} variant="secondary" className="rounded-full text-xs bg-amber-50 text-amber-700">{String(s)}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {session.performanceSummary.confidence_assessment && (
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Confidence: </span>
                            {session.performanceSummary.confidence_assessment}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Transcript */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Transcript</p>
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {Array.isArray(session.messages) && session.messages.map((msg, idx) => (
                          <div key={idx} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                            <div className={cn(
                              'max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed',
                              msg.role === 'user'
                                ? 'bg-primary/10 text-foreground rounded-br-md'
                                : 'bg-muted/60 text-foreground rounded-bl-md'
                            )}>
                              {msg.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delete button */}
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id) }}
                        className="text-xs text-muted-foreground hover:text-destructive gap-1.5"
                      >
                        <FiTrash2 className="w-3 h-3" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
