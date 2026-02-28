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
  executive_summary: 'Based on your strong foundation in data analysis and machine learning, transitioning to a Senior Data Scientist role within 12 months is achievable. Focus on deepening your ML engineering skills, gaining experience with production-level deployments, and building a portfolio of impactful projects. Your fintech background provides a strong advantage in industries that value data-driven decision making. The roadmap below prioritizes high-impact skills first, followed by leadership development and strategic job search execution.',
  overall_timeline_months: 12,
  career_roadmap: [
    {
      milestone_number: 1,
      title: 'Strengthen ML Engineering Foundations',
      description: 'Deepen understanding of advanced ML algorithms, feature engineering, and model evaluation techniques. Build a solid theoretical foundation in neural networks, ensemble methods, and optimization algorithms that will serve as the backbone of your senior-level expertise.',
      timeline_months: 'Months 1-3',
      required_skills: ['Advanced ML Algorithms', 'Feature Engineering', 'Model Evaluation', 'Python OOP', 'Linear Algebra', 'Probability Theory'],
      action_steps: ['Complete Andrew Ng Deep Learning Specialization on Coursera', 'Build 2 end-to-end ML projects with full documentation on GitHub', 'Contribute to open-source ML libraries (scikit-learn, XGBoost)', 'Read and implement 3 landmark ML papers from arxiv'],
    },
    {
      milestone_number: 2,
      title: 'Production ML & MLOps',
      description: 'Learn to deploy, monitor, and maintain ML models in production environments. Master the tools and practices that separate data scientists from ML engineers, including containerization, experiment tracking, and automated pipelines.',
      timeline_months: 'Months 3-6',
      required_skills: ['Docker', 'MLflow', 'CI/CD', 'Cloud Platforms (AWS/GCP)', 'Kubernetes Basics', 'Airflow'],
      action_steps: ['Deploy a model using FastAPI + Docker to AWS ECS', 'Set up MLflow experiment tracking for all projects', 'Complete AWS ML Specialty certification', 'Build an automated retraining pipeline with Airflow'],
    },
    {
      milestone_number: 3,
      title: 'Advanced NLP & Deep Learning Applications',
      description: 'Specialize in natural language processing and transformer-based models, which are increasingly demanded in senior data science roles. Build practical applications using LLMs and fine-tuning techniques.',
      timeline_months: 'Months 5-8',
      required_skills: ['Transformers', 'NLP Pipeline Design', 'Fine-tuning LLMs', 'Hugging Face', 'RAG Architecture'],
      action_steps: ['Complete the Hugging Face NLP course', 'Fine-tune a pre-trained model for a domain-specific task', 'Build a RAG-based Q&A system using your fintech domain knowledge', 'Publish a technical blog post on your NLP project'],
    },
    {
      milestone_number: 4,
      title: 'Leadership & Communication',
      description: 'Develop skills to lead data science initiatives, mentor junior team members, and present findings to stakeholders. Senior roles require not just technical excellence but the ability to influence decisions and drive organizational impact.',
      timeline_months: 'Months 6-9',
      required_skills: ['Technical Presentation', 'Stakeholder Management', 'Mentoring', 'Project Scoping', 'A/B Testing Strategy', 'Cross-functional Collaboration'],
      action_steps: ['Present at a local data science meetup or conference', 'Mentor a junior analyst through a complete project', 'Write 3 technical blog posts on Medium or your personal site', 'Lead a cross-functional data initiative at your current role'],
    },
    {
      milestone_number: 5,
      title: 'Portfolio & Personal Branding',
      description: 'Build a compelling professional presence that showcases your expertise. A strong portfolio and online presence significantly increase interview callbacks and demonstrate thought leadership.',
      timeline_months: 'Months 8-10',
      required_skills: ['Technical Writing', 'Portfolio Development', 'Networking', 'GitHub Best Practices'],
      action_steps: ['Build a portfolio website showcasing 4-5 best projects', 'Publish 5 articles on data science topics in your niche', 'Grow LinkedIn presence to 1000+ relevant connections', 'Contribute answers on Stack Overflow or Kaggle competitions'],
    },
    {
      milestone_number: 6,
      title: 'Job Search & Interview Preparation',
      description: 'Prepare for and execute a targeted job search for Senior Data Scientist positions. Focus on companies that align with your fintech background and ML engineering strengths.',
      timeline_months: 'Months 10-12',
      required_skills: ['System Design', 'Case Studies', 'Behavioral Interviewing', 'Salary Negotiation', 'Take-home Assignment Excellence'],
      action_steps: ['Update portfolio website with latest projects', 'Practice 20+ mock interviews covering technical, behavioral, and system design', 'Apply to 15-20 targeted positions at top-tier companies', 'Prepare 5 detailed STAR stories for behavioral interviews', 'Research compensation benchmarks and practice negotiation'],
    },
  ],
  skill_gaps: [
    {
      skill_name: 'Deep Learning',
      current_level: 'Beginner',
      required_level: 'Advanced',
      importance: 'High',
      resources: [
        { name: 'Deep Learning Specialization (Coursera)', type: 'Course', description: 'Comprehensive deep learning course by Andrew Ng covering CNNs, RNNs, and transformers. 5-course series with hands-on assignments.' },
        { name: 'PyTorch Tutorials', type: 'Tutorial', description: 'Official PyTorch tutorials for hands-on deep learning implementation with practical examples.' },
        { name: 'Fast.ai Practical Deep Learning', type: 'Course', description: 'Top-down approach to deep learning with practical projects from day one. Free and highly recommended.' },
      ],
    },
    {
      skill_name: 'MLOps & Model Deployment',
      current_level: 'None',
      required_level: 'Intermediate',
      importance: 'High',
      resources: [
        { name: 'Made With ML', type: 'Course', description: 'Free course on ML engineering and MLOps best practices covering the full ML lifecycle.' },
        { name: 'AWS ML Specialty Cert', type: 'Certification', description: 'AWS certification validating ML deployment skills on cloud infrastructure.' },
        { name: 'MLOps Zoomcamp (DataTalksClub)', type: 'Course', description: 'Free hands-on course covering experiment tracking, orchestration, deployment, and monitoring.' },
      ],
    },
    {
      skill_name: 'Natural Language Processing',
      current_level: 'Beginner',
      required_level: 'Intermediate',
      importance: 'High',
      resources: [
        { name: 'Hugging Face NLP Course', type: 'Course', description: 'Free comprehensive course on modern NLP with transformers, fine-tuning, and deployment.' },
        { name: 'Speech and Language Processing (Jurafsky)', type: 'Book', description: 'Definitive textbook on NLP fundamentals and modern approaches. Free online edition available.' },
        { name: 'Build a RAG Application Project', type: 'Project', description: 'Hands-on project building a retrieval-augmented generation system using LangChain and vector databases.' },
      ],
    },
    {
      skill_name: 'System Design for ML',
      current_level: 'Beginner',
      required_level: 'Intermediate',
      importance: 'High',
      resources: [
        { name: 'Designing ML Systems (O\'Reilly)', type: 'Book', description: 'Practical guide to designing production ML systems by Chip Huyen. Covers the complete lifecycle.' },
        { name: 'ML System Design Interview (Alibaba)', type: 'Book', description: 'Focused preparation for ML system design interviews with real-world case studies.' },
        { name: 'Stanford CS 329S: ML Systems Design', type: 'Course', description: 'Stanford course materials on designing, building, and serving ML systems at scale.' },
      ],
    },
    {
      skill_name: 'Cloud Computing (AWS/GCP)',
      current_level: 'Beginner',
      required_level: 'Intermediate',
      importance: 'Medium',
      resources: [
        { name: 'AWS Cloud Practitioner', type: 'Certification', description: 'Entry-level AWS certification to build foundational cloud knowledge.' },
        { name: 'Google Cloud ML Engineer Path', type: 'Course', description: 'Structured learning path for ML on Google Cloud Platform with hands-on labs.' },
      ],
    },
    {
      skill_name: 'Technical Communication',
      current_level: 'Intermediate',
      required_level: 'Advanced',
      importance: 'Medium',
      resources: [
        { name: 'Storytelling with Data', type: 'Book', description: 'Learn to communicate data insights effectively through compelling visualizations and narratives.' },
        { name: 'Toastmasters International', type: 'Practice', description: 'Join a local chapter for regular public speaking practice and structured feedback.' },
        { name: 'Writing for Data Scientists (O\'Reilly)', type: 'Book', description: 'Guide to technical writing specifically for data professionals communicating with diverse audiences.' },
      ],
    },
  ],
}

