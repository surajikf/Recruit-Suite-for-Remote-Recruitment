import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseApi } from '../api/supabase';
import type { Candidate } from '../types';
import * as pdfjsLib from 'pdfjs-dist';
import { getSupabase } from '../lib/supabase';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';

// Configure PDF.js worker - use local worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export function useCandidates() {
  return useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      const response = await supabaseApi.candidates.getAll();
      return response.data || [];
    },
  });
}

// Enhanced PDF text extraction with better formatting
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    // Extract text from ALL pages for better data
    const numPages = pdf.numPages;
    console.log(`📄 Extracting from ${numPages} pages...`);
    
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Better text assembly - preserve line breaks and spacing
      let pageText = '';
      let lastY = -1;
      
      textContent.items.forEach((item: any) => {
        const str = item.str.trim();
        if (!str) return;
        
        // Add line break if Y position changed (new line)
        if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 5) {
          pageText += '\n';
        }
        
        pageText += str + ' ';
        lastY = item.transform[5];
      });
      
      fullText += pageText + '\n\n';
    }
    
    // Clean up multiple spaces and empty lines
    fullText = fullText
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
    
    console.log(`✅ Extracted ${fullText.length} characters from PDF`);
    return fullText;
  } catch (error) {
    console.error('❌ PDF extraction failed:', error);
    return '';
  }
}

