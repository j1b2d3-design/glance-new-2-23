# Supabase 集成完整指南

## 📋 集成步骤总览

```
1. 创建数据库表 (Supabase Dashboard)
   ↓
2. 安装依赖包
   ↓
3. 配置通知权限
   ↓
4. 更新 HomeScreen
   ↓
5. 测试
```

---

## Step 1: 创建数据库表

### 在 Supabase Dashboard 执行

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 点击左侧 **SQL Editor**
4. 点击 **New Query**
5. 复制粘贴 `supabase_schema.sql` 的内容
6. 点击 **Run** 执行

### 需要创建的表

- ✅ `analyzed_events` - 分析后的事件
- ✅ `user_portfolio` - 用户持仓
- ✅ `event_cache` - 事件去重缓存

---

## Step 2: 安装依赖

```bash
cd "c:\Users\25684\Downloads\figma design\GlanceApp"

# 安装通知库
npm install expo-notifications

# 安装 AsyncStorage（如果还没有）
npm install @react-native-async-storage/async-storage
```

---

## Step 3: 配置通知权限

### 3.1 修改 `app.json`

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ],
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#000000",
      "androidMode": "default",
      "androidCollapsedTitle": "Glance"
    }
  }
}
```

### 3.2 在 `App.tsx` 中配置通知

```typescript
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 配置通知处理
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// 请求权限
async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    alert('Failed to get push notification permissions!');
    return;
  }

  return true;
}

// 在 App.tsx 的 useEffect 中调用
useEffect(() => {
  registerForPushNotificationsAsync();
}, []);
```

---

## Step 4: 更新 HomeScreen.tsx

### 4.1 替换现有的 `fetchEvents` 函数

找到 `HomeScreen.tsx` 中的这部分代码：

```typescript
// 旧代码（删除）
const fetchEvents = async () => {
  try {
    setLoading(true);
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', currentUserId)
      // ...
  } catch (err) {
    // ...
  }
};
```

替换为：

```typescript
// 新代码
import { SupabaseEventService } from '../services/SupabaseEventService';
import { BackgroundAnalyzer } from '../services/BackgroundAnalyzer';

// 在组件内部
const [dbService] = useState(() => new SupabaseEventService(currentUserId));
const [backgroundAnalyzer] = useState(() => new BackgroundAnalyzer(currentUserId));

useEffect(() => {
  // 启动后台分析
  backgroundAnalyzer.start(15); // 每 15 分钟
  
  // 立即加载事件
  loadEventsFromDb();
  
  return () => {
    backgroundAnalyzer.stop();
  };
}, []);

const loadEventsFromDb = async () => {
  try {
    setLoading(true);
    const events = await dbService.getEvents({ isArchived: false });
    
    // 分类
    const urgent = events.filter(e => e.urgency >= 0.7);
    const window = events.filter(e => e.urgency < 0.7);
    
    setUrgentEvents(urgent);
    setWindowEvents(window);
  } catch (error) {
    console.error('Error loading events:', error);
  } finally {
    setLoading(false);
  }
};
```

### 4.2 更新下拉刷新

```typescript
const onRefresh = async () => {
  setRefreshing(true);
  
  // 触发新一轮分析
  await backgroundAnalyzer.runAnalysis();
  
  // 重新加载
  await loadEventsFromDb();
  
  setRefreshing(false);
};
```

---

## Step 5: 添加用户持仓（测试用）

### 方式 1: 在 Supabase Dashboard 手动添加

1. 打开 **Table Editor**
2. 选择 `user_portfolio` 表
3. 点击 **Insert Row**
4. 填写：
   - `user_id`: `46d0a240-dc45-4ef2-8b61-21bfe24b7624`
   - `ticker`: `AAPL`
   - `shares`: `100`

### 方式 2: 通过代码添加

```typescript
const dbService = new SupabaseEventService(userId);

