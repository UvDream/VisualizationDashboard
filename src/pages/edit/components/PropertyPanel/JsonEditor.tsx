import { Input } from 'antd'

const { TextArea } = Input

interface JsonEditorProps {
    value: any
    onChange: (value: any) => void
    placeholder?: string
}

export default function JsonEditor({ value, onChange, placeholder }: JsonEditorProps) {


    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        try {
            const parsedValue = JSON.parse(e.target.value)
            onChange(parsedValue)
        } catch (error) {
            console.error("Invalid JSON")
        }
    }

    const textValue = typeof value === 'string' ? value : JSON.stringify(value, null, 2)

    return (
        <TextArea
            defaultValue={textValue}
            onBlur={handleBlur}
            style={{ fontFamily: 'monospace', minHeight: 200 }}
            placeholder={placeholder || '请输入 JSON 数据'}
            autoSize={{ minRows: 5, maxRows: 20 }}
        />
    )
}
