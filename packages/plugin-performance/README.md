# Performance Plugin - 性能监控插件

该插件用于采集页面关键性能指标（FP/FCP/LCP/CLS/FID等）与资源加载耗时，支持实时监控和批量上报。

## 安装

```bash
pnpm add @hawk-tracker/plugin-performance
```

## 快速开始

```ts
import { init } from '@hawk-tracker/core';
import { PerformancePlugin } from '@hawk-tracker/plugin-performance';

const tracker = init({ dsn: '/api/track', debug: true });

tracker.use(PerformancePlugin, {
  enableWebVitals: true, // 启用 Web Vitals 监控
  enableResourceTiming: true, // 启用资源加载监控
  enableNavigationTiming: true, // 启用导航性能监控
  resourceTypes: ['script', 'css', 'img', 'fetch', 'xmlhttprequest'], // 监控的资源类型
  performanceThresholds: {
    // 性能阈值配置
    loadTime: 3000,
    domContentLoaded: 1500,
    firstPaint: 1000,
    lcp: 2500,
    fid: 100,
    cls: 0.1,
  },
});
```

## 功能特性

### 1. 导航性能监控

- **页面加载时间**：完整的页面加载耗时
- **DOM 内容加载**：DOM 解析完成时间
- **首次绘制 (FP)**：首次像素渲染时间
- **首次内容绘制 (FCP)**：首次内容渲染时间
- **DNS 解析时间**：域名解析耗时
- **TCP 连接时间**：TCP 连接建立耗时
- **请求响应时间**：HTTP 请求处理耗时
- **DOM 解析时间**：DOM 树构建耗时
- **重定向时间**：页面重定向耗时
- **安全连接时间**：HTTPS 握手耗时

### 2. Web Vitals 监控

- **LCP (Largest Contentful Paint)**：最大内容绘制时间
- **FID (First Input Delay)**：首次输入延迟
- **CLS (Cumulative Layout Shift)**：累积布局偏移

### 3. 资源加载监控

- **资源类型**：script、css、img、fetch、xmlhttprequest
- **加载耗时**：资源完整加载时间
- **传输大小**：资源传输字节数
- **网络时间**：DNS 解析、TCP 连接、请求响应时间

## 数据上报格式

### 导航性能数据

```json
{
  "type": "navigation",
  "timestamp": 1703123456789,
  "loadTime": 2345,
  "domContentLoaded": 1234,
  "firstPaint": 567,
  "firstContentfulPaint": 890,
  "dnsTime": 12,
  "tcpTime": 45,
  "requestTime": 234,
  "domParseTime": 123,
  "domReadyTime": 67,
  "redirectTime": 0,
  "unloadTime": 0,
  "secureConnectionTime": 23
}
```

### Web Vitals 数据

```json
{
  "type": "web_vitals",
  "timestamp": 1703123456789,
  "metric": "LCP",
  "value": 2456,
  "element": "IMG"
}
```

### 资源加载数据

```json
{
  "type": "resource",
  "timestamp": 1703123456789,
  "name": "https://example.com/app.js",
  "duration": 1234,
  "transferSize": 45678,
  "initiatorType": "script",
  "startTime": 567,
  "responseEnd": 1801,
  "domainLookupStart": 567,
  "domainLookupEnd": 579,
  "connectStart": 579,
  "connectEnd": 624,
  "requestStart": 624,
  "responseStart": 1456
}
```

## 配置选项

| 选项                     | 类型     | 默认值                                              | 描述                     |
| ------------------------ | -------- | --------------------------------------------------- | ------------------------ |
| `enableWebVitals`        | boolean  | true                                                | 是否启用 Web Vitals 监控 |
| `enableResourceTiming`   | boolean  | true                                                | 是否启用资源加载监控     |
| `enableNavigationTiming` | boolean  | true                                                | 是否启用导航性能监控     |
| `resourceTypes`          | string[] | ['script', 'css', 'img', 'fetch', 'xmlhttprequest'] | 监控的资源类型           |
| `performanceThresholds`  | object   | -                                                   | 性能阈值配置             |

### 性能阈值配置

```ts
interface PerformanceThresholds {
  loadTime?: number; // 页面加载时间阈值 (ms)
  domContentLoaded?: number; // DOM 加载时间阈值 (ms)
  firstPaint?: number; // 首次绘制时间阈值 (ms)
  lcp?: number; // LCP 阈值 (ms)
  fid?: number; // FID 阈值 (ms)
  cls?: number; // CLS 阈值
}
```

## 公共 API

### 手动收集性能数据

```ts
const performancePlugin = tracker.getPlugin('performance');
const perfData = performancePlugin.collectManualPerformanceData();
```

### 获取资源性能数据

```ts
const resourceData = performancePlugin.getResourceTimingData();
```

### 获取资源摘要

```ts
const summary = performancePlugin.getResourceSummary();
// 返回: { totalResources: 10, totalBytes: 1024000, byType: {...} }
```

### 获取插件状态

```ts
const status = performancePlugin.getPluginStatus();
// 返回: { isInstalled: true, options: {...}, observersCount: 3 }
```

## 事件监听

插件会自动监听以下事件：

- `load`：页面完全加载完成
- `readystatechange`：DOM 内容加载完成

## 兼容性

- **PerformanceObserver**：需要浏览器支持 PerformanceObserver API
- **现代浏览器**：Chrome 51+, Firefox 55+, Safari 11+, Edge 79+
- **降级处理**：不支持 PerformanceObserver 的环境会自动跳过相关监控

## 最佳实践

### 1. 生产环境配置

```ts
tracker.use(PerformancePlugin, {
  enableWebVitals: true,
  enableResourceTiming: false, // 生产环境可关闭详细资源监控
  enableNavigationTiming: true,
  performanceThresholds: {
    loadTime: 3000, // 3秒
    lcp: 2500, // 2.5秒
    fid: 100, // 100ms
    cls: 0.1, // 0.1
  },
});
```

### 2. 性能优化建议

- 生产环境建议关闭详细资源监控以减少数据量
- 设置合理的性能阈值，避免过多正常数据上报
- 结合错误监控插件，分析性能问题与错误的关系
- 定期分析 Web Vitals 数据，优化用户体验

### 3. 调试模式

```ts
const tracker = init({
  dsn: '/api/track',
  debug: true, // 开启调试模式查看详细日志
});
```

## 故障排除

### 1. 数据未上报

- 检查浏览器是否支持 PerformanceObserver
- 确认插件已正确安装和配置
- 查看控制台是否有错误信息

### 2. 数据不准确

- 确保在页面完全加载后收集数据
- 检查网络环境对性能数据的影响
- 验证性能阈值设置是否合理

### 3. 性能影响

- 监控功能本身对性能影响极小
- 如发现影响，可关闭部分监控功能
- 使用采样率控制数据上报频率
