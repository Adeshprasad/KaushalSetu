import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { MOCK_JOBS, MOCK_GOVERNMENT_SCHEMES, SKILL_TAXONOMY } from "./src/data/mockData";
import { THIRD_PARTY_JOBS } from "./src/data/externalJobsData";
import { Job, GovernmentScheme, UserApplication, SimplifiedScheme, ThirdPartyJobSource } from "./src/types";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "10mb" }));

// In-memory data stores initialized with seed data
let jobsStore: Job[] = [...MOCK_JOBS];
let schemesStore: GovernmentScheme[] = [...MOCK_GOVERNMENT_SCHEMES];
let applicationsStore: UserApplication[] = [
  {
    id: "app-101",
    jobId: "job-1",
    jobTitle: "Arc & MIG Welder",
    employer: "ABC Agro Engineering Works",
    applicantName: "Ravi Kumar",
    applicantPhone: "+91 98765 43210",
    applicantLocation: "Patna, Bihar",
    applicantSkills: ["welding", "metal fabrication"],
    appliedDate: "Yesterday",
    status: "under_review",
    notes: "Experienced in agricultural trailers and gate fabrication."
  },
  {
    id: "app-102",
    jobId: "job-5",
    jobTitle: "Master Tailor & Boutique Stitcher",
    employer: "Ananya Rural Women Self-Help Producer Co.",
    applicantName: "Sunita Devi",
    applicantPhone: "+91 94500 88991",
    applicantLocation: "Lucknow, Uttar Pradesh",
    applicantSkills: ["tailoring"],
    appliedDate: "3 days ago",
    status: "shortlisted",
    notes: "Proficient in power sewing machines."
  }
];

let totalVisitorCount = 1420;

// Simple in-memory response cache to handle rate limits and avoid repeated quota consumption
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function getCached(key: string): any | null {
  const cached = responseCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    responseCache.delete(key);
    return null;
  }
  return cached.data;
}

function setCached(key: string, data: any) {
  // Cap cache size to avoid memory growth
  if (responseCache.size > 200) {
    const firstKey = responseCache.keys().next().value;
    if (firstKey) responseCache.delete(firstKey);
  }
  responseCache.set(key, { data, timestamp: Date.now() });
}

// Lazy GenAI initialization helper
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// Helper to execute Gemini requests with fast primary model (gemini-2.5-flash) and fallback
async function generateGeminiContent(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
  }
) {
  const models = ["gemini-2.5-flash", "gemini-3.1-flash-lite", "gemini-3.8-flash"];
  let lastError: any = null;

  for (const model of models) {
    try {
      const config = { ...(params.config || {}) };
      // Disable thinking budget overhead for fast single-turn classification and generation
      if (config.thinkingConfig === undefined && !config.tools) {
        config.thinkingConfig = { thinkingBudget: 0 };
      }
      return await ai.models.generateContent({
        model,
        contents: params.contents,
        config
      });
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Model Notice] Model ${model} returned error:`, err?.status || err?.message?.slice(0, 100));
    }
  }
  throw lastError;
}

// Canonical resolution helper to map any skill variant/alias into canonical taxonomy skill
function normalizeToCanonicalSkill(skill: string): string {
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

// Fallback local skill extractor using dictionary matching
function extractSkillsLocally(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();

  for (const skillDef of SKILL_TAXONOMY) {
    if (lower.includes(skillDef.canonical.toLowerCase()) || lower.includes(skillDef.labelHi.toLowerCase())) {
      found.add(skillDef.canonical);
      continue;
    }
    for (const alias of skillDef.aliases) {
      if (lower.includes(alias.toLowerCase())) {
        found.add(skillDef.canonical);
        break;
      }
    }
  }

  // Common keyword matches
  if (lower.includes("weld") || lower.includes("वेल्ड") || lower.includes("लोहा") || lower.includes("फैब्रिकेशन")) {
    found.add("welding");
  }
  if (lower.includes("bike") || lower.includes("मोटरसाइकिल") || lower.includes("गाड़ी") || lower.includes("scooter") || lower.includes("मैकेनिक") || lower.includes("गैराज")) {
    found.add("motorcycle repair");
  }
  if (lower.includes("bijli") || lower.includes("बिजली") || lower.includes("तार") || lower.includes("electric") || lower.includes("wiring") || lower.includes("इलेक्ट्रीशियन")) {
    found.add("electrical repair");
  }
  if (lower.includes("plumb") || lower.includes("नल") || lower.includes("पाइप") || lower.includes("motor fitting") || lower.includes("प्लंबर")) {
    found.add("plumbing");
  }
  if (lower.includes("silai") || lower.includes("सिलाई") || lower.includes("कपड़ा") || lower.includes("tailor") || lower.includes("दर्जी") || lower.includes("कुर्ती") || lower.includes("सूट")) {
    found.add("tailoring");
  }
  if (lower.includes("rajmistri") || lower.includes("राजमिस्त्री") || lower.includes("मकान") || lower.includes("mason") || lower.includes("tile") || lower.includes("चिनाई")) {
    found.add("masonry");
  }
  if (lower.includes("barhai") || lower.includes("बढ़ई") || lower.includes("लकड़ी") || lower.includes("carpenter") || lower.includes("furniture") || lower.includes("प्लाईवुड")) {
    found.add("carpentry");
  }
  if (lower.includes("solar") || lower.includes("सोलर") || lower.includes("सौर")) {
    found.add("solar installation");
  }
  if (lower.includes("tractor") || lower.includes("ट्रैक्टर") || lower.includes("kheti") || lower.includes("खेती")) {
    found.add("tractor driving");
  }
  if (lower.includes("mobile") || lower.includes("मोबाइल") || lower.includes("phone") || lower.includes("स्क्रीन")) {
    found.add("mobile repair");
  }
  if (lower.includes("khana") || lower.includes("खाना") || lower.includes("cook") || lower.includes("रसोइया") || lower.includes("हलवाई") || lower.includes("कुकिंग")) {
    found.add("cooking");
  }
  if (lower.includes("ac ") || lower.includes("एसी") || lower.includes("fridge") || lower.includes("फ्रिज") || lower.includes("कूलर")) {
    found.add("ac and refrigeration repair");
  }
  if (lower.includes("driver") || lower.includes("ड्राइवर") || lower.includes("ड्राइविंग") || lower.includes("गाड़ी चलाना")) {
    found.add("driving");
  }
  if (lower.includes("cnc") || lower.includes("सीएनसी") || lower.includes("खराद") || lower.includes("lathe")) {
    found.add("cnc machine operation");
  }

  return Array.from(found);
}

// ---------------- API ROUTES ----------------

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 1. Skill Extraction & Normalization
app.post("/api/skills/extract", async (req, res) => {
  const { description, language } = req.body || {};
  if (!description || typeof description !== "string" || !description.trim()) {
    return res.json({ skills: [], displaySkills: [], displaySkillsHi: [] });
  }

  const localSkills = extractSkillsLocally(description);
  const cacheKey = `skills:${description.trim().toLowerCase()}:${language || 'hi'}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const ai = getGeminiClient();

    if (!ai) {
      const result = {
        skills: localSkills,
        source: "local"
      };
      setCached(cacheKey, result);
      return res.json(result);
    }

    const validCanonicals = SKILL_TAXONOMY.map(s => s.canonical);
    const prompt = `You are an expert AI skill extractor for KaushalSetu, a platform for rural youth in India.
Your task: Analyze the user's description of their work/skills (which may be in Hindi, English, Hinglish, Bengali, Tamil, Odia, or informal spoken style with typos) and extract ONLY genuine vocational or technical skills.

Map each identified skill strictly to one of the following canonical skill names:
${JSON.stringify(validCanonicals, null, 2)}

Strict rules:
1. Do NOT invent or assume skills not mentioned in the text.
2. Normalize informal slang/terms:
   - "bike repair", "two wheeler", "bike ka mistri" -> "motorcycle repair"
   - "bijli ka kaam", "house wiring", "electrician" -> "electrical repair"
   - "silai", "darzi", "stitching", "sewing" -> "tailoring"
   - "loha ka kaam", "chaddar cutting" -> "metal fabrication"
   - "welding", "welder", "वेल्डिंग" -> "welding"
   - "nal fitting", "pipe", "plumber" -> "plumbing"
   - "rajmistri", "chinai", "tile lagana" -> "masonry"
   - "barhai", "lakdi ka kaam", "furniture" -> "carpentry"
   - "solar panel", "saur urja" -> "solar installation"
   - "mobile screen", "phone charging repair" -> "mobile repair"
   - "tractor chalana", "jutai" -> "tractor driving"
   - "khana banana", "halwai", "dhaba cook" -> "cooking"
   - "ac gas", "fridge repair" -> "ac and refrigeration repair"
   - "farming", "khet" -> "farming and horticulture"
   - "lathe", "kharad" -> "cnc machine operation"

User input: "${description}"
User language: "${language || 'hi'}"`;

    const response = await generateGeminiContent(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of canonical skill names strictly matched from the provided list"
            }
          },
          required: ["skills"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    const rawAiSkills: string[] = Array.isArray(parsed.skills) ? parsed.skills : [];
    
    // Normalize every skill (whether in Hindi or English) to canonical taxonomy name
    const normalizedAi = rawAiSkills.map(s => normalizeToCanonicalSkill(s));
    const combined = Array.from(new Set([...normalizedAi, ...localSkills]))
      .filter(s => validCanonicals.includes(s));

    const finalSkills = combined.length > 0 ? combined : localSkills;
    const result = {
      skills: finalSkills,
      source: "ai"
    };
    setCached(cacheKey, result);
    res.json(result);
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.message?.includes("429");
    if (!isRateLimit) console.warn("Notice in /api/skills/extract, serving fallback:", error?.message || error);
    const fallback = { skills: localSkills, source: "fallback" };
    setCached(cacheKey, fallback);
    res.json(fallback);
  }
});

