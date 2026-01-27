import type { EditorState, ComponentItem, CanvasConfig } from '../types'
import { message } from 'antd'

// 导出数据格式
export interface ExportData {
    version: string
    timestamp: string
    canvasConfig: CanvasConfig
    components: ComponentItem[]
    metadata: {
        name: string
        description?: string
        author?: string
        componentCount: number
        canvasSize: string
    }
}

// 导出项目为 JSON 文件
export function exportProject(state: EditorState, projectName?: string): void {
    try {
        const exportData: ExportData = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            canvasConfig: state.canvasConfig,
            components: state.components,
            metadata: {
                name: projectName || state.canvasConfig.name || '可视化大屏',
                description: `包含 ${state.components.length} 个组件的可视化大屏项目`,
                author: 'Visualization Dashboard',
                componentCount: state.components.length,
                canvasSize: `${state.canvasConfig.width} × ${state.canvasConfig.height}`
            }
        }

        // 创建下载链接
        const dataStr = JSON.stringify(exportData, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        
        // 创建下载链接并触发下载
        const link = document.createElement('a')
        link.href = url
        link.download = `${exportData.metadata.name}_${formatDate(new Date())}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // 清理 URL 对象
        URL.revokeObjectURL(url)
        
        message.success(`项目 "${exportData.metadata.name}" 导出成功！`)
    } catch (error) {
        console.error('导出项目失败:', error)
        message.error('导出项目失败，请重试')
    }
}

// 导入项目文件
export function importProject(
    file: File,
    onSuccess: (data: { canvasConfig: CanvasConfig; components: ComponentItem[] }) => void
): void {
    const reader = new FileReader()
    
    reader.onload = (e) => {
        try {
            const content = e.target?.result as string
            const importData: ExportData = JSON.parse(content)
            
            // 验证数据格式
            if (!validateImportData(importData)) {
                message.error('文件格式不正确，请选择有效的项目文件')
                return
            }
            
            // 处理组件 ID 冲突（重新生成 ID）
            const processedComponents = processComponentIds(importData.components)
            
            // 调用成功回调
            onSuccess({
                canvasConfig: importData.canvasConfig,
                components: processedComponents
            })
            
            message.success(`项目 "${importData.metadata.name}" 导入成功！包含 ${processedComponents.length} 个组件`)
        } catch (error) {
            console.error('导入项目失败:', error)
            message.error('文件解析失败，请检查文件格式')
        }
    }
    
    reader.onerror = () => {
        message.error('文件读取失败，请重试')
    }
    
    reader.readAsText(file)
}

// 验证导入数据格式
function validateImportData(data: any): data is ExportData {
    if (!data || typeof data !== 'object') {
        return false
    }
    
    // 检查必需字段
    const requiredFields = ['version', 'canvasConfig', 'components']
    for (const field of requiredFields) {
        if (!(field in data)) {
            console.error(`缺少必需字段: ${field}`)
            return false
        }
    }
    
    // 检查 canvasConfig 结构
    const canvasConfig = data.canvasConfig
    if (!canvasConfig || typeof canvasConfig !== 'object') {
        console.error('canvasConfig 格式不正确')
        return false
    }
    
    const requiredCanvasFields = ['width', 'height', 'backgroundColor', 'name']
    for (const field of requiredCanvasFields) {
        if (!(field in canvasConfig)) {
            console.error(`canvasConfig 缺少必需字段: ${field}`)
            return false
        }
    }
    
    // 检查 components 结构
    if (!Array.isArray(data.components)) {
        console.error('components 必须是数组')
        return false
    }
    
    // 检查每个组件的基本结构
    for (let i = 0; i < data.components.length; i++) {
        const component = data.components[i]
        if (!component || typeof component !== 'object') {
            console.error(`组件 ${i} 格式不正确`)
            return false
        }
        
        const requiredComponentFields = ['id', 'type', 'props', 'style']
        for (const field of requiredComponentFields) {
            if (!(field in component)) {
                console.error(`组件 ${i} 缺少必需字段: ${field}`)
                return false
            }
        }
        
        // 检查 style 的基本字段
        const style = component.style
        if (!style || typeof style !== 'object') {
            console.error(`组件 ${i} 的 style 格式不正确`)
            return false
        }
        
        const requiredStyleFields = ['x', 'y', 'width', 'height']
        for (const field of requiredStyleFields) {
            if (!(field in style) || typeof style[field] !== 'number') {
                console.error(`组件 ${i} 的 style 缺少必需字段: ${field}`)
                return false
            }
        }
    }
    
    return true
}

// 处理组件 ID 冲突，重新生成唯一 ID
function processComponentIds(components: ComponentItem[]): ComponentItem[] {
    const idMap = new Map<string, string>()
    
    return components.map(component => {
        // 生成新的唯一 ID
        const newId = generateUniqueId()
        idMap.set(component.id, newId)
        
        return {
            ...component,
            id: newId,
            // 如果有 parentId 或 groupId，也需要更新
            parentId: component.parentId ? idMap.get(component.parentId) || component.parentId : undefined,
            groupId: component.groupId ? idMap.get(component.groupId) || component.groupId : undefined
        }
    })
}

// 生成唯一 ID
function generateUniqueId(): string {
    return `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 格式化日期为文件名友好格式
function formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}${month}${day}_${hours}${minutes}`
}

// 导出为模板（简化版，只包含组件配置）
export function exportAsTemplate(components: ComponentItem[], templateName: string): void {
    try {
        const templateData = {
            version: '1.0.0',
            type: 'template',
            timestamp: new Date().toISOString(),
            name: templateName,
            components: components.map(comp => ({
                type: comp.type,
                props: comp.props,
                style: {
                    ...comp.style,
                    // 重置位置，让模板组件从原点开始
                    x: comp.style.x - Math.min(...components.map(c => c.style.x)),
                    y: comp.style.y - Math.min(...components.map(c => c.style.y))
                }
            })),
            metadata: {
                componentCount: components.length,
                description: `包含 ${components.length} 个组件的模板`
            }
        }

        const dataStr = JSON.stringify(templateData, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `template_${templateName}_${formatDate(new Date())}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        URL.revokeObjectURL(url)
        
        message.success(`模板 "${templateName}" 导出成功！`)
    } catch (error) {
        console.error('导出模板失败:', error)
        message.error('导出模板失败，请重试')
    }
}

// 批量导出选中组件
export function exportSelectedComponents(components: ComponentItem[], fileName: string): void {
    try {
        const exportData = {
            version: '1.0.0',
            type: 'components',
            timestamp: new Date().toISOString(),
            components,
            metadata: {
                componentCount: components.length,
                description: `${components.length} 个选中的组件`
            }
        }

        const dataStr = JSON.stringify(exportData, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `${fileName}_${formatDate(new Date())}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        URL.revokeObjectURL(url)
        
        message.success(`${components.length} 个组件导出成功！`)
    } catch (error) {
        console.error('导出组件失败:', error)
        message.error('导出组件失败，请重试')
    }
}