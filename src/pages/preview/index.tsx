import Canvas from '../edit/components/Canvas'
import './index.less'

export default function Preview() {
    return (
        <div className="preview-container">
            <Canvas previewMode={true} />
        </div>
    )
}