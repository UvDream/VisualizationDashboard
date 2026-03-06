/**
 * useInteraction Hook - 组件联动核心逻辑
 * 
 * 功能：
 * 1. 读取组件的联动配置
 * 2. 自动注册事件监听（作为目标组件时）
 * 3. 提供触发联动的方法（作为源组件时）
 */

import { useEffect, useCallback, useRef } from 'react'
import { useEditor } from '../context/EditorContext'
import { editorBus, INTERACTION_EVENTS } from '../utils/eventBus'
import type { InteractionConfig, ComponentItem } from '../types'

// 联动事件数据结构
export interface InteractionEventData {
    sourceId: string            // 源组件ID
    sourceType: string          // 源组件类型
    trigger: string             // 触发方式
    data: Record<string, any>   // 携带的数据
    timestamp: number           // 时间戳
}

/**
 * 生成组件的联动事件名
 */
function getInteractionEventName(componentId: string): string {
    return `${INTERACTION_EVENTS.COMPONENT_INTERACT}:${componentId}`
}

/**
 * useInteraction Hook
 * @param componentId 当前组件ID
 * @param previewMode 是否预览模式（只有预览模式下才真正执行联动）
 */
export function useInteraction(componentId: string, previewMode: boolean = false) {
    const { state, updateComponent } = useEditor()
    const stateRef = useRef(state)
    stateRef.current = state

    const component = state.components.find(c => c.id === componentId)
    const interactions = component?.interactions || []

    // 触发联动 - 当源组件发生交互时调用
    const triggerInteraction = useCallback((trigger: string, data: Record<string, any>) => {
        if (!previewMode) return

        const eventData: InteractionEventData = {
            sourceId: componentId,
            sourceType: component?.type || '',
            trigger,
            data,
            timestamp: Date.now(),
        }

        const matchedInteractions = interactions.filter(i => i.trigger === trigger && i.enabled !== false)

        // 遍历该组件的所有联动配置，向目标组件发送事件
        matchedInteractions.forEach(interaction => {
            editorBus.emit(getInteractionEventName(interaction.targetId), {
                ...eventData,
                interactionConfig: interaction,
            })
        })
    }, [componentId, component?.type, interactions, previewMode])

    // 监听来自其他组件的联动事件（作为目标组件时）
    useEffect(() => {
        if (!previewMode) return

        const eventName = getInteractionEventName(componentId)

        const handleInteraction = (payload: InteractionEventData & { interactionConfig: InteractionConfig }) => {
            const { interactionConfig, data } = payload
            const currentState = stateRef.current
            const targetComponent = currentState.components.find(c => c.id === componentId)
            if (!targetComponent) return

            switch (interactionConfig.action) {
                case 'filterData': {
                    // 过滤图表数据
                    const filterField = interactionConfig.paramMapping?.['targetField'] || 'filterValue'
                    const filterValue = data[interactionConfig.triggerField || 'name']

                    // 更新目标组件的 props，添加过滤参数
                    updateComponent(componentId, {
                        props: {
                            ...targetComponent.props,
                            _interactionFilter: {
                                field: filterField,
                                value: filterValue,
                                sourceId: payload.sourceId,
                            }
                        }
                    })
                    break
                }

                case 'refreshData': {
                    // 刷新数据源：更新API参数后重新请求
                    if (targetComponent.props.dataSource?.apiConfig) {
                        const apiConfig = { ...targetComponent.props.dataSource.apiConfig }
                        const method = apiConfig.method || 'GET'

                        // 使用参数映射，根据请求方法自动合并到 params 或 body
                        if (interactionConfig.paramMapping) {
                            if (method === 'GET') {
                                // GET 请求：合并到 params
                                const params = { ...apiConfig.params }
                                Object.entries(interactionConfig.paramMapping).forEach(([sourceField, targetParam]) => {
                                    if (data[sourceField] !== undefined) {
                                        params[targetParam] = data[sourceField]
                                    }
                                })
                                apiConfig.params = params
                            } else {
                                // POST/PUT/DELETE 请求：合并到 body
                                const body = { ...apiConfig.body }
                                Object.entries(interactionConfig.paramMapping).forEach(([sourceField, targetParam]) => {
                                    if (data[sourceField] !== undefined) {
                                        body[targetParam] = data[sourceField]
                                    }
                                })
                                apiConfig.body = body
                            }
                        }

                        updateComponent(componentId, {
                            props: {
                                ...targetComponent.props,
                                dataSource: {
                                    ...targetComponent.props.dataSource,
                                    apiConfig,
                                    // 添加时间戳，确保即使参数相同也能触发 useEffect 重新加载
                                    _lastInteractionTrigger: Date.now(),
                                },
                            }
                        })
                    }
                    break
                }

                case 'setValue': {
                    // 设置目标组件的属性值
                    const targetProp = interactionConfig.paramMapping?.['targetProp'] || 'content'
                    const sourceField = interactionConfig.triggerField || 'value'
                    const value = data[sourceField]

                    if (value !== undefined) {
                        updateComponent(componentId, {
                            props: {
                                ...targetComponent.props,
                                [targetProp]: value,
                            }
                        })
                    }
                    break
                }

                case 'toggleVisible': {
                    // 切换显隐
                    updateComponent(componentId, {
                        visible: !targetComponent.visible,
                    })
                    break
                }

                case 'highlight': {
                    // 高亮数据（通过 _interactionHighlight 传递高亮信息）
                    const highlightValue = data[interactionConfig.triggerField || 'name']
                    updateComponent(componentId, {
                        props: {
                            ...targetComponent.props,
                            _interactionHighlight: {
                                value: highlightValue,
                                sourceId: payload.sourceId,
                            }
                        }
                    })
                    break
                }
            }
        }

        const unsubscribe = editorBus.on(eventName, handleInteraction)

        return () => {
            unsubscribe()
        }
    }, [componentId, previewMode, updateComponent])

    // 获取当前组件的所有入站联动关系（有哪些组件联动到当前组件）
    const getIncomingInteractions = useCallback((): Array<{
        source: ComponentItem
        config: InteractionConfig
    }> => {
        return state.components
            .filter(c => c.interactions?.some(i => i.targetId === componentId))
            .flatMap(source =>
                (source.interactions || [])
                    .filter(i => i.targetId === componentId)
                    .map(config => ({ source, config }))
            )
    }, [state.components, componentId])

    // 获取当前组件的所有出站联动关系
    const getOutgoingInteractions = useCallback((): Array<{
        target: ComponentItem | undefined
        config: InteractionConfig
    }> => {
        return interactions.map(config => ({
            target: state.components.find(c => c.id === config.targetId),
            config,
        }))
    }, [state.components, interactions])

    return {
        triggerInteraction,
        interactions,
        getIncomingInteractions,
        getOutgoingInteractions,
        hasInteractions: interactions.length > 0,
    }
}
