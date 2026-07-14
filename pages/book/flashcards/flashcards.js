// pages/book/flashcards/flashcards.js
const app = getApp();

// 记忆闪卡数据：front 为正面提问，back 为背面答案
const CARDS = [
  {
    front: '什么是 RAG（检索增强生成）？',
    back: 'RAG 是「检索 + 生成」协同的技术：先从外部知识库检索相关内容作为上下文，再交给大模型生成回答，从而缓解知识滞后与「幻觉」问题。'
  },
  {
    front: 'RAG 架构演进的三个阶段是什么？',
    back: 'Naive RAG（经典）、Advanced RAG（高级，增加检索前/后处理）、Modular RAG（模块化，各阶段可灵活重组）。'
  },
  {
    front: '底层数据构建中 Node（节点）指什么？',
    back: 'Node 是 Document（文档）分割后的更小数据块（Chunk），是更细粒度的数据抽象单元。'
  },
  {
    front: 'C-RAG 与 Self-RAG 分别解决什么问题？',
    back: 'C-RAG（自纠错）用轻量评估器判断检索质量，必要时触发网络搜索纠错；Self-RAG（自省式）让模型输出「自省 Token」实现自我监督。'
  },
  {
    front: '衡量 RAG 生成质量的常见评估指标有哪些？',
    back: '忠实度（Faithfulness）、答案相关性（Answer Relevancy）、上下文相关性等，用于衡量是否发生幻觉及回答质量。'
  }
];

Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    total: CARDS.length,
    current: 0,
    card: null,        // 当前卡片
    flipped: false,    // 是否已翻到背面
    known: 0,          // 记住数量
    unknown: 0,        // 没记住数量
    marks: [],         // 每张卡的标记：'' | 'known' | 'unknown'
    finished: false    // 是否全部标记完成
  },

  onLoad() {
    const marks = CARDS.map(() => '');
    this.setData({ marks }, () => this.refresh());
  },

  refresh() {
    const { current, marks } = this.data;
    this.setData({
      card: CARDS[current],
      flipped: false,
      currentMark: marks[current]
    });
  },

  // 点击卡片翻面（由 wxs 手势回调）
  flip() {
    this.setData({ flipped: !this.data.flipped });
  },

  next() {
    if (this.data.current >= this.data.total - 1) {
      wx.showToast({ title: '已经是最后一张', icon: 'none' });
      return;
    }
    this.setData({ current: this.data.current + 1 }, () => this.refresh());
  },

  prev() {
    if (this.data.current <= 0) {
      wx.showToast({ title: '已经是第一张', icon: 'none' });
      return;
    }
    this.setData({ current: this.data.current - 1 }, () => this.refresh());
  },

  // 标记：记住了 / 没记住
  mark(e) {
    const type = e.currentTarget.dataset.type; // known | unknown
    const { current, marks } = this.data;
    const prev = marks[current];
    if (prev === type) return; // 重复点击同一状态不处理

    // 先撤销旧计数
    let known = this.data.known;
    let unknown = this.data.unknown;
    if (prev === 'known') known--;
    else if (prev === 'unknown') unknown--;
    // 再累加新计数
    if (type === 'known') known++;
    else unknown++;

    marks[current] = type;
    this.setData(
      { marks, known, unknown },
      () => this.checkFinished()
    );

    // 标记后自动前往下一张（非最后一张）
    if (current < this.data.total - 1) {
      setTimeout(() => this.next(), 220);
    }
  },

  checkFinished() {
    const finished = this.data.marks.every(m => m !== '');
    this.setData({ finished, currentMark: this.data.marks[this.data.current] });
  },

  // 重新学习
  restart() {
    const marks = CARDS.map(() => '');
    this.setData(
      { current: 0, known: 0, unknown: 0, marks, finished: false },
      () => this.refresh()
    );
  }
});