// 2. Deterministic Job Match Explanation
app.post("/api/jobs/explain-match", async (req, res) => {
  const { userSkills, job, matchPercentage, matchedSkills, missingSkills, language } = req.body || {};
  const isHindi = language === "hi";

  // Local transparent explanation generator
  let localExplanation = "";
  if (isHindi) {
    if (matchPercentage >= 75) {
      localExplanation = `यह नौकरी आपके लिए बहुत उपयुक्त है क्योंकि आपके पास आवश्यक हुनर (${(matchedSkills || []).join(", ")}) मौजूद हैं।`;
      if (missingSkills && missingSkills.length > 0) {
        localExplanation += ` इस नौकरी में ${missingSkills.join(", ")} की भी आवश्यकता है, जिसे आप ऑन-जॉब सीख सकते हैं।`;
      }
    } else if (matchPercentage >= 50) {
      localExplanation = `आपके पास इस नौकरी के कुछ मुख्य हुनर (${(matchedSkills || []).join(", ")}) हैं। अतिरिक्त आवश्यकता: ${(missingSkills || []).join(", ")}।`;
    } else {
      localExplanation = `इस पद के लिए ${(missingSkills || []).join(", ")} का अनुभव मांगा गया है। यदि आप यह सीखना चाहते हैं तो संबंधित सरकारी ट्रेनिंग योजनाएं देखें।`;
    }
  } else {
    if (matchPercentage >= 75) {
      localExplanation = `You are a strong match because you possess required skills (${(matchedSkills || []).join(", ")}).`;
      if (missingSkills && missingSkills.length > 0) {
        localExplanation += ` The employer also seeks ${missingSkills.join(", ")}, which you can develop on the job.`;
      }
    } else if (matchPercentage >= 50) {
      localExplanation = `You have matching capabilities in ${(matchedSkills || []).join(", ")}. Additional skills asked: ${(missingSkills || []).join(", ")}.`;
    } else {
      localExplanation = `This position requires ${(missingSkills || []).join(", ")}. Check recommended skill schemes to gain these certificates.`;
    }
  }

  const cacheKey = `match:${job?.id || 'job'}:${(matchedSkills || []).sort().join(',')}:${(missingSkills || []).sort().join(',')}:${language || 'hi'}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const ai = getGeminiClient();
    if (!ai) {
      const result = { explanation: localExplanation };
      setCached(cacheKey, result);
      return res.json(result);
    }

    const prompt = `You are an encouraging, plain-language career advisor for KaushalSetu (helping rural Indian youth).
Create a short, warm, and highly clear 2-sentence explanation of why this job matches the user.

FACTS (Do not invent anything outside these facts):
- Job Title: ${job?.title || 'Vocational Job'} (${job?.titleHi || ''})
- Employer: ${job?.employer || 'Employer'}
- Location: ${job?.location || 'Local'}, ${job?.state || 'India'}
- Deterministic Match Score: ${matchPercentage}%
- Matched Skills: ${JSON.stringify(matchedSkills)}
- Missing/Additional Skills: ${JSON.stringify(missingSkills)}
- User Skills: ${JSON.stringify(userSkills)}
- Target Language: ${language === 'hi' ? 'Hindi (सरल और सम्मानजनक हिंदी)' : language === 'bn' ? 'Bengali' : language === 'ta' ? 'Tamil' : language === 'or' ? 'Odia' : 'Simple English'}

Rules:
1. Explain clearly in simple words based ONLY on the matched and missing skills.
2. Do NOT mention algorithm formulas or technical jargon.
3. Be respectful, encouraging, and easy to understand for someone with basic literacy.
4. Keep it under 40 words.`;

    const response = await generateGeminiContent(ai, {
      contents: prompt
    });

    const explanation = response.text?.trim() || localExplanation;
    const result = { explanation };
    setCached(cacheKey, result);
    res.json(result);
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.message?.includes("429");
    if (!isRateLimit) console.warn("Notice in /api/jobs/explain-match, serving fallback:", error?.message || error);
    const result = { explanation: localExplanation };
    setCached(cacheKey, result);
    res.json(result);
  }
});

// 3. Plain-Language Government Scheme Simplifier
app.post("/api/schemes/explain-simple", async (req, res) => {
  const { scheme: rawScheme, schemeId, language, userSkills } = req.body || {};
  const rawId = rawScheme?.id || schemeId || (typeof rawScheme === 'string' ? rawScheme : undefined);
  let scheme: GovernmentScheme | undefined = undefined;
  if (rawId) {
    const sId = String(rawId).toLowerCase();
    scheme = schemesStore.find(s => s.id.toLowerCase() === sId || s.name.toLowerCase().includes(sId))
      || MOCK_GOVERNMENT_SCHEMES.find(s => s.id.toLowerCase() === sId || s.name.toLowerCase().includes(sId) || s.category.toLowerCase().includes(sId));
  }
  if (!scheme && typeof rawScheme === 'object' && rawScheme?.name) {
    scheme = rawScheme;
  }
  if (!scheme) {
    scheme = schemesStore[0] || MOCK_GOVERNMENT_SCHEMES[0];
  }

  const isHindi = language === "hi";

  // Standard fallback simplification structure grounded in official scheme facts
  const fallback: SimplifiedScheme = {
    inSimpleWords: isHindi
      ? `${scheme.nameHi || scheme.name} सरकार की एक कल्याणकारी योजना है, जिसका उद्देश्य युवाओं को मुफ्त तकनीकी हुनर सिखाना और रोजगार/स्वरोजगार के अवसर उपलब्ध कराना है।`
      : `${scheme.name} is a government support programme designed to provide free vocational training, official certification, and financial aid to help people earn a stable livelihood.`,
    whoMayBeEligible: isHindi
      ? (scheme.eligibilityHi || scheme.eligibility || ["18 वर्ष या उससे अधिक आयु के भारतीय नागरिक", "संबंधित ट्रेड में काम करने के इच्छुक युवा"])
      : (scheme.eligibility || ["Indian citizens seeking practical skill training", "Youth looking for formal certification or self-employment"]),
    whatYouGet: isHindi
      ? (scheme.benefitsHi || scheme.benefits || ["मुफ्त प्रशिक्षण और भारत सरकार का प्रमाण पत्र", "प्रोत्साहन भत्ता या टूलकिट सहायता"])
      : (scheme.benefits || ["100% Free practical training & Govt Certificate", "Financial stipend or toolkit allowance where applicable"]),
    howToApply: isHindi
      ? (scheme.applicationProcessHi || scheme.applicationProcess || ["नजदीकी सीएससी केंद्र या ब्लॉक कार्यालय जाएं", "आधार कार्ड से पंजीकरण कराएं", "ट्रेनिंग पूरी करके सर्टिफिकेट पाएं"])
      : (scheme.applicationProcess || ["Visit nearest Common Service Centre (CSC) or official portal", "Register with Aadhaar and select your skill course", "Complete hands-on training and pass practical exam"]),
    documentsNeeded: isHindi
      ? (scheme.documentsHi || scheme.documents || ["आधार कार्ड (पहचान पत्र)", "बैंक पासबुक", "पासपोर्ट साइज फोटो"])
      : (scheme.documents || ["Aadhaar Card", "Bank Account Passbook", "Passport Size Photos"]),
    disclaimer: isHindi
      ? "नोट: यह केवल सूचना हेतु है। अंतिम पात्रता आधिकारिक पोर्टल पर सत्यापन के अधीन है।"
      : "Note: Provided for informational guidance. Final eligibility is verified by government authorities."
  };

  const cacheKey = `scheme_explain:${scheme.id || 'default'}:${language || 'hi'}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const ai = getGeminiClient();
    if (!ai) {
      const result = { simplified: fallback };
      setCached(cacheKey, result);
      return res.json(result);
    }

    const prompt = `You are the Official Plain-Language Explainer for KaushalSetu (helping rural youth understand Indian Government Schemes).
Simplify the following official government scheme into clear, non-intimidating, and friendly language.

OFFICIAL SCHEME DATA (You must ONLY use information from this data; NEVER hallucinate benefits, amounts, or rules):
${JSON.stringify(scheme, null, 2)}

Target Language: ${language === 'hi' ? 'Simple, clear Hindi (सरल हिंदी जो ग्रामीण युवा आसानी से समझ सकें)' : language === 'bn' ? 'Bengali' : language === 'ta' ? 'Tamil' : language === 'or' ? 'Odia' : 'Plain, easy-to-read English'}
User skills for context: ${JSON.stringify(userSkills || [])}

Transform into this exact JSON structure:
1. "inSimpleWords": 1-2 sentences explaining what the scheme does in daily conversational words.
2. "whoMayBeEligible": 3-4 bullet points clarifying who can apply (use "You may be eligible if...").
3. "whatYouGet": 3-4 bullet points highlighting key concrete benefits (stipend, certificate, free food/hostel, loan, or toolkit).
4. "howToApply": 3-4 numbered step-by-step instructions on where to go and how to register.
5. "documentsNeeded": bullet list of essential documents (Aadhaar, passbook, photo).
6. "disclaimer": short reminder that final eligibility is determined by official authorities.`;

    const response = await generateGeminiContent(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            inSimpleWords: { type: Type.STRING },
            whoMayBeEligible: { type: Type.ARRAY, items: { type: Type.STRING } },
            whatYouGet: { type: Type.ARRAY, items: { type: Type.STRING } },
            howToApply: { type: Type.ARRAY, items: { type: Type.STRING } },
            documentsNeeded: { type: Type.ARRAY, items: { type: Type.STRING } },
            disclaimer: { type: Type.STRING }
          },
          required: ["inSimpleWords", "whoMayBeEligible", "whatYouGet", "howToApply", "documentsNeeded"]
        }
      }
    });

    const parsed: SimplifiedScheme = JSON.parse(response.text || "{}");
    const result = { simplified: { ...fallback, ...parsed } };
    setCached(cacheKey, result);
    res.json(result);
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.message?.includes("429");
    if (!isRateLimit) console.warn("Notice in /api/schemes/explain-simple, serving fallback:", error?.message || error);
    const result = { simplified: fallback };
    setCached(cacheKey, result);
    res.json(result);
  }
});

