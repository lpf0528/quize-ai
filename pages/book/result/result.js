// pages/book/result/result.js
import * as echarts from '../../../towxml/echarts/wx-echarts';

const app = getApp();

Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    total: 0,
    correct: 0,
    wrong: 0,
    unanswered: 0,
    rate: 0,        // 正确率百分比
    level: '',      // 评价文案
    ec: { lazyLoad: true }
  },

  onLoad(options) {
    // 安全解析 query；缺省用模拟数据（仅在参数完全缺失时兜底）
    const num = (v, fallback) => {
      const n = parseInt(v, 10);
      return isNaN(n) ? fallback : n;
    };

    const total = Math.max(num(options.total, 4), 0);
    // 以 total 与 correct 为准，wrong 由已答推导，并逐一钳制，
    // 确保 答对 + 答错 + 未答 恒等于 总题数，不会出现相加超过总数的矛盾
    let correct = Math.min(Math.max(num(options.correct, 3), 0), total);
    let wrong = Math.min(Math.max(num(options.wrong, 1), 0), total - correct);
    const unanswered = Math.max(total - correct - wrong, 0);
    const rate = total > 0 ? Math.round((correct / total) * 100) : 0;

    this.setData({
      total,
      correct,
      wrong,
      unanswered,
      rate,
      level: this.getLevel(rate)
    });
  },

  onReady() {
    this.initChart();
  },

  getLevel(rate) {
    if (rate >= 90) return '优秀，掌握扎实！';
    if (rate >= 60) return '良好，继续加油！';
    return '仍需努力，再复习一下吧';
  },

  initChart() {
    const { correct, wrong, unanswered } = this.data;
    const chartData = [
      { value: correct, name: '答对', itemStyle: { color: '#39b54a' } },
      { value: wrong, name: '答错', itemStyle: { color: '#e54d42' } }
    ];
    if (unanswered > 0) {
      chartData.push({ value: unanswered, name: '未答', itemStyle: { color: '#cccccc' } });
    }

    const ecComponent = this.selectComponent('#result-chart');
    if (!ecComponent) return;

    ecComponent.init((canvas, width, height) => {
      const chart = echarts.init(canvas, null, { width, height });
      chart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} 题 ({d}%)' },
        legend: {
          bottom: 0,
          left: 'center',
          itemWidth: 14,
          itemHeight: 14,
          textStyle: { fontSize: 13, color: '#666' }
        },
        series: [
          {
            name: '答题统计',
            type: 'pie',
            radius: ['48%', '70%'],
            center: ['50%', '42%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'center',
              formatter: `{a|${this.data.rate}%}\n{b|正确率}`,
              rich: {
                a: { fontSize: 40, fontWeight: 'bold', color: '#333', lineHeight: 50 },
                b: { fontSize: 14, color: '#999' }
              }
            },
            labelLine: { show: false },
            data: chartData
          }
        ]
      });
      return chart;
    });
  },

  retry() {
    wx.redirectTo({ url: '/pages/book/quize/quize' });
  },

  backBook() {
    wx.navigateBack({
      delta: 1,
      fail() {
        wx.reLaunch({ url: '/pages/book/book' });
      }
    });
  }
});
