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
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <FiClock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Interview History</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">Review past mock interviews and track your improvement.</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mb-5 shadow-sm">
            <FiClock className="w-9 h-9 text-indigo-500" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">No Interviews Yet</h3>
          <p className="text-muted-foreground text-sm max-w-md leading-relaxed mb-6">Start practicing to build your interview history and track improvement over time.</p>
          <Button onClick={onStartInterview} className="rounded-xl gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-md shadow-indigo-500/20">
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <FiClock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Interview History</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''} completed
              {trend === 'up' && (
                <span className="inline-flex items-center gap-1 ml-2 text-emerald-600 font-medium">
                  <FiTrendingUp className="w-3.5 h-3.5" /> Improving
                </span>
              )}
              {trend === 'down' && (
                <span className="inline-flex items-center gap-1 ml-2 text-amber-600 font-medium">
                  <FiTrendingDown className="w-3.5 h-3.5" /> Needs practice
                </span>
              )}
            </p>
          </div>
        </div>
        <Button onClick={onStartInterview} size="sm" className="rounded-xl gap-1.5 text-xs bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-md shadow-indigo-500/20">
          <FiMessageSquare className="w-3.5 h-3.5" />
          New Interview
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2.5">
        <FiFilter className="w-3.5 h-3.5 text-muted-foreground" />
        <div className="flex gap-1.5">
          {filterTypes.map(f => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                filterType === f
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions list */}
      <ScrollArea className="h-[calc(100vh-14rem)]">
        <div className="space-y-4 pr-4">
          {filteredSessions.map((session) => {
            const isExpanded = expandedSession === session.id
            const score = session.performanceSummary?.overall_score

            return (
              <Card key={session.id} className="bg-card border border-border/60 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                  className="w-full text-left p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="rounded-lg text-xs bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-medium">{session.type}</Badge>
                        <Badge variant="outline" className="rounded-lg text-xs border-border/60">{session.difficulty}</Badge>
                        {session.targetRole && (
                          <span className="text-xs text-muted-foreground truncate">{session.targetRole}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <FiClock className="w-3 h-3 text-indigo-400" />
                        {formatDate(session.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {score != null && (
                        <div className="text-center">
                          <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{score}</div>
                          <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">Score</div>
                        </div>
                      )}
                      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center transition-colors', isExpanded ? 'bg-indigo-50' : 'bg-muted/50')}>
                        {isExpanded ? <FiChevronUp className="w-4 h-4 text-indigo-600" /> : <FiChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <CardContent className="px-5 pb-5 pt-0 space-y-5">
                    <div className="h-px bg-border/50" />

                    {/* Performance Summary */}
                    {session.performanceSummary && (
                      <div className="rounded-xl bg-gradient-to-br from-indigo-50/80 to-violet-50/50 p-5 border border-indigo-200/30 space-y-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                            <FiAward className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-sm font-bold tracking-tight text-foreground">Performance Summary</span>
                        </div>
                        {Array.isArray(session.performanceSummary.strengths) && session.performanceSummary.strengths.length > 0 && (
                          <div>
                            <p className="text-[11px] font-semibold text-emerald-600 mb-1.5 uppercase tracking-widest">Strengths</p>
                            <div className="flex flex-wrap gap-1.5">
                              {session.performanceSummary.strengths.map((s, i) => (
                                <Badge key={i} className="rounded-lg text-xs bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium">{String(s)}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {Array.isArray(session.performanceSummary.improvement_areas) && session.performanceSummary.improvement_areas.length > 0 && (
                          <div>
                            <p className="text-[11px] font-semibold text-amber-600 mb-1.5 uppercase tracking-widest">Areas for Improvement</p>
                            <div className="flex flex-wrap gap-1.5">
                              {session.performanceSummary.improvement_areas.map((s, i) => (
                                <Badge key={i} className="rounded-lg text-xs bg-amber-50 text-amber-700 border border-amber-200/60 font-medium">{String(s)}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {session.performanceSummary.confidence_assessment && (
                          <p className="text-xs text-muted-foreground">
                            <span className="font-semibold">Confidence: </span>
                            {session.performanceSummary.confidence_assessment}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Transcript */}
                    <div>
                      <p className="text-[11px] font-semibold text-indigo-600 mb-3 uppercase tracking-widest">Transcript</p>
                      <div className="space-y-2.5 max-h-80 overflow-y-auto">
                        {Array.isArray(session.messages) && session.messages.map((msg, idx) => (
                          <div key={idx} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                            <div className={cn(
                              'max-w-[85%] px-4 py-2.5 rounded-xl text-xs leading-relaxed',
                              msg.role === 'user'
                                ? 'bg-indigo-50 text-indigo-900 rounded-br-md border border-indigo-200/40'
                                : 'bg-muted/40 text-foreground rounded-bl-md border border-border/40'
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
                        className="text-xs text-muted-foreground hover:text-red-600 gap-1.5"
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
