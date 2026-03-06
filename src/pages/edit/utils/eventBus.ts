/**
 * 事件总线 - 组件联动核心
 * 实现发布/订阅模式，让画布上的组件之间解耦通信
 */

type EventHandler = (...args: any[]) => void

class EventBus {
    private events = new Map<string, Set<EventHandler>>()

    /**
     * 订阅事件
     * @returns 取消订阅的函数
     */
    on(event: string, handler: EventHandler): () => void {
        if (!this.events.has(event)) {
            this.events.set(event, new Set())
        }
        this.events.get(event)!.add(handler)
        return () => this.off(event, handler)
    }

    /**
     * 取消订阅事件
     */
    off(event: string, handler: EventHandler) {
        this.events.get(event)?.delete(handler)
    }

    /**
     * 发布事件
     */
    emit(event: string, ...args: any[]) {
        this.events.get(event)?.forEach(handler => {
            try {
                handler(...args)
            } catch (error) {
                console.error(`[EventBus] Error in handler for event "${event}":`, error)
            }
        })
    }

    /**
     * 一次性监听
     */
    once(event: string, handler: EventHandler): () => void {
        const wrapper = (...args: any[]) => {
            handler(...args)
            this.off(event, wrapper)
        }
        return this.on(event, wrapper)
    }

    /**
     * 清除某个事件的所有监听
     */
    clear(event: string) {
        this.events.delete(event)
    }

    /**
     * 清除所有事件监听
     */
    clearAll() {
        this.events.clear()
    }

    /**
     * 获取某个事件的监听器数量（调试用）
     */
    listenerCount(event: string): number {
        return this.events.get(event)?.size || 0
    }
}

// 全局单例
export const editorBus = new EventBus()

// 预定义事件名常量，避免拼写错误
export const INTERACTION_EVENTS = {
    /** 组件数据交互事件前缀 */
    COMPONENT_INTERACT: 'component:interact',
    /** 联动关系变化事件 */
    LINKAGE_CHANGED: 'linkage:changed',
} as const
