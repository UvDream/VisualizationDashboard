# 大屏可视化编辑器

一个基于 React 的可视化大屏编辑器，支持拖拽式组件布局、实时预览和丰富的图表组件。

## 技术栈

- React 19 + TypeScript
- Vite (Rolldown)
- Ant Design 6
- ECharts 6
- React DnD (拖拽)
- React Three Fiber (3D 组件)

## 功能特性

- 🎨 拖拽式组件编辑，支持自由布局
- 📊 丰富的图表组件（折线图、柱状图、饼图、仪表盘、雷达图、散点图）
- 🧩 Antd 组件库（文本、按钮、输入框、表格等）
- 🖼️ 装饰边框和小组件
- 🌍 3D 组件（地球、粒子背景）
- 📐 智能吸附对齐
- 📋 图层管理（排序、显示/隐藏、锁定）
- ↩️ 撤销/重做
- 📄 复制组件
- ⚙️ 画布配置（尺寸、背景色）
- 🔍 缩放控制

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
src/
├── pages/edit/
│   ├── components/
│   │   ├── Canvas/          # 画布区域
│   │   ├── ComponentPanel/  # 组件面板
│   │   ├── PropertyPanel/   # 属性面板
│   │   ├── LayerPanel/      # 图层面板
│   │   ├── Toolbar/         # 工具栏
│   │   └── Ruler/           # 标尺
│   ├── context/             # 状态管理
│   ├── types/               # 类型定义
│   └── utils/               # 工具函数
```

## License

MIT
