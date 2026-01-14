// 地图区域配置
export interface MapRegionConfig {
    name: string
    label: string
}

// 中国省份列表
export const mapRegions: MapRegionConfig[] = [
    { name: 'china', label: '中国' },
    { name: 'beijing', label: '北京' },
    { name: 'tianjin', label: '天津' },
    { name: 'hebei', label: '河北' },
    { name: 'shanxi', label: '山西' },
    { name: 'neimenggu', label: '内蒙古' },
    { name: 'liaoning', label: '辽宁' },
    { name: 'jilin', label: '吉林' },
    { name: 'heilongjiang', label: '黑龙江' },
    { name: 'shanghai', label: '上海' },
    { name: 'jiangsu', label: '江苏' },
    { name: 'zhejiang', label: '浙江' },
    { name: 'anhui', label: '安徽' },
    { name: 'fujian', label: '福建' },
    { name: 'jiangxi', label: '江西' },
    { name: 'shandong', label: '山东' },
    { name: 'henan', label: '河南' },
    { name: 'hubei', label: '湖北' },
    { name: 'hunan', label: '湖南' },
    { name: 'guangdong', label: '广东' },
    { name: 'guangxi', label: '广西' },
    { name: 'hainan', label: '海南' },
    { name: 'chongqing', label: '重庆' },
    { name: 'sichuan', label: '四川' },
    { name: 'guizhou', label: '贵州' },
    { name: 'yunnan', label: '云南' },
    { name: 'xizang', label: '西藏' },
    { name: 'shaanxi', label: '陕西' },
    { name: 'gansu', label: '甘肃' },
    { name: 'qinghai', label: '青海' },
    { name: 'ningxia', label: '宁夏' },
    { name: 'xinjiang', label: '新疆' },
    { name: 'taiwan', label: '台湾' },
    { name: 'hongkong', label: '香港' },
    { name: 'macao', label: '澳门' },
]

// 获取本地地图 JSON 文件路径
export function getMapJsonPath(name: string): string {
    return `/map/${name}.json`
}

// 根据区域名称获取配置
export function getMapRegionByName(name: string): MapRegionConfig | undefined {
    return mapRegions.find(r => r.name === name)
}

// 获取地图选项列表（用于 Select 组件）
export function getMapRegionOptions() {
    return mapRegions.map(r => ({
        value: r.name,
        label: r.label
    }))
}
