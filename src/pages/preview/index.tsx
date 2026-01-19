import { ConfigProvider, theme } from 'antd'
import { useEffect } from 'react'
import { EditorProvider, useEditor } from '../edit/context/EditorContext'
import Canvas from '../edit/components/Canvas'
import './index.less'

// 预览内容组件
function PreviewContent() {
    const { dispatch } = useEditor()

    useEffect(() => {
        // 监听 localStorage 变化，实时同步编辑页面的状态
        const handleStorageChange = () => {
            const savedState = localStorage.getItem('editorState')
            if (savedState) {
                try {
                    const parsed = JSON.parse(savedState)
                    // 直接设置整个状态（SYNC_STATE 不会触发事件，避免循环）
                    dispatch({ type: 'SYNC_STATE', payload: parsed } as any)
                } catch (error) {
                    console.error('Failed to sync state from localStorage:', error)
                }
            }
        }

        // 监听 storage 事件（跨标签页同步）
        window.addEventListener('storage', handleStorageChange)

        // 监听自定义事件（同标签页同步）
        window.addEventListener('editorStateChange', handleStorageChange)

        // 初始同步
        handleStorageChange()

        return () => {
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('editorStateChange', handleStorageChange)
        }
    }, [dispatch])

    return <Canvas previewMode={true} />
}

export default function Preview() {
    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm,
                token: {
                    colorPrimary: '#1890ff',
                },
            }}
        >
            <EditorProvider>
                <div className="preview-container">
                    <PreviewContent />
                </div>
            </EditorProvider>
        </ConfigProvider>
    )
}