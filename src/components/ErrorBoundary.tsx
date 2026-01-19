import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button, Result } from 'antd'

interface Props {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
}

/**
 * 错误边界组件
 * 用于捕获子组件树中的 JavaScript 错误，记录错误并显示备用 UI
 */
export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        }
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        // 更新 state 使下一次渲染能够显示降级后的 UI
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // 记录错误信息
        console.error('ErrorBoundary caught an error:', error, errorInfo)
        
        this.setState({ errorInfo })
        
        // 调用外部错误处理回调
        this.props.onError?.(error, errorInfo)
    }

    handleRetry = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        })
    }

    render(): ReactNode {
        if (this.state.hasError) {
            // 如果提供了自定义 fallback，使用它
            if (this.props.fallback) {
                return this.props.fallback
            }

            // 默认错误 UI
            return (
                <Result
                    status="error"
                    title="组件渲染出错"
                    subTitle={this.state.error?.message || '发生了未知错误'}
                    extra={[
                        <Button key="retry" type="primary" onClick={this.handleRetry}>
                            重试
                        </Button>,
                    ]}
                >
                    {import.meta.env.DEV && this.state.errorInfo && (
                        <details style={{ whiteSpace: 'pre-wrap', textAlign: 'left', marginTop: 16 }}>
                            <summary>错误详情</summary>
                            <pre style={{ 
                                background: '#f5f5f5', 
                                padding: 16, 
                                borderRadius: 4,
                                overflow: 'auto',
                                maxHeight: 300
                            }}>
                                {this.state.error?.stack}
                                {'\n\nComponent Stack:\n'}
                                {this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    )}
                </Result>
            )
        }

        return this.props.children
    }
}

/**
 * 轻量级错误边界，用于单个组件
 */
interface LightErrorBoundaryState {
    hasError: boolean
}

export class LightErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, LightErrorBoundaryState> {
    constructor(props: { children: ReactNode; fallback?: ReactNode }) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(): LightErrorBoundaryState {
        return { hasError: true }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('Component error:', error, errorInfo)
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div style={{ 
                    color: '#ff4d4f', 
                    padding: 8, 
                    textAlign: 'center',
                    background: 'rgba(255,77,79,0.1)',
                    borderRadius: 4
                }}>
                    组件加载失败
                </div>
            )
        }

        return this.props.children
    }
}
