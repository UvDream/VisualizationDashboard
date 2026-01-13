import { ConfigProvider, theme } from 'antd'
import { EditorProvider } from '../edit/context/EditorContext'
import Canvas from '../edit/components/Canvas'
import './index.less'

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
                    <Canvas previewMode={true} />
                </div>
            </EditorProvider>
        </ConfigProvider>
    )
}