/**
 * Glance App - Fly.io News Listener (Alpaca WebSocket)
 *
 * 1. 从 Supabase users 表读取所有用户订阅的股票
 * 2. 连接 Alpaca WebSocket，实时接收新闻
 * 3. 有新闻时，POST 到 Supabase Edge Function (super-handler)
 * 4. 每 30 分钟重新同步用户订阅列表
 */

import WebSocket from 'ws'
import { createClient } from '@supabase/supabase-js'
import http from 'http'

// ========== 环境变量 ==========
const ALPACA_KEY    = process.env.ALPACA_KEY
const ALPACA_SECRET = process.env.ALPACA_SECRET
const SUPABASE_URL  = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const SUPER_HANDLER_URL = process.env.SUPER_HANDLER_URL

if (!ALPACA_KEY || !ALPACA_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SUPER_HANDLER_URL) {
  console.error('❌ Missing required environment variables:')
  console.error('   ALPACA_KEY, ALPACA_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPER_HANDLER_URL')
  process.exit(1)
}

// ========== Supabase 客户端 ==========
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
})

// ========== 状态 ==========
let ws = null
let subscribedTickers = new Set()
let reconnectTimer = null
let syncTimer = null
let pingTimer = null
let isConnected = false

const recentNewsIds = new Set()
const MAX_RECENT_IDS = 500

// ========== Step 1: 从 users 表读取股票 ==========
async function fetchAllTickers() {
  try {
    console.log('\n📋 Fetching tickers from users table...')

    const { data, error } = await supabase
      .from('users')
      .select('tickers')

    if (error) throw error

    const allTickers = new Set()
    for (const row of data || []) {
      let tickers = row.tickers
      if (!tickers) continue
      if (typeof tickers === 'string') {
        try { tickers = JSON.parse(tickers) } catch { continue }
      }
      if (Array.isArray(tickers)) {
        tickers.forEach(t => allTickers.add(t.toUpperCase()))
      }
    }

    const result = [...allTickers]
    console.log(`✅ Found ${result.length} unique tickers: ${result.join(', ')}`)
    return result

  } catch (err) {
    console.error('❌ Failed to fetch tickers:', err.message)
    return []
  }
}

// ========== Step 2: 订阅新闻 ==========
function subscribeToNews(tickers) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return

  // Alpaca: 先取消旧订阅，再订阅新的
  if (subscribedTickers.size > 0) {
    ws.send(JSON.stringify({
      action: 'unsubscribe',
      news: [...subscribedTickers]
    }))
    console.log(`  ➖ Unsubscribed all previous tickers`)
  }

  if (tickers.length > 0) {
    ws.send(JSON.stringify({
      action: 'subscribe',
      news: tickers
    }))
    subscribedTickers = new Set(tickers)
    console.log(`  ➕ Subscribed: ${tickers.join(', ')}`)
  }
}

// ========== Step 3: 转发新闻到 Supabase ==========
async function forwardNewsToSupabase(newsItem) {
  const id = String(newsItem.id)
  if (recentNewsIds.has(id)) {
    console.log(`  ⏭️  News ${id} already processed, skipping`)
    return
  }
  recentNewsIds.add(id)
  if (recentNewsIds.size > MAX_RECENT_IDS) {
    const first = recentNewsIds.values().next().value
    recentNewsIds.delete(first)
  }

  // Alpaca 新闻的 symbols 字段是数组
  const relatedTickers = (newsItem.symbols || []).filter(t => subscribedTickers.has(t))
  if (relatedTickers.length === 0) {
    console.log(`  ⏭️  No subscribed tickers in this news, skipping`)
    return
  }

  for (const ticker of relatedTickers) {
    console.log(`\n📤 Forwarding news for ${ticker} → super-handler`)
    console.log(`   Headline: ${newsItem.headline}`)
    console.log(`   Source: ${newsItem.source}`)

    try {
      const body = {
        source: 'finnhub-websocket',
        trigger: 'news',
        ticker,
        news: [{
          id: newsItem.id,
          headline: newsItem.headline,
          summary: newsItem.summary,
          source: newsItem.source,
          url: newsItem.url,
          datetime: Math.floor(new Date(newsItem.created_at).getTime() / 1000),
          content: newsItem.content,
          author: newsItem.author,
        }],
      }

      const res = await fetch(SUPER_HANDLER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        console.log(`  ✅ ${ticker} → super-handler OK (${res.status})`)
      } else {
        const text = await res.text()
        console.error(`  ❌ ${ticker} → super-handler failed (${res.status}): ${text}`)
      }
    } catch (err) {
      console.error(`  ❌ Failed to forward news for ${ticker}:`, err.message)
    }
  }
}

