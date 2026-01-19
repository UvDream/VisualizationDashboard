/**
 * 防抖函数
 * @param fn 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    return function (this: unknown, ...args: Parameters<T>) {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }

        timeoutId = setTimeout(() => {
            fn.apply(this, args)
            timeoutId = null
        }, delay)
    }
}

/**
 * 节流函数
 * @param fn 要节流的函数
 * @param limit 时间限制（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
    fn: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle = false
    let lastArgs: Parameters<T> | null = null

    return function (this: unknown, ...args: Parameters<T>) {
        if (!inThrottle) {
            fn.apply(this, args)
            inThrottle = true
            
            setTimeout(() => {
                inThrottle = false
                if (lastArgs) {
                    fn.apply(this, lastArgs)
                    lastArgs = null
                }
            }, limit)
        } else {
            lastArgs = args
        }
    }
}

/**
 * 创建一个带有防抖功能的 localStorage 写入器
 * @param key localStorage 的 key
 * @param delay 防抖延迟
 */
export function createDebouncedStorage(key: string, delay: number = 300) {
    const debouncedWrite = debounce((value: string) => {
        try {
            localStorage.setItem(key, value)
        } catch (error) {
            console.error(`Failed to write to localStorage (${key}):`, error)
        }
    }, delay)

    return {
        write: (value: unknown) => {
            debouncedWrite(JSON.stringify(value))
        },
        read: <T>(): T | null => {
            try {
                const item = localStorage.getItem(key)
                return item ? JSON.parse(item) : null
            } catch (error) {
                console.error(`Failed to read from localStorage (${key}):`, error)
                return null
            }
        },
        remove: () => {
            try {
                localStorage.removeItem(key)
            } catch (error) {
                console.error(`Failed to remove from localStorage (${key}):`, error)
            }
        }
    }
}
