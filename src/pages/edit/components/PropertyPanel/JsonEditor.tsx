import React, { useState, useEffect } from 'react'
import { Input } from 'antd'

const { TextArea } = Input

interface JsonEditorProps {
    value: any
    onChange: (value: any) => void
    placeholder?: string
}

export default function JsonEditor({ value, onChange, placeholder }: JsonEditorProps) {
    const [text, setText] = useState('')

    // 当外部value变化时，同步到内部text
    useEffect(() => {
        const newText = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
        setText(newText)
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value)
    }

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        try {
            const parsedValue = JSON.parse(e.target.value)
            onChange(parsedValue)
        } catch (error) {
            // console.error("Invalid JSON")
        }
    }

    return (
        <TextArea
            value={text}
            onChange={handleChange}
            onBlur={handleBlur}
            style={{ fontFamily: 'monospace', minHeight: 200 }}
            placeholder={placeholder || '请输入 JSON 数据'}
            autoSize={{ minRows: 5, maxRows: 20 }}
        />
    )
}