// ========== Step 4: 连接 Alpaca WebSocket ==========
function connect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }

  const wsUrl = 'wss://stream.data.alpaca.markets/v1beta1/news'
  console.log('\n🔌 Connecting to Alpaca News WebSocket...')
  ws = new WebSocket(wsUrl)

  ws.on('open', () => {
    console.log('✅ WebSocket connected, authenticating...')
    ws.send(JSON.stringify({
      action: 'auth',
      key: ALPACA_KEY,
      secret: ALPACA_SECRET,
    }))
  })

  ws.on('message', async (raw) => {
    try {
      const messages = JSON.parse(raw.toString())

      // Alpaca sends arrays of messages
      for (const msg of Array.isArray(messages) ? messages : [messages]) {

        if (msg.T === 'success' && msg.msg === 'connected') {
          console.log('✅ Alpaca: connected')
        }

        else if (msg.T === 'success' && msg.msg === 'authenticated') {
          isConnected = true
          console.log('✅ Alpaca: authenticated')

          // 认证成功后订阅股票
          const tickers = await fetchAllTickers()
          subscribeToNews(tickers)

          // 每 30 分钟同步订阅列表
          if (syncTimer) clearInterval(syncTimer)
          syncTimer = setInterval(async () => {
            console.log('\n🔄 Syncing subscription list...')
            const latest = await fetchAllTickers()
            subscribeToNews(latest)
          }, 30 * 60 * 1000)

          // 每 30 秒发 ping 保活
          if (pingTimer) clearInterval(pingTimer)
          pingTimer = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.ping()
            }
          }, 30 * 1000)
        }

        else if (msg.T === 'subscription') {
          console.log(`✅ Subscription confirmed: news=[${(msg.news || []).join(', ')}]`)
        }

        else if (msg.T === 'n') {
          // 新闻消息
          console.log(`\n📰 News received: "${msg.headline}" (${(msg.symbols || []).join(', ')})`)
          await forwardNewsToSupabase(msg)
        }

        else if (msg.T === 'error') {
          console.error('❌ Alpaca error:', msg.msg, msg.code)
        }
      }
    } catch (err) {
      console.error('❌ Failed to parse message:', err.message)
    }
  })

  ws.on('close', (code, reason) => {
    isConnected = false
    subscribedTickers.clear()
    if (syncTimer) clearInterval(syncTimer)
    if (pingTimer) clearInterval(pingTimer)
    console.log(`\n⚠️  WebSocket closed (code: ${code})`)
    console.log('   Reconnecting in 5 seconds...')
    reconnectTimer = setTimeout(connect, 5000)
  })

  ws.on('error', (err) => {
    console.error('❌ WebSocket error:', err.message)
  })
}

// ========== HTTP 健康检查 ==========
const healthServer = http.createServer((req, res) => {
  res.writeHead(isConnected ? 200 : 503, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({
    status: isConnected ? 'ok' : 'disconnected',
    provider: 'alpaca',
    subscribedTickers: [...subscribedTickers],
    recentNewsProcessed: recentNewsIds.size,
    timestamp: new Date().toISOString(),
  }))
})

healthServer.listen(3000, () => {
  console.log('🏥 Health check server running on port 3000')
})

// ========== 启动 ==========
console.log('🚀 Glance News Listener starting (Alpaca)...')
console.log(`   Supabase URL: ${SUPABASE_URL}`)
console.log(`   Super-handler: ${SUPER_HANDLER_URL}`)
connect()

// 优雅退出
process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...')
  if (ws) ws.close()
  if (syncTimer) clearInterval(syncTimer)
  if (pingTimer) clearInterval(pingTimer)
  healthServer.close()
  process.exit(0)
})
