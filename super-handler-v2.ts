// Supabase Edge Function: super-handler v2
// 升级版 - 数据丰富 + 多角度 Claude AI 分析

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.24.3'

// ========== 初始化客户端 ==========
const SUPABASE_URL = Deno.env.get('SB_URL')!
const SUPABASE_KEY = Deno.env.get('SB_SERVICE_KEY')!
const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_KEY')!
const FINNHUB_KEY = Deno.env.get('FINNHUB_KEY')!
const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID')!
const ONESIGNAL_API_KEY = Deno.env.get('ONESIGNAL_API_KEY')!

console.log(`🔍 SUPABASE_URL: ${SUPABASE_URL}`)
console.log(`🔍 SUPABASE_KEY: ${SUPABASE_KEY.substring(0, 20)}...`)
console.log(`🔍 FINNHUB_KEY: ${FINNHUB_KEY ? 'SET' : 'MISSING'}`)

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY })

// ========== 类型定义 ==========
interface EnrichedContext {
  quote: {
    c: number    // current price
    dp: number   // percent change
    h: number    // high of day
    l: number    // low of day
    o: number    // open
    pc: number   // previous close
    t: number    // timestamp
  } | null
  profile: {
    name: string
    finnhubIndustry: string
    marketCapitalization: number
    logo: string
    weburl: string
    ipo: string
  } | null
  recentNews: Array<{
    headline: string
    source: string
    datetime: number
    summary: string
    url: string
  }>
  historicalEarnings: Array<{
    actual: number
    estimate: number
    period: string
    surprise: number
    surprisePercent: number
    symbol: string
  }>
}

interface InsightResult {
  insight: string
  should_push_immediately: boolean
  urgency_score: number
  user_value_score: number
  market_reaction_score: number
  timing_risk_score: number
  user_fatigue_score: number
  overall_score: number
  confidence: number
  reasoning: string
  quick_take: {
    what_happened: string
    why_it_matters: string
    what_to_expect: string
    sentiment: string
    expected_move: string
    risk_level: string
  }
  reasoning_chain: Array<{
    label: string
    explanation: string
  }> | string  // Support both array (new format) and string (fallback)
  reasoning_chain_summary?: string
  bull_case: string
  bear_case: string
  key_risk: string
  historical_context: string
  sources_used: string[]
}

interface EarningsData {
  symbol: string
  eps_actual?: number
  eps_estimate?: number
  revenue_actual?: number
  revenue_estimate?: number
  date?: string
  market_cap?: number
  [key: string]: any
}

interface UserData {
  id: string
  email?: string
  tickers?: string[] | string
  timezone?: string
  ab_group?: string
  windows?: string[]
  onesignal_player_id?: string
  recent_pushes?: number
  open_rate?: number
}

// ========== Layer 1: 市场数据补充（quote + profile + historical earnings） ==========
// 新闻内容由 Alpaca WebSocket 实时推送，不再从 Finnhub 拉取新闻
async function enrichContext(ticker: string, providedNews: EnrichedContext['recentNews'] = []): Promise<EnrichedContext> {
  console.log(`\n📡 Fetching market context for ${ticker}...`)

  const results: EnrichedContext = {
    quote: null,
    profile: null,
    recentNews: providedNews,  // 直接使用传入的新闻（来自 Alpaca 或 Finnhub earnings webhook）
    historicalEarnings: [],
  }

  try {
    const [quoteRes, profileRes, earningsRes] = await Promise.all([
      // 1. Real-time quote
      fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_KEY}`)
        .then(r => r.json())
        .catch(e => { console.error('❌ Quote fetch failed:', e); return null }),

      // 2. Company profile
      fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${FINNHUB_KEY}`)
        .then(r => r.json())
        .catch(e => { console.error('❌ Profile fetch failed:', e); return null }),

      // 3. Historical earnings (for context only)
      fetch(`https://finnhub.io/api/v1/stock/earnings?symbol=${ticker}&token=${FINNHUB_KEY}`)
        .then(r => r.json())
        .catch(e => { console.error('❌ Earnings history fetch failed:', e); return [] }),
    ])

    results.quote = quoteRes
    results.profile = profileRes
    results.historicalEarnings = Array.isArray(earningsRes) ? earningsRes.slice(0, 4) : []

    console.log(`  ✅ Quote: $${results.quote?.c || 'N/A'} (${results.quote?.dp || 0}%)`)
    console.log(`  ✅ Profile: ${results.profile?.name || 'N/A'} (${results.profile?.finnhubIndustry || 'N/A'})`)
    console.log(`  ✅ News articles: ${results.recentNews.length} (from Alpaca/webhook)`)
    console.log(`  ✅ Historical earnings: ${results.historicalEarnings.length} quarters`)

  } catch (e) {
    console.error('❌ Context enrichment failed:', e)
  }

  return results
}

