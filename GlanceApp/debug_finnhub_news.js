// 测试 Finnhub API 返回的真实数据
// 在 EventAnalysisScreen 的 useEffect 中临时添加这段代码来打印

const fetchNewsArticles = async () => {
  try {
    setLoadingNews(true);
    const apiKey = Constants.expoConfig?.extra?.finnhubApiKey || process.env.EXPO_PUBLIC_FINNHUB_API_KEY;
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const url = `https://finnhub.io/api/v1/company-news?symbol=${event.ticker}&from=${sevenDaysAgo}&to=${today}&token=${apiKey}`;
    console.log('📡 Fetching news from:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    // ===== 🔍 打印完整数据结构 =====
    console.log('='.repeat(60));
    console.log('📰 FINNHUB NEWS API RESPONSE');
    console.log('='.repeat(60));
    console.log('Total articles:', data?.length || 0);
    
    if (data && Array.isArray(data) && data.length > 0) {
      console.log('\n📄 First Article (完整数据):');
      console.log(JSON.stringify(data[0], null, 2));
      
      console.log('\n📋 Available Fields (字段列表):');
      Object.keys(data[0]).forEach(key => {
        console.log(`  - ${key}: ${typeof data[0][key]}`);
      });
      
      console.log('\n📰 All Headlines:');
      data.slice(0, 5).forEach((article, index) => {
        console.log(`\n[${index + 1}]`);
        console.log(`  Headline: ${article.headline}`);
        console.log(`  Source: ${article.source}`);
        console.log(`  Date: ${new Date(article.datetime * 1000).toLocaleString()}`);
        console.log(`  Category: ${article.category}`);
        console.log(`  Has Summary: ${!!article.summary}`);
        console.log(`  Has URL: ${!!article.url}`);
        console.log(`  Has Image: ${!!article.image}`);
      });
      
      setNewsArticles(data.slice(0, 5));
    } else {
      console.log('⚠️ No articles returned');
    }
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error fetching news:', error);
  } finally {
    setLoadingNews(false);
  }
};
