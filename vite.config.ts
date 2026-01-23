import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // 路径别名配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@utils': resolve(__dirname, 'src/utils'),
    },
  },

  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    cors: true,
  },

  // 构建优化配置
  build: {
    // 输出目录
    outDir: 'dist',

    // 静态资源目录
    assetsDir: 'assets',

    // 生成 sourcemap（生产环境可关闭）
    sourcemap: false,

    // 代码分割配置
    rollupOptions: {
      output: {
        // 分割代码块 - 使用函数形式以兼容 rolldown-vite
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            // React 相关
            if (id.includes('react-dom') || id.includes('react-router-dom') || id.includes('/react/')) {
              return 'vendor-react'
            }
            // Ant Design 相关
            if (id.includes('antd') || id.includes('@ant-design/icons')) {
              return 'vendor-antd'
            }
            // ECharts 相关
            if (id.includes('echarts')) {
              return 'vendor-echarts'
            }
            // Three.js 相关
            if (id.includes('three') || id.includes('@react-three')) {
              return 'vendor-three'
            }
            // 拖拽相关
            if (id.includes('react-dnd')) {
              return 'vendor-dnd'
            }
          }
        },
        // 用于从入口点创建的块的打包输出格式
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },

    // 压缩配置（rolldown-vite 默认使用 oxc）
    minify: true,

    // 启用 CSS 代码分割
    cssCodeSplit: true,

    // chunk 大小警告限制
    chunkSizeWarningLimit: 1000,
  },

  // 依赖预构建优化
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'antd',
      '@ant-design/icons',
      'echarts',
      'echarts-for-react',
      'react-dnd',
      'react-dnd-html5-backend',
    ],
    // 排除不需要预构建的依赖
    exclude: [],
  },

  // CSS 配置
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          // Ant Design 主题变量覆盖
          'primary-color': '#3b82f6',
          'body-background': '#0a0a0a',
          'component-background': '#161616',
          'border-color-base': '#262626',
          'text-color': '#ffffff',
          'text-color-secondary': '#a3a3a3',
        },
      },
    },
  },

  // 环境变量前缀
  envPrefix: 'VITE_',
})