// ========== Layer 2: 多角度 Claude AI 分析 ==========
async function generateInsight(
  ticker: string,
  earningsData: EarningsData,
  context: EnrichedContext,
  userData?: UserData
): Promise<InsightResult> {
  try {
    const {
      eps_actual = 0,
      eps_estimate = 0,
      revenue_actual = 0,
      revenue_estimate = 0,
    } = earningsData

    const epsVariance = eps_estimate !== 0
      ? ((eps_actual - eps_estimate) / Math.abs(eps_estimate)) * 100
      : 0
    const revenueVariance = revenue_estimate !== 0
      ? ((revenue_actual - revenue_estimate) / Math.abs(revenue_estimate)) * 100
      : 0

    console.log(`\n📊 Analyzing ${ticker} earnings...`)
    console.log(`   EPS: $${eps_actual} vs $${eps_estimate} (${epsVariance > 0 ? '+' : ''}${epsVariance.toFixed(1)}%)`)
    console.log(`   Revenue: $${revenue_actual} vs $${revenue_estimate} (${revenueVariance > 0 ? '+' : ''}${revenueVariance.toFixed(1)}%)`)

    // Build historical earnings context
    const historicalContext = context.historicalEarnings.length > 0
      ? context.historicalEarnings.map((e, i) =>
          `  Q${i + 1}: EPS $${e.actual} vs $${e.estimate} (${e.surprisePercent > 0 ? '+' : ''}${e.surprisePercent?.toFixed(1) || 0}% surprise) - Period: ${e.period}`
        ).join('\n')
      : '  No historical earnings data available'

    // Build recent news context (full article data for AI analysis)
    const newsContext = context.recentNews.length > 0
      ? context.recentNews.map((n, i) =>
          `  [Article ${i + 1}]\n  Headline: "${n.headline}"\n  Source: ${n.source}\n  Time: ${new Date(n.datetime * 1000).toISOString()}\n  Summary: ${n.summary || 'N/A'}\n  URL: ${n.url || 'N/A'}`
        ).join('\n\n')
      : '  No recent news available'

    // Determine if we have real earnings data or just news
    const hasEarningsData = eps_actual !== 0 || eps_estimate !== 0 || revenue_actual !== 0 || revenue_estimate !== 0

    // Build the enriched prompt with TradingAgents multi-agent framework
    const prompt = `You are a multi-agent financial analysis system for "Glance" - a mobile app for investors.

CRITICAL RULES:
1. ALL OUTPUT IN ENGLISH ONLY - zero Chinese characters anywhere
2. Analyze ONLY the actual news articles provided below - do NOT invent events
3. If no article mentions earnings, do NOT discuss earnings or fabricate earnings data
4. If no article mentions a product launch, do NOT discuss product launches
5. ONLY reference facts that appear in the provided data
6. Create original synthesized content - NEVER copy-paste from article headlines or summaries
7. The "insight" title must be a NEW sentence you create, not copied from any headline
8. ABSOLUTELY DO NOT copy any article's "summary" field into "what_happened". You must READ all articles, UNDERSTAND the key themes, then WRITE your own 1-2 sentence synthesis that integrates information across ALL articles. If your what_happened looks similar to any single article's summary, you have FAILED.

# RAW DATA

## News Articles for ${ticker} (${context.recentNews.length} articles)

${newsContext}

## Current Market Data

${context.quote ? `Price: $${context.quote.c} | Change: ${context.quote.dp > 0 ? '+' : ''}${context.quote.dp?.toFixed(2)}% | High: $${context.quote.h} | Low: $${context.quote.l} | Open: $${context.quote.o} | Prev Close: $${context.quote.pc}` : 'Unavailable'}

## Company Profile

${context.profile ? `${context.profile.name} | ${context.profile.finnhubIndustry} | Market Cap: $${context.profile.marketCapitalization}B | IPO: ${context.profile.ipo || 'N/A'}` : 'Unavailable'}
${hasEarningsData ? `
## Earnings Data (from webhook trigger)

EPS: $${eps_actual} actual vs $${eps_estimate} estimate (${epsVariance > 0 ? '+' : ''}${epsVariance.toFixed(1)}%)
Revenue: $${revenue_actual}B actual vs $${revenue_estimate}B estimate (${revenueVariance > 0 ? '+' : ''}${revenueVariance.toFixed(1)}%)` : ''}

## Historical Earnings (for reference ONLY - do not discuss unless news explicitly mentions earnings)

${historicalContext}

## User Context

${userData ? `Recent pushes (7 days): ${userData.recent_pushes || 0} | Open rate: ${userData.open_rate || 50}% | Timezone: ${userData.timezone || 'America/New_York'}` : 'Not provided'}

---

# MULTI-AGENT ANALYSIS FRAMEWORK (inspired by TradingAgents)

Think step by step through 4 specialist agent perspectives before synthesizing.

## AGENT 1: NEWS ANALYST
Read every article above carefully. Identify:
- The dominant narrative across all articles
- Key facts, numbers, names, and specific claims
- What is NEW information vs already known
- Any contradictions between articles
- Extract 3-5 important keywords that capture the core themes

## AGENT 2: SENTIMENT & MARKET CONTEXT ANALYST
Using the news tone + current price action:
- Is the market already pricing this in? (compare news timing vs price move)
- Overall sentiment: fear, greed, uncertainty, or indifference?
- Does the price action confirm or contradict the news narrative?
- Where is the stock trading relative to its daily range?

## AGENT 3: BULL RESEARCHER
Build the strongest possible BULLISH case using ONLY facts from the provided data:
- What growth opportunities does this news reveal?
- What competitive advantages are highlighted?
- What positive indicators support upside?
- Directly counter the bear's likely concerns with specific evidence from the articles

## AGENT 4: BEAR RESEARCHER
Build the strongest possible BEARISH case using ONLY facts from the provided data:
- What risks or threats does this news expose?
- What weaknesses or vulnerabilities are revealed?
- What negative indicators suggest downside?
- Directly counter the bull's optimism with specific evidence from the articles

After all 4 agents analyze, a RISK MANAGER synthesizes: weigh aggressive vs conservative viewpoints and determine the net assessment.

---

# SCORING DIMENSIONS (1-10)

1. urgency_score: Time-sensitivity (9-10: breaking/major; 5-6: moderate; 1-2: routine)
2. user_value_score: Importance to investor (9-10: mega cap, high impact; 5-6: mid cap; 1-2: low relevance)
3. market_reaction_score: Expected price impact (9-10: >10% move; 5-6: 3-8%; 1-2: minimal)
4. timing_risk_score: Risk of pushing now (1-2: good timing; 9-10: bad timing) - LOWER IS BETTER
5. user_fatigue_score: Will this annoy user? (1-2: they want this; 9-10: spam) - LOWER IS BETTER

---

# OUTPUT FORMAT

Return PURE JSON. ALL text in English. No markdown. No code blocks.

{
  "urgency_score": <1-10>,
  "user_value_score": <1-10>,
  "market_reaction_score": <1-10>,
  "timing_risk_score": <1-10>,
  "user_fatigue_score": <1-10>,
  "should_push_immediately": <true/false>,
  "overall_score": <1-10>,
  "confidence": <0.5-1.0>,
  "insight": "YOUR OWN original synthesized headline - max 8 words, punchy and specific. Example: 'Apple Bets Big on AI Wearables Ecosystem'",
  "reasoning": "Push decision rationale in 2-3 sentences",
  "quick_take": {
    "what_happened": "40-50 words max. Synthesize ALL articles into 1-2 concise sentences in your own words. Cover the key theme and 1-2 specific facts. Example: 'Apple is accelerating development of three AI-driven wearables — smart glasses, a Siri pendant, and AI-enhanced AirPods — while Berkshire Hathaway reaffirmed its position as Apple's largest holding despite trimming Amazon.'",
    "why_it_matters": "40-50 words max. 1-2 sentences connecting the news to concrete investor impact — revenue, margins, market share, or valuation. Example: 'New AI hardware categories could reduce Apple's iPhone dependency and open recurring revenue streams, though the crowded wearables market and high execution risk temper near-term upside.'",
    "what_to_expect": "30-40 words max. 1-2 forward-looking sentences. Example: 'Watch for product launch timelines and analyst price target revisions. Berkshire's continued confidence may attract additional institutional interest over the next quarter.'",
    "sentiment": "Bullish | Bearish | Neutral",
    "expected_move": "High | Medium | Low",
    "risk_level": "High | Medium | Low"
  },
  "reasoning_chain": [
    {
      "label": "Specific keyword extracted from actual news (3-7 words)",
      "explanation": "News Analyst: [cite specific fact from article]. Bull view: [why this is positive with evidence]. Bear view: [why this is concerning with evidence]. Net impact: [risk-adjusted synthesis]. (2-3 sentences)"
    }
  ],
  "reasoning_chain_summary": "KeyFact1 → Implication → MarketImpact → InvestorAction (one line)",
  "bull_case": "Bull researcher's strongest argument citing specific evidence from the news (one sentence)",
  "bear_case": "Bear researcher's strongest argument citing specific evidence from the news (one sentence)",
  "key_risk": "Risk manager's #1 concern from the conservative perspective (one sentence)",
  "historical_context": "How similar news has historically impacted this stock, or 'No comparable historical data available'",
  "sources_used": ["recent_news", "real_time_quote", "company_profile", "historical_earnings"]
}

IMPORTANT: 
- "confidence" MUST vary by data quality: 0.85-0.95 if 4+ articles + quote + profile; 0.65-0.80 if 2-3 articles; 0.5-0.65 if 1 article or missing data. Never default to 0.85.
- "reasoning_chain" must have 3-5 nodes. Each "label" should be a real keyword/theme FROM the news, not generic phrases.
- Each "explanation" must show the Bull vs Bear debate for that specific point, citing article evidence.
- "insight" must be a NEW sentence synthesizing the overall theme - not copied from ANY article headline.
- "what_happened" is the MOST IMPORTANT field. It must be YOUR OWN analysis integrating ALL articles into a cohesive narrative. Think: "If I had to explain this to a busy investor in 2 sentences, what would I say?" Do NOT just paraphrase a single article - combine insights from ALL of them.
- If earnings data was not provided or is all zeros, do NOT mention earnings results.

Example of a GOOD reasoning_chain node:
{
  "label": "AI Wearables Acceleration",
  "explanation": "News Analyst: Apple is reportedly accelerating development of three AI-driven wearables including smart glasses and a Siri pendant. Bull view: This opens entirely new product categories and recurring revenue streams beyond iPhone dependency. Bear view: Wearables market is crowded and Apple's track record with new categories is mixed (HomePod struggled). Net impact: Positive medium-term signal if execution aligns with Apple's ecosystem advantages."
}`

    console.log(`\n🧠 Calling Claude with enriched multi-perspective analysis...`)

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text.trim()
      : '{}'

    console.log(`✅ Claude response received (${responseText.length} chars)`)

    // Parse Claude's JSON response
    let result
    try {
      result = JSON.parse(responseText)
    } catch (e) {
      console.log(`⚠️ JSON parse failed, trying to extract JSON...`)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[0])
        } catch (e2) {
          console.log(`⚠️ JSON extraction also failed, using defaults`)
          result = null
        }
      }
    }

    // ========== VALIDATION: Ensure what_happened is AI-synthesized, not copied ==========
    if (result?.quick_take?.what_happened && context.recentNews.length > 0) {
      const whatHappened = result.quick_take.what_happened.toLowerCase().trim()
      
      // Check if what_happened is too similar to any single article's summary (>60% overlap)
      const isCopied = context.recentNews.some(article => {
        if (!article.summary) return false
        const summary = article.summary.toLowerCase().trim()
        // Check if what_happened starts the same as any summary (first 80 chars)
        const prefix = summary.substring(0, 80)
        if (whatHappened.startsWith(prefix.substring(0, 50))) return true
        // Check word overlap ratio
        const whWords = new Set(whatHappened.split(/\s+/).filter(w => w.length > 4))
        const sumWords = summary.split(/\s+/).filter(w => w.length > 4)
        if (sumWords.length === 0) return false
        const overlap = sumWords.filter(w => whWords.has(w)).length
        return overlap / sumWords.length > 0.6
      })

      // Truncate only if extremely long (safety net, ~350 chars ≈ 50 words)
      if (result.quick_take.what_happened.length > 350) {
        const sentences = result.quick_take.what_happened.split(/[.!?]+/)
        result.quick_take.what_happened = sentences.slice(0, 2).join('. ').trim() + '.'
        console.log(`✂️ Truncated what_happened`)
      }
      if (result.quick_take?.why_it_matters?.length > 350) {
        const sentences = result.quick_take.why_it_matters.split(/[.!?]+/)
        result.quick_take.why_it_matters = sentences.slice(0, 2).join('. ').trim() + '.'
      }
      if (result.quick_take?.what_to_expect?.length > 300) {
        const sentences = result.quick_take.what_to_expect.split(/[.!?]+/)
        result.quick_take.what_to_expect = sentences.slice(0, 2).join('. ').trim() + '.'
      }

      if (isCopied) {
        console.log(`⚠️ what_happened detected as copied from article summary - rebuilding synthetically`)
        // Build a programmatic synthesis from multiple articles
        const headlines = context.recentNews.slice(0, 3).map(n => n.headline)
        const company = context.profile?.name || ticker
        const priceInfo = context.quote 
          ? `, with shares ${context.quote.dp >= 0 ? 'up' : 'down'} ${Math.abs(context.quote.dp).toFixed(1)}% to $${context.quote.c}`
          : ''
        
        // Extract key unique phrases from different articles
        const keyPhrases = context.recentNews.slice(0, 3).map(n => {
          // Take the second sentence of each summary if available
          const sentences = (n.summary || n.headline).split(/[.!?]+/).filter(s => s.trim().length > 20)
          return sentences[0]?.trim() || n.headline
        })

        result.quick_take.what_happened = `${company} is making headlines${priceInfo}: ${keyPhrases[0]}${keyPhrases[1] ? `, while separately, ${keyPhrases[1].toLowerCase()}` : ''}.`
        console.log(`✅ Rebuilt what_happened: ${result.quick_take.what_happened.substring(0, 100)}...`)
      } else {
        console.log(`✅ what_happened passed originality check`)
      }
    }

    if (!result) {
      result = {
        urgency_score: 5,
        user_value_score: 5,
        market_reaction_score: 5,
        timing_risk_score: 5,
        user_fatigue_score: 5,
        should_push_immediately: false,
        overall_score: 5,
        confidence: 0.5,
        insight: 'Earnings reported - analysis pending',
        reasoning: 'Could not parse AI response',
        quick_take: {
          what_happened: `${ticker} reported earnings.`,
          why_it_matters: 'Analysis unavailable.',
          what_to_expect: 'Monitor for further developments.',
          sentiment: 'Neutral',
          expected_move: 'Medium',
          risk_level: 'Medium'
        },
        reasoning_chain: [{
          label: 'Event Occurred',
          explanation: `${ticker} reported earnings. Analysis is pending due to parsing error.`
        }, {
          label: 'Analysis Pending',
          explanation: 'Detailed analysis unavailable. Monitor for updates.'
        }],
        reasoning_chain_summary: 'Earnings reported → Analysis pending',
        bull_case: 'Earnings beat could drive upside.',
        bear_case: 'Market may have already priced in the beat.',
        key_risk: 'Guidance uncertainty.',
        historical_context: 'No historical pattern available.',
        sources_used: ['earnings_data']
      }
    }

    // Log the analysis
    console.log(`\n📊 Claude's Multi-Perspective Analysis:`)
    console.log(`   🚨 Urgency: ${result.urgency_score}/10`)
    console.log(`   👤 User Value: ${result.user_value_score}/10`)
    console.log(`   📈 Market Reaction: ${result.market_reaction_score}/10`)
    console.log(`   ⏰ Timing Risk: ${result.timing_risk_score}/10 (lower is better)`)
    console.log(`   😴 User Fatigue: ${result.user_fatigue_score}/10 (lower is better)`)
    console.log(`   📊 Overall Score: ${result.overall_score}/10`)
    console.log(`   💡 Confidence: ${(result.confidence * 100).toFixed(0)}%`)
    console.log(`\n🎯 Quick Take:`)
    console.log(`   What happened: ${result.quick_take?.what_happened}`)
    console.log(`   Why it matters: ${result.quick_take?.why_it_matters}`)
    console.log(`   Sentiment: ${result.quick_take?.sentiment}`)
    console.log(`\n⚖️ Bull vs Bear:`)
    console.log(`   🐂 Bull: ${result.bull_case}`)
    console.log(`   🐻 Bear: ${result.bear_case}`)
    console.log(`   ⚠️ Key Risk: ${result.key_risk}`)
    console.log(`   🔗 Chain: ${Array.isArray(result.reasoning_chain) 
      ? result.reasoning_chain.map((n: any) => n.label).join(' → ') 
      : result.reasoning_chain || result.reasoning_chain_summary}`)
    console.log(`\n🎯 Final Decision:`)
    console.log(`   Push Immediately: ${result.should_push_immediately ? '🚨 YES' : '⏰ NO'}`)
    console.log(`   Sources: ${(result.sources_used || []).join(', ')}`)

    return {
      insight: result.insight || 'Earnings reported',
      should_push_immediately: result.should_push_immediately || false,
      urgency_score: result.urgency_score || 5,
      user_value_score: result.user_value_score || 5,
      market_reaction_score: result.market_reaction_score || 5,
      timing_risk_score: result.timing_risk_score || 5,
      user_fatigue_score: result.user_fatigue_score || 5,
      overall_score: result.overall_score || 5,
      confidence: result.confidence || 0.5,
      reasoning: result.reasoning || 'Standard earnings',
      quick_take: {
        what_happened: result.quick_take?.what_happened || 'Earnings reported.',
        why_it_matters: result.quick_take?.why_it_matters || 'Impact analysis pending.',
        what_to_expect: result.quick_take?.what_to_expect || 'Monitor for developments.',
        sentiment: result.quick_take?.sentiment || 'Neutral',
        expected_move: result.quick_take?.expected_move || 'Medium',
        risk_level: result.quick_take?.risk_level || 'Medium'
      },
      reasoning_chain: result.reasoning_chain || [{
        label: 'Event',
        explanation: 'Earnings reported.'
      }, {
        label: 'Analysis',
        explanation: 'Analysis pending.'
      }],
      reasoning_chain_summary: result.reasoning_chain_summary || 'Earnings → Analysis pending',
      bull_case: result.bull_case || 'Upside possible.',
      bear_case: result.bear_case || 'Downside possible.',
      key_risk: result.key_risk || 'Uncertainty remains.',
      historical_context: result.historical_context || 'No historical data.',
      sources_used: result.sources_used || ['earnings_data']
    }

  } catch (e) {
    console.error('❌ Claude error:', e)
    return {
      insight: 'Earnings reported',
      should_push_immediately: false,
      urgency_score: 5,
      user_value_score: 5,
      market_reaction_score: 5,
      timing_risk_score: 5,
      user_fatigue_score: 5,
      overall_score: 5,
      confidence: 0.3,
      reasoning: 'Error in analysis',
      quick_take: {
        what_happened: 'Earnings reported.',
        why_it_matters: 'Analysis unavailable due to error.',
        what_to_expect: 'Please check back later.',
        sentiment: 'Neutral',
        expected_move: 'Medium',
        risk_level: 'Medium'
      },
      reasoning_chain: [{
        label: 'Error',
        explanation: 'Analysis error occurred.'
      }],
      reasoning_chain_summary: 'Error in analysis',
      bull_case: 'N/A',
      bear_case: 'N/A',
      key_risk: 'Analysis error',
      historical_context: 'N/A',
      sources_used: []
    }
  }
}

