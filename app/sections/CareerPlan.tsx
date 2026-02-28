'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { FiClock, FiTarget, FiBookOpen, FiChevronDown, FiChevronUp, FiRefreshCw, FiMessageSquare, FiCheckCircle, FiArrowUpRight, FiMap, FiZap } from 'react-icons/fi'

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
  if (lower === 'high' || lower === 'critical') return 'bg-red-50 text-red-700 border-red-200/60'
  if (lower === 'medium') return 'bg-amber-50 text-amber-700 border-amber-200/60'
  return 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
}

export default function CareerPlan({ data, onRegenerate, onStartInterview, loading }: CareerPlanProps) {
  const [expandedMilestones, setExpandedMilestones] = useState<Set<number>>(new Set([0]))
  const [expandedSkills, setExpandedSkills] = useState<Set<number>>(new Set())

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mb-5 shadow-sm">
          <FiTarget className="w-9 h-9 text-indigo-500" />
        </div>
        <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">No Career Plan Yet</h3>
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
      <div className="space-y-8 pr-4 pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <FiMap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Career Plan</h2>
              <p className="text-muted-foreground text-sm">Your personalized roadmap and skill analysis</p>
            </div>
          </div>
          <div className="flex gap-2.5">
            <Button variant="outline" size="sm" onClick={onRegenerate} disabled={loading} className="rounded-xl text-xs gap-1.5 border-border/60 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700">
              <FiRefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
              Regenerate
            </Button>
            <Button size="sm" onClick={onStartInterview} className="rounded-xl text-xs gap-1.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-md shadow-indigo-500/20">
              <FiMessageSquare className="w-3.5 h-3.5" />
              Mock Interview
            </Button>
          </div>
        </div>

        {/* Executive Summary */}
        <Card className="bg-gradient-to-br from-indigo-50/80 via-violet-50/40 to-card border border-indigo-200/30 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-7">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <FiZap className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold tracking-widest text-indigo-600 uppercase">Executive Summary</h3>
              </div>
              {(data?.overall_timeline_months ?? 0) > 0 && (
                <Badge className="rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-indigo-100 text-indigo-700 border border-indigo-200/60 px-3 py-1">
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
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                <FiMap className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold tracking-tight text-foreground">Career Roadmap</h3>
              <Badge variant="outline" className="rounded-lg text-[11px] ml-1 border-border/60">{roadmap.length} milestones</Badge>
            </div>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[22px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-indigo-400 via-violet-400 to-indigo-200" />
              <div className="space-y-5">
                {roadmap.map((milestone, idx) => {
                  const isExpanded = expandedMilestones.has(idx)
                  const skills = Array.isArray(milestone?.required_skills) ? milestone.required_skills : []
                  const steps = Array.isArray(milestone?.action_steps) ? milestone.action_steps : []

                  return (
                    <div key={idx} className="relative pl-14">
                      {/* Milestone number circle */}
                      <div className="absolute left-2 top-5 w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-indigo-500/30 z-10 ring-4 ring-background">
                        {milestone?.milestone_number ?? idx + 1}
                      </div>

                      <Card className="bg-card border border-border/60 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl overflow-hidden">
                        <button
                          onClick={() => toggleMilestone(idx)}
                          className="w-full text-left p-5 pb-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-sm tracking-tight text-foreground">{milestone?.title ?? 'Milestone'}</h4>
                              {milestone?.timeline_months && (
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                                  <FiClock className="w-3 h-3 text-indigo-400" />
                                  {milestone.timeline_months}
                                </p>
                              )}
                            </div>
                            <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center transition-colors', isExpanded ? 'bg-indigo-50' : 'bg-muted/50')}>
                              {isExpanded ? <FiChevronUp className="w-4 h-4 text-indigo-600" /> : <FiChevronDown className="w-4 h-4 text-muted-foreground" />}
                            </div>
                          </div>
                        </button>

                        {isExpanded && (
                          <CardContent className="px-5 pb-5 pt-0 space-y-4">
                            <div className="h-px bg-border/50" />
                            {milestone?.description && (
                              <div className="text-foreground">{renderMarkdown(milestone.description)}</div>
                            )}
                            {skills.length > 0 && (
                              <div>
                                <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-widest mb-2">Required Skills</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {skills.map((skill, si) => (
                                    <Badge key={si} className="rounded-lg text-xs bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-medium">{String(skill)}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {steps.length > 0 && (
                              <div>
                                <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-widest mb-2">Action Steps</p>
                                <div className="space-y-2">
                                  {steps.map((step, si) => (
                                    <div key={si} className="flex items-start gap-2.5 text-sm">
                                      <div className="w-5 h-5 rounded-md bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <FiCheckCircle className="w-3 h-3 text-emerald-500" />
                                      </div>
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
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <FiTarget className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold tracking-tight text-foreground">Skill Gap Analysis</h3>
              <Badge variant="outline" className="rounded-lg text-[11px] ml-1 border-border/60">{skillGaps.length} gaps</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {skillGaps.map((gap, idx) => {
                const isExpanded = expandedSkills.has(idx)
                const resources = Array.isArray(gap?.resources) ? gap.resources : []

                return (
                  <Card key={idx} className="bg-card border border-border/60 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl overflow-hidden">
                    <button onClick={() => toggleSkill(idx)} className="w-full text-left p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2.5 mb-2.5">
                            <h4 className="font-bold text-sm tracking-tight text-foreground">{gap?.skill_name ?? 'Skill'}</h4>
                            <Badge className={cn('rounded-lg text-[10px] px-2 py-0.5 border font-semibold', importanceColor(gap?.importance))}>
                              {gap?.importance ?? 'N/A'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="px-2 py-0.5 rounded-md bg-muted/60 font-medium">{gap?.current_level ?? '?'}</span>
                            <FiArrowUpRight className="w-3 h-3 text-indigo-400" />
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium">{gap?.required_level ?? '?'}</span>
                          </div>
                        </div>
                        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center transition-colors', isExpanded ? 'bg-indigo-50' : 'bg-muted/50')}>
                          {isExpanded ? <FiChevronUp className="w-4 h-4 text-indigo-600" /> : <FiChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </div>
                    </button>

                    {isExpanded && resources.length > 0 && (
                      <CardContent className="px-5 pb-5 pt-0">
                        <div className="h-px bg-border/50 mb-4" />
                        <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-widest mb-3">Recommended Resources</p>
                        <div className="space-y-2.5">
                          {resources.map((res, ri) => (
                            <div key={ri} className="p-3.5 rounded-xl bg-muted/30 border border-border/40">
                              <div className="flex items-center gap-2 mb-1.5">
                                <FiBookOpen className="w-3.5 h-3.5 text-indigo-500" />
                                <span className="text-sm font-semibold text-foreground">{res?.name ?? 'Resource'}</span>
                                {res?.type && (
                                  <Badge variant="outline" className="rounded-md text-[10px] px-1.5 py-0 border-border/60 font-medium">{res.type}</Badge>
                                )}
                              </div>
                              {res?.description && (
                                <p className="text-xs text-muted-foreground leading-relaxed ml-[22px]">{res.description}</p>
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
