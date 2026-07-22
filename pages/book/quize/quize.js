// pages/book/quize/quize.js
const app = getApp();

// 模拟测验数据：单选 single / 多选 multiple
const QUESTIONS = [
  {
    type: 'single',
    title: 'RAG（检索增强生成）技术的核心目标是什么？',
    options: [
      { key: 'A', text: '通过外部知识检索缓解大模型的知识滞后与“幻觉”问题', analysis: '正确。RAG 将实时检索到的外部知识作为上下文，提升生成的时效性与可靠性。' },
      { key: 'B', text: '单纯扩大模型参数规模以提升推理能力', analysis: '扩大参数量成本高，且无法解决私有数据与时效性问题，并非 RAG 的目标。' },
      { key: 'C', text: '替代大模型，完全用检索系统回答问题', analysis: 'RAG 是“检索 + 生成”协同，检索用于补充上下文，而非替代生成模型。' },
      { key: 'D', text: '压缩模型体积以便部署到端侧', analysis: '模型压缩属于部署优化范畴，与 RAG 的核心目标无关。' }
    ],
    answer: ['A']
  },
  {
    type: 'multiple',
    title: 'RAG 架构演进经历了哪些阶段？',
    options: [
      { key: 'A', text: 'Naive RAG（经典 RAG）', analysis: '正确。仅含索引、检索与生成的基础顺序流程。' },
      { key: 'B', text: 'Advanced RAG（高级 RAG）', analysis: '正确。增加了检索前处理（查询转换）与检索后处理（重排序）。' },
      { key: 'C', text: 'Modular RAG（模块化 RAG）', analysis: '正确。各阶段拆分为可灵活重组的独立模块与算法。' },
      { key: 'D', text: 'Static RAG（静态 RAG）', analysis: '错误。并不存在该阶段，属于干扰项。' }
    ],
    answer: ['A', 'B', 'C']
  },
  {
    type: 'single',
    title: '在底层数据构建中，Node（节点）通常指的是？',
    options: [
      { key: 'A', text: '连接各种数据源的通用载体', analysis: '这是 Document（文档）的定义，而非 Node。' },
      { key: 'B', text: 'Document 分割后的更小数据块（Chunk）', analysis: '正确。Node 是 Document 切分后的更细粒度数据单元。' },
      { key: 'C', text: '大模型的推理输出结果', analysis: 'Node 属于数据抽象层，与模型输出无关。' },
      { key: 'D', text: '向量数据库的索引文件', analysis: 'Node 是数据抽象，不等同于底层索引文件。' }
    ],
    answer: ['B']
  },
  {
    type: 'multiple',
    title: '以下哪些属于将 RAG 推向“生产就绪”的评估或自省机制？（多选）',
    options: [
      { key: 'A', text: '忠实度、答案相关性等量化评估指标', analysis: '正确。用于衡量是否发生幻觉及回答质量。' },
      { key: 'B', text: 'C-RAG（自纠错 RAG）', analysis: '正确。通过轻量评估器判断检索质量，必要时触发网络搜索纠错。' },
      { key: 'C', text: 'Self-RAG（自省式 RAG）', analysis: '正确。让模型自主输出“自省 Token”实现自我监督。' },
      { key: 'D', text: '直接关闭检索模块提高速度', analysis: '错误。关闭检索会削弱 RAG 能力，不属于评估/自省机制。' }
    ],
    answer: ['A', 'B', 'C']
  }
];

Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    total: QUESTIONS.length,
    current: 0,
    answeredCount: 0,   // 已选择题目数量
    question: null,     // 当前题目视图对象
    selected: [],       // 各题已选项 [[..],[..]]
    submitted: [],      // 各题是否已提交
    canSubmit: false,   // 当前题是否可提交
    isSubmitted: false, // 当前题是否已提交
    allSubmitted: false, // 是否所有题都已提交
    elapsed: 0,         // 已用秒数
    timeText: '00:00',  // 计时器展示文本
    // 悬浮答题卡按钮
    fabX: 0,            // 按钮左上角 x（px）
    fabY: 0,            // 按钮左上角 y（px）
    fabDragging: false, // 是否正在拖动
    showCard: false,    // 答题卡弹窗是否展示
    cardItems: []       // 答题卡各题状态
  },

  onLoad() {
    const selected = QUESTIONS.map(() => []);
    const submitted = QUESTIONS.map(() => false);
    this.setData({ selected, submitted }, () => this.refresh());
    this.initFab();
    this.startTimer();
  },

  // 初始化悬浮按钮位置：默认右下角靠上一点
  initFab() {
    const info = wx.getSystemInfoSync();
    const fabSize = 50; // 与 wxss 中 100rpx 对应，px 约按 2rpx=1px 估算
    const margin = 16;
    this.setData({
      fabX: info.windowWidth - fabSize - margin,
      fabY: info.windowHeight - fabSize - margin - 120
    });
    this._fabSize = fabSize;
    this._winW = info.windowWidth;
    this._winH = info.windowHeight;
  },

  onUnload() {
    this.stopTimer();
  },

  // 启动计时器：每秒累加并刷新展示
  startTimer() {
    this.stopTimer();
    this._timer = setInterval(() => {
      const elapsed = this.data.elapsed + 1;
      this.setData({ elapsed, timeText: this.formatTime(elapsed) });
    }, 1000);
  },

  stopTimer() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  },

  // 秒数格式化为 mm:ss
  formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return (m < 10 ? '0' + m : m) + ':' + (sec < 10 ? '0' + sec : sec);
  },

  // 根据当前 index / 选择 / 提交状态，构建题目展示视图
  refresh() {
    const { current, selected, submitted } = this.data;
    const q = QUESTIONS[current];
    const picked = selected[current] || [];
    const isSubmitted = submitted[current];
    // 整题是否答对：所选与正确答案完全一致（多选少选/多选都算错）
    const qRight = isSubmitted && this.checkRight(picked, q.answer);

    const options = q.options.map(opt => {
      const isSelected = picked.indexOf(opt.key) > -1;
      const isCorrect = q.answer.indexOf(opt.key) > -1;
      let status = 'normal'; // normal | right | wrong | correct
      let hint = '';
      if (isSubmitted) {
        if (isSelected && isCorrect) {
          status = 'right';
          // 整题答对才提示“回答正确”；否则（如多选少选）只标为正确选项
          hint = qRight ? '回答正确' : '正确选项';
        } else if (isSelected && !isCorrect) {
          status = 'wrong';
          hint = '不太对';
        } else if (!isSelected && isCorrect) {
          status = 'correct';
          hint = q.type === 'multiple' ? '漏选的正确答案' : '正确答案';
        }
      }
      return {
        key: opt.key,
        text: opt.text,
        analysis: opt.analysis,
        isSelected,
        status,
        hint
      };
    });

    this.setData({
      question: {
        type: q.type,
        typeText: q.type === 'single' ? '单选题' : '多选题',
        title: q.title,
        options,
        result: isSubmitted ? (qRight ? 'right' : 'wrong') : '',
        resultText: isSubmitted ? (qRight ? '回答正确' : '回答错误') : ''
      },
      canSubmit: picked.length > 0,
      isSubmitted,
      allSubmitted: this.data.submitted.every(Boolean),
      answeredCount: selected.filter(s => (s || []).length > 0).length
    });
  },

  // 集合完全相等判定：数量一致且每个正确答案都被选中
  checkRight(picked, answer) {
    if (picked.length !== answer.length) return false;
    return answer.every(k => picked.indexOf(k) > -1);
  },

  // 判断某题是否答对
  isRight(index) {
    return this.checkRight(this.data.selected[index] || [], QUESTIONS[index].answer);
  },

  // 跳转结果页，带上统计
  goResult() {
    this.stopTimer();
    const total = this.data.total;
    let correct = 0;
    let wrong = 0;
    this.data.submitted.forEach((done, i) => {
      if (!done) return;
      if (this.isRight(i)) correct++;
      else wrong++;
    });
    wx.navigateTo({
      url: `/pages/book/result/result?total=${total}&correct=${correct}&wrong=${wrong}&elapsed=${this.data.elapsed}`
    });
  },

  // 选择/取消选择选项
  chooseOption(e) {
    const { current, submitted, selected } = this.data;
    if (submitted[current]) return; // 已提交不可再改

    const key = e.currentTarget.dataset.key;
    const q = QUESTIONS[current];
    const picked = (selected[current] || []).slice();

    if (q.type === 'single') {
      selected[current] = [key];
    } else {
      const idx = picked.indexOf(key);
      if (idx > -1) {
        picked.splice(idx, 1);
      } else {
        picked.push(key);
      }
      selected[current] = picked;
    }
    this.setData({ selected }, () => this.refresh());
  },

  // 提交当前题
  submit() {
    const { current, submitted, canSubmit } = this.data;
    if (!canSubmit || submitted[current]) return;
    submitted[current] = true;
    this.setData({ submitted }, () => this.refresh());
  },

  // 记录触摸起点，用于左右滑动切题
  onTouchStart(e) {
    const t = e.touches[0];
    this._touchStartX = t.clientX;
    this._touchStartY = t.clientY;
  },

  // 松手时判定：水平位移足够且大于垂直位移才切题
  onTouchEnd(e) {
    if (this._touchStartX == null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - this._touchStartX;
    const dy = t.clientY - this._touchStartY;
    this._touchStartX = null;
    const SWIPE = 60; // 判定滑动的最小水平位移
    if (Math.abs(dx) < SWIPE || Math.abs(dx) <= Math.abs(dy)) return;
    if (dx < 0) {
      this.next(); // 左滑：下一题
    } else {
      this.prev(); // 右滑：上一题
    }
  },

  prev() {
    if (this.data.current <= 0) return;
    this.setData({ current: this.data.current - 1 }, () => {
      this.refresh();
      this.scrollToTop();
    });
  },

  next() {
    if (this.data.current >= this.data.total - 1) return;
    this.setData({ current: this.data.current + 1 }, () => {
      this.refresh();
      this.scrollToTop();
    });
  },

  // 切题后回到顶部，让选项完整展示
  scrollToTop() {
    wx.pageScrollTo({ scrollTop: 0, duration: 200 });
  },

  // ===== 悬浮答题卡按钮拖动 =====
  onFabTouchStart(e) {
    const t = e.touches[0];
    this._fabMoved = false;
    this._fabStartX = t.clientX;
    this._fabStartY = t.clientY;
    this._fabOffX = t.clientX - this.data.fabX;
    this._fabOffY = t.clientY - this.data.fabY;
    this.setData({ fabDragging: true });
  },

  onFabTouchMove(e) {
    const t = e.touches[0];
    if (Math.abs(t.clientX - this._fabStartX) > 5 || Math.abs(t.clientY - this._fabStartY) > 5) {
      this._fabMoved = true;
    }
    const size = this._fabSize || 50;
    let x = t.clientX - this._fabOffX;
    let y = t.clientY - this._fabOffY;
    // 限制在屏幕范围内
    x = Math.max(0, Math.min(x, (this._winW || 0) - size));
    y = Math.max(0, Math.min(y, (this._winH || 0) - size));
    this.setData({ fabX: x, fabY: y });
  },

  onFabTouchEnd() {
    this.setData({ fabDragging: false });
    // 吸附到最近的左右边缘
    const size = this._fabSize || 50;
    const margin = 16;
    const x = this.data.fabX + size / 2 < (this._winW || 0) / 2
      ? margin
      : (this._winW || 0) - size - margin;
    this.setData({ fabX: x });
    if (!this._fabMoved) this.openCard();
  },

  // ===== 答题卡弹窗 =====
  openCard() {
    const { selected, submitted } = this.data;
    const cardItems = QUESTIONS.map((q, i) => {
      const picked = selected[i] || [];
      let status = 'none'; // none 未选 | selected 已选未提交 | right 正确 | wrong 错误
      if (submitted[i]) {
        status = this.isRight(i) ? 'right' : 'wrong';
      } else if (picked.length > 0) {
        status = 'selected';
      }
      return { index: i, status };
    });
    this.setData({ cardItems, showCard: true });
  },

  closeCard() {
    this.setData({ showCard: false });
  },

  // 一键提交所有已选择题目
  submitAll() {
    const submitted = this.data.selected.map(s => (s || []).length > 0);
    this.setData({ submitted }, () => {
      this.refresh();
      this.openCard(); // 重建答题卡状态（正确/错误配色）
    });
  },

  jumpTo(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ current: index, showCard: false }, () => {
      this.refresh();
      this.scrollToTop();
    });
  }
});