// ========== 计算下次推送窗口时间 ==========
function findNextWindow(windows: string[], timezone: string = 'America/New_York'): string {
  const now = new Date()

  if (!windows || windows.length === 0) {
    const later = new Date(now)
    later.setHours(later.getHours() + 8)
    return later.toISOString()
  }

  const windowMinutes = windows.map(w => {
    const [h, m] = w.split(':').map(Number)
    return h * 60 + m
  }).sort((a, b) => a - b)

  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  for (const mins of windowMinutes) {
    if (mins > nowMinutes) {
      const scheduled = new Date(now)
      scheduled.setHours(Math.floor(mins / 60))
      scheduled.setMinutes(mins % 60)
      scheduled.setSeconds(0)
      return scheduled.toISOString()
    }
  }

  const scheduled = new Date(now)
  scheduled.setDate(scheduled.getDate() + 1)
  const firstWindow = windowMinutes[0]
  scheduled.setHours(Math.floor(firstWindow / 60))
  scheduled.setMinutes(firstWindow % 60)
  scheduled.setSeconds(0)
  return scheduled.toISOString()
}

// ========== 创建 Alert 和推送 ==========
async function createAlertAndNotify(
  userId: string,
  ticker: string,
  headline: string,
  insight: string,
  timezone: string,
  abGroup: string,
  windows: string[],
  playerId: string | null | undefined,
  shouldPushImmediately: boolean,
  analysisData: {
    urgency_score: number
    user_value_score: number
    market_reaction_score: number
    timing_risk_score: number
    user_fatigue_score: number
    overall_score: number
    confidence: number
    reasoning: string
    quick_take: {
      what_happened: string
      why_it_matters: string
      what_to_expect: string
      sentiment: string
      expected_move: string
      risk_level: string
    }
    reasoning_chain: Array<{ label: string; explanation: string }> | string
    reasoning_chain_summary?: string
    bull_case: string
    bear_case: string
    key_risk: string
    historical_context: string
    sources_used: string[]
    news_articles?: Array<{ headline: string; source: string; summary: string; url: string; datetime: number }>
  }
) {
  try {
    let scheduledFor: string
    let pushNow = false

    if (shouldPushImmediately) {
      console.log(`\n🚨 URGENT - Push to ALL users immediately`)
      scheduledFor = new Date().toISOString()
      pushNow = true
    } else if (abGroup === 'immediate') {
      console.log(`\n⚡ NORMAL - Immediate group, sending now`)
      scheduledFor = new Date().toISOString()
      pushNow = true
    } else if (abGroup === 'right_time') {
      console.log(`\n⏰ NORMAL - Right_time group, scheduling for window`)
      scheduledFor = findNextWindow(windows, timezone)
      pushNow = false
    } else {
      scheduledFor = new Date().toISOString()
      pushNow = false
    }

    console.log(`   User: ${userId}`)
    console.log(`   Stock: ${ticker}`)
    console.log(`   Group: ${abGroup}`)
    console.log(`   Scores: U=${analysisData.urgency_score} V=${analysisData.user_value_score} M=${analysisData.market_reaction_score} C=${(analysisData.confidence * 100).toFixed(0)}%`)
    console.log(`   Scheduled: ${scheduledFor}`)

    // Insert alert with FULL analysis data (mirrors analyzed_events)
    const { error } = await supabase
      .from('alerts')
      .insert({
        user_id: userId,
        ticker: ticker,
        headline: headline,
        insight: insight,
        scheduled_for: scheduledFor,
        created_at: new Date().toISOString(),
        urgency_score: analysisData.urgency_score,
        user_value_score: analysisData.user_value_score,
        market_reaction_score: analysisData.market_reaction_score,
        timing_risk_score: analysisData.timing_risk_score,
        user_fatigue_score: analysisData.user_fatigue_score,
        overall_score: analysisData.overall_score,
        confidence: analysisData.confidence,
        reasoning: analysisData.reasoning,
        quick_take: analysisData.quick_take,
        reasoning_chain: analysisData.reasoning_chain,
        reasoning_chain_summary: analysisData.reasoning_chain_summary,
        bull_case: analysisData.bull_case,
        bear_case: analysisData.bear_case,
        key_risk: analysisData.key_risk,
        historical_context: analysisData.historical_context,
        sources_used: analysisData.sources_used,
        news_articles: analysisData.news_articles || []
      })

    if (error) {
      console.error(`❌ Error creating alert:`, error)
      return
    }

    console.log(`✅ Alert created with FULL enriched analysis data`)

    if (pushNow && playerId) {
      console.log(`📤 Sending push now...`)
      await sendPushNotification(playerId, ticker, insight)
    } else {
      console.log(`✅ Alert saved, will be delivered later by Cron Job`)
    }

  } catch (e) {
    console.error('❌ Error in createAlertAndNotify:', e)
  }
}

