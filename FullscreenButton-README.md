# FullscreenButton 全屏按钮组件

FullscreenButton 是一个功能强大的全屏控制组件，支持一键进入/退出全屏模式，具有高度的可定制性和良好的浏览器兼容性。

## 🌟 功能特性

- ✨ **一键全屏**: 点击按钮即可进入/退出全屏模式
- 🎯 **智能状态**: 自动检测全屏状态，图标智能切换
- 🎨 **高度定制**: 支持自定义按钮大小、颜色、位置等
- 📱 **兼容性好**: 支持主流浏览器的全屏 API
- 🔄 **状态同步**: 支持 ESC 键退出，状态实时同步
- 💫 **动画效果**: 流畅的悬停和点击动画

## 📋 组件属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `width` | `number` | `60` | 组件容器宽度 |
| `height` | `number` | `60` | 组件容器高度 |
| `buttonSize` | `number` | `40` | 按钮大小 |
| `iconSize` | `number` | `20` | 图标大小 |
| `buttonColor` | `string` | `'#1890ff'` | 按钮背景色 |
| `hoverColor` | `string` | `'#40a9ff'` | 悬停时背景色 |
| `position` | `string` | `'center'` | 按钮位置 |
| `children` | `React.ReactNode` | - | 子内容 |

### 位置选项 (position)
- `'center'` - 居中显示
- `'top-left'` - 左上角
- `'top-right'` - 右上角  
- `'bottom-left'` - 左下角
- `'bottom-right'` - 右下角

## 🚀 使用示例

### 基础用法

```tsx
import FullscreenButton from './FullscreenButton'

function App() {
  return (
    <FullscreenButton>
      点击全屏
    </FullscreenButton>
  )
}
```

### 自定义样式

```tsx
<FullscreenButton
  width={120}
  height={80}
  buttonSize={50}
  iconSize={24}
  buttonColor="#52c41a"
  hoverColor="#73d13d"
  position="top-right"
>
  <div>大屏内容区域</div>
</FullscreenButton>
```

### 不同位置示例

```tsx
// 右上角全屏按钮
<FullscreenButton
  position="top-right"
  buttonColor="#fa8c16"
  buttonSize={35}
>
  控制面板
</FullscreenButton>

// 居中大按钮
<FullscreenButton
  position="center"
  buttonSize={60}
  iconSize={28}
  buttonColor="#722ed1"
>
  <h2>点击进入全屏模式</h2>
</FullscreenButton>
```

## 🎛️ 在编辑器中使用

### 添加组件
1. 打开组件库面板
2. 切换到"小组件"分类
3. 找到"全屏按钮"组件
4. 拖拽到画布上

### 属性配置
在属性面板中可以调整：
- **按钮大小**: 20-80px 范围
- **图标大小**: 12-40px 范围  
- **按钮颜色**: 颜色选择器
- **悬停颜色**: 颜色选择器
- **按钮位置**: 下拉选择框

## 🔧 技术实现

### 全屏 API 兼容性
组件支持以下浏览器全屏 API：
- 标准 API: `requestFullscreen()` / `exitFullscreen()`
- WebKit: `webkitRequestFullscreen()` / `webkitExitFullscreen()`
- Mozilla: `mozRequestFullScreen()` / `mozCancelFullScreen()`
- IE/Edge: `msRequestFullscreen()` / `msExitFullscreen()`

### 状态管理
```typescript
// 监听全屏状态变化
useEffect(() => {
  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement)
  }
  
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  // ... 其他浏览器事件
}, [])
```

### 样式系统
- 使用 CSS 变量实现主题定制
- 支持 backdrop-filter 毛玻璃效果
- 响应式悬停和点击动画

## 🎨 样式定制

### CSS 类名
- `.fullscreen-button-container` - 主容器
- `.fullscreen-content` - 内容区域
- `.fullscreen-button` - 按钮元素

### 自定义样式示例
```less
.fullscreen-button-container {
  .fullscreen-button {
    // 自定义按钮样式
    border: 2px solid rgba(255, 255, 255, 0.3);
    
    &:hover {
      border-color: rgba(255, 255, 255, 0.6);
    }
  }
}
```

## 📱 浏览器兼容性

| 浏览器 | 版本 | 支持状态 |
|--------|------|----------|
| Chrome | 15+ | ✅ 完全支持 |
| Firefox | 10+ | ✅ 完全支持 |
| Safari | 5.1+ | ✅ 完全支持 |
| Edge | 12+ | ✅ 完全支持 |
| IE | 11+ | ⚠️ 部分支持 |

## 🔍 使用场景

### 数据大屏
```tsx
<FullscreenButton
  position="top-right"
  buttonColor="#1890ff"
  buttonSize={40}
>
  <Dashboard />
</FullscreenButton>
```

### 视频播放器
```tsx
<FullscreenButton
  position="bottom-right"
  buttonColor="rgba(0,0,0,0.6)"
  hoverColor="rgba(0,0,0,0.8)"
>
  <VideoPlayer />
</FullscreenButton>
```

### 图片查看器
```tsx
<FullscreenButton
  position="center"
  buttonSize={50}
  iconSize={24}
>
  <ImageViewer />
</FullscreenButton>
```

## ⚠️ 注意事项

1. **用户交互要求**: 全屏 API 需要用户主动触发（点击事件）
2. **HTTPS 要求**: 某些浏览器要求在 HTTPS 环境下才能使用全屏功能
3. **移动端限制**: iOS Safari 对全屏 API 支持有限
4. **权限策略**: 某些网站可能通过 CSP 策略限制全屏功能

## 🐛 常见问题

### Q: 全屏功能无效？
A: 检查是否在 HTTPS 环境下，确保用户主动点击触发

### Q: 移动端不支持？
A: iOS Safari 对全屏 API 支持有限，可以考虑使用视口全屏替代方案

### Q: 样式在全屏下异常？
A: 全屏模式下 CSS 上下文会改变，建议使用相对单位和响应式设计

## 📝 更新日志

### v1.0.0
- 🎉 初始版本发布
- ✨ 支持基础全屏功能
- 🎨 支持多种位置和样式配置
- 📱 兼容主流浏览器全屏 API
- 💫 添加流畅的动画效果