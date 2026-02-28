'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { FiPlus, FiX, FiArrowRight, FiAlertCircle, FiCheckCircle, FiUser, FiTarget } from 'react-icons/fi'

export interface ProfileData {
  skills: string[]
  experience: string
  degree: string
  institution: string
  graduationYear: string
  industry: string
  desiredRole: string
  timeline: string
}

interface ProfileGoalsProps {
  profileData: ProfileData
  onProfileChange: (data: ProfileData) => void
  onGeneratePlan: () => void
  loading: boolean
  error: string | null
  success: boolean
}

const industries = ['Tech', 'Finance', 'Healthcare', 'Consulting', 'Marketing', 'Education', 'Engineering', 'Other']
const timelines = [
  { value: '6', label: '6 months' },
  { value: '12', label: '1 year' },
  { value: '24', label: '2 years' },
  { value: '36', label: '3+ years' },
]

export default function ProfileGoals({ profileData, onProfileChange, onGeneratePlan, loading, error, success }: ProfileGoalsProps) {
  const [skillInput, setSkillInput] = useState('')

  const addSkill = () => {
    const trimmed = skillInput.trim()
    if (trimmed && !profileData.skills.includes(trimmed)) {
      onProfileChange({ ...profileData, skills: [...profileData.skills, trimmed] })
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    onProfileChange({ ...profileData, skills: profileData.skills.filter(s => s !== skill) })
  }

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill()
    }
  }

  const isValid = profileData.skills.length > 0 && profileData.desiredRole.trim().length > 0

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-9 w-72 mb-3" />
          <Skeleton className="h-5 w-[420px]" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border border-border/60 shadow-sm">
            <CardContent className="p-8 space-y-5">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </CardContent>
          </Card>
          <Card className="border border-border/60 shadow-sm">
            <CardContent className="p-8 space-y-5">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </CardContent>
          </Card>
        </div>
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <FiUser className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Profile & Goals</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">Tell us about your background and career aspirations.</p>
          </div>
        </div>
      </div>

      {/* Two column form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <Card className="bg-card border border-border/60 shadow-sm shadow-indigo-500/[0.03] rounded-2xl overflow-hidden">
          <CardHeader className="pb-2 pt-7 px-7">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                <FiUser className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <CardTitle className="text-[15px] font-semibold tracking-tight">Background</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-7 pb-7">
            {/* Skills */}
            <div className="space-y-2.5">
              <Label className="text-sm font-medium text-foreground">Skills <span className="text-indigo-500">*</span></Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a skill and press Enter"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  className="flex-1 rounded-xl h-11 border-border/60 focus:border-indigo-400 focus:ring-indigo-400/20"
                />
                <Button variant="outline" size="icon" onClick={addSkill} className="rounded-xl h-11 w-11 flex-shrink-0 border-border/60 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600">
                  <FiPlus className="w-4 h-4" />
                </Button>
              </div>
              {profileData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {profileData.skills.map((skill) => (
                    <Badge key={skill} className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60 hover:bg-indigo-100">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors ml-0.5">
                        <FiX className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Experience */}
            <div className="space-y-2.5">
              <Label className="text-sm font-medium text-foreground">Experience</Label>
              <Textarea
                placeholder="Describe your work experience, notable projects, and achievements..."
                value={profileData.experience}
                onChange={(e) => onProfileChange({ ...profileData, experience: e.target.value })}
                rows={4}
                className="rounded-xl resize-none border-border/60 focus:border-indigo-400 focus:ring-indigo-400/20"
              />
            </div>

            {/* Education */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Education</Label>
              <Input
                placeholder="Degree (e.g., BS Computer Science)"
                value={profileData.degree}
                onChange={(e) => onProfileChange({ ...profileData, degree: e.target.value })}
                className="rounded-xl h-11 border-border/60 focus:border-indigo-400 focus:ring-indigo-400/20"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Institution"
                  value={profileData.institution}
                  onChange={(e) => onProfileChange({ ...profileData, institution: e.target.value })}
                  className="rounded-xl h-11 border-border/60 focus:border-indigo-400 focus:ring-indigo-400/20"
                />
                <Input
                  placeholder="Graduation Year"
                  value={profileData.graduationYear}
                  onChange={(e) => onProfileChange({ ...profileData, graduationYear: e.target.value })}
                  className="rounded-xl h-11 border-border/60 focus:border-indigo-400 focus:ring-indigo-400/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column */}
        <Card className="bg-card border border-border/60 shadow-sm shadow-indigo-500/[0.03] rounded-2xl overflow-hidden">
          <CardHeader className="pb-2 pt-7 px-7">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <FiTarget className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <CardTitle className="text-[15px] font-semibold tracking-tight">Career Goals</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-7 pb-7">
            {/* Industry */}
            <div className="space-y-2.5">
              <Label className="text-sm font-medium text-foreground">Target Industry</Label>
              <Select
                value={profileData.industry}
                onValueChange={(v) => onProfileChange({ ...profileData, industry: v })}
              >
                <SelectTrigger className="rounded-xl h-11 border-border/60 focus:border-indigo-400 focus:ring-indigo-400/20">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((ind) => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Desired Role */}
            <div className="space-y-2.5">
              <Label className="text-sm font-medium text-foreground">Desired Role <span className="text-indigo-500">*</span></Label>
              <Input
                placeholder="e.g., Senior Software Engineer, Data Scientist"
                value={profileData.desiredRole}
                onChange={(e) => onProfileChange({ ...profileData, desiredRole: e.target.value })}
                className="rounded-xl h-11 border-border/60 focus:border-indigo-400 focus:ring-indigo-400/20"
              />
            </div>

            {/* Timeline */}
            <div className="space-y-2.5">
              <Label className="text-sm font-medium text-foreground">Career Timeline</Label>
              <div className="grid grid-cols-2 gap-2.5">
                {timelines.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => onProfileChange({ ...profileData, timeline: t.value })}
                    className={cn(
                      'px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-200',
                      profileData.timeline === t.value
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                        : 'bg-background text-foreground border-border/60 hover:border-indigo-300 hover:bg-indigo-50/50'
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview summary */}
            {isValid && (
              <div className="rounded-xl bg-gradient-to-br from-indigo-50/80 to-violet-50/50 p-5 border border-indigo-200/40">
                <p className="text-[11px] text-indigo-500 font-semibold uppercase tracking-widest mb-2">Plan Preview</p>
                <p className="text-sm text-foreground leading-relaxed">
                  Generating a career plan for <strong className="text-indigo-700">{profileData.desiredRole}</strong>
                  {profileData.industry ? ` in ${profileData.industry}` : ''}
                  {profileData.timeline ? ` over ${timelines.find(t => t.value === profileData.timeline)?.label}` : ''}
                  {' '}leveraging {profileData.skills.length} skill{profileData.skills.length !== 1 ? 's' : ''}.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Error/Success messages */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200/60 text-red-700 text-sm">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-sm">
          <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">Career plan generated successfully! Navigating to your plan...</span>
        </div>
      )}

      {/* CTA */}
      <Button
        onClick={onGeneratePlan}
        disabled={!isValid || loading}
        className={cn(
          'w-full md:w-auto min-w-[280px] h-14 rounded-xl text-sm font-semibold transition-all duration-300',
          isValid && !loading
            ? 'bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30'
            : ''
        )}
        size="lg"
      >
        {loading ? (
          <span className="flex items-center gap-2.5">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating Career Plan...
          </span>
        ) : (
          <span className="flex items-center gap-2.5">
            Generate Career Plan
            <FiArrowRight className="w-4 h-4" />
          </span>
        )}
      </Button>
    </div>
  )
}