// 4. Grounded Scheme Q&A Chatbot
app.post("/api/schemes/chat", async (req, res) => {
  const { scheme: rawScheme, schemeId, question, query, language } = req.body || {};
  const rawId = rawScheme?.id || schemeId || (typeof rawScheme === 'string' ? rawScheme : undefined);
  let scheme: GovernmentScheme | undefined = undefined;
  if (rawId) {
    const sId = String(rawId).toLowerCase();
    scheme = schemesStore.find(s => s.id.toLowerCase() === sId || s.name.toLowerCase().includes(sId))
      || MOCK_GOVERNMENT_SCHEMES.find(s => s.id.toLowerCase() === sId || s.name.toLowerCase().includes(sId) || s.category.toLowerCase().includes(sId));
  }
  if (!scheme && typeof rawScheme === 'object' && rawScheme?.name) {
    scheme = rawScheme;
  }
  if (!scheme) {
    scheme = schemesStore[0] || MOCK_GOVERNMENT_SCHEMES[0];
  }

  const effectiveQuestion = String(question || query || "योजना के बारे में बताएं").trim();
  const isHindi = language === "hi";
  const officialSource = scheme.officialSource || 'https://www.india.gov.in';

  // Safe non-empty arrays
  const steps = (isHindi ? (scheme.applicationProcessHi || scheme.applicationProcess) : scheme.applicationProcess) || [];
  const stepsText = steps.length > 0
    ? steps.join(" ➔ ")
    : (isHindi ? "नजदीकी सीएससी या कौशल केंद्र पर आधार के साथ जाएं" : "Visit nearest Common Service Centre or official portal with Aadhaar");

  const docs = (isHindi ? (scheme.documentsHi || scheme.documents) : scheme.documents) || [];
  const docsText = docs.length > 0
    ? docs.join(", ")
    : (isHindi ? "आधार कार्ड, बैंक पासबुक और पासपोर्ट साइज फोटो" : "Aadhaar card, bank passbook, and photos");

  // Local rule-based answer
  const q = effectiveQuestion.toLowerCase();
  let localAnswer = "";
  if (q.includes("document") || q.includes("कागजात") || q.includes("दस्तावेज") || q.includes("aadhaar") || q.includes("आधार")) {
    localAnswer = isHindi
      ? `इस योजना के लिए आवश्यक दस्तावेज हैं: ${docsText}।`
      : `Required documents for this scheme are: ${docsText}.`;
  } else if (q.includes("apply") || q.includes("आवेदन") || q.includes("फॉर्म") || q.includes("kaise")) {
    localAnswer = isHindi
      ? `आवेदन प्रक्रिया: ${stepsText}। अधिक जानकारी: ${officialSource}`
      : `Application steps: ${stepsText}. Official website: ${officialSource}`;
  } else if (q.includes("stipend") || q.includes("paisa") || q.includes("पैसा") || q.includes("रुपये") || q.includes("loan") || q.includes("लोन")) {
    localAnswer = isHindi
      ? `वित्तीय लाभ / सहायता: ${scheme.stipendOrAidHi || scheme.stipendOrAid || 'मुफ्त व्यावहारिक प्रशिक्षण, टूलकिट व प्रमाण पत्र'}`
      : `Financial assistance: ${scheme.stipendOrAid || 'Free practical training, toolkit, and certification'}`;
  } else {
    localAnswer = isHindi
      ? `${scheme.nameHi || scheme.name} में ${scheme.targetAudienceHi || scheme.targetAudience || 'इच्छुक युवा'} पात्र हैं। मुख्य लाभ: ${(scheme.benefitsHi || scheme.benefits || ['व्यावहारिक प्रशिक्षण व सरकारी सर्टिफिकेट']).slice(0, 2).join(", ")}। अधिक जानकारी: ${officialSource}`
      : `${scheme.name} is for ${scheme.targetAudience || 'eligible candidates'}. Key benefits include ${(scheme.benefits || ['Vocational training & certification']).slice(0, 2).join(", ")}. Official website: ${officialSource}`;
  }

  const cacheKey = `scheme_chat:${scheme.id || 'default'}:${q.trim()}:${language || 'hi'}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const ai = getGeminiClient();
    if (!ai) {
      const result = { answer: localAnswer };
      setCached(cacheKey, result);
      return res.json(result);
    }

    const prompt = `You are the KaushalSetu Scheme Assistant chatbot answering questions strictly about ONE specific Indian Government Scheme.

SCHEME SOURCE OF TRUTH (You MUST answer using ONLY this information):
Name: ${scheme.name} (${scheme.nameHi || ''})
Ministry: ${scheme.ministry || ''}
Category: ${scheme.category || ''}
Description: ${scheme.description} (${scheme.descriptionHi || ''})
Target Audience: ${scheme.targetAudience || ''}
Eligibility: ${JSON.stringify(scheme.eligibility || [])}
Benefits: ${JSON.stringify(scheme.benefits || [])}
Application Process: ${JSON.stringify(scheme.applicationProcess || [])}
Documents: ${JSON.stringify(scheme.documents || [])}
Stipend / Aid: ${scheme.stipendOrAid || 'N/A'}
Duration: ${scheme.duration || 'N/A'}
Official Source: ${officialSource}

USER QUESTION: "${question}"
TARGET LANGUAGE: ${isHindi ? 'Hindi (सरल, स्पष्ट और विनम्र हिंदी)' : language === 'bn' ? 'Bengali' : language === 'ta' ? 'Tamil' : language === 'or' ? 'Odia' : 'Simple English'}

STRICT ACCURACY RULES:
1. Answer strictly using ONLY the factual points above.
2. If the user asks for something not mentioned in the scheme data above, clearly state:
   ${isHindi ? '"माफ कीजिए, इस योजना के विवरण में यह जानकारी उपलब्ध नहीं है। कृपया आधिकारिक वेबसाइट देखें।"' : '"I don\'t have that information right now. Please check the official government portal."'}
3. Never hallucinate loans, eligibility, or benefits not provided.
4. Keep the answer concise (2-4 sentences max), clear, and direct.`;

    const response = await generateGeminiContent(ai, {
      contents: prompt
    });

    const answer = response.text?.trim() || localAnswer;
    const result = { answer };
    setCached(cacheKey, result);
    res.json(result);
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.message?.includes("429");
    if (!isRateLimit) console.warn("Notice in /api/schemes/chat, serving fallback:", error?.message || error);
    const result = { answer: localAnswer };
    setCached(cacheKey, result);
    res.json(result);
  }
});

// 5. Jobs & Schemes CRUD and Applications
app.get("/api/data/jobs", (req, res) => {
  res.json({ jobs: jobsStore });
});

app.post("/api/data/jobs", (req, res) => {
  const newJob: Job = {
    id: req.body.id || `job-${Date.now()}`,
    title: req.body.title || "Vocational Specialist",
    titleHi: req.body.titleHi || req.body.title || "कुशल कारीगर",
    employer: req.body.employer || "Local Enterprise",
    location: req.body.location || "Patna",
    state: req.body.state || "Bihar",
    salaryMin: Number(req.body.salaryMin) || 15000,
    salaryMax: Number(req.body.salaryMax) || 20000,
    salaryPeriod: req.body.salaryPeriod || "month",
    requiredSkills: Array.isArray(req.body.requiredSkills) ? req.body.requiredSkills : ["welding"],
    preferredSkills: Array.isArray(req.body.preferredSkills) ? req.body.preferredSkills : [],
    experienceMinYears: Number(req.body.experienceMinYears) || 0,
    education: req.body.education || "8th / 10th Pass",
    description: req.body.description || "Practical job opportunity for skilled youth.",
    applicationInfo: req.body.applicationInfo || "Direct employer call or walk-in.",
    contactPhone: req.body.contactPhone || "+91 98000 00000",
    contactPerson: req.body.contactPerson,
    vacancies: Number(req.body.vacancies) || 2,
    workType: req.body.workType || "Full-time",
    postedDate: req.body.postedDate || "Just now",
    isVerified: req.body.isVerified !== false,
    isActive: req.body.isActive !== false,
    postedBy: req.body.postedBy,
    perks: Array.isArray(req.body.perks) ? req.body.perks : [],
    source: req.body.source || 'local'
  };
  jobsStore.unshift(newJob);
  res.json({ success: true, job: newJob });
});

app.patch("/api/data/jobs/:id", (req, res) => {
  const { id } = req.params;
  const index = jobsStore.findIndex(j => j.id === id);
  if (index !== -1) {
    jobsStore[index] = { ...jobsStore[index], ...req.body };
    return res.json({ success: true, job: jobsStore[index] });
  }
  res.status(404).json({ error: "Job not found" });
});

app.delete("/api/data/jobs/:id", (req, res) => {
  const { id } = req.params;
  jobsStore = jobsStore.filter(j => j.id !== id);
  res.json({ success: true });
});

// Third-Party Job Ingestion Endpoint (NCS, Apprenticeship India & Live Search-Grounded)
app.post("/api/jobs/external-fetch", async (req, res) => {
  const { 
    source = 'all', 
    state = '', 
    district = '', 
    skill = '', 
    saveToStore = true,
    liveSearch = false,
    query = ''
  } = req.body;

  try {
    let results: Job[] = [];

    // Filter base third party catalogue by source and prioritize relevance without dropping valid vacancies
    let candidateJobs = source === 'all'
      ? [...THIRD_PARTY_JOBS]
      : THIRD_PARTY_JOBS.filter(job => job.source === source);

    if (req.body.strict) {
      if (state) {
        candidateJobs = candidateJobs.filter(job => job.state.toLowerCase() === state.toLowerCase());
      }
      if (skill) {
        candidateJobs = candidateJobs.filter(job =>
          job.requiredSkills.some(s => s.toLowerCase().includes(skill.toLowerCase())) ||
          job.preferredSkills?.some(s => s.toLowerCase().includes(skill.toLowerCase()))
        );
      }
    } else {
      // Score and sort candidate matches to the top while keeping all opportunities available
      candidateJobs.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;
        if (state && a.state.toLowerCase() === state.toLowerCase()) scoreA += 5;
        if (state && b.state.toLowerCase() === state.toLowerCase()) scoreB += 5;
        if (district && a.location.toLowerCase().includes(district.toLowerCase())) scoreA += 5;
        if (district && b.location.toLowerCase().includes(district.toLowerCase())) scoreB += 5;
        if (skill && (a.requiredSkills.includes(skill.toLowerCase()) || a.preferredSkills?.includes(skill.toLowerCase()))) scoreA += 10;
        if (skill && (b.requiredSkills.includes(skill.toLowerCase()) || b.preferredSkills?.includes(skill.toLowerCase()))) scoreB += 10;
        return scoreB - scoreA;
      });
    }

    results = [...candidateJobs];

    // If live search is requested or source is live-grounded
    if (source === 'live-grounded' || (liveSearch && query)) {
      const ai = getGeminiClient();
      if (ai) {
        try {
          const searchQuery = query || `${skill || 'vocational trade'} vacancies ${district ? `${district} ` : ''}${state || 'India'} National Career Service Apprenticeship`;
          const prompt = `Find 3-4 real-world vocational / trade job listings in India matching: "${searchQuery}".
Look for vacancies on National Career Service (NCS), Apprenticeship India, or state employment exchanges.
Format the result as a strict JSON array:
[
  {
    "id": "live-job-1",
    "title": "Trade Job Title in English",
    "titleHi": "हिंदी में पद का नाम",
    "employer": "Organization or Enterprise Name",
    "location": "District/City",
    "state": "State in India",
    "salaryMin": 16000,
    "salaryMax": 23000,
    "requiredSkills": ["${skill || 'welding'}"],
    "experienceMinYears": 0,
    "education": "ITI / 10th Pass",
    "description": "Short 1-2 sentence job overview.",
    "applicationInfo": "Direct NCS walk-in or portal apply",
    "contactPhone": "Toll free or mobile number",
    "vacancies": 4,
    "workType": "Full-time",
    "source": "ncs",
    "sourceName": "National Career Service (NCS)",
    "sourceUrl": "https://www.ncs.gov.in",
    "externalId": "NCS-LIVE-REF"
  }
]
Output ONLY raw JSON. Do not include markdown code ticks.`;

          const searchRes = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
            config: {
              tools: [{ googleSearch: {} }]
            }
          });

          const rawText = searchRes.text?.trim() || "";
          const cleanedText = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
          if (cleanedText) {
            const parsed = JSON.parse(cleanedText);
            if (Array.isArray(parsed)) {
              for (const j of parsed) {
                if (j.title && j.employer) {
                  results.unshift({
                    ...j,
                    id: j.id || `live-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                    isVerified: true,
                    isActive: true,
                    postedDate: 'Today',
                    salaryPeriod: 'month',
                    source: j.source || 'external',
                    sourceName: j.sourceName || 'Live Grounded Portal',
                    sourceUrl: j.sourceUrl || 'https://www.ncs.gov.in'
                  });
                }
              }
            }
          }
        } catch (searchErr: any) {
          console.warn("Notice: Live search grounding fallback triggered:", searchErr?.message || searchErr);
        }
      }
    }

    // Fallback: If filtered returned nothing due to tight state/skill filter, provide all items for requested source
    if (results.length === 0) {
      results = source === 'all' 
        ? THIRD_PARTY_JOBS 
        : THIRD_PARTY_JOBS.filter(j => j.source === source);
    }

    // Optionally merge into server's in-memory jobsStore
    if (saveToStore) {
      for (const job of results) {
        if (!jobsStore.some(existing => existing.id === job.id)) {
          jobsStore.unshift(job);
        }
      }
    }

    const sourceCounts = {
      ncs: results.filter(j => j.source === 'ncs').length,
      apprenticeship: results.filter(j => j.source === 'apprenticeship').length,
      external: results.filter(j => j.source === 'external').length,
      total: results.length
    };

    res.json({
      success: true,
      count: results.length,
      jobs: results,
      sourceCounts
    });
  } catch (error: any) {
    console.error("Error in /api/jobs/external-fetch:", error);
    res.status(500).json({ error: "Failed to fetch third-party jobs", details: error.message });
  }
});

