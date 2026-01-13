// 地图区域配置
export interface MapRegionConfig {
    name: string
    label: string
    adcode: string
}

// 中国省份列表
export const mapRegions: MapRegionConfig[] = [
    { name: 'china', label: '中国', adcode: '100000' },
    { name: 'beijing', label: '北京', adcode: '110000' },
    { name: 'tianjin', label: '天津', adcode: '120000' },
    { name: 'hebei', label: '河北', adcode: '130000' },
    { name: 'shanxi', label: '山西', adcode: '140000' },
    { name: 'neimenggu', label: '内蒙古', adcode: '150000' },
    { name: 'liaoning', label: '辽宁', adcode: '210000' },
    { name: 'jilin', label: '吉林', adcode: '220000' },
    { name: 'heilongjiang', label: '黑龙江', adcode: '230000' },
    { name: 'shanghai', label: '上海', adcode: '310000' },
    { name: 'jiangsu', label: '江苏', adcode: '320000' },
    { name: 'zhejiang', label: '浙江', adcode: '330000' },
    { name: 'anhui', label: '安徽', adcode: '340000' },
    { name: 'fujian', label: '福建', adcode: '350000' },
    { name: 'jiangxi', label: '江西', adcode: '360000' },
    { name: 'shandong', label: '山东', adcode: '370000' },
    { name: 'henan', label: '河南', adcode: '410000' },
    { name: 'hubei', label: '湖北', adcode: '420000' },
    { name: 'hunan', label: '湖南', adcode: '430000' },
    { name: 'guangdong', label: '广东', adcode: '440000' },
    { name: 'guangxi', label: '广西', adcode: '450000' },
    { name: 'hainan', label: '海南', adcode: '460000' },
    { name: 'chongqing', label: '重庆', adcode: '500000' },
    { name: 'sichuan', label: '四川', adcode: '510000' },
    { name: 'guizhou', label: '贵州', adcode: '520000' },
    { name: 'yunnan', label: '云南', adcode: '530000' },
    { name: 'xizang', label: '西藏', adcode: '540000' },
    { name: 'shaanxi', label: '陕西', adcode: '610000' },
    { name: 'gansu', label: '甘肃', adcode: '620000' },
    { name: 'qinghai', label: '青海', adcode: '630000' },
    { name: 'ningxia', label: '宁夏', adcode: '640000' },
    { name: 'xinjiang', label: '新疆', adcode: '650000' },
    { name: 'taiwan', label: '台湾', adcode: '710000' },
    { name: 'hongkong', label: '香港', adcode: '810000' },
    { name: 'macao', label: '澳门', adcode: '820000' },
]

// 获取地图 GeoJSON 数据的 URL 列表（按优先级）
export function getMapGeoJsonUrls(adcode: string): string[] {
    return [
        // 阿里云 DataV - 带 _full（包含子区域）
        `https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`,
        // 阿里云 DataV - 不带 _full（仅边界）
        `https://geo.datav.aliyun.com/areas_v3/bound/${adcode}.json`,
        // 备用源 - areas_v2
        `https://geo.datav.aliyun.com/areas/bound/${adcode}_full.json`,
        `https://geo.datav.aliyun.com/areas/bound/${adcode}.json`,
    ]
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
