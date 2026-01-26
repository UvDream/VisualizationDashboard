import React from 'react';
import { Card, Row, Col, Typography, Space } from 'antd';
import { PRESET_THEMES } from '../pages/edit/config/chartThemes';

const { Title, Text } = Typography;

interface ColorSwatchProps {
  color: string;
  name?: string;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, name }) => (
  <div style={{ textAlign: 'center', marginBottom: 8 }}>
    <div
      style={{
        width: 40,
        height: 40,
        backgroundColor: color,
        borderRadius: 6,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        margin: '0 auto 4px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
      }}
    />
    <Text style={{ fontSize: 11, color: '#94A3B8' }}>
      {name || color}
    </Text>
  </div>
);

interface ThemePreviewProps {
  themeName: string;
  theme: any;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({ themeName, theme }) => (
  <Card
    size="small"
    title={
      <Space>
        <span style={{ color: '#F8FAFC' }}>{theme.name}</span>
        {themeName === 'professional' && (
          <span style={{ 
            fontSize: 11, 
            color: '#F59E0B',
            background: 'rgba(245, 158, 11, 0.1)',
            padding: '2px 6px',
            borderRadius: 4,
            border: '1px solid rgba(245, 158, 11, 0.2)'
          }}>
            推荐
          </span>
        )}
      </Space>
    }
    style={{
      background: '#1E293B',
      border: '1px solid #334155'
    }}
    headStyle={{
      background: '#334155',
      borderBottom: '1px solid #475569',
      minHeight: 'auto',
      padding: '8px 12px'
    }}
    bodyStyle={{ padding: 12 }}
  >
    <div style={{ marginBottom: 8 }}>
      <Text style={{ fontSize: 12, color: '#CBD5E1' }}>
        {theme.description}
      </Text>
    </div>
    <Row gutter={[4, 4]}>
      {theme.colors.slice(0, 8).map((color: string, index: number) => (
        <Col span={3} key={index}>
          <ColorSwatch color={color} />
        </Col>
      ))}
    </Row>
  </Card>
);

const ColorPreview: React.FC = () => {
  const newThemes = ['professional', 'modernDark', 'analytics', 'gradient'];
  const classicThemes = ['bright', 'dark', 'macarons', 'blueGreen'];

  return (
    <div style={{ 
      padding: 24, 
      background: '#0F172A',
      minHeight: '100vh'
    }}>
      <Title level={2} style={{ color: '#F8FAFC', marginBottom: 24 }}>
        🎨 配色方案预览
      </Title>
      
      <Title level={3} style={{ color: '#E2E8F0', marginBottom: 16 }}>
        ✨ 新增专业主题
      </Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {newThemes.map(themeName => (
          <Col xs={24} sm={12} lg={6} key={themeName}>
            <ThemePreview 
              themeName={themeName}
              theme={PRESET_THEMES[themeName]} 
            />
          </Col>
        ))}
      </Row>

      <Title level={3} style={{ color: '#E2E8F0', marginBottom: 16 }}>
        🔄 优化后的经典主题
      </Title>
      <Row gutter={[16, 16]}>
        {classicThemes.map(themeName => (
          <Col xs={24} sm={12} lg={6} key={themeName}>
            <ThemePreview 
              themeName={themeName}
              theme={PRESET_THEMES[themeName]} 
            />
          </Col>
        ))}
      </Row>

      <Card
        style={{
          marginTop: 32,
          background: '#1E293B',
          border: '1px solid #334155'
        }}
        title={
          <span style={{ color: '#F8FAFC' }}>
            📊 界面配色系统
          </span>
        }
        headStyle={{
          background: '#334155',
          borderBottom: '1px solid #475569'
        }}
      >
        <Row gutter={[24, 16]}>
          <Col span={8}>
            <Title level={5} style={{ color: '#E2E8F0' }}>背景色层次</Title>
            <Space direction="vertical" size={8}>
              <ColorSwatch color="#0F172A" name="主背景" />
              <ColorSwatch color="#1E293B" name="面板背景" />
              <ColorSwatch color="#334155" name="组件背景" />
              <ColorSwatch color="#475569" name="悬浮背景" />
            </Space>
          </Col>
          <Col span={8}>
            <Title level={5} style={{ color: '#E2E8F0' }}>文字色系统</Title>
            <Space direction="vertical" size={8}>
              <ColorSwatch color="#F8FAFC" name="主要文字" />
              <ColorSwatch color="#E2E8F0" name="次要文字" />
              <ColorSwatch color="#94A3B8" name="弱化文字" />
              <ColorSwatch color="#60A5FA" name="强调文字" />
            </Space>
          </Col>
          <Col span={8}>
            <Title level={5} style={{ color: '#E2E8F0' }}>功能色系统</Title>
            <Space direction="vertical" size={8}>
              <ColorSwatch color="#1E40AF" name="主色" />
              <ColorSwatch color="#F59E0B" name="强调色" />
              <ColorSwatch color="#10B981" name="成功色" />
              <ColorSwatch color="#EF4444" name="错误色" />
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ColorPreview;