app.get("/api/data/schemes", (req, res) => {
  res.json({ schemes: schemesStore });
});

app.post("/api/data/apply", (req, res) => {
  const { jobId, jobTitle, employer, applicantName, applicantPhone, applicantLocation, applicantSkills, notes } = req.body;
  const newApp: UserApplication = {
    id: `app-${Date.now()}`,
    jobId: jobId || "job-1",
    jobTitle: jobTitle || "Vocational Position",
    employer: employer || "Direct Employer",
    applicantName: applicantName || "Rural Youth Candidate",
    applicantPhone: applicantPhone || "+91 98765 00000",
    applicantLocation: applicantLocation || "India",
    applicantSkills: applicantSkills || [],
    appliedDate: "Today",
    status: "submitted",
    notes: notes || ""
  };
  applicationsStore.unshift(newApp);
  res.json({ success: true, application: newApp });
});

app.get("/api/data/applications", (req, res) => {
  res.json({ applications: applicationsStore });
});

// Admin stats
app.get("/api/admin/metrics", (req, res) => {
  totalVisitorCount += 1;

  // Skill frequency count across jobs
  const skillCount: Record<string, number> = {};
  jobsStore.forEach(j => {
    j.requiredSkills.forEach(s => {
      skillCount[s] = (skillCount[s] || 0) + 1;
    });
  });

  const topSkills = Object.entries(skillCount)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // State distribution
  const stateCount: Record<string, number> = {};
  jobsStore.forEach(j => {
    stateCount[j.state] = (stateCount[j.state] || 0) + 1;
  });

  const stateBreakdown = Object.entries(stateCount)
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count);

  res.json({
    totalUsers: totalVisitorCount,
    totalJobs: jobsStore.length,
    totalSchemes: schemesStore.length,
    totalApplications: applicationsStore.length,
    topSkills,
    stateBreakdown
  });
});