const SAMPLE_SESSIONS: InterviewSession[] = [
  {
    id: 'sample_1',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Technical',
    difficulty: 'Hard',
    targetRole: 'Senior Data Scientist',
    messages: [
      { role: 'agent', content: 'Welcome to your hard-level technical interview for a Senior Data Scientist role. Let us begin. Can you walk me through how you would design a real-time fraud detection system for a fintech platform processing millions of transactions daily?', timestamp: '', questionNumber: 1, questionCategory: 'System Design', difficultyLevel: 'Hard' },
      { role: 'user', content: 'I would design a two-stage system: a fast rule-based filter for obvious fraud patterns running at sub-millisecond latency, followed by an ML model using gradient-boosted trees for nuanced detection. Features would include transaction velocity, geolocation anomalies, device fingerprinting, and merchant category patterns. I\'d use Apache Kafka for real-time streaming, with feature stores in Redis for low-latency lookups.', timestamp: '' },
      { role: 'agent', content: 'Excellent system design thinking. Now, explain the mathematical intuition behind gradient boosting and why it might be preferred over deep learning for tabular fraud data.', timestamp: '', questionNumber: 2, questionCategory: 'ML Theory', difficultyLevel: 'Hard', feedback: { score: 9, strengths: 'Outstanding system design with clear justification for each component. Excellent mention of streaming architecture and feature store patterns.', improvements: 'Could discuss model monitoring, concept drift detection, and how to handle the severe class imbalance inherent in fraud detection.', tip: 'Always address data quality and drift monitoring when discussing production ML systems.' } },
      { role: 'user', content: 'Gradient boosting builds trees sequentially, where each new tree corrects the residual errors of the ensemble so far. It minimizes a loss function via gradient descent in function space. For tabular data, GBMs outperform deep learning because they handle heterogeneous features, require less data, and are more interpretable. The split-based learning naturally handles feature interactions without manual engineering.', timestamp: '' },
      { role: 'agent', content: 'Strong theoretical answer. How would you handle a scenario where your model performance degrades over time due to adversarial drift from fraudsters adapting their strategies?', timestamp: '', questionNumber: 3, questionCategory: 'ML Engineering', difficultyLevel: 'Hard', feedback: { score: 8, strengths: 'Solid mathematical understanding with clear explanation of gradient descent in function space. Good comparison with deep learning.', improvements: 'Could mention specific loss functions (log loss for classification), learning rate scheduling, and regularization techniques like max depth and subsampling.', tip: 'When discussing algorithms, always tie theory back to practical implications and hyperparameter choices.' } },
      { role: 'user', content: 'I would implement continuous monitoring with statistical tests like PSI and KS tests to detect distribution shifts. Set up automated alerts when model performance drops below thresholds. Use online learning or periodic retraining with recent data. Also build a human-in-the-loop feedback system where fraud analysts flag false negatives that feed back into training data.', timestamp: '' },
      { role: 'agent', content: 'Excellent approach to model maintenance. Final question: Design an A/B testing framework for evaluating a new fraud model against the existing one, considering that false negatives in fraud detection have asymmetric costs.', timestamp: '', questionNumber: 4, questionCategory: 'Experimentation', difficultyLevel: 'Hard', feedback: { score: 9, strengths: 'Comprehensive strategy covering detection, automated response, and human feedback. Excellent mention of PSI and KS tests.', improvements: 'Could discuss champion-challenger model patterns and shadow mode deployment for safer rollouts.', tip: 'Mention specific tools like Evidently AI or WhyLabs for production monitoring.' }, anxietyTip: 'You are doing great. Take a deep breath and remember that interviewers want to see your thought process, not just the perfect answer. Structured thinking always impresses.' },
      { role: 'user', content: 'For fraud A/B testing, I would avoid traditional random splitting since it could expose users to real fraud. Instead, I would use a shadow mode approach where the new model scores alongside the existing one but only the incumbent makes decisions. Compare precision-recall curves with cost-weighted metrics. Use sequential testing with spending functions to detect improvements early while controlling for multiple comparisons.', timestamp: '' },
      { role: 'agent', content: 'Interview complete. Here is your performance summary.', timestamp: '', messageType: 'summary', feedback: { score: 9, strengths: 'Excellent understanding of experimentation in high-stakes environments. Shadow mode is the correct approach for fraud models.', improvements: 'Could quantify the cost asymmetry more explicitly and discuss how to set appropriate sample sizes for the shadow test.', tip: 'Always frame A/B testing in terms of business impact and risk when discussing safety-critical systems.' } },
    ],
    performanceSummary: { overall_score: 88, total_questions: 4, strengths: ['Exceptional system design thinking', 'Strong ML theory fundamentals', 'Excellent production ML awareness', 'Good experimentation methodology'], improvement_areas: ['Could provide more quantitative examples', 'Deeper dive into monitoring tools', 'More explicit cost-benefit analysis'], tips: ['Practice whiteboard system design diagrams', 'Prepare 2-3 detailed case studies from your work experience', 'Quantify impact whenever possible'], confidence_assessment: 'High confidence with strong technical depth. Ready for senior-level technical interviews at top-tier companies.' },
  },
  {
    id: 'sample_2',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Behavioral',
    difficulty: 'Medium',
    targetRole: 'Senior Data Scientist',
    messages: [
      { role: 'agent', content: 'Let us start with a behavioral interview focused on your leadership and collaboration skills. Tell me about a time when you had to convince stakeholders to adopt a data-driven approach over their intuition.', timestamp: '', questionNumber: 1, questionCategory: 'Influence & Persuasion', difficultyLevel: 'Medium' },
      { role: 'user', content: 'At my fintech startup, the marketing team wanted to increase spend on a channel they believed was performing well. I analyzed attribution data and found the channel was over-credited due to last-touch attribution. I presented a multi-touch attribution model showing the true incremental value, which revealed the channel was only 40% as effective as believed. I ran a controlled experiment to validate, and the team reallocated $500K in annual spend to higher-performing channels.', timestamp: '' },
      { role: 'agent', content: 'Good use of data to challenge assumptions. Now, tell me about a time you failed at a project or made a significant mistake. How did you handle it?', timestamp: '', questionNumber: 2, questionCategory: 'Resilience & Growth', difficultyLevel: 'Medium', feedback: { score: 8, strengths: 'Excellent use of the STAR format with specific metrics and outcomes. Strong demonstration of data-driven decision making and influence.', improvements: 'Could elaborate more on the emotional dynamics - how did stakeholders initially react? How did you handle pushback? This shows emotional intelligence.', tip: 'When discussing influence, always mention the human element - empathy, active listening, and meeting people where they are.' }, anxietyTip: 'Remember that behavioral questions are about YOUR story. There are no wrong answers - just be authentic and structured.' },
      { role: 'user', content: 'I once deployed a pricing optimization model that had a bug in the feature engineering pipeline. It recommended aggressive price increases for a segment of loyal customers. We caught it after 48 hours when customer complaints spiked. I immediately took ownership, rolled back the changes, personally apologized to affected customers, and implemented a comprehensive testing framework including shadow testing, canary deployments, and automated anomaly detection on model outputs. The experience taught me that model validation is not just about accuracy metrics but about understanding business impact.', timestamp: '' },
      { role: 'agent', content: 'Great demonstration of accountability and learning. Describe a situation where you had to work with a difficult colleague or cross-functional team with competing priorities.', timestamp: '', questionNumber: 3, questionCategory: 'Collaboration & Conflict', difficultyLevel: 'Medium', feedback: { score: 9, strengths: 'Excellent vulnerability and honesty. Strong demonstration of accountability, rapid response, and systemic improvement. The lesson learned shows genuine growth.', improvements: 'Could quantify the impact of the bug more specifically (revenue lost, customers affected) and the results of the new testing framework.', tip: 'Failure stories are powerful when you show concrete systemic changes you implemented to prevent recurrence.' } },
      { role: 'user', content: 'Our engineering team was reluctant to prioritize ML model serving infrastructure because they viewed it as a data science problem. I scheduled regular syncs, created a shared roadmap showing how model latency directly impacted customer conversion rates, and proposed a compromise where we would containerize our models to fit their existing deployment pipeline. Within two months we had a collaborative ML platform that both teams owned.', timestamp: '' },
      { role: 'agent', content: 'Interview complete. Here is your performance summary.', timestamp: '', messageType: 'summary', feedback: { score: 8, strengths: 'Good collaborative approach showing empathy and pragmatism. Nice demonstration of finding common ground through shared business metrics.', improvements: 'Could provide more detail on specific tension points and how you navigated emotional dynamics during the disagreements.', tip: 'Practice articulating the emotional journey in conflict stories - it shows self-awareness and emotional intelligence.' } },
    ],
    performanceSummary: { overall_score: 83, total_questions: 3, strengths: ['Strong STAR format usage', 'Excellent accountability in failure stories', 'Good at quantifying impact', 'Demonstrates genuine learning and growth'], improvement_areas: ['Deeper emotional intelligence demonstrations', 'More detail on interpersonal dynamics', 'Could share more about personal feelings during challenges'], tips: ['Prepare 5-7 detailed STAR stories covering leadership, failure, conflict, innovation, and ambiguity', 'Practice expressing emotions and personal reflections in answers', 'Always end failure stories with systemic improvements you drove'], confidence_assessment: 'Good confidence with authentic storytelling. Behavioral skills are strong - focus on adding emotional depth to answers.' },
  },
  {
    id: 'sample_3',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Technical',
    difficulty: 'Medium',
    targetRole: 'Senior Data Scientist',
    messages: [
      { role: 'agent', content: 'Welcome to your technical interview. Let us start with a fundamental question. Explain the difference between L1 and L2 regularization, and when you would use each.', timestamp: '', questionNumber: 1, questionCategory: 'ML Fundamentals', difficultyLevel: 'Medium' },
      { role: 'user', content: 'L1 regularization adds the absolute value of coefficients as a penalty term, which tends to produce sparse solutions by driving some coefficients to exactly zero - useful for feature selection. L2 regularization adds the squared magnitude, which shrinks coefficients uniformly but rarely to zero. I use L1 when I suspect many irrelevant features and want automatic feature selection, and L2 when all features are potentially relevant but I want to prevent any single feature from dominating.', timestamp: '' },
      { role: 'agent', content: 'Great explanation. How would you approach building a recommendation system for a new e-commerce platform with limited user interaction data?', timestamp: '', questionNumber: 2, questionCategory: 'Applied ML', difficultyLevel: 'Medium', feedback: { score: 8, strengths: 'Clear and accurate explanation with practical guidance on when to use each. Good understanding of the sparsity-inducing property of L1.', improvements: 'Could mention Elastic Net as a combination approach and discuss the geometric intuition (diamond vs. circle constraint regions).', tip: 'For regularization questions, drawing the constraint geometry can be a powerful visual explanation.' } },
      { role: 'user', content: 'For cold start, I would begin with content-based filtering using item features like category, price, and description embeddings. As user data accumulates, transition to collaborative filtering. I would use a hybrid approach: matrix factorization for users with history, and a neural network that combines user demographics with item features for new users. Implement bandits for exploration to gather diverse interaction data quickly.', timestamp: '' },
      { role: 'agent', content: 'Solid approach to the cold start problem. Can you explain how you would evaluate the recommendation system beyond simple accuracy metrics?', timestamp: '', questionNumber: 3, questionCategory: 'Evaluation', difficultyLevel: 'Medium', feedback: { score: 7, strengths: 'Good multi-phase strategy addressing the cold start problem. Nice mention of bandits for exploration.', improvements: 'Could discuss specific architectures (two-tower models, transformers for sequential recommendations) and how to handle implicit feedback vs explicit ratings.', tip: 'Always mention the distinction between offline evaluation (precision@k, NDCG) and online evaluation (A/B tests, engagement metrics) for recommendation systems.' }, anxietyTip: 'If you feel stuck on a question, it is perfectly fine to pause and organize your thoughts. Taking 10 seconds to structure your answer is always better than rushing into an unorganized response.' },
      { role: 'user', content: 'Beyond accuracy, I would track diversity metrics to ensure recommendations are not too narrow, novelty scores to surface items users have not seen, and coverage to make sure the long tail gets exposure. For business metrics, track click-through rate, conversion rate, average order value, and user retention. Use interleaving experiments for faster online evaluation before committing to full A/B tests.', timestamp: '' },
      { role: 'agent', content: 'Interview complete. Here is your performance summary.', timestamp: '', messageType: 'summary', feedback: { score: 8, strengths: 'Excellent holistic evaluation framework considering both technical and business metrics. Good mention of interleaving.', improvements: 'Could discuss fairness metrics and how recommendations might create filter bubbles.', tip: 'When discussing evaluation, always consider the ethical dimension - recommender systems can amplify biases.' } },
    ],
    performanceSummary: { overall_score: 78, total_questions: 3, strengths: ['Strong ML fundamentals', 'Good practical system design', 'Holistic evaluation thinking', 'Clear communication'], improvement_areas: ['Deeper architectural knowledge for recommendations', 'Could discuss fairness and ethical considerations', 'More specific tool and framework mentions'], tips: ['Study two-tower and sequential recommendation architectures', 'Prepare examples of evaluation frameworks you have built', 'Read about ML fairness and responsible AI'], confidence_assessment: 'Good confidence, could be more assertive in answers. Technical depth is solid but would benefit from more breadth in modern architectures.' },
  },
  {
    id: 'sample_4',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Mixed',
    difficulty: 'Easy',
    targetRole: 'Senior Data Scientist',
    messages: [
      { role: 'agent', content: 'Let us do a mixed interview combining both technical and behavioral questions. First, tell me: what is your favorite machine learning algorithm and why?', timestamp: '', questionNumber: 1, questionCategory: 'ML Passion', difficultyLevel: 'Easy' },
      { role: 'user', content: 'XGBoost is my go-to algorithm. It consistently performs well on tabular data, handles missing values natively, offers built-in regularization, and provides feature importance scores for interpretability. In my churn prediction work, it outperformed deep learning models while being 10x faster to train and much easier to explain to stakeholders.', timestamp: '' },
      { role: 'agent', content: 'Great practical choice. Now a behavioral question: why do you want to move from a Data Analyst to a Senior Data Scientist role?', timestamp: '', questionNumber: 2, questionCategory: 'Career Motivation', difficultyLevel: 'Easy', feedback: { score: 8, strengths: 'Practical and well-reasoned answer with real-world evidence from your own experience. Shows maturity in algorithm selection.', improvements: 'Could mention scenarios where XGBoost is not the best choice to show breadth of knowledge.', tip: 'Showing awareness of when NOT to use your favorite tool demonstrates deeper expertise.' } },
      { role: 'user', content: 'I want to move from descriptive analytics to building predictive and prescriptive systems that directly drive business decisions. As a Data Analyst, I identified patterns. As a Data Scientist, I want to build models that act on those patterns. I am passionate about creating ML systems that measurably improve outcomes, and a Senior role would let me mentor others and shape the data science strategy for the organization.', timestamp: '' },
      { role: 'agent', content: 'Interview complete. Here is your performance summary.', timestamp: '', messageType: 'summary', feedback: { score: 8, strengths: 'Clear career narrative showing intentional growth and strong motivation. Good distinction between analyst and scientist roles.', improvements: 'Could provide specific examples of the impact you want to create and concrete leadership goals.', tip: 'Always connect your career motivation to specific impact you want to have on the organization and the broader field.' } },
    ],
    performanceSummary: { overall_score: 72, total_questions: 2, strengths: ['Clear career motivation', 'Practical algorithm knowledge', 'Good self-awareness'], improvement_areas: ['Need more depth in technical answers', 'Could articulate leadership vision more concretely', 'Practice longer, more detailed responses'], tips: ['Extend answers to 2-3 minutes for deeper impression', 'Prepare a 30-second elevator pitch for your career transition story', 'Have specific examples ready for every claim you make'], confidence_assessment: 'Moderate confidence, building well. The foundation is solid - focus on depth and detail to reach senior-level interview performance.' },
  },
  {
    id: 'sample_5',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Behavioral',
    difficulty: 'Easy',
    targetRole: 'Senior Data Scientist',
    messages: [
      { role: 'agent', content: 'Tell me about a time you led a project that had a significant impact on your team.', timestamp: '', questionNumber: 1, questionCategory: 'Leadership', difficultyLevel: 'Easy' },
      { role: 'user', content: 'I led a churn prediction project that reduced customer churn by 15% and saved $2M annually. I coordinated with engineering to deploy the model, worked with marketing to design intervention campaigns, and presented results to the C-suite.', timestamp: '' },
      { role: 'agent', content: 'Good start. Can you tell me about a time you had to learn a new technology quickly to meet a deadline?', timestamp: '', questionNumber: 2, questionCategory: 'Adaptability', difficultyLevel: 'Easy', feedback: { score: 7, strengths: 'Good use of metrics and cross-functional collaboration. Results-oriented storytelling.', improvements: 'STAR method structure needs work - need more detail on the Situation context, specific Tasks you owned, and what made your Actions effective.', tip: 'Use the STAR format consistently: spend 20% on Situation, 10% on Task, 50% on Action, 20% on Result.' } },
      { role: 'user', content: 'When we needed to migrate our data pipeline from batch to real-time processing, I taught myself Apache Kafka in two weeks by following tutorials, building a proof of concept, and pairing with a senior engineer. I delivered the migration on time, reducing data latency from 24 hours to under 5 minutes.', timestamp: '' },
      { role: 'agent', content: 'Interview complete. Here is your performance summary.', timestamp: '', messageType: 'summary', feedback: { score: 7, strengths: 'Shows strong learning agility and practical problem-solving. Good quantification of improvement.', improvements: 'Could provide more context on WHY real-time was needed and the challenges encountered during learning.', tip: 'Learning stories are powerful - always mention your specific learning strategy and how you validated your understanding.' } },
    ],
    performanceSummary: { overall_score: 70, total_questions: 2, strengths: ['Good use of metrics', 'Results-oriented', 'Shows learning agility'], improvement_areas: ['STAR method structure', 'More detail on challenges and feelings', 'Longer, more detailed responses'], tips: ['Use the STAR format consistently', 'Prepare 5 detailed stories covering common behavioral themes', 'Practice telling each story in 2-3 minutes'], confidence_assessment: 'Moderate confidence, room for growth. The raw material is good - needs more polish and structure in delivery.' },
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
