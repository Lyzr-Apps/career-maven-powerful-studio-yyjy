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
import { FiPlus, FiX, FiArrowRight, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'

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
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="backdrop-blur-md bg-white/75 border-white/20 shadow-md">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <Card className="backdrop-blur-md bg-white/75 border-white/20 shadow-md">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Profile & Goals</h2>
        <p className="text-muted-foreground mt-1 leading-relaxed">Tell us about your background and career aspirations to generate a personalized plan.</p>
      </div>

      {/* Two column form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <Card className="backdrop-blur-md bg-white/75 border-white/20 shadow-md rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold tracking-tight">Background</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Skills */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Skills *</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a skill and press Enter"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  className="flex-1 rounded-xl"
                />
                <Button variant="outline" size="icon" onClick={addSkill} className="rounded-xl flex-shrink-0">
                  <FiPlus className="w-4 h-4" />
                </Button>
              </div>
              {profileData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {profileData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-medium">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-destructive transition-colors">
                        <FiX className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Experience</Label>
              <Textarea
                placeholder="Describe your work experience, notable projects, and achievements..."
                value={profileData.experience}
                onChange={(e) => onProfileChange({ ...profileData, experience: e.target.value })}
                rows={4}
                className="rounded-xl resize-none"
              />
            </div>

            {/* Education */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Education</Label>
              <Input
                placeholder="Degree (e.g., BS Computer Science)"
                value={profileData.degree}
                onChange={(e) => onProfileChange({ ...profileData, degree: e.target.value })}
                className="rounded-xl"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Institution"
                  value={profileData.institution}
                  onChange={(e) => onProfileChange({ ...profileData, institution: e.target.value })}
                  className="rounded-xl"
                />
                <Input
                  placeholder="Graduation Year"
                  value={profileData.graduationYear}
                  onChange={(e) => onProfileChange({ ...profileData, graduationYear: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column */}
        <Card className="backdrop-blur-md bg-white/75 border-white/20 shadow-md rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold tracking-tight">Career Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Industry */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Target Industry</Label>
              <Select
                value={profileData.industry}
                onValueChange={(v) => onProfileChange({ ...profileData, industry: v })}
              >
                <SelectTrigger className="rounded-xl">
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
            <div className="space-y-2">
              <Label className="text-sm font-medium">Desired Role *</Label>
              <Input
                placeholder="e.g., Senior Software Engineer, Data Scientist"
                value={profileData.desiredRole}
                onChange={(e) => onProfileChange({ ...profileData, desiredRole: e.target.value })}
                className="rounded-xl"
              />
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Career Timeline</Label>
              <div className="grid grid-cols-2 gap-2">
                {timelines.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => onProfileChange({ ...profileData, timeline: t.value })}
                    className={cn(
                      'px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200',
                      profileData.timeline === t.value
                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                        : 'bg-white/50 text-foreground border-border hover:bg-muted/60'
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview summary */}
            {isValid && (
              <div className="rounded-xl bg-muted/40 p-4 border border-border/50">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Plan Preview</p>
                <p className="text-sm text-foreground leading-relaxed">
                  Generating a career plan for <strong>{profileData.desiredRole}</strong>
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
        <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
          <FiCheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>Career plan generated successfully! Navigating to your plan...</span>
        </div>
      )}

      {/* CTA */}
      <Button
        onClick={onGeneratePlan}
        disabled={!isValid || loading}
        className="w-full md:w-auto min-w-[260px] h-12 rounded-xl text-sm font-semibold shadow-md transition-all duration-200 hover:shadow-lg"
        size="lg"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Generating Career Plan...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Generate Career Plan
            <FiArrowRight className="w-4 h-4" />
          </span>
        )}
      </Button>
    </div>
  )
}
