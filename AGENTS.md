# AGENTS.md

## 项目概述

这是一个基于微信小程序的在线测试应用,用户可以通过输入网址链接生成测试题目并进行答题。

### 核心功能
- 用户输入网址链接,生成个性化测试题目
- 支持单选题、判断题、多选题三种题型
- 实时答题反馈(正确/错误提示)
- 答题结果统计与展示

## 技术栈

- **框架**: 微信小程序原生开发
- **语言**: JavaScript (ES6+)
- **样式**: WXSS (微信小程序样式)
- **数据**: WXML (微信小程序模板)

## 项目结构

```
miniprogram/
├── pages/
│   ├── index/              # 首页 - 输入网址
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   ├── test/               # 测试页面 - 答题
│   │   ├── test.js
│   │   ├── test.json
│   │   ├── test.wxml
│   │   └── test.wxss
│   └── result/             # 结果页面 - 成绩展示
│       ├── result.js
│       ├── result.json
│       ├── result.wxml
│       └── result.wxss
├── utils/
│   ├── api.js              # API 接口封装
│   └── mockData.js         # Mock 测试数据
├── app.js
├── app.json
└── app.wxss
```

## 开发环境配置

### 必需工具
- 微信开发者工具 (最新稳定版)
- Node.js >= 14.x (用于运行后端 mock 服务)

### 启动开发

1. 使用微信开发者工具打开项目目录
2. 配置 AppID (可使用测试号)
3. 编译运行

### Mock 数据说明

由于后端接口暂未开发,当前使用 Mock 数据模拟测试题目返回。Mock 数据位于 `utils/mockData.js`。

## 数据结构定义

### 测试题目数据结构

```javascript
{
  "code": 200,
  "message": "success",
  "data": {
    "testId": "test_12345",
    "url": "https://example.com",
    "questions": [
      {
        "id": 1,
        "type": "single",        // single: 单选, multiple: 多选, judge: 判断
        "question": "题目内容",
        "options": [
          { "key": "A", "text": "选项A" },
          { "key": "B", "text": "选项B" },
          { "key": "C", "text": "选项C" },
          { "key": "D", "text": "选项D" }
        ],
        "answer": ["A"],         // 单选为单个元素数组,多选为多个元素数组
        "explanation": "答案解析内容"
      }
    ]
  }
}
```

### 用户答题记录结构

```javascript
{
  "questionId": 1,
  "userAnswer": ["A"],         // 用户选择的答案
  "isCorrect": true,           // 是否正确
  "timestamp": 1234567890
}
```

## 页面开发指南

### 首页 (index)

**功能要求:**
- 页面中间位置显示 input 输入框
- 输入框下方显示"开始测试"按钮
- 输入验证:检查网址格式是否合法
- 点击按钮后调用接口/使用 Mock 数据,跳转到测试页面

**关键实现:**
```javascript
// 网址验证正则
const urlPattern = /^https?:\/\/.+/;

// 页面跳转时携带数据
wx.navigateTo({
  url: `/pages/test/test?testId=${testId}`
});
```

### 测试页面 (test)

**功能要求:**
- 显示当前题目编号和总题数 (如 1/10)
- 根据题目类型渲染不同的选项样式
- 用户选择后立即显示正确/错误反馈:
  - 正确选项:绿色背景
  - 错误选项:红色背景
  - 在正确选项下方显示解析文字
- 页面底部显示圆形"Next"按钮
- 记录每道题的答题情况

**答题反馈规则:**
1. 单选题:点击选项后立即判断
2. 多选题:点击选项可多选,确认后判断
3. 判断题:点击选项后立即判断

**样式规范:**
- 正确选项背景色: `#4CAF50` (绿色)
- 错误选项背景色: `#F44336` (红色)
- Next 按钮:圆形,直径 60rpx,底部固定定位
- 解析文字:字体大小 28rpx,颜色 `#666666`

**关键实现:**
```javascript
// 答案比对逻辑
function checkAnswer(userAnswer, correctAnswer) {
  if (userAnswer.length !== correctAnswer.length) return false;
  return userAnswer.sort().join(',') === correctAnswer.sort().join(',');
}

// 记录答题
this.setData({
  [`answerRecords[${currentIndex}]`]: {
    questionId: question.id,
    userAnswer: userAnswer,
    isCorrect: isCorrect,
    timestamp: Date.now()
  }
});
```

### 结果页面 (result)

**功能要求:**
- 显示答对题数和答错题数
- 显示正确率百分比
- 提供"重新测试"和"返回首页"按钮
- 可选:显示错题列表

**样式规范:**
- 结果展示使用卡片式布局
- 正确题数:绿色显示
- 错误题数:红色显示
- 正确率:大字号居中显示

## API 接口规范

### 获取测试题目

**接口地址:** `POST /api/generateTest`

**请求参数:**
```javascript
{
  "url": "https://example.com"
}
```

**返回数据:**
参考"数据结构定义"中的测试题目数据结构

### 提交答题记录 (可选)

**接口地址:** `POST /api/submitAnswers`

**请求参数:**
```javascript
{
  "testId": "test_12345",
  "answerRecords": [...]
}
```

## 代码规范