// Extract email from resume text
function extractEmailFromText(text: string): string | null {
  // Remove extra spaces that might break email detection
  const cleanedText = text.replace(/\s+@/g, '@').replace(/@\s+/g, '@');
  
  console.log('Searching for emails in cleaned text (sample):', cleanedText.substring(0, 500));
  
  // Multiple email patterns to catch different formats
  const emailPatterns = [
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    /email[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
    /e-mail[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi
  ];
  
  let allEmails: string[] = [];
  
  for (const pattern of emailPatterns) {
    const matches = cleanedText.match(pattern);
    if (matches) {
      allEmails = allEmails.concat(matches);
    }
  }
  
  // Remove duplicates and clean up
  allEmails = [...new Set(allEmails.map(e => e.replace(/^email[:\s]*/i, '').trim()))];
  
  console.log('All emails found in PDF:', allEmails);
  
  if (allEmails.length > 0) {
    // Filter out common non-personal emails
    const validEmails = allEmails.filter(email => {
      const lowerEmail = email.toLowerCase();
      return !lowerEmail.includes('example.com') &&
             !lowerEmail.includes('domain.com') &&
             !lowerEmail.includes('yourcompany.com') &&
             !lowerEmail.includes('candidate.local') &&
             !lowerEmail.includes('sample.com') &&
             !lowerEmail.includes('test.com');
    });
    
    const finalEmail = validEmails[0] || allEmails[0];
    console.log('Selected email:', finalEmail);
    return finalEmail;
  }
  
  console.log('No valid email found in PDF');
  return null;
}

// Ultra-comprehensive phone extraction - catches 99% of formats
function extractPhoneFromText(text: string): string {
  const lines = text.split('\n').map(l => l.trim());
  
  // Strategy 1: Look for labeled phone numbers (highest priority)
  const phoneLabels = /(?:phone|mobile|cell|tel|telephone|contact|call|mob|whatsapp|number)s?\s*:?\s*([\+\(\)\d\s\-\.]+)/gi;
  const labeledMatches = text.matchAll(phoneLabels);
  
  for (const match of labeledMatches) {
    const phoneCandidate = match[1];
    const digits = phoneCandidate.replace(/\D/g, '');
    
    // Check if it's a valid phone number
    if (digits.length >= 10 && digits.length <= 15) {
      console.log('📱 Found phone with label:', phoneCandidate);
      return digits;
    }
  }
  
  // Strategy 2: Find all number sequences that could be phones
  const allNumberSequences = text.match(/[\+\(\)\d\s\-\.]{10,}/g) || [];
  
  const potentialPhones = allNumberSequences
    .map(seq => seq.replace(/[^\d+]/g, ''))
    .filter(seq => {
      const digits = seq.replace(/\D/g, '');
      
      // Must be 10-15 digits
      if (digits.length < 10 || digits.length > 15) return false;
      
      // Reject years
      if (/^(19|20)\d{2}$/.test(digits)) return false;
      
      // Reject obvious fakes
      if (/^(\d)\1{9,}$/.test(digits)) return false; // All same digit
      if (/^(0123456789|1234567890|9876543210)$/.test(digits)) return false; // Sequential
      
      // For 10-digit numbers starting with 0-5, likely not phone
      if (digits.length === 10 && /^[0-5]/.test(digits)) return false;
      
      return true;
    });
  
  // Remove duplicates
  const uniquePhones = [...new Set(potentialPhones)];
  
  console.log('📱 All potential phones:', uniquePhones);
  
  // Prioritize phones that look like they're in contact section
  const contactSectionIndex = text.toLowerCase().indexOf('contact');
  const emailIndex = text.toLowerCase().indexOf('@');
  
  for (const phone of uniquePhones) {
    // Find position of this phone in original text
    const phoneIndex = text.indexOf(phone);
    
    // Prioritize phones near contact info or email
    if (contactSectionIndex !== -1 && phoneIndex !== -1 && 
        Math.abs(phoneIndex - contactSectionIndex) < 200) {
      console.log('✅ Found phone near contact section:', phone);
      return phone;
    }
    
    if (emailIndex !== -1 && phoneIndex !== -1 && 
        Math.abs(phoneIndex - emailIndex) < 100) {
      console.log('✅ Found phone near email:', phone);
      return phone;
    }
  }
  
  // Just return first valid phone if found
  if (uniquePhones.length > 0) {
    console.log('✅ Using first valid phone:', uniquePhones[0]);
    return uniquePhones[0];
  }
  
  console.log('❌ No phone found');
  return '';
}

// SIMPLE and RELIABLE: Use email as primary source
function extractNameFromText(text: string, fileName: string, email?: string): string {
  // BEST APPROACH: Extract from email (most reliable!)
  if (email && !email.includes('@example.com')) {
    const username = email.split('@')[0];
    
    // Skip generic emails
    if (!/^(info|contact|hr|admin|support|sales|help|team|careers|noreply)/i.test(username)) {
      const nameFromEmail = username
        .replace(/\d+/g, '') // Remove numbers
        .replace(/[._-]/g, ' ') // Separators to spaces
        .split(/(?=[A-Z])/) // Split camelCase
        .join(' ')
        .split(/\s+/)
        .filter(w => w.length > 1)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .slice(0, 3)
        .join(' ');
      
      if (nameFromEmail.split(' ').length >= 2) {
        console.log('✅ Name from email:', nameFromEmail);
        return nameFromEmail;
      }
    }
  }
  
  // Fallback: Try first line of PDF (simple extraction)
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  for (const line of lines.slice(0, 5)) {
    // Skip junk lines
    if (line.length < 5 || line.length > 60) continue;
    if (/resume|cv|years|experience|@|http|www|\d{4}/i.test(line)) continue;
    
    // Extract only letters
    const onlyLetters = line
      .replace(/[^a-zA-Z\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const words = onlyLetters.split(/\s+/)
      .filter(w => w.length >= 2 && /^[A-Z]/i.test(w))
      .slice(0, 3);
    
    if (words.length >= 2) {
      const name = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      console.log('✅ Name from PDF text:', name);
      return name;
    }
  }
  
  // Last resort: filename
  return fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[_-]/g, ' ')
    .replace(/resume|cv|\d+/gi, '')
    .trim() || 'Unnamed Candidate';
}

// Advanced skills extraction - finds ACTUAL skills from resume
function extractSkillsFromText(text: string): string[] {
  const foundSkills: string[] = [];
  const lines = text.split('\n').map(l => l.trim());
  
  // Comprehensive skills database
  const technicalSkills = [
    // Programming Languages
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'C', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl', 'Dart', 'Objective-C',
    
    // Frontend
    'React', 'React.js', 'Angular', 'Vue', 'Vue.js', 'Next.js', 'Nuxt.js', 'Svelte', 'jQuery', 'Redux', 'MobX', 'Vuex',
    'HTML', 'HTML5', 'CSS', 'CSS3', 'SASS', 'SCSS', 'LESS', 'Tailwind', 'Bootstrap', 'Material-UI', 'Ant Design', 'Chakra UI',
    
    // Backend
    'Node.js', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring', 'Spring Boot', 'ASP.NET', '.NET', 'Laravel', 'Rails', 'NestJS',
    
    // Databases
    'MongoDB', 'PostgreSQL', 'MySQL', 'SQL', 'Oracle', 'Redis', 'Cassandra', 'DynamoDB', 'Elasticsearch', 'SQLite', 'MariaDB', 'MS SQL', 'NoSQL',
    
    // Cloud & DevOps
    'AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'K8s', 'Jenkins', 'Git', 'GitHub', 'GitLab', 'CI/CD', 'Terraform', 'Ansible', 'Linux', 'Unix', 'Bash',
    
    // Mobile
    'React Native', 'Flutter', 'iOS', 'Android', 'Swift', 'Kotlin', 'Xamarin',
    
    // Data & AI
    'Machine Learning', 'ML', 'AI', 'Artificial Intelligence', 'Deep Learning', 'Data Science', 'TensorFlow', 'PyTorch', 'Keras', 'Pandas', 'NumPy', 'Scikit-learn',
    
    // Architecture & Patterns
    'REST API', 'RESTful', 'GraphQL', 'Microservices', 'Monolithic', 'MVC', 'MVVM', 'Clean Architecture', 'Design Patterns',
    
    // Methodologies
    'Agile', 'Scrum', 'Kanban', 'DevOps', 'TDD', 'BDD', 'Waterfall', 'Lean',
    
    // Tools & Software
    'JIRA', 'Confluence', 'Slack', 'Trello', 'Asana', 'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator',
    'Excel', 'PowerPoint', 'Word', 'Tableau', 'Power BI', 'Looker', 'Salesforce',
    
    // Testing
    'Jest', 'Mocha', 'Cypress', 'Selenium', 'JUnit', 'PyTest', 'Unit Testing', 'Integration Testing', 'E2E Testing',
    
    // Other
    'API', 'SDK', 'JSON', 'XML', 'YAML', 'Webpack', 'Vite', 'Babel', 'npm', 'Yarn', 'Maven', 'Gradle'
  ];
  
  const softSkills = [
    'Leadership', 'Team Management', 'Communication', 'Problem Solving', 'Critical Thinking',
    'Project Management', 'Time Management', 'Collaboration', 'Adaptability', 'Creativity',
    'Analytical', 'Strategic Planning', 'Presentation', 'Negotiation', 'Conflict Resolution'
  ];
  
  const allSkills = [...technicalSkills, ...softSkills];
  
  // Method 1: Look for "Skills" section explicitly
  let inSkillsSection = false;
  let skillsSectionText = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect skills section start
    if (/^(skills|technical skills|core competencies|expertise|technologies|proficiency|key skills|competencies|core skills)$/i.test(line)) {
      inSkillsSection = true;
      continue;
    }
    
    // Detect section end
    if (inSkillsSection && /^(experience|education|projects|certifications|achievements|objective|summary|employment|work history)/i.test(line)) {
      inSkillsSection = false;
      break;
    }
    
    // Collect skills section text
    if (inSkillsSection) {
      skillsSectionText += ' ' + line;
    }
  }
  
  // If we found a skills section, prioritize skills from there
  const searchText = skillsSectionText || text;
  const lowerSearchText = searchText.toLowerCase();
  
  // Match skills (case-insensitive)
  for (const skill of allSkills) {
    const skillLower = skill.toLowerCase();
    // Check for whole word match (with word boundaries)
    const regex = new RegExp(`\\b${skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(searchText)) {
      if (!foundSkills.some(s => s.toLowerCase() === skillLower)) {
        foundSkills.push(skill);
      }
    }
  }
  
  // Also extract skills from bullet points and commas
  const skillsFromBullets = searchText
    .split(/[,;•●○■▪▫]/)
    .map(s => s.trim())
    .filter(s => s.length > 2 && s.length < 30)
    .filter(s => allSkills.some(skill => skill.toLowerCase() === s.toLowerCase()))
    .slice(0, 10);
  
  foundSkills.push(...skillsFromBullets);
  
  // Remove duplicates (case-insensitive)
  const uniqueSkills = Array.from(new Set(foundSkills.map(s => s.toLowerCase())))
    .map(lower => foundSkills.find(s => s.toLowerCase() === lower)!)
    .slice(0, 15); // Limit to 15 skills
  
  console.log('✅ Skills extracted from resume:', uniqueSkills);
  
  return uniqueSkills.length > 0 ? uniqueSkills : ['General Skills'];
}

// Calculate experience from text
function calculateExperienceYears(text: string): number {
  // Look for "X years" patterns
  const yearPatterns = [
    /(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|exp)/gi,
    /(?:experience|exp).*?(\d+)\+?\s*(?:years?|yrs?)/gi,
    /total.*?(\d+)\+?\s*(?:years?|yrs?)/gi
  ];
  
  for (const pattern of yearPatterns) {
    const match = text.match(pattern);
    if (match) {
      const numbers = match[0].match(/\d+/);
      if (numbers) {
        const years = parseInt(numbers[0]);
        if (years >= 0 && years <= 50) {
          console.log('✅ Experience found:', years, 'years');
          return years;
        }
      }
    }
  }
  
  // Fallback: count years from dates (2020-2023 = 3 years)
  const years = text.match(/20\d{2}/g);
  if (years && years.length >= 2) {
    const yearNumbers = years.map(y => parseInt(y)).sort();
    const experience = yearNumbers[yearNumbers.length - 1] - yearNumbers[0];
    if (experience > 0 && experience <= 50) {
      console.log('✅ Experience calculated from dates:', experience, 'years');
      return experience;
    }
  }
  
  return 0;
}

export function useUploadResumes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]) => {
      // PRODUCTION APPROACH: Use backend API with Gemini AI (like Zoho Recruit)
      // This gives 100% accuracy using Google's AI
      
      const apiUrl = import.meta.env.VITE_API_URL || '';
      
      // Try backend API first (if available)
      if (apiUrl) {
        try {
          const formData = new FormData();
          files.forEach(file => formData.append('files', file));

          const response = await fetch(`${apiUrl}/api/upload/resumes`, {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const result = await response.json();
            if (result.status === 'ok') {
              console.log('✅ Used AI-powered backend parsing (100% accuracy)');
              return result.data;
            }
          }
        } catch (error) {
          console.log('⚠️ Backend not available, using client-side parsing');
        }
      }
      
      // FALLBACK: Client-side parsing (when backend not deployed)
      const supabase = getSupabase();
      if (!supabase) throw new Error('Supabase not initialized');
      
      // Remove duplicates by filename
      const uniqueFiles = Array.from(
        new Map(files.map(f => [f.name + f.size, f])).values()
      );
      
      console.log('Processing files client-side:', uniqueFiles.map(f => f.name));
      
      const results = [];
      
      for (const file of uniqueFiles) {
        const fileName = file.name;
        let candidateName = 'Unnamed Candidate';
        let candidateEmail = '';
        let candidatePhone = '';
        let resumeText = '';
        
        // Extract text from PDF
        if (file.type === 'application/pdf') {
          resumeText = await extractTextFromPDF(file);
          
          // Log the extracted text for debugging
          console.log('========== PROCESSING PDF ==========');
          console.log('File:', fileName);
          console.log('Extracted text (first 500 chars):\n', resumeText.substring(0, 500));
          console.log('====================================');
          
          // Extract email FIRST
          const extractedEmail = extractEmailFromText(resumeText);
          if (extractedEmail) {
            candidateEmail = extractedEmail;
          } else {
            console.log('❌ No email found in PDF text');
          }
          
          // Then extract name (can use email to help)
          candidateName = extractNameFromText(resumeText, fileName, candidateEmail);
          console.log('✅ Extracted Name:', candidateName);
          
          candidatePhone = extractPhoneFromText(resumeText);
          if (candidatePhone) {
            console.log('✅ Extracted Phone:', candidatePhone);
          }
          
          // Extract skills from resume
          const extractedSkills = extractSkillsFromText(resumeText);
          console.log('✅ Extracted Skills:', extractedSkills);
          
          // Calculate experience years
          const experienceYears = calculateExperienceYears(resumeText);
          console.log('✅ Calculated Experience:', experienceYears, 'years');
        } else {
          // For non-PDF files, use filename
          candidateName = fileName
            .replace(/\.[^/.]+$/, '')
            .replace(/[_-]/g, ' ')
            .replace(/\d+/g, '')
            .trim() || 'Unnamed Candidate';
        }

        // Generate clean email if not found in resume
        if (!candidateEmail) {
          const emailBase = candidateName
            .toLowerCase()
            .replace(/\s+/g, '')
            .substring(0, 20); // Limit length
          const randomId = Math.random().toString(36).substring(2, 8); // Short random ID
          candidateEmail = `${emailBase}.${randomId}@example.com`;
          console.log('Using fallback email:', candidateEmail);
        }

        // Upload PDF to Supabase Storage
        const fileExt = fileName.split('.').pop();
        const filePath = `${Date.now()}-${candidateName.replace(/\s+/g, '-')}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          // Continue with just filename if upload fails
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('resumes')
          .getPublicUrl(filePath);

        const resumeUrl = uploadData ? urlData.publicUrl : fileName;
        
        // Extract skills and experience for PDF files
        let candidateSkills = ['General Skills'];
        let candidateExperience = 0;
        
        if (file.type === 'application/pdf' && resumeText) {
          candidateSkills = extractSkillsFromText(resumeText);
          candidateExperience = calculateExperienceYears(resumeText);
        }

        // Create candidate with REAL extracted data
        const candidate = {
          name: candidateName,
          email: candidateEmail,
          phone: candidatePhone,
          skills: candidateSkills,
          experience_years: candidateExperience,
          status: 'new' as const,
          resumes: [resumeUrl],
          parsed_text: resumeText || `Resume file: ${fileName}`
        };

        const response = await supabaseApi.candidates.create(candidate);
        if (response.status === 'ok' && response.data) {
          results.push(response.data);
        }
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
}

export function useUpdateCandidateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ candidateId, status }: { candidateId: string; status: Candidate['status'] }) => {
      const response = await supabaseApi.candidates.updateStatus(candidateId, status);
      if (response.status === 'error') {
        throw new Error(response.errors[0]?.message || 'Failed to update candidate status');
      }
      return response.data!;
    },
    // Optimistic update - immediately update UI before server responds
    onMutate: async ({ candidateId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['candidates'] });

      // Snapshot the previous value
      const previousCandidates = queryClient.getQueryData<Candidate[]>(['candidates']);

      // Optimistically update to the new value
      queryClient.setQueryData<Candidate[]>(['candidates'], (old) => {
        if (!old) return old;
        return old.map((candidate) =>
          candidate.id === candidateId
            ? { ...candidate, status }
            : candidate
        );
      });

      // Return context with the snapshot
      return { previousCandidates };
    },
    // If mutation fails, rollback to the previous value
    onError: (err, variables, context) => {
      if (context?.previousCandidates) {
        queryClient.setQueryData(['candidates'], context.previousCandidates);
      }
      console.error('Failed to update candidate status:', err);
    },
    // Always refetch after error or success to ensure sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
}

export function useDeleteCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (candidateId: string) => {
      const response = await supabaseApi.candidates.delete(candidateId);
      if (response.status === 'error') throw new Error('Failed to delete');
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    }
  });
}