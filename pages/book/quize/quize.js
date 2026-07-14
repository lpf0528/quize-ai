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
    title: 'RAG 架构演进经历了哪些阶段？（多选）',
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
    question: null,     // 当前题目视图对象
    selected: [],       // 各题已选项 [[..],[..]]
    submitted: [],      // 各题是否已提交
    canSubmit: false,   // 当前题是否可提交
    isSubmitted: false  // 当前题是否已提交
  },

  onLoad() {
    const selected = QUESTIONS.map(() => []);
    const submitted = QUESTIONS.map(() => false);
    this.setData({ selected, submitted }, () => this.refresh());
  },

  // 根据当前 index / 选择 / 提交状态，构建题目展示视图
  refresh() {
    const { current, selected, submitted } = this.data;
    const q = QUESTIONS[current];
    const picked = selected[current] || [];
    const isSubmitted = submitted[current];

    const options = q.options.map(opt => {
      const isSelected = picked.indexOf(opt.key) > -1;
      const isCorrect = q.answer.indexOf(opt.key) > -1;
      let status = 'normal'; // normal | right | wrong | correct
      let hint = '';
      if (isSubmitted) {
        if (isSelected && isCorrect) {
          status = 'right';
          hint = '回答正确';
        } else if (isSelected && !isCorrect) {
          status = 'wrong';
          hint = '不太对';
        } else if (!isSelected && isCorrect) {
          status = 'correct';
          hint = '正确答案';
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
        options
      },
      canSubmit: picked.length > 0,
      isSubmitted
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
  }
});