// ========== 发送推送通知 ==========
async function sendPushNotification(
  playerId: string,
  ticker: string,
  insight: string
): Promise<boolean> {
  try {
    if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
      console.log('⚠️ OneSignal not configured')
      return false
    }

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${ONESIGNAL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        include_player_ids: [playerId],
        headings: { en: `📊 ${ticker}` },
        contents: { en: insight },
        data: {
          ticker: ticker,
          insight: insight
        }
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`❌ OneSignal error (${response.status}):`, error)
      return false
    }

    console.log(`✅ Push sent successfully`)
    return true

  } catch (e) {
    console.error('❌ Push error:', e)
    return false
  }
}

// ========== 处理财报事件 ==========
async function handleEarnings(data: any) {
  try {
    if (!data.data || data.data.length === 0) {
      console.log('⚠️ No earnings data')
      return
    }

    const earning = data.data[0]
    const ticker = earning.symbol
    console.log(`\n📈 Processing ${ticker} earnings`)

    // ========== STEP 1: Enrich Context ==========
    console.log(`\n🔄 Step 1: Fetching market context for ${ticker}...`)
    const context = await enrichContext(ticker)

    // Test users (hardcoded)
    const testUsers: UserData[] = [{
      id: '46d0a240-dc45-4ef2-8b61-21bfe24b7624',
      email: 'test@example.com',
      tickers: ['AAPL', 'TSLA'],
      timezone: 'America/New_York',
      ab_group: 'immediate',
      windows: ['07:00', '12:00', '16:00'],
      onesignal_player_id: 'test-player-id-123',
      recent_pushes: 1,
      open_rate: 75
    }]

    console.log(`✅ Using test users (hardcoded)`)

    // Filter users interested in this ticker
    const matchedUsers = testUsers.filter(user => {
      try {
        if (!user.tickers) return false
        let tickersArray = user.tickers
        if (typeof tickersArray === 'string') {
          tickersArray = JSON.parse(tickersArray)
        }
        if (!Array.isArray(tickersArray)) {
          tickersArray = [tickersArray]
        }
        return tickersArray.includes(ticker)
      } catch (e) {
        return false
      }
    })

    console.log(`✅ Found ${matchedUsers.length} users interested in ${ticker}`)

    if (matchedUsers.length === 0) {
      console.log('No matching users')
      return
    }

    // ========== STEP 2: Multi-Perspective Claude Analysis (UPGRADED!) ==========
    console.log(`\n🔄 Step 2: Running enriched Claude analysis...`)
    const analysisResult = await generateInsight(ticker, earning, context, matchedUsers[0])

    console.log(`\n🎯 Final decision:`)
    console.log(`   Should push immediately: ${analysisResult.should_push_immediately ? 'YES' : 'NO'}`)
    console.log(`   Overall score: ${analysisResult.overall_score}/10`)
    console.log(`   Confidence: ${(analysisResult.confidence * 100).toFixed(0)}%`)

    // ========== STEP 3: Save to analyzed_events (with enriched data) ==========
    console.log(`\n💾 Step 3: Saving enriched analysis to analyzed_events...`)

    const { error: insertError } = await supabase
      .from('analyzed_events')
      .insert({
        ticker: ticker,
        headline: analysisResult.insight,
        insight: analysisResult.insight,
        urgency_score: analysisResult.urgency_score,
        user_value_score: analysisResult.user_value_score,
        market_reaction_score: analysisResult.market_reaction_score,
        timing_risk_score: analysisResult.timing_risk_score,
        user_fatigue_score: analysisResult.user_fatigue_score,
        overall_score: analysisResult.overall_score,
        confidence: analysisResult.confidence,
        reasoning: analysisResult.reasoning,
        quick_take: analysisResult.quick_take,
        reasoning_chain: analysisResult.reasoning_chain,
        reasoning_chain_summary: analysisResult.reasoning_chain_summary,
        bull_case: analysisResult.bull_case,
        bear_case: analysisResult.bear_case,
        key_risk: analysisResult.key_risk,
        historical_context: analysisResult.historical_context,
        sources_used: analysisResult.sources_used,
        news_articles: context.recentNews.map(n => ({
          headline: n.headline,
          source: n.source,
          summary: n.summary,
          url: n.url,
          datetime: n.datetime
        })),
        raw_context: {
          quote: context.quote ? {
            price: context.quote.c,
            change_percent: context.quote.dp,
            day_high: context.quote.h,
            day_low: context.quote.l,
            prev_close: context.quote.pc
          } : null,
          company: context.profile ? {
            name: context.profile.name,
            industry: context.profile.finnhubIndustry,
            market_cap: context.profile.marketCapitalization
          } : null,
          recent_headlines: context.recentNews.map(n => n.headline),
          historical_earnings: context.historicalEarnings.map(e => ({
            period: e.period,
            actual: e.actual,
            estimate: e.estimate,
            surprise_percent: e.surprisePercent
          }))
        }
      })

    if (insertError) {
      console.error(`❌ Insert error:`, insertError)
    } else {
      console.log(`✅ Enriched analysis saved to analyzed_events`)
    }

    // ========== STEP 4: Create alerts for each user ==========
    console.log(`\n🔄 Step 4: Creating alerts for matched users...`)

    for (const user of matchedUsers) {
      console.log(`\n📍 Processing user ${user.id}...`)
      await createAlertAndNotify(
        user.id,
        ticker,
        analysisResult.insight,
        analysisResult.insight,
        user.timezone || 'America/New_York',
        user.ab_group || 'immediate',
        user.windows || ['09:00', '12:00', '16:00'],
        user.onesignal_player_id,
        analysisResult.should_push_immediately,
        {
          urgency_score: analysisResult.urgency_score,
          user_value_score: analysisResult.user_value_score,
          market_reaction_score: analysisResult.market_reaction_score,
          timing_risk_score: analysisResult.timing_risk_score,
          user_fatigue_score: analysisResult.user_fatigue_score,
          overall_score: analysisResult.overall_score,
          confidence: analysisResult.confidence,
          reasoning: analysisResult.reasoning,
          quick_take: analysisResult.quick_take,
          reasoning_chain: analysisResult.reasoning_chain,
          bull_case: analysisResult.bull_case,
          bear_case: analysisResult.bear_case,
          key_risk: analysisResult.key_risk,
          historical_context: analysisResult.historical_context,
          sources_used: analysisResult.sources_used,
          news_articles: context.recentNews.map(n => ({
            headline: n.headline,
            source: n.source,
            summary: n.summary,
            url: n.url,
            datetime: n.datetime
          }))
        }
      )
    }

    console.log(`\n✅ All users processed with enriched analysis`)

  } catch (e) {
    console.error('❌ Error in handleEarnings:', e)
  }
}