### 命名规范
- 变量名使用小驼峰: `currentQuestion`, `answerRecords`
- 常量使用大写下划线: `MAX_QUESTIONS`, `API_BASE_URL`
- 文件名使用小写: `index.js`, `test-utils.js`
- 组件名使用小驼峰: `questionCard`, `optionItem`

### 注释规范
- 每个函数必须添加注释说明功能、参数、返回值
- 复杂逻辑必须添加行内注释
- 示例:
```javascript
/**
 * 检查用户答案是否正确
 * @param {Array} userAnswer - 用户选择的答案
 * @param {Array} correctAnswer - 正确答案
 * @returns {Boolean} 是否正确
 */
function checkAnswer(userAnswer, correctAnswer) {
  // 实现逻辑...
}
```

### 错误处理
- 所有 API 请求必须包含 try-catch 或 fail 回调
- 网络错误需要友好提示用户
- 示例:
```javascript
wx.request({
  url: API_URL,
  success: (res) => {
    // 处理成功
  },
  fail: (err) => {
    wx.showToast({
      title: '网络请求失败,请重试',
      icon: 'none'
    });
  }
});
```

## 测试指南

### 功能测试清单

**首页测试:**
- [ ] 输入框可正常输入
- [ ] 输入非法网址时显示错误提示
- [ ] 输入合法网址后可成功跳转
- [ ] Mock 数据加载正常

**测试页面测试:**
- [ ] 题目正常显示
- [ ] 单选题:点击选项后正确显示绿色/红色
- [ ] 多选题:可多选,确认后正确判断
- [ ] 判断题:点击后正确判断
- [ ] 解析文字在正确选项下方正常显示
- [ ] Next 按钮功能正常
- [ ] 进度显示正确 (如 3/10)
- [ ] 答题记录正确保存

**结果页面测试:**
- [ ] 统计数据正确 (答对/答错题数)
- [ ] 正确率计算正确
- [ ] "重新测试"按钮功能正常
- [ ] "返回首页"按钮功能正常

### 边界情况测试
- 网络异常时的处理
- 题目数为 0 的情况
- 用户未作答直接点击 Next 的情况
- 多选题未选择任何选项的情况

## Mock 数据示例

```javascript
// utils/mockData.js
module.exports = {
  generateMockTest: (url) => {
    return {
      code: 200,
      message: "success",
      data: {
        testId: `test_${Date.now()}`,
        url: url,
        questions: [
          {
            id: 1,
            type: "single",
            question: "以下哪个是 JavaScript 的数据类型?",
            options: [
              { key: "A", text: "String" },
              { key: "B", text: "Integer" },
              { key: "C", text: "Float" },
              { key: "D", text: "Character" }
            ],
            answer: ["A"],
            explanation: "JavaScript 有 String 类型,但没有 Integer、Float、Character 类型"
          },
          {
            id: 2,
            type: "judge",
            question: "微信小程序支持 jQuery 库",
            options: [
              { key: "A", text: "正确" },
              { key: "B", text: "错误" }
            ],
            answer: ["B"],
            explanation: "微信小程序不支持 DOM 操作,因此不能使用 jQuery"
          },
          {
            id: 3,
            type: "multiple",
            question: "以下哪些是微信小程序的生命周期函数?",
            options: [
              { key: "A", text: "onLoad" },
              { key: "B", text: "onShow" },
              { key: "C", text: "onCreate" },
              { key: "D", text: "onReady" }
            ],
            answer: ["A", "B", "D"],
            explanation: "小程序页面的生命周期包括 onLoad、onShow、onReady 等,没有 onCreate"
          }
        ]
      }
    };
  }
};
```

## 样式设计规范

### 颜色方案
- 主色调: `#1AAD19` (微信绿)
- 正确提示: `#4CAF50`
- 错误提示: `#F44336`
- 文字主色: `#333333`
- 文字辅助色: `#666666`
- 背景色: `#F5F5F5`

### 布局规范
- 页面左右边距: 30rpx
- 元素间距: 20rpx
- 卡片圆角: 12rpx
- 按钮高度: 80rpx

### 字体规范
- 标题: 36rpx, 加粗
- 正文: 28rpx
- 辅助文字: 24rpx

## 部署说明

### 发布前检查
- [ ] 所有页面功能测试通过
- [ ] Mock 数据替换为真实 API
- [ ] 配置正式环境 AppID
- [ ] 检查隐私协议和用户条款
- [ ] 提交微信审核

### 版本管理
- 使用语义化版本号: major.minor.patch
- 每次发布前打 tag
- 维护 CHANGELOG.md

## 常见问题

### Q: 如何切换 Mock 数据和真实 API?
A: 在 `utils/api.js` 中通过环境变量控制:
```javascript
const USE_MOCK = true; // 开发环境使用 Mock
```

### Q: 多选题如何判断正确?
A: 用户选择的选项数组与正确答案数组排序后完全一致即为正确。

### Q: Next 按钮何时可点击?
A: 用户至少选择一个选项后,Next 按钮变为可点击状态。

### Q: 如何实现题目的随机顺序?
A: 在获取题目数据后,使用洗牌算法(Fisher-Yates)打乱题目数组。

## 扩展功能建议

- 添加题目收藏功能
- 支持分享测试结果
- 添加答题计时功能
- 支持查看历史测试记录
- 添加错题本功能
- 支持题目难度分级

## 联系方式

如有问题或建议,请联系开发团队。