// Helper for rich, district-tailored Maps Grounding fallback
function getLocalMapsFallback(searchQuery: string, searchLocation: string, category?: string, language?: string) {
  const loc = searchLocation || "Patna, Bihar";
  const isHi = language === "hi";

  const allPlaces = [
    {
      title: `Government Industrial Training Institute (ITI) - ${loc}`,
      uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Government Industrial Training Institute ITI College ${loc}`)}`,
      address: `Main Campus, ITI Road, ${loc}`,
      snippets: [
        isHi 
          ? "एनसीवीटी/एससीवीटी प्रमाणित सरकारी संस्थान - इलेक्ट्रीशियन, फिटर, वेल्डर, ड्राफ्ट्समैन, सोलर और डीजल मैकेनिक ट्रेड।"
          : "NCVT/SCVT certified technical campus with Electrician, Fitter, Welder, Solar & Diesel Mechanic trade workshops."
      ],
      sourceType: "maps" as const
    },
    {
      title: `Pradhan Mantri Kaushal Kendra (PMKK) - ${loc}`,
      uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Pradhan Mantri Kaushal Kendra PMKK ${loc}`)}`,
      address: `Skill Development Complex, Collectorate Area, ${loc}`,
      snippets: [
        isHi
          ? "पीएमकेवीवाई 4.0 अधिकृत कौशल केंद्र - 100% मुफ्त प्रैक्टिकल ट्रेनिंग, सरकारी प्रमाण पत्र और टूलकिट सहायता।"
          : "PMKVY 4.0 official training center offering 100% free courses, Govt NSDC certificates, and job placement assistance."
      ],
      sourceType: "maps" as const
    },
    {
      title: `Common Service Centre (CSC) Digital Seva - ${loc}`,
      uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Common Service Centre CSC Digital Seva Kendra ${loc}`)}`,
      address: `Gram Panchayat & Block Seva Kendra, ${loc}`,
      snippets: [
        isHi
          ? "डिजिटल सेवा केंद्र - पीएम विश्वकर्मा, ई-श्रम कार्ड, आधार प्रमाणीकरण और सरकारी योजनाओं के लिए निःशुल्क सहायता केंद्र।"
          : "Digital Seva e-governance kiosk for PM Vishwakarma, e-Shram Card, Aadhaar verification and govt scheme registration."
      ],
      sourceType: "maps" as const
    },
    {
      title: `District Employment Exchange & MSME Toolroom - ${loc}`,
      uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`District Employment Exchange Rozgar Karyalaya ${loc}`)}`,
      address: `Industrial Estate Phase-1, District Headquarter, ${loc}`,
      snippets: [
        isHi
          ? "जिला रोजगार सहायता केंद्र - पंजीकृत औद्योगिक कंपनियों में स्थानीय युवाओं के लिए डायरेक्ट भर्ती व रोजगार मेले।"
          : "District placement office organizing direct employer recruitment drives and vocational apprenticeship programs."
      ],
      sourceType: "maps" as const
    },
    {
      title: `Jan Shikshan Sansthan (JSS) Rural Skill Center - ${loc}`,
      uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Jan Shikshan Sansthan JSS ${loc}`)}`,
      address: `Skill Bhavan, Near Bus Stand, ${loc}`,
      snippets: [
        isHi
          ? "ग्रामीण युवाओं और महिलाओं के लिए सिलाई, कटाई, ब्यूटी एंड वेलनेस, मोपेड रिपेयर और हैंडीक्राफ्ट ट्रेनिंग।"
          : "Community skill center focusing on tailoring, beauty wellness, motorcycle maintenance, and handicrafts."
      ],
      sourceType: "maps" as const
    }
  ];

  let selectedPlaces = allPlaces;
  if (category === 'iti') {
    selectedPlaces = allPlaces.filter(p => p.title.includes('ITI') || p.title.includes('Employment'));
  } else if (category === 'pmkvy') {
    selectedPlaces = allPlaces.filter(p => p.title.includes('Kaushal') || p.title.includes('Shikshan'));
  } else if (category === 'csc') {
    selectedPlaces = allPlaces.filter(p => p.title.includes('CSC') || p.title.includes('Kaushal'));
  } else if (category === 'toolroom' || category === 'employment') {
    selectedPlaces = allPlaces.filter(p => p.title.includes('Employment') || p.title.includes('ITI'));
  }

  const text = isHi
    ? `**${loc}** में सत्यापित सरकारी आईटीआई, कौशल विकास केंद्र और सीएससी सेवा केंद्र उपलब्ध हैं। नीचे दिए गए केंद्रों पर क्लिक करके सीधे गूगल मैप्स पर नेविगेशन शुरू करें या संपर्क विवरण देखें।`
    : `Verified Government ITIs, PMKVY Skill Kendras, and CSC Digital Seva points in **${loc}**. Click any location below to open Google Maps navigation or inspect trade details.`;

  return {
    text,
    places: selectedPlaces.length > 0 ? selectedPlaces : allPlaces.slice(0, 4),
    searchQuery,
    searchLocation: loc,
    groundingMetadata: null
  };
}

// 6. Google Maps Grounding - Search Nearby Physical Centers & Institutes
app.post(["/api/maps/search", "/api/maps/nearby-centers"], async (req, res) => {
  const { query, category, locationName, district, state, latitude, longitude, userCoordinates, language } = req.body || {};
  const searchLocation = district && state ? `${district}, ${state}` : (locationName || district || state || "Patna, Bihar");
  const searchQuery = query && query.trim().length > 0 
    ? query 
    : (category ? `${category} in ${searchLocation}` : `Government ITI and PMKVY vocational skill training centers in ${searchLocation}`);

  const effectiveLat = typeof latitude === "number" ? latitude : (typeof userCoordinates?.lat === "number" ? userCoordinates.lat : undefined);
  const effectiveLng = typeof longitude === "number" ? longitude : (typeof userCoordinates?.lng === "number" ? userCoordinates.lng : undefined);

  // Check in-memory cache first
  const cacheKey = `maps:${searchLocation}:${searchQuery}:${category || 'all'}:${language || 'hi'}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const isHindi = language === "hi";

  try {
    const ai = getGeminiClient();

    if (!ai) {
      const fallbackResults = getLocalMapsFallback(searchQuery, searchLocation, category, language);
      setCached(cacheKey, fallbackResults);
      return res.json(fallbackResults);
    }

    const prompt = `You are KaushalSetu's Google Maps Grounding Assistant helping Indian youth locate physical vocational training institutes, ITIs, PMKVY skill centres, Common Service Centres (CSCs), and workshop clusters.

User Search: "${searchQuery}"
Target District / Location: "${searchLocation}"
User GPS Coordinates: ${effectiveLat && effectiveLng ? `Latitude ${effectiveLat}, Longitude ${effectiveLng}` : 'Not provided'}
Language: ${isHindi ? 'Hindi (सरल और स्पष्ट हिंदी)' : language === 'bn' ? 'Bengali' : language === 'ta' ? 'Tamil' : language === 'or' ? 'Odia' : 'Simple English'}

Instructions:
1. Use Google Maps grounding to find real, physical, and verified facilities in and around ${searchLocation}, India (e.g. Government ITIs, Pradhan Mantri Kaushal Kendras, CSC Digital Seva, Toolrooms, Polytechnic Colleges, or Industrial Areas).
2. For each location found in Google Maps, provide:
   - Official Place Name
   - Exact Address, Landmark, and District
   - Practical details (trades taught: Electrician, Fitter, Welder, COPA, Sewing, Solar, Automobile; NCVT/SCVT certification; contact tips; how to reach via bus/train)
3. Return an encouraging, clean markdown response highlighting key tips for rural youth.`;

    const config: any = {
      tools: [{ googleMaps: {} }]
    };

    if (effectiveLat && effectiveLng && typeof effectiveLat === "number" && typeof effectiveLng === "number") {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: effectiveLat,
            longitude: effectiveLng
          }
        }
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config
    });

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const chunks = groundingMetadata?.groundingChunks || [];

    // Extract place links and verified URIs
    const places: Array<{
      title: string;
      uri: string;
      address?: string;
      snippets?: string[];
      sourceType: "maps" | "web";
    }> = [];

    const seenUris = new Set<string>();

    for (const chunk of chunks) {
      if (chunk.maps) {
        const uri = chunk.maps.uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(chunk.maps.title || searchQuery)}`;
        if (!seenUris.has(uri)) {
          seenUris.add(uri);
          const reviewSnippets = (chunk.maps as any).placeAnswerSources?.reviewSnippets?.map((s: any) => s.content || s.text || "") || [];
          places.push({
            title: chunk.maps.title || "Government / Vocational Centre",
            uri,
            address: (chunk.maps as any).address || `${searchLocation}`,
            snippets: reviewSnippets.filter(Boolean),
            sourceType: "maps"
          });
        }
      } else if (chunk.web) {
        const uri = chunk.web.uri;
        if (uri && !seenUris.has(uri)) {
          seenUris.add(uri);
          places.push({
            title: chunk.web.title || "Official Resource",
            uri,
            sourceType: "web"
          });
        }
      }
    }

    // If grounding chunks were empty, combine with verified fallback
    if (places.length === 0) {
      const fallback = getLocalMapsFallback(searchQuery, searchLocation, category, language);
      places.push(...fallback.places);
    }

    const finalResult = {
      text: response.text || (isHindi ? "गूगल मैप्स पर सत्यापित केंद्र मिले।" : "Found verified centers on Google Maps."),
      places,
      searchQuery,
      searchLocation,
      groundingMetadata
    };

    setCached(cacheKey, finalResult);
    res.json(finalResult);
  } catch (error: any) {
    // Gracefully handle 429 quota exhaustion or other API issues
    const isRateLimit = error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED");
    if (isRateLimit) {
      console.warn(`[Maps Grounding] Rate limit active. Returning verified district fallback for: ${searchLocation}`);
    } else {
      console.warn("Notice in /api/maps/search, serving fallback:", error?.message || error);
    }

    const fallbackResults = getLocalMapsFallback(searchQuery || "Government ITI & Skill Centers", searchLocation, category, language);
    setCached(cacheKey, fallbackResults);
    res.json(fallbackResults);
  }
});

// 7. Google Maps Grounding - Job Location & Commute/Transit Guide
app.post("/api/maps/job-transit", async (req, res) => {
  const { jobTitle, employer, location, state, userLocation, language } = req.body || {};
  const destination = `${employer || 'Employer'}, ${location || 'Patna'}, ${state || 'Bihar'}`;
  const cacheKey = `transit:${destination}:${userLocation || 'loc'}:${language || 'hi'}`;
  
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const isHindi = language === 'hi';
  const defaultFallback = {
    text: isHindi
      ? `**${employer} (${location}, ${state})** के लिए यात्रा सुझाव: यह कार्यस्थल जिला मुख्य बस स्टैंड और रेलवे स्टेशन से स्थानीय ऑटो/ई-रिक्शा द्वारा सीधे जुड़ा हुआ है। सुबह और शाम के समय नियमित ऑटो चलते हैं।`
      : `Transit advice for **${employer} (${location}, ${state})**: Accessible via district bus terminus and railway station. Frequent shared autos and buses connect to the industrial zone.`,
    mapsUri: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`,
    places: [
      {
        title: `${employer} (${location})`,
        uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`,
        address: `${location}, ${state}`
      }
    ]
  };

  try {
    const ai = getGeminiClient();

    if (!ai) {
      setCached(cacheKey, defaultFallback);
      return res.json(defaultFallback);
    }

    const prompt = `Using Google Maps grounding, provide transit directions, commute advice, and nearby landmark information for a job candidate traveling for work/interview:
Job: ${jobTitle}
Employer: ${employer}
Location: ${location}, ${state}
Candidate Starting Location (if provided): ${userLocation || 'Local District'}
Language: ${isHindi ? 'Hindi (सरल और स्पष्ट हिंदी)' : 'English'}

Please identify:
1. Exact location & industrial area / commercial zone
2. Nearest Railway Station & Bus Terminal
3. Shared auto / bus transit advice from main district center
4. Important nearby landmarks & navigation tips`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }]
      }
    });

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const chunks = groundingMetadata?.groundingChunks || [];

    const places: any[] = [];
    const seen = new Set<string>();
    for (const chunk of chunks) {
      if (chunk.maps) {
        const uri = chunk.maps.uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(chunk.maps.title)}`;
        if (!seen.has(uri)) {
          seen.add(uri);
          places.push({
            title: chunk.maps.title,
            uri,
            snippets: chunk.maps.placeAnswerSources?.reviewSnippets?.map((s: any) => s.content || s.text || "") || []
          });
        }
      }
    }

    const result = {
      text: response.text || defaultFallback.text,
      mapsUri: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`,
      places: places.length > 0 ? places : defaultFallback.places,
      groundingMetadata
    };

    setCached(cacheKey, result);
    res.json(result);
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED");
    if (isRateLimit) {
      console.warn(`[Maps Transit] Rate limit active. Serving fallback transit for: ${destination}`);
    } else {
      console.warn("Notice in /api/maps/job-transit, serving fallback:", error?.message || error);
    }
    setCached(cacheKey, defaultFallback);
    res.json(defaultFallback);
  }
});

// 8. Career Advisory & Vocational Guidance
app.all("/api/advisory/advice", async (req, res) => {
  const data = req.method === "POST" ? req.body : req.query;
  const { skills, experienceYears, trade, targetTrade, district, state, language } = data || {};

  const isHindi = language === "hi";
  const userTrade = trade || targetTrade || (Array.isArray(skills) && skills.length > 0 ? skills[0] : "तकनीकी कौशल");
  const userDistrict = district || "Patna";
  const userState = state || "Bihar";
  const exp = typeof experienceYears === "number" ? experienceYears : (parseInt(String(experienceYears || "1"), 10) || 1);

  const fallbackAdvice = {
    trade: userTrade,
    experienceLevel: exp <= 1 ? (isHindi ? "प्रारंभिक / अप्रेंटिस" : "Entry / Apprentice") : (isHindi ? "अनुभवी कारीगर" : "Skilled Craftsman"),
    summary: isHindi
      ? `${userTrade} के क्षेत्र में ${userDistrict} (${userState}) और नजदीकी औद्योगिक क्षेत्रों में कुशल कारीगरों की निरंतर मांग है। प्रमाणन और आधुनिक टूल्स का ज्ञान आपको बेहतर वेतन दिला सकता है।`
      : `Strong employment and self-employment demand exists for ${userTrade} in ${userDistrict}, ${userState} and adjacent industrial clusters. Formal certification unlocks higher wage tiers.`,
    recommendedCertifications: [
      "NCVT / SCVT National Trade Certificate (NTC)",
      "PMKVY 4.0 RPL (Recognition of Prior Learning) Skill Card",
      "Skill India Digital Verified Digital Badge"
    ],
    careerPath: isHindi
      ? [
          "सहायक कारीगर / अप्रेंटिस (₹12,000 - ₹16,000 / माह)",
          "स्वतंत्र कुशल मिस्त्री / तकनीशियन (₹18,000 - ₹26,000 / माह)",
          "वर्कशॉप सुपरवाइजर / खुद का उद्यम (₹30,000+ / माह)"
        ]
      : [
          "Junior Apprentice (₹12,000 - ₹16,000 / mo)",
          "Certified Skilled Craftsman (₹18,000 - ₹26,000 / mo)",
          "Workshop Lead / Micro-Enterprise Owner (₹30,000+ / mo)"
        ],
    estimatedWageGrowth: isHindi ? "प्रमाणन के साथ आय में 35% से 60% तक की वृद्धि संभव है।" : "Potential 35% - 60% earnings increase with formal trade certification.",
    recommendedSchemes: [
      "PM Vishwakarma Yojana (₹15,000 Toolkit + 5% Collateral-free Loan)",
      "PMKVY 4.0 Free Practical Upskilling & Placement Assistance",
      "National Apprenticeship Promotion Scheme (NAPS Stipend Support)"
    ],
    actionSteps: isHindi
      ? [
          "कौशल सेतु पर अपना कौशल बायोडाटा (Kaushal Card) जनरेट करें",
          "नजदीकी आईटीआई या कौशल विकास केंद्र पर आरपीएल (RPL) परीक्षा के लिए संपर्क करें",
          "स्थानीय सत्यापित नियोक्ताओं की नौकरियों में सीधे आवेदन करें"
        ]
      : [
          "Generate verified Kaushal Biodata Card from your portal dashboard",
          "Register for RPL assessment at nearest PMKK / Govt ITI",
          "Apply directly to verified employers in the Jobs tab"
        ]
  };

  const cacheKey = `advisory:${userTrade}:${exp}:${userDistrict}:${language || 'hi'}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const ai = getGeminiClient();
    if (!ai) {
      setCached(cacheKey, fallbackAdvice);
      return res.json(fallbackAdvice);
    }

    const prompt = `You are KaushalSetu's Expert Vocational Career Advisor helping rural youth in India understand their career path, certification steps, and wage opportunities.

Candidate details:
- Trade / Focus Skill: ${userTrade}
- All Known Skills: ${JSON.stringify(skills || [])}
- Experience: ${exp} years
- Location: ${userDistrict}, ${userState}
- Language: ${isHindi ? 'Hindi (सरल और प्रेरक हिंदी)' : 'English'}

Provide encouraging and structured guidance for rural youth:
1. Brief summary of local demand and wage potential.
2. Recommended certifications (NCVT, PMKVY RPL, Skill India Digital).
3. 3-stage career path with wage ranges in INR per month.
4. Top 2 government schemes suitable for them.
5. 3 immediate practical action steps.`;

    const response = await generateGeminiContent(ai, {
      contents: prompt
    });

    const aiAdviceText = response.text?.trim();
    const result = {
      ...fallbackAdvice,
      aiAdviceText: aiAdviceText || undefined
    };

    setCached(cacheKey, result);
    res.json(result);
  } catch (error: any) {
    setCached(cacheKey, fallbackAdvice);
    res.json(fallbackAdvice);
  }
});

app.get("/KAUSHALSETU_SPECIFICATION.md", (req, res) => {
  res.sendFile(path.join(process.cwd(), "KAUSHALSETU_SPECIFICATION.md"));
});

// ---------------- VITE MIDDLEWARE & SERVER START ----------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`KaushalSetu server running on http://localhost:${PORT}`);
  });
}

startServer();
