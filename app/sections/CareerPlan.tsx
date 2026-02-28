'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { FiClock, FiTarget, FiBookOpen, FiChevronDown, FiChevronUp, FiRefreshCw, FiMessageSquare, FiCheckCircle, FiArrowUpRight } from 'react-icons/fi'

interface CareerPlanData {
  executive_summary?: string
  overall_timeline_months?: number
  career_roadmap?: Array<{
    milestone_number?: number
    title?: string
    description?: string
    timeline_months?: string
    required_skills?: string[]
    action_steps?: string[]
  }>
  skill_gaps?: Array<{
    skill_name?: string
    current_level?: string
    required_level?: string
    importance?: string
    resources?: Array<{
      name?: string
      type?: string
      description?: string
    }>
  }>
}

interface CareerPlanProps {
  data: CareerPlanData | null
  onRegenerate: () => void
  onStartInterview: () => void
  loading: boolean
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm leading-relaxed">{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part)
}

function importanceColor(importance?: string) {
  const lower = (importance ?? '').toLowerCase()
  if (lower === 'high' || lower === 'critical') return 'bg-red-100 text-red-700 border-red-200'
  if (lower === 'medium') return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-green-100 text-green-700 border-green-200'
}

export default function CareerPlan({ data, onRegenerate, onStartInterview, loading }: CareerPlanProps) {
  const [expandedMilestones, setExpandedMilestones] = useState<Set<number>>(new Set([0]))
  const [expandedSkills, setExpandedSkills] = useState<Set<number>>(new Set())

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <FiTarget className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-foreground mb-2">No Career Plan Yet</h3>
        <p className="text-muted-foreground text-sm max-w-md leading-relaxed">Complete your Profile & Goals to generate a personalized career roadmap.</p>
      </div>
    )
  }

  const roadmap = Array.isArray(data?.career_roadmap) ? data.career_roadmap : []
  const skillGaps = Array.isArray(data?.skill_gaps) ? data.skill_gaps : []

  const toggleMilestone = (idx: number) => {
    setExpandedMilestones(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const toggleSkill = (idx: number) => {
    setExpandedSkills(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  return (
    <ScrollArea className="h-[calc(100vh-3rem)]">
      <div className="space-y-6 pr-4 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Career Plan</h2>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">Your personalized roadmap and skill gap analysis</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onRegenerate} disabled={loading} className="rounded-xl text-xs gap-1.5">
              <FiRefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
              Regenerate
            </Button>
            <Button size="sm" onClick={onStartInterview} className="rounded-xl text-xs gap-1.5">
              <FiMessageSquare className="w-3.5 h-3.5" />
              Mock Interview
            </Button>
          </div>
        </div>

        {/* Executive Summary */}
        <Card className="backdrop-blur-md bg-white/75 border-white/20 shadow-md rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="text-sm font-semibold tracking-tight text-foreground uppercase">Executive Summary</h3>
              {(data?.overall_timeline_months ?? 0) > 0 && (
                <Badge variant="secondary" className="rounded-full text-xs font-medium flex items-center gap-1">
                  <FiClock className="w-3 h-3" />
                  {data.overall_timeline_months} months
                </Badge>
              )}
            </div>
            <div className="text-foreground">{renderMarkdown(data?.executive_summary ?? '')}</div>
          </CardContent>
        </Card>

        {/* Career Roadmap */}
        {roadmap.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground mb-4">Career Roadmap</h3>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-4">
                {roadmap.map((milestone, idx) => {
                  const isExpanded = expandedMilestones.has(idx)
                  const skills = Array.isArray(milestone?.required_skills) ? milestone.required_skills : []
                  const steps = Array.isArray(milestone?.action_steps) ? milestone.action_steps : []

                  return (
                    <div key={idx} className="relative pl-12">
                      {/* Milestone number circle */}
                      <div className="absolute left-2 top-4 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center shadow-md z-10">
                        {milestone?.milestone_number ?? idx + 1}
                      </div>

                      <Card className="backdrop-blur-md bg-white/75 border-white/20 shadow-md rounded-xl">
                        <button
                          onClick={() => toggleMilestone(idx)}
                          className="w-full text-left p-4 pb-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm tracking-tight text-foreground">{milestone?.title ?? 'Milestone'}</h4>
                              {milestone?.timeline_months && (
                                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                  <FiClock className="w-3 h-3" />
                                  {milestone.timeline_months}
                                </p>
                              )}
                            </div>
                            {isExpanded ? <FiChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" /> : <FiChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />}
                          </div>
                        </button>

                        {isExpanded && (
                          <CardContent className="px-4 pb-4 pt-0 space-y-3">
                            {milestone?.description && (
                              <div className="text-foreground">{renderMarkdown(milestone.description)}</div>
                            )}
                            {skills.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1.5">Required Skills</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {skills.map((skill, si) => (
                                    <Badge key={si} variant="secondary" className="rounded-full text-xs">{String(skill)}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {steps.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1.5">Action Steps</p>
                                <div className="space-y-1.5">
                                  {steps.map((step, si) => (
                                    <div key={si} className="flex items-start gap-2 text-sm">
                                      <FiCheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-foreground leading-relaxed">{String(step)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        )}
                      </Card>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Skill Gaps */}
        {skillGaps.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground mb-4">Skill Gap Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skillGaps.map((gap, idx) => {
                const isExpanded = expandedSkills.has(idx)
                const resources = Array.isArray(gap?.resources) ? gap.resources : []

                return (
                  <Card key={idx} className="backdrop-blur-md bg-white/75 border-white/20 shadow-md rounded-xl">
                    <button onClick={() => toggleSkill(idx)} className="w-full text-left p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-sm tracking-tight text-foreground">{gap?.skill_name ?? 'Skill'}</h4>
                            <Badge className={cn('rounded-full text-[10px] px-2 py-0 border', importanceColor(gap?.importance))}>
                              {gap?.importance ?? 'N/A'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>Current: <strong className="text-foreground">{gap?.current_level ?? '?'}</strong></span>
                            <FiArrowUpRight className="w-3 h-3" />
                            <span>Required: <strong className="text-foreground">{gap?.required_level ?? '?'}</strong></span>
                          </div>
                        </div>
                        {isExpanded ? <FiChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <FiChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                      </div>
                    </button>

                    {isExpanded && resources.length > 0 && (
                      <CardContent className="px-4 pb-4 pt-0">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Recommended Resources</p>
                        <div className="space-y-2">
                          {resources.map((res, ri) => (
                            <div key={ri} className="p-3 rounded-lg bg-muted/40 border border-border/50">
                              <div className="flex items-center gap-2 mb-1">
                                <FiBookOpen className="w-3.5 h-3.5 text-primary" />
                                <span className="text-sm font-medium text-foreground">{res?.name ?? 'Resource'}</span>
                                {res?.type && (
                                  <Badge variant="outline" className="rounded-full text-[10px] px-1.5 py-0">{res.type}</Badge>
                                )}
                              </div>
                              {res?.description && (
                                <p className="text-xs text-muted-foreground leading-relaxed ml-5">{res.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
