import { Job, JobMatchResult, GovernmentScheme } from '../types';
import { SKILL_TAXONOMY } from '../data/mockData';

// Normalize any skill string or regional synonym to canonical taxonomy skill name
export function normalizeToCanonicalSkill(skill: string): string {
  const s = skill.toLowerCase().trim();
  if (!s) return skill;

  const found = SKILL_TAXONOMY.find(item =>
    item.canonical.toLowerCase() === s ||
    item.id.toLowerCase() === s ||
    item.labelEn.toLowerCase() === s ||
    item.labelHi.toLowerCase() === s ||
    item.labelHi.toLowerCase().includes(s) ||
    item.labelEn.toLowerCase().includes(s) ||
    item.aliases.some(a => a.toLowerCase() === s || s.includes(a.toLowerCase()) || a.toLowerCase().includes(s))
  );

  return found ? found.canonical : s;
}

// Expand a skill to all its canonical forms and synonyms from the taxonomy
function expandSkillWithAliases(skill: string): string[] {
  const s = skill.toLowerCase().trim();
  if (!s) return [];
  
  const found = SKILL_TAXONOMY.find(item =>
    item.canonical.toLowerCase() === s ||
    item.id.toLowerCase() === s ||
    item.labelEn.toLowerCase() === s ||
    item.labelHi.toLowerCase() === s ||
    item.labelHi.toLowerCase().includes(s) ||
    item.labelEn.toLowerCase().includes(s) ||
    item.aliases.some(a => a.toLowerCase() === s || s.includes(a.toLowerCase()) || a.toLowerCase().includes(s))
  );

  if (!found) {
    return [s];
  }

  const aliasesLower = found.aliases.map(a => a.toLowerCase().trim());
  return Array.from(new Set([
    s,
    found.canonical.toLowerCase(),
    found.id.toLowerCase(),
    found.labelEn.toLowerCase(),
    found.labelHi.toLowerCase(),
    ...aliasesLower
  ]));
}

export function calculateJobMatch(job: Job, userSkills: string[], userState?: string): JobMatchResult {
  const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim()).filter(Boolean);
  
  if (normalizedUserSkills.length === 0 || job.requiredSkills.length === 0) {
    return {
      job,
      matchPercentage: 0,
      matchedSkills: [],
      missingSkills: [...job.requiredSkills],
      locationMatch: Boolean(userState && job.state.toLowerCase() === userState.toLowerCase())
    };
  }

  // Pre-expand all user skills into a comprehensive alias set
  const userSkillPool = new Set<string>();
  normalizedUserSkills.forEach(uSkill => {
    expandSkillWithAliases(uSkill).forEach(variant => userSkillPool.add(variant));
  });

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  job.requiredSkills.forEach(reqSkill => {
    const reqVariants = expandSkillWithAliases(reqSkill);
    const isMatched = reqVariants.some(variant =>
      userSkillPool.has(variant) ||
      Array.from(userSkillPool).some(u => u.includes(variant) || variant.includes(u))
    );

    if (isMatched) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  // Pure deterministic percentage calculation
  let baseScore = (matchedSkills.length / job.requiredSkills.length) * 100;
  
  // Preferred skills bonus (up to 5% bonus if present)
  if (job.preferredSkills && job.preferredSkills.length > 0) {
    const matchedPreferred = job.preferredSkills.filter(prefSkill => {
      const prefVariants = expandSkillWithAliases(prefSkill);
      return prefVariants.some(variant =>
        userSkillPool.has(variant) ||
        Array.from(userSkillPool).some(u => u.includes(variant) || variant.includes(u))
      );
    });
    if (matchedPreferred.length > 0) {
      baseScore = Math.min(100, baseScore + (matchedPreferred.length / job.preferredSkills.length) * 5);
    }
  }

  // Location match boolean
  const locationMatch = Boolean(userState && job.state.toLowerCase() === userState.toLowerCase());

  const matchPercentage = Math.min(100, Math.round(baseScore));

  return {
    job,
    matchPercentage,
    matchedSkills,
    missingSkills,
    locationMatch
  };
}

export function rankJobsForUser(jobs: Job[], userSkills: string[], userState?: string): JobMatchResult[] {
  const results = jobs
    .filter(job => job.isActive)
    .map(job => calculateJobMatch(job, userSkills, userState));

  // Sort strictly by decreasing match score, then location match, then matched skills count, then salaryMax
  return results.sort((a, b) => {
    // 1. Primary: Match percentage descending (100% -> 0%)
    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }
    // 2. Secondary tie-breaker: Location match (in-state jobs first)
    if (b.locationMatch !== a.locationMatch) {
      return b.locationMatch ? 1 : -1;
    }
    // 3. Tertiary tie-breaker: Number of matched skills
    if (b.matchedSkills.length !== a.matchedSkills.length) {
      return b.matchedSkills.length - a.matchedSkills.length;
    }
    // 4. Quaternary tie-breaker: Maximum salary descending
    if (b.job.salaryMax !== a.job.salaryMax) {
      return b.job.salaryMax - a.job.salaryMax;
    }
    // 5. Quinary: Verified jobs first
    return (b.job.isVerified ? 1 : 0) - (a.job.isVerified ? 1 : 0);
  });
}

export function matchGovernmentSchemes(schemes: GovernmentScheme[], userSkills: string[]): { scheme: GovernmentScheme; relevanceScore: number; matchedSkills: string[] }[] {
  const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim()).filter(Boolean);

  return schemes.map(scheme => {
    const matched = scheme.relevantSkills.filter(req =>
      normalizedUserSkills.some(u => u === req || u.includes(req) || req.includes(u))
    );

    // Universal schemes like PMKVY, JSS, DDU-GKY have high baseline relevance even with 0 skills
    const baselineRelevance = ['scheme-1', 'scheme-3', 'scheme-4'].includes(scheme.id) ? 40 : 20;
    const skillScore = scheme.relevantSkills.length > 0
      ? (matched.length / scheme.relevantSkills.length) * 80
      : 30;

    const relevanceScore = Math.min(100, Math.round(baselineRelevance + skillScore));

    return {
      scheme,
      relevanceScore,
      matchedSkills: matched
    };
  }).sort((a, b) => b.relevanceScore - a.relevanceScore);
}