await dbService.addToPortfolio('AAPL', 100, 150.00);
await dbService.addToPortfolio('MSFT', 50, 300.00);
await dbService.addToPortfolio('GOOGL', 30, 140.00);
```

---

## Step 6: 测试流程

### 6.1 手动触发分析

在 HomeScreen 添加测试按钮：

```typescript
<TouchableOpacity 
  onPress={() => backgroundAnalyzer.runAnalysis()}
  style={styles.testButton}
>
  <Text>🔍 手动分析</Text>
</TouchableOpacity>
```

### 6.2 查看日志

打开 Expo 开发工具，查看控制台输出：

```
📊 Running portfolio analysis...
📈 Analyzing 3 stocks: AAPL, MSFT, GOOGL
🔍 Found 5 total events
🆕 Detected 2 new events
✅ Saved 5 events to Supabase
📬 Sending 2 notifications
✅ Analysis complete
```

### 6.3 验证数据库

在 Supabase Dashboard → Table Editor → `analyzed_events` 查看是否有新数据。

---

## 🎯 完整数据流

```
1. App 启动
   ↓
2. BackgroundAnalyzer.start(15) - 启动后台任务
   ↓
3. 每 15 分钟自动执行:
   ├─ 从 user_portfolio 获取持仓
   ├─ 对每个股票调用 Finnhub API
   ├─ EventAnalyzer 本地分析
   ├─ EventCache 检测新事件
   ├─ 保存到 Supabase (analyzed_events)
   └─ 发送通知
   ↓
4. HomeScreen 从 analyzed_events 读取并显示
   ↓
5. 用户下拉刷新 → 触发 runAnalysis()
```

---

## 📊 数据库查询示例

### 获取未读事件

```sql
SELECT * FROM analyzed_events
WHERE user_id = '46d0a240-dc45-4ef2-8b61-21bfe24b7624'
  AND is_read = FALSE
  AND is_archived = FALSE
ORDER BY urgency DESC, event_timestamp DESC;
```

### 获取特定股票的历史

```sql
SELECT * FROM analyzed_events
WHERE user_id = '46d0a240-dc45-4ef2-8b61-21bfe24b7624'
  AND ticker = 'AAPL'
ORDER BY event_timestamp DESC
LIMIT 10;
```

### 统计每个股票的事件数量

```sql
SELECT ticker, COUNT(*) as event_count
FROM analyzed_events
WHERE user_id = '46d0a240-dc45-4ef2-8b61-21bfe24b7624'
GROUP BY ticker
ORDER BY event_count DESC;
```

---

## ⚠️ 常见问题

### Q1: 通知不显示？

**A**: 检查权限：

```typescript
const { status } = await Notifications.getPermissionsAsync();
console.log('Notification permission:', status);
```

### Q2: 数据库插入失败？

**A**: 检查 RLS 策略是否启用，确保 `auth.uid()` 能正确获取用户 ID。

### Q3: API 调用频率限制？

**A**: Finnhub 免费版限制 60 calls/min。如果持仓超过 10 只股票，考虑增加分析间隔（30 分钟）。

### Q4: 如何清理旧数据？

```sql
-- 删除 30 天前的事件
DELETE FROM analyzed_events
WHERE event_timestamp < NOW() - INTERVAL '30 days';

-- 或者在 Supabase Dashboard 设置定时任务
```

---

## 🚀 下一步优化

1. **用户登录** - 集成 Supabase Auth，获取真实 `user_id`
2. **推送令牌** - 保存 Expo Push Token 到数据库
3. **批量操作** - 优化 API 调用，减少 Finnhub 请求次数
4. **错误重试** - 添加重试机制
5. **性能监控** - 记录分析耗时，优化慢查询

---

## ✅ 验收清单

- [ ] Supabase 表已创建
- [ ] 依赖包已安装
- [ ] 通知权限已配置
- [ ] HomeScreen 已更新
- [ ] 持仓数据已添加
- [ ] 手动测试成功（能看到事件）
- [ ] 下拉刷新有效
- [ ] 通知能正常发送
- [ ] 数据库有新记录
- [ ] 事件能正确归档

完成以上步骤后，你的 Glance App 就完全集成了智能分析系统！🎉
