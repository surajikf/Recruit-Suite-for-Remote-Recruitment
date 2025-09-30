import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyCfOJHFXP2PbCjkByXj-D-Mr5kXui8zIp8');

export interface ResumeAnalysis {
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  experience_years: number;
  education: string[];
  summary: string;
  achievements: string[];
  parsed_text: string;
}

export interface JobMatch {
  candidate_id: string;
  candidate_name: string;
  match_score: number;
  matching_skills: string[];
  missing_skills: string[];
  reasons: string[];
}

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
    const prompt = `
    Analyze this resume text and extract the following information in JSON format:
    
    {
      "name": "Full name of the candidate",
      "email": "Email address",
      "phone": "Phone number if available",
      "skills": ["skill1", "skill2", "skill3"],
      "experience_years": number,
      "education": ["degree1", "degree2"],
      "summary": "Brief professional summary",
      "achievements": ["achievement1", "achievement2"],
      "parsed_text": "Cleaned and formatted resume text"
    }
    
    Instructions:
    - Extract all technical skills, programming languages, frameworks, tools
    - Calculate total years of professional experience
    - Include all educational qualifications
    - Create a concise professional summary
    - List key achievements and accomplishments
    - Clean and format the resume text for better readability
    - Return ONLY valid JSON, no additional text
    
    Resume Text:
    ${resumeText}
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      const analysis = JSON.parse(jsonMatch[0]);
      
      // Validate and clean the data
      return {
        name: analysis.name || 'Unknown',
        email: analysis.email || '',
        phone: analysis.phone || '',
        skills: Array.isArray(analysis.skills) ? analysis.skills : [],
        experience_years: typeof analysis.experience_years === 'number' ? analysis.experience_years : 0,
        education: Array.isArray(analysis.education) ? analysis.education : [],
        summary: analysis.summary || '',
        achievements: Array.isArray(analysis.achievements) ? analysis.achievements : [],
        parsed_text: analysis.parsed_text || resumeText
      };
    } catch (error) {
      console.error('Error analyzing resume:', error);
      throw new Error('Failed to analyze resume with AI');
    }
  }

  async matchCandidateToJob(candidateText: string, jobDescription: string, jobSkills: string[]): Promise<JobMatch> {
    const prompt = `
    Analyze how well this candidate matches the job requirements and provide a detailed assessment.
    
    Job Description: ${jobDescription}
    Required Skills: ${jobSkills.join(', ')}
    
    Candidate Resume: ${candidateText}
    
    Provide your analysis in JSON format:
    {
      "match_score": number (0-100),
      "matching_skills": ["skill1", "skill2"],
      "missing_skills": ["skill1", "skill2"],
      "reasons": ["reason1", "reason2", "reason3"]
    }
    
    Instructions:
    - Calculate match score based on skills alignment, experience relevance, and overall fit
    - List skills that match between candidate and job requirements
    - List skills that are missing from the candidate
    - Provide 3 specific reasons for the match score
    - Be objective and detailed in your assessment
    - Return ONLY valid JSON, no additional text
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      const match = JSON.parse(jsonMatch[0]);
      
      return {
        candidate_id: '', // Will be set by caller
        candidate_name: '', // Will be set by caller
        match_score: Math.max(0, Math.min(100, match.match_score || 0)),
        matching_skills: Array.isArray(match.matching_skills) ? match.matching_skills : [],
        missing_skills: Array.isArray(match.missing_skills) ? match.missing_skills : [],
        reasons: Array.isArray(match.reasons) ? match.reasons : []
      };
    } catch (error) {
      console.error('Error matching candidate to job:', error);
      throw new Error('Failed to match candidate with AI');
    }
  }

  async generateJobDescription(jobTitle: string, requirements: string[]): Promise<string> {
    const prompt = `
    Generate a professional job description for the position: ${jobTitle}
    
    Requirements: ${requirements.join(', ')}
    
    Create a comprehensive job description that includes:
    - Job title and overview
    - Key responsibilities
    - Required qualifications
    - Preferred qualifications
    - Company benefits
    - Application instructions
    
    Make it professional, engaging, and detailed. Format it properly with clear sections.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating job description:', error);
      throw new Error('Failed to generate job description with AI');
    }
  }

  async generateInterviewQuestions(jobTitle: string, skills: string[]): Promise<string[]> {
    const prompt = `
    Generate 10 relevant interview questions for a ${jobTitle} position.
    
    Required Skills: ${skills.join(', ')}
    
    Include a mix of:
    - Technical questions
    - Behavioral questions
    - Situational questions
    - Role-specific questions
    
    Return the questions as a JSON array of strings.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON array found in response');
      }
      
      const questions = JSON.parse(jsonMatch[0]);
      return Array.isArray(questions) ? questions : [];
    } catch (error) {
      console.error('Error generating interview questions:', error);
      throw new Error('Failed to generate interview questions with AI');
    }
  }

  async analyzeHiringTrends(candidates: any[], jobs: any[]): Promise<string> {
    const prompt = `
    Analyze the following recruitment data and provide insights:
    
    Candidates: ${candidates.length} total
    Jobs: ${jobs.length} total
    
    Candidate Skills Distribution: ${this.extractSkillsDistribution(candidates)}
    Job Requirements: ${this.extractJobRequirements(jobs)}
    
    Provide insights on:
    - Skills gap analysis
    - Hiring trends
    - Recommendations for improvement
    - Market insights
    
    Format as a comprehensive report with clear sections and actionable recommendations.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error analyzing hiring trends:', error);
      throw new Error('Failed to analyze hiring trends with AI');
    }
  }

  private extractSkillsDistribution(candidates: any[]): string {
    const skillCounts: Record<string, number> = {};
    candidates.forEach(candidate => {
      candidate.skills?.forEach((skill: string) => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });
    
    return Object.entries(skillCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([skill, count]) => `${skill}: ${count}`)
      .join(', ');
  }

  private extractJobRequirements(jobs: any[]): string {
    const skillCounts: Record<string, number> = {};
    jobs.forEach(job => {
      job.skills?.forEach((skill: string) => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });
    
    return Object.entries(skillCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([skill, count]) => `${skill}: ${count}`)
      .join(', ');
  }
}

export const geminiService = new GeminiService();
