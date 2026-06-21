# AIGHT-Zhen 个人主页

> 混合式架构：主滚动长页 + 独立子页系统。优先功能，逐步完善。

## 项目结构

```
├── index.html                  # 主滚动长页（3屏，可向下扩展）
├── css/
│   └── main.css                # 全部样式
├── js/
│   ├── scroll-snap.js          # 视差滚动控制
│   ├── crystal.js              # 3D晶体（碎片化+破碎重组）
│   ├── page-transition.js      # 页面平滑切换动画
│   └── main.js                 # 入口，协调所有模块
└── subpages/
    └── questionnaire.html      # MBTI风格问卷子页（示例）
```

## 快速开始

直接双击 `index.html` 即可在浏览器中打开，无需本地服务器。

## 页面说明

### 主滚动长页（3屏）

| 屏序 | 名称 | 内容 | 交互 |
|------|------|------|------|
| 第一屏 | 引子 Hero | Slogan + 副标题 + 向下箭头 | 呼吸灯动画，视差背景 |
| 第二屏 | 浮空晶体 Crystal | 3D 透亮晶体（20面体碎片化） | 拖拽旋转 · 3次点击破碎 · 3秒后自动重组 |
| 第三屏 | 予我侧写 About | 文字介绍 + 跳转按钮 | 点击按钮平滑过渡至子页 |

### 子页

| 页面 | 说明 |
|------|------|
| `subpages/questionnaire.html` | MBTI 风格问卷（4题），选择后生成个性化侧写，含返回按钮 |

## 核心功能

- **CSS 原生滚动吸附** — GPU 加速，移动端触摸友好，零 JS 库依赖
- **3D 晶体** — Three.js 渲染，碎片化几何体，点击破碎后自动重组
- **页面切换** — 3 种动画模式（slide / fade / flip），默认左滑切换
- **问卷引擎** — 题目数组驱动，选项统计，结果模板匹配
- **视差滚动** — 背景层以 0.35x 速率偏移，营造空间纵深感

## 扩展指南

### 添加新屏（主滚动长页）

在 `index.html` 的 `</main>` 前添加新的 `<section>`：

```html
<section class="screen new-screen" id="screen4">
  <div class="parallax-bg"></div>
  <div class="screen-content">
    <!-- 你的内容 -->
  </div>
</section>
```

CSS 命名约定：`.new-screen .parallax-bg` 设定该屏背景样式。

### 添加新子页

1. 在 `subpages/` 下创建新的 HTML 文件
2. 在主长页对应按钮上添加 `data-href="subpages/新页面.html"`
3. 按钮会自动拦截点击，触发过渡动画后跳转
4. 子页返回按钮参考 `questionnaire.html` 中的 `.btn-back` 实现

### 切换页面过渡动画

在浏览器控制台中执行：

```js
PageTransition.setMode('fade');   // 淡入淡出
PageTransition.setMode('flip');   // 3D翻转
PageTransition.setMode('slide');  // 滑动（默认）
```

### 修改问卷题目

编辑 `subpages/questionnaire.html` 中的 `questions` 数组和 `profiles` 对象即可。

## 依赖

- [Three.js](https://threejs.org/) v0.157 — CDN 加载（唯一外部依赖）
- [Noto Serif SC](https://fonts.google.com/) — Google Fonts（可选，无网络时回退系统字体）

## 兼容性

- Chrome / Edge / Firefox / Safari 最新版
- 移动端适配（100vh 全屏滚动 + 触摸晶体拖拽）
- 依赖 CSS `scroll-snap` 特性（Chrome 69+, Safari 11+, Firefox 99+）

## License

MIT