// ========== 处理 Fly.io WebSocket 实时新闻 ==========
async function handleWebSocketNews(ticker: string, newsItems: any[]) {
  try {
    console.log(`\n📡 WEBSOCKET NEWS: Processing ${newsItems.length} article(s) for ${ticker}`)

    // STEP 1: 拉取市场数据，新闻直接用 Alpaca 推来的
    console.log(`\n🔄 Step 1: Fetching market context (quote + profile + historical earnings) for ${ticker}...`)
    const alpacaNews = newsItems.map(n => ({
      headline: n.headline || '',
      source: n.source || '',
      datetime: n.datetime || Math.floor(Date.now() / 1000),
      summary: n.summary || '',
      url: n.url || '',
    }))
    const context = await enrichContext(ticker, alpacaNews)

    // STEP 2: 从 users 表直接查询订阅了该股票的用户（tickers 字段）
    console.log(`\n🔄 Step 2: Fetching real users who subscribed to ${ticker}...`)
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, email, timezone, ab_group, windows, onesignal_player_id, tickers')
      .contains('tickers', [ticker])

    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      return
    }

    if (!usersData || usersData.length === 0) {
      console.log(`⏭️ No users subscribed to ${ticker}, skipping`)
      return
    }

    const matchedUsers: UserData[] = usersData.map(u => ({
      id: u.id,
      email: u.email,
      timezone: u.timezone || 'America/New_York',
      ab_group: u.ab_group || 'immediate',
      windows: u.windows || ['09:00', '12:00', '16:00'],
      onesignal_player_id: u.onesignal_player_id,
      recent_pushes: 0,
      open_rate: 50,
      tickers: u.tickers,
    }))

    console.log(`✅ Found ${matchedUsers.length} real user(s) subscribed to ${ticker}`)

    // STEP 3: Claude AI 分析
    console.log(`\n🔄 Step 3: Running Claude analysis...`)
    const dummyEarning = { symbol: ticker }
    const analysisResult = await generateInsight(ticker, dummyEarning, context, matchedUsers[0])

    console.log(`\n🎯 Analysis complete:`)
    console.log(`   Overall score: ${analysisResult.overall_score}/10`)
    console.log(`   Confidence: ${(analysisResult.confidence * 100).toFixed(0)}%`)
    console.log(`   Push immediately: ${analysisResult.should_push_immediately ? 'YES 🚨' : 'NO'}`)

    // STEP 4: 存入 analyzed_events
    console.log(`\n💾 Step 4: Saving to analyzed_events...`)
    const newsForDb = context.recentNews.map(n => ({
      headline: n.headline,
      source: n.source,
      summary: n.summary,
      url: n.url,
      datetime: n.datetime,
    }))

    const { error: insertError } = await supabase
      .from('analyzed_events')
      .insert({
        ticker,
        headline: analysisResult.insight,
        insight: analysisResult.insight,
        urgency_score: analysisResult.urgency_score,
        user_value_score: analysisResult.user_value_score,
        market_reaction_score: analysisResult.market_reaction_score,
        timing_risk_score: analysisResult.timing_risk_score,
        user_fatigue_score: analysisResult.user_fatigue_score,
        overall_score: analysisResult.overall_score,
        confidence: analysisResult.confidence,
        reasoning: analysisResult.reasoning,
        quick_take: analysisResult.quick_take,
        reasoning_chain: analysisResult.reasoning_chain,
        reasoning_chain_summary: analysisResult.reasoning_chain_summary,
        bull_case: analysisResult.bull_case,
        bear_case: analysisResult.bear_case,
        key_risk: analysisResult.key_risk,
        historical_context: analysisResult.historical_context,
        sources_used: analysisResult.sources_used,
        news_articles: newsForDb,
        raw_context: {
          quote: context.quote ? {
            price: context.quote.c,
            change_percent: context.quote.dp,
            day_high: context.quote.h,
            day_low: context.quote.l,
            prev_close: context.quote.pc,
          } : null,
          company: context.profile ? {
            name: context.profile.name,
            industry: context.profile.finnhubIndustry,
            market_cap: context.profile.marketCapitalization,
          } : null,
          recent_headlines: context.recentNews.map(n => n.headline),
          trigger_source: 'alpaca-websocket',
        },
      })

    if (insertError) {
      console.error(`❌ Insert error:`, insertError)
    } else {
      console.log(`✅ Saved to analyzed_events`)
    }

    // STEP 5: 为每个用户创建 alert 并推送
    console.log(`\n🔄 Step 5: Creating alerts for ${matchedUsers.length} user(s)...`)
    for (const user of matchedUsers) {
      await createAlertAndNotify(
        user.id,
        ticker,
        analysisResult.insight,
        analysisResult.insight,
        user.timezone || 'America/New_York',
        user.ab_group || 'immediate',
        user.windows || ['09:00', '12:00', '16:00'],
        user.onesignal_player_id,
        analysisResult.should_push_immediately,
        {
          urgency_score: analysisResult.urgency_score,
          user_value_score: analysisResult.user_value_score,
          market_reaction_score: analysisResult.market_reaction_score,
          timing_risk_score: analysisResult.timing_risk_score,
          user_fatigue_score: analysisResult.user_fatigue_score,
          overall_score: analysisResult.overall_score,
          confidence: analysisResult.confidence,
          reasoning: analysisResult.reasoning,
          quick_take: analysisResult.quick_take,
          reasoning_chain: analysisResult.reasoning_chain,
          bull_case: analysisResult.bull_case,
          bear_case: analysisResult.bear_case,
          key_risk: analysisResult.key_risk,
          historical_context: analysisResult.historical_context,
          sources_used: analysisResult.sources_used,
          news_articles: newsForDb,
        }
      )
    }

    console.log(`\n✅ WebSocket news processing complete for ${ticker}`)

  } catch (e) {
    console.error(`❌ Error in handleWebSocketNews for ${ticker}:`, e)
  }
}


// ========== 主 HTTP 处理器 ==========
serve(async (req: Request) => {
  try {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`${new Date().toISOString()} | REQUEST RECEIVED`)
    console.log(`Method: ${req.method}`)

    if (req.method !== 'POST') {
      return new Response('Only POST allowed', { status: 405 })
    }

    const body = await req.json().catch(() => ({}))
    console.log(`Body received:`, JSON.stringify(body).substring(0, 200))

    // 处理来自 Fly.io Alpaca WebSocket 监听器的实时新闻
    if (body.source === 'alpaca-websocket' && body.ticker && Array.isArray(body.news)) {
      console.log(`\n📡 WEBSOCKET NEWS received for ${body.ticker} (${body.news.length} articles)`)
      await handleWebSocketNews(body.ticker, body.news)
      return new Response(JSON.stringify({ success: true, source: 'alpaca-websocket', ticker: body.ticker }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (body.event_message) {
      console.log(`Event type: ${body.event_message}`)
    }

    if (body.data && Array.isArray(body.data)) {
      console.log(`📰 Processing earnings event with enriched analysis`)
      await handleEarnings(body)
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Fatal error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
