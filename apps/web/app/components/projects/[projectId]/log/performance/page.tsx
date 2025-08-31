import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MockAPI, Project, PerformanceMetric, PerformanceSummary } from '../../../../../api/mockAPI';

export default function PerformancePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [performanceSummary, setPerformanceSummary] = useState<PerformanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'core-metrics' | 'interaction-metrics' | 'supplementary-metrics' | 'api-performance'>('overview');

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;

      try {
        const [projectData, metricsData, summaryData] = await Promise.all([
          MockAPI.getProject(projectId),
          MockAPI.getPerformanceMetrics(projectId),
          MockAPI.getPerformanceSummary(projectId)
        ]);

        setProject(projectData);
        setPerformanceMetrics(metricsData);
        setPerformanceSummary(summaryData);
      } catch (error) {
        console.error('获取性能数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

    // 模拟触发性能测试
    const testPerformance = async (testType: string) => {
      if (!projectId) return;
  
      try {
        let newMetric: Omit<PerformanceMetric, 'id'> | undefined;
  
        switch (testType) {
          case 'core':
            // 测试核心性能指标：FP, FCP, LCP, TTFB
            newMetric = {
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
              type: 'navigation',
              loadTime: Math.floor(Math.random() * 2000) + 800,
              domContentLoaded: Math.floor(Math.random() * 1000) + 500,
              firstPaint: Math.floor(Math.random() * 1000) + 200, // FP
              firstContentfulPaint: Math.floor(Math.random() * 1800) + 300, // FCP
              timeToFirstByte: Math.floor(Math.random() * 800) + 100, // TTFB
              // LCP 通过单独的 web_vitals 记录
              pageUrl: window.location.href,
              userAgent: navigator.userAgent
            };
            break;
            
            case 'interaction':
              // 测试交互性能指标：INP, TBT, CLS
              const interactionMetrics = ['INP', 'TBT', 'CLS'] as const;
              const selectedMetric = interactionMetrics[Math.floor(Math.random() * interactionMetrics.length)];
              
              let interactionValue: number = 0; // 添加默认值
              switch (selectedMetric) {
                case 'INP':
                  interactionValue = Math.floor(Math.random() * 300) + 100;
                  break;
                case 'TBT':
                  interactionValue = Math.floor(Math.random() * 400) + 100;
                  break;
                case 'CLS':
                  interactionValue = Math.random() * 0.3;
                  break;
              }
              
              newMetric = {
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                type: 'web_vitals',
                metric: selectedMetric,
                value: interactionValue,
                element: selectedMetric === 'CLS' ? 'DIV' : selectedMetric === 'INP' ? 'BUTTON' : undefined,
                pageUrl: window.location.href,
                userAgent: navigator.userAgent
              };
              break;
            
          case 'supplementary':
            // 测试补充性能指标：DNS, TCP, DOM解析, 首屏时间, 白屏时间, 资源加载, 长任务
            const supplementaryTypes = ['dns', 'tcp', 'dom', 'firstScreen', 'whiteScreen', 'resource', 'longTask'] as const;
            const selectedSupplementary = supplementaryTypes[Math.floor(Math.random() * supplementaryTypes.length)];
            
            switch (selectedSupplementary) {
              case 'dns':
              case 'tcp':
              case 'dom':
              case 'firstScreen':
              case 'whiteScreen':
                newMetric = {
                  timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                  type: 'navigation',
                  loadTime: Math.floor(Math.random() * 2000) + 800,
                  domContentLoaded: Math.floor(Math.random() * 1000) + 500,
                  dnsTime: selectedSupplementary === 'dns' ? Math.floor(Math.random() * 200) + 50 : Math.floor(Math.random() * 100) + 50,
                  tcpTime: selectedSupplementary === 'tcp' ? Math.floor(Math.random() * 150) + 40 : Math.floor(Math.random() * 100) + 40,
                  domParseTime: selectedSupplementary === 'dom' ? Math.floor(Math.random() * 300) + 100 : Math.floor(Math.random() * 200) + 100,
                  firstScreenTime: selectedSupplementary === 'firstScreen' ? Math.floor(Math.random() * 1500) + 600 : Math.floor(Math.random() * 800) + 600,
                  whiteScreenTime: selectedSupplementary === 'whiteScreen' ? Math.floor(Math.random() * 500) + 100 : Math.floor(Math.random() * 300) + 100,
                  pageUrl: window.location.href,
                  userAgent: navigator.userAgent
                };
                break;
              case 'resource':
                newMetric = {
                  timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                  type: 'resource',
                  name: `https://example.com/static/supplementary-${Date.now()}.js`,
                  duration: Math.floor(Math.random() * 300) + 50,
                  transferSize: Math.floor(Math.random() * 800000) + 100000,
                  initiatorType: ['script', 'stylesheet', 'img', 'fetch'][Math.floor(Math.random() * 4)] as any,
                  startTime: Math.floor(Math.random() * 1000),
                  responseEnd: Math.floor(Math.random() * 1500) + 1000,
                  pageUrl: window.location.href,
                  userAgent: navigator.userAgent
                };
                break;
              case 'longTask':
                newMetric = {
                  timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                  type: 'long_task',
                  longTaskCount: Math.floor(Math.random() * 5) + 1,
                  longTaskDuration: Math.floor(Math.random() * 500) + 50,
                  pageUrl: window.location.href,
                  userAgent: navigator.userAgent
                };
                break;
              default:
                return;
              }
              break;
              
            case 'api':
              // 测试API接口性能
              const apiPerf = getApiPerf('mockAPI');
              if (apiPerf) {
                newMetric = {
                  timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                  type: 'resource',
                  name: apiPerf.url,
                  duration: apiPerf.duration,
                  transferSize: apiPerf.transferSize,
                  initiatorType: 'fetch',
                  startTime: 0,
                  responseEnd: apiPerf.duration,
                  pageUrl: window.location.href,
                  userAgent: navigator.userAgent
                };
              } else {
                // 如果没有找到真实API调用，生成模拟数据
                newMetric = {
                  timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                  type: 'resource',
                  name: `https://api.example.com/performance-test-${Date.now()}`,
                  duration: Math.floor(Math.random() * 500) + 100,
                  transferSize: Math.floor(Math.random() * 50000) + 10000,
                  initiatorType: 'fetch',
                  startTime: 0,
                  responseEnd: Math.floor(Math.random() * 500) + 100,
                  pageUrl: window.location.href,
                  userAgent: navigator.userAgent
                };
              }
              break;
              
              default:
                return;
            }
    
            if (!newMetric) return;
            
            const addedMetric = await MockAPI.addPerformanceMetric(projectId, newMetric);
            setPerformanceMetrics(prev => [addedMetric, ...prev]);
    
            // 重新获取摘要数据
            const updatedSummary = await MockAPI.getPerformanceSummary(projectId);
            setPerformanceSummary(updatedSummary);
    
            const testTypeNames = {
              'core': '核心性能指标',
              'interaction': '交互性能指标', 
              'supplementary': '补充性能指标',
              'api': 'API接口性能'
            };
            
            alert(`${testTypeNames[testType as keyof typeof testTypeNames]}测试数据添加成功！`);
          } catch (error) {
            console.error('添加性能测试数据失败:', error);
            alert('添加测试数据失败，请重试！');
          }
        };
  

    // 格式化时间
    const formatTime = (ms: number | undefined): string => {
      if (ms === undefined) return 'N/A';
      return `${ms}ms`;
    };

    // 格式化文件大小
    const formatFileSize = (bytes: number | undefined): string => {
      if (bytes === undefined) return 'N/A';
      if (bytes < 1024) return `${bytes}B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    };

    // 定义返回的接口性能数据类型
    interface ApiPerfMetrics {
      url: string;
      duration: number;          // 总耗时
      dns: number;               // DNS 解析
      tcp: number;               // TCP 连接
      tls: number;               // TLS 握手
      request: number;           // 请求时间
      response: number;          // 响应时间
      transferSize: number;      // 响应大小 (字节数)
    }

    /**
     * 获取指定 URL 的接口性能数据
     * @param urlPart 接口 URL 或者 URL 关键字
     * @returns ApiPerfMetrics | null
     */
    function getApiPerf(urlPart: string): ApiPerfMetrics | null {
      const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
  
      const target = entries.find(
        (entry) =>
          (entry.initiatorType === "fetch" || entry.initiatorType === "xmlhttprequest") &&
          entry.name.includes(urlPart)
      );
  
      if (!target) return null;
  
      return {
        url: target.name,
        duration: target.duration,
        dns: target.domainLookupEnd - target.domainLookupStart,
        tcp: target.connectEnd - target.connectStart,
        tls: target.secureConnectionStart > 0 ? target.connectEnd - target.secureConnectionStart : 0,
        request: target.responseStart - target.requestStart,
        response: target.responseEnd - target.responseStart,
        transferSize: target.transferSize
      };
    }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* 面包屑导航 */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              应用首页
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link to="/projects" className="text-gray-700 hover:text-blue-600 transition-colors">
                项目管理
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-900 font-medium">性能监控</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* 页面标题 */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">性能监控</h1>

      {/* 性能测试按钮 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">性能监控测试</h2>
        <p className="text-sm text-gray-600 mb-4">
          点击下面的按钮来模拟性能数据收集。这些数据会被PerformancePlugin捕获并上报。
        </p>
        
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => testPerformance('core')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            测试核心性能指标
          </button>
          <button
            onClick={() => testPerformance('interaction')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            测试交互性能指标
          </button>
          <button
            onClick={() => testPerformance('supplementary')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
          >
            测试补充性能指标
          </button>
          <button
            onClick={() => testPerformance('api')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
          >
            测试API接口性能
          </button>
        </div>
      </div>

      {/* 性能摘要 */}
      {performanceSummary && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-6">性能摘要</h2>
          
          {/* 核心性能指标 - 移除了角标 */}
          <div className="mb-8">
            <h3 className="text-md font-medium text-gray-900 mb-4">核心性能指标 </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-700">FP (首次绘制)</h4>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatTime(performanceSummary.coreMetrics?.fp?.value || performanceSummary.averageFirstPaint)}</p>
                <p className="text-xs text-gray-600 mt-1">良好: ≤1000ms</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-700">FCP (首次内容绘制)</h4>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatTime(performanceSummary.coreMetrics?.fcp?.value || performanceSummary.averageFirstContentfulPaint)}</p>
                <p className="text-xs text-gray-600 mt-1">良好: ≤1.8s</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-700">LCP (最大内容绘制)</h4>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatTime(performanceSummary.coreMetrics?.lcp?.value || performanceSummary.webVitals.lcp.value)}</p>
                <p className="text-xs text-gray-600 mt-1">良好: ≤2.5s</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-700">TTFB (首字节时间)</h4>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatTime(performanceSummary.coreMetrics?.ttfb?.value || performanceSummary.averageTimeToFirstByte || 0)}</p>
                <p className="text-xs text-gray-600 mt-1">良好: ≤800ms</p>
              </div>
            </div>
          </div>

          {/* 交互性能指标 - 移除了角标 */}
          <div className="mb-8">
            <h3 className="text-md font-medium text-gray-900 mb-4">交互性能指标</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 border border-teal-200">
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-700">INP (交互到下次绘制)</h4>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatTime(performanceSummary.interactionMetrics?.inp?.value || 0)}</p>
                <p className="text-xs text-gray-600 mt-1">良好: ≤200ms</p>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-700">TBT (总阻塞时间)</h4>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatTime(performanceSummary.interactionMetrics?.tbt?.value || 0)}</p>
                <p className="text-xs text-gray-600 mt-1">良好: ≤200ms</p>
              </div>
              
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 border border-pink-200">
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-700">CLS (累积布局偏移)</h4>
                </div>
                <p className="text-2xl font-bold text-gray-900">{performanceSummary.interactionMetrics?.cls?.value || performanceSummary.webVitals.cls.value}</p>
                <p className="text-xs text-gray-600 mt-1">良好: ≤0.1</p>
              </div>
            </div>
          </div>

          {/* 补充性能指标 - 移除了角标 */}
          <div className="mb-8">
            <h3 className="text-md font-medium text-gray-900 mb-4">补充性能指标</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-500">DNS解析时间</h4>
                </div>
                <p className="text-xl font-bold text-gray-900">{formatTime(performanceSummary.supplementaryMetrics?.dns?.value || 0)}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-500">TCP连接时间</h4>
                </div>
                <p className="text-xl font-bold text-gray-900">{formatTime(performanceSummary.supplementaryMetrics?.tcp?.value || 0)}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-500">DOM解析时间</h4>
                </div>
                <p className="text-xl font-bold text-gray-900">{formatTime(performanceSummary.supplementaryMetrics?.dom?.value || 0)}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-500">首屏加载时间</h4>
                </div>
                <p className="text-xl font-bold text-gray-900">{formatTime(performanceSummary.supplementaryMetrics?.firstScreen?.value || 0)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-500">白屏时间</h4>
                </div>
                <p className="text-xl font-bold text-gray-900">{formatTime(performanceSummary.supplementaryMetrics?.whiteScreen?.value || 0)}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-500">资源加载时间</h4>
                </div>
                <p className="text-xl font-bold text-gray-900">{formatTime(performanceSummary.supplementaryMetrics?.resourceLoad?.value || 0)}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-500">长任务</h4>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  <span className="text-xl">{performanceSummary.supplementaryMetrics?.longTask?.count || 0}</span>
                  <span className="text-sm ml-1">个任务</span>
                </div>
                <p className="text-sm text-gray-600">{formatTime(performanceSummary.supplementaryMetrics?.longTask?.duration || 0)} 总时长</p>
              </div>
            </div>
          </div>

          {/* API接口性能指标 */}
          <div className="mb-8">
            <h3 className="text-md font-medium text-gray-900 mb-4">API接口性能指标</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-700">API调用总数</h4>
                </div>
                <p className="text-2xl font-bold text-gray-900">{performanceSummary.apiPerformance.totalApiCalls}</p>
                <p className="text-xs text-gray-600 mt-1">接口调用次数</p>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-700">平均响应时间</h4>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatTime(performanceSummary.apiPerformance.averageResponseTime)}</p>
                <p className="text-xs text-gray-600 mt-1">良好: ≤500ms</p>
              </div>
              
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4 border border-cyan-200">
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-700">成功率</h4>
                </div>
                <p className="text-2xl font-bold text-gray-900">{performanceSummary.apiPerformance.successRate}%</p>
                <p className="text-xs text-gray-600 mt-1">良好: ≥99%</p>
              </div>
              
              <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg p-4 border border-rose-200">
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-700">P95响应时间</h4>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatTime(performanceSummary.apiPerformance.p95ResponseTime.value)}</p>
                <p className="text-xs text-gray-600 mt-1">良好: ≤1000ms</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-500">最慢接口</h4>
                </div>
                <p className="text-lg font-bold text-gray-900 truncate">{performanceSummary.apiPerformance.slowestApi.name}</p>
                <p className="text-sm text-gray-600">{formatTime(performanceSummary.apiPerformance.slowestApi.duration)}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-500">最快接口</h4>
                </div>
                <p className="text-lg font-bold text-gray-900 truncate">{performanceSummary.apiPerformance.fastestApi.name}</p>
                <p className="text-sm text-gray-600">{formatTime(performanceSummary.apiPerformance.fastestApi.duration)}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-500">错误率</h4>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  <span className="text-xl">{performanceSummary.apiPerformance.errorRate.value}%</span>
                </div>
                <p className="text-sm text-gray-600">吞吐量: {performanceSummary.apiPerformance.throughput.value} req/s</p>
              </div>
            </div>
          </div>
          
        </div>
      )}

      {/* 标签页导航 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { key: 'overview', label: '概览', count: performanceMetrics.length },
              { 
                key: 'core-metrics', 
                label: '核心性能指标', 
                count: performanceMetrics.filter(m => 
                  m.type === 'navigation' && (m.firstPaint || m.firstContentfulPaint || m.timeToFirstByte)
                ).length + performanceMetrics.filter(m => 
                  m.type === 'web_vitals' && (m.metric === 'LCP')
                ).length
              },
              { 
                key: 'interaction-metrics', 
                label: '交互性能指标', 
                count: performanceMetrics.filter(m => 
                  m.type === 'web_vitals' && (m.metric === 'INP' || m.metric === 'TBT' || m.metric === 'CLS')
                ).length
              },
              { 
                key: 'supplementary-metrics', 
                label: '补充性能指标', 
                count: performanceMetrics.filter(m => 
                  (m.type === 'navigation' && (m.dnsTime || m.tcpTime || m.domParseTime || m.firstScreenTime || m.whiteScreenTime)) ||
                  m.type === 'long_task'
                ).length
              },
              { 
                key: 'api-performance', 
                label: 'API接口性能', 
                count: performanceMetrics.filter(m => 
                  m.type === 'resource' && (m.initiatorType === 'fetch' || m.initiatorType === 'xmlhttprequest')
                ).length
              }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* 标签页内容 */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">详情</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">页面URL</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {performanceMetrics.map((metric) => (
                    <tr key={metric.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.timestamp}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          metric.type === 'navigation' ? 'bg-blue-100 text-blue-800' :
                          metric.type === 'web_vitals' ? 'bg-green-100 text-green-800' :
                          metric.type === 'resource' ? 'bg-purple-100 text-purple-800' :
                          metric.type === 'long_task' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {metric.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {metric.type === 'navigation' && `加载时间: ${formatTime(metric.loadTime)}`}
                        {metric.type === 'web_vitals' && `${metric.metric}: ${metric.metric === 'CLS' ? metric.value : formatTime(metric.value)}`}
                        {metric.type === 'resource' && `${metric.name?.split('/').pop()} (${formatFileSize(metric.transferSize)})`}
                        {metric.type === 'long_task' && `${metric.longTaskCount}个长任务, 总时长: ${formatTime(metric.longTaskDuration)}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{metric.pageUrl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'core-metrics' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">指标类型</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FP (首次绘制)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FCP (首次内容绘制)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LCP (最大内容绘制)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TTFB (首字节时间)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">页面URL</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* 显示导航性能数据中的核心指标 */}
                  {performanceMetrics.filter(m => 
                    m.type === 'navigation' && (m.firstPaint || m.firstContentfulPaint || m.timeToFirstByte)
                  ).map((metric) => (
                    <tr key={metric.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.timestamp}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          导航性能
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatTime(metric.firstPaint)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatTime(metric.firstContentfulPaint)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatTime(metric.timeToFirstByte)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{metric.pageUrl}</td>
                    </tr>
                  ))}
                  {/* 显示Web Vitals中的LCP数据 */}
                  {performanceMetrics.filter(m => 
                    m.type === 'web_vitals' && m.metric === 'LCP'
                  ).map((metric) => (
                    <tr key={metric.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.timestamp}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Web Vitals
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatTime(metric.value)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{metric.pageUrl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'interaction-metrics' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">指标类型</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">值</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">影响元素</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">评级</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">页面URL</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {performanceMetrics.filter(m => 
                    m.type === 'web_vitals' && (m.metric === 'INP' || m.metric === 'TBT' || m.metric === 'CLS')
                  ).map((metric) => (
                    <tr key={metric.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.timestamp}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          metric.metric === 'INP' ? 'bg-teal-100 text-teal-800' :
                          metric.metric === 'TBT' ? 'bg-yellow-100 text-yellow-800' :
                          metric.metric === 'CLS' ? 'bg-pink-100 text-pink-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {metric.metric === 'INP' ? 'INP (交互到下次绘制)' :
                           metric.metric === 'TBT' ? 'TBT (总阻塞时间)' :
                           metric.metric === 'CLS' ? 'CLS (累积布局偏移)' :
                           metric.metric}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {metric.metric === 'CLS' ? metric.value?.toFixed(3) : formatTime(metric.value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{metric.element || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          (metric.metric === 'INP' && (metric.value || 0) <= 200) ||
                          (metric.metric === 'TBT' && (metric.value || 0) <= 200) ||
                          (metric.metric === 'CLS' && (metric.value || 0) <= 0.1)
                            ? 'bg-green-100 text-green-800'
                            : (metric.metric === 'INP' && (metric.value || 0) <= 500) ||
                              (metric.metric === 'TBT' && (metric.value || 0) <= 600) ||
                              (metric.metric === 'CLS' && (metric.value || 0) <= 0.25)
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {(metric.metric === 'INP' && (metric.value || 0) <= 200) ||
                           (metric.metric === 'TBT' && (metric.value || 0) <= 200) ||
                           (metric.metric === 'CLS' && (metric.value || 0) <= 0.1) ? '良好' :
                           (metric.metric === 'INP' && (metric.value || 0) <= 500) ||
                           (metric.metric === 'TBT' && (metric.value || 0) <= 600) ||
                           (metric.metric === 'CLS' && (metric.value || 0) <= 0.25) ? '需要改进' : '较差'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{metric.pageUrl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'supplementary-metrics' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">指标类型</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DNS解析</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TCP连接</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOM解析</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">首屏时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">白屏时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">长任务</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">页面URL</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* 显示导航性能数据中的补充指标 */}
                  {performanceMetrics.filter(m => 
                    m.type === 'navigation' && (m.dnsTime || m.tcpTime || m.domParseTime || m.firstScreenTime || m.whiteScreenTime)
                  ).map((metric) => (
                    <tr key={metric.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.timestamp}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          网络&DOM
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatTime(metric.dnsTime)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatTime(metric.tcpTime)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatTime(metric.domParseTime)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatTime(metric.firstScreenTime)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatTime(metric.whiteScreenTime)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {metric.longTaskCount ? `${metric.longTaskCount}个 (${formatTime(metric.longTaskDuration)})` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{metric.pageUrl}</td>
                    </tr>
                  ))}
                  {/* 显示长任务数据 */}
                  {performanceMetrics.filter(m => m.type === 'long_task').map((metric) => (
                    <tr key={metric.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.timestamp}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          长任务
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {metric.longTaskCount || 0}个任务，总时长：{formatTime(metric.longTaskDuration)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{metric.pageUrl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'api-performance' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API接口</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">响应时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">传输大小</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态评估</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">请求类型</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">页面URL</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {performanceMetrics.filter(m => 
                    m.type === 'resource' && (m.initiatorType === 'fetch' || m.initiatorType === 'xmlhttprequest')
                  ).map((metric) => (
                    <tr key={metric.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.timestamp}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={metric.name}>
                        {metric.name?.split('/').pop() || 'API接口'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatTime(metric.duration)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatFileSize(metric.transferSize)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          (metric.duration || 0) <= 500 ? 'bg-green-100 text-green-800' :
                          (metric.duration || 0) <= 2000 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {(metric.duration || 0) <= 500 ? '快速' :
                           (metric.duration || 0) <= 2000 ? '正常' : '缓慢'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          metric.initiatorType === 'fetch' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {metric.initiatorType === 'fetch' ? 'Fetch API' : 'XMLHttpRequest'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{metric.pageUrl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {performanceMetrics.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">暂无性能监控数据</p>
              <p className="text-sm text-gray-400 mt-2">点击上方的测试按钮来生成一些模拟数据</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
