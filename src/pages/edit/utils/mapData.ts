// 地图区域配置
export interface MapRegionConfig {
    name: string
    label: string
    level: 'country' | 'province' | 'city' | 'district'  // 新增区县层级
    parent?: string  // 新增父级字段
}

// 中国省份和主要城市列表
export const mapRegions: MapRegionConfig[] = [
    // 国家级
    { name: 'china', label: '中国', level: 'country' },
    
    // 省级
    { name: 'beijing', label: '北京', level: 'province', parent: 'china' },
    { name: 'tianjin', label: '天津', level: 'province', parent: 'china' },
    { name: 'hebei', label: '河北', level: 'province', parent: 'china' },
    { name: 'shanxi', label: '山西', level: 'province', parent: 'china' },
    { name: 'neimenggu', label: '内蒙古', level: 'province', parent: 'china' },
    { name: 'liaoning', label: '辽宁', level: 'province', parent: 'china' },
    { name: 'jilin', label: '吉林', level: 'province', parent: 'china' },
    { name: 'heilongjiang', label: '黑龙江', level: 'province', parent: 'china' },
    { name: 'shanghai', label: '上海', level: 'province', parent: 'china' },
    { name: 'jiangsu', label: '江苏', level: 'province', parent: 'china' },
    { name: 'zhejiang', label: '浙江', level: 'province', parent: 'china' },
    { name: 'anhui', label: '安徽', level: 'province', parent: 'china' },
    { name: 'fujian', label: '福建', level: 'province', parent: 'china' },
    { name: 'jiangxi', label: '江西', level: 'province', parent: 'china' },
    { name: 'shandong', label: '山东', level: 'province', parent: 'china' },
    { name: 'henan', label: '河南', level: 'province', parent: 'china' },
    { name: 'hubei', label: '湖北', level: 'province', parent: 'china' },
    { name: 'hunan', label: '湖南', level: 'province', parent: 'china' },
    { name: 'guangdong', label: '广东', level: 'province', parent: 'china' },
    { name: 'guangxi', label: '广西', level: 'province', parent: 'china' },
    { name: 'hainan', label: '海南', level: 'province', parent: 'china' },
    { name: 'chongqing', label: '重庆', level: 'province', parent: 'china' },
    { name: 'sichuan', label: '四川', level: 'province', parent: 'china' },
    { name: 'guizhou', label: '贵州', level: 'province', parent: 'china' },
    { name: 'yunnan', label: '云南', level: 'province', parent: 'china' },
    { name: 'xizang', label: '西藏', level: 'province', parent: 'china' },
    { name: 'shaanxi', label: '陕西', level: 'province', parent: 'china' },
    { name: 'gansu', label: '甘肃', level: 'province', parent: 'china' },
    { name: 'qinghai', label: '青海', level: 'province', parent: 'china' },
    { name: 'ningxia', label: '宁夏', level: 'province', parent: 'china' },
    { name: 'xinjiang', label: '新疆', level: 'province', parent: 'china' },
    { name: 'taiwan', label: '台湾', level: 'province', parent: 'china' },
    { name: 'hongkong', label: '香港', level: 'province', parent: 'china' },
    { name: 'macao', label: '澳门', level: 'province', parent: 'china' },

    // 城市级（主要城市）
    // 河北省
    { name: 'shijiazhuang', label: '石家庄市', level: 'city', parent: 'hebei' },
    
    // 山西省
    { name: 'taiyuan', label: '太原市', level: 'city', parent: 'shanxi' },
    
    // 内蒙古
    { name: 'huhehaote', label: '呼和浩特市', level: 'city', parent: 'neimenggu' },
    
    // 辽宁省
    { name: 'shenyang', label: '沈阳市', level: 'city', parent: 'liaoning' },
    { name: 'dalian', label: '大连市', level: 'city', parent: 'liaoning' },
    
    // 吉林省
    { name: 'changchun', label: '长春市', level: 'city', parent: 'jilin' },
    
    // 黑龙江省
    { name: 'haerbin', label: '哈尔滨市', level: 'city', parent: 'heilongjiang' },
    
    // 江苏省
    { name: 'nanjing', label: '南京市', level: 'city', parent: 'jiangsu' },
    { name: 'suzhou', label: '苏州市', level: 'city', parent: 'jiangsu' },
    { name: 'wuxi', label: '无锡市', level: 'city', parent: 'jiangsu' },
    { name: 'changzhou', label: '常州市', level: 'city', parent: 'jiangsu' },
    { name: 'xuzhou', label: '徐州市', level: 'city', parent: 'jiangsu' },
    
    // 浙江省
    { name: 'hangzhou', label: '杭州市', level: 'city', parent: 'zhejiang' },
    { name: 'ningbo', label: '宁波市', level: 'city', parent: 'zhejiang' },
    { name: 'wenzhou', label: '温州市', level: 'city', parent: 'zhejiang' },
    
    // 安徽省
    { name: 'hefei', label: '合肥市', level: 'city', parent: 'anhui' },
    
    // 福建省
    { name: 'fuzhou', label: '福州市', level: 'city', parent: 'fujian' },
    { name: 'xiamen', label: '厦门市', level: 'city', parent: 'fujian' },
    
    // 江西省
    { name: 'nanchang', label: '南昌市', level: 'city', parent: 'jiangxi' },
    
    // 山东省
    { name: 'jinan', label: '济南市', level: 'city', parent: 'shandong' },
    { name: 'qingdao', label: '青岛市', level: 'city', parent: 'shandong' },
    
    // 河南省
    { name: 'zhengzhou', label: '郑州市', level: 'city', parent: 'henan' },
    
    // 湖北省
    { name: 'wuhan', label: '武汉市', level: 'city', parent: 'hubei' },
    
    // 湖南省
    { name: 'changsha', label: '长沙市', level: 'city', parent: 'hunan' },
    
    // 广东省
    { name: 'guangzhou', label: '广州市', level: 'city', parent: 'guangdong' },
    { name: 'shenzhen', label: '深圳市', level: 'city', parent: 'guangdong' },
    { name: 'foshan', label: '佛山市', level: 'city', parent: 'guangdong' },
    
    // 广西
    { name: 'nanning', label: '南宁市', level: 'city', parent: 'guangxi' },
    
    // 海南省
    { name: 'haikou', label: '海口市', level: 'city', parent: 'hainan' },
    
    // 四川省
    { name: 'chengdu', label: '成都市', level: 'city', parent: 'sichuan' },
    
    // 贵州省
    { name: 'guiyang', label: '贵阳市', level: 'city', parent: 'guizhou' },
    
    // 云南省
    { name: 'kunming', label: '昆明市', level: 'city', parent: 'yunnan' },
    
    // 西藏
    { name: 'lhasa', label: '拉萨市', level: 'city', parent: 'xizang' },
    
    // 陕西省
    { name: 'xian', label: '西安市', level: 'city', parent: 'shaanxi' },
    
    // 甘肃省
    { name: 'lanzhou', label: '兰州市', level: 'city', parent: 'gansu' },
    
    // 青海省
    { name: 'xining', label: '西宁市', level: 'city', parent: 'qinghai' },
    
    // 宁夏
    { name: 'yinchuan', label: '银川市', level: 'city', parent: 'ningxia' },
    
    // 新疆
    { name: 'wulumuqi', label: '乌鲁木齐市', level: 'city', parent: 'xinjiang' },
]

// 主要城市地图数据配置（省份下的城市数据）
export const cityMapData: Record<string, Array<{ name: string; value: number }>> = {
    'beijing': [
        { name: '东城区', value: 95 },
        { name: '西城区', value: 88 },
        { name: '朝阳区', value: 92 },
        { name: '丰台区', value: 78 },
        { name: '石景山区', value: 65 },
        { name: '海淀区', value: 98 },
        { name: '门头沟区', value: 45 },
        { name: '房山区', value: 52 },
        { name: '通州区', value: 68 },
        { name: '顺义区', value: 58 },
        { name: '昌平区', value: 72 },
        { name: '大兴区', value: 63 },
        { name: '怀柔区', value: 38 },
        { name: '平谷区', value: 35 },
        { name: '密云区', value: 42 },
        { name: '延庆区', value: 28 },
    ],
    'shanghai': [
        { name: '黄浦区', value: 96 },
        { name: '徐汇区', value: 89 },
        { name: '长宁区', value: 85 },
        { name: '静安区', value: 92 },
        { name: '普陀区', value: 78 },
        { name: '虹口区', value: 82 },
        { name: '杨浦区', value: 88 },
        { name: '闵行区', value: 75 },
        { name: '宝山区', value: 68 },
        { name: '嘉定区', value: 72 },
        { name: '浦东新区', value: 94 },
        { name: '金山区', value: 55 },
        { name: '松江区', value: 69 },
        { name: '青浦区', value: 62 },
        { name: '奉贤区', value: 58 },
        { name: '崇明区', value: 45 },
    ],
    'guangdong': [
        { name: '广州市', value: 95 },
        { name: '深圳市', value: 98 },
        { name: '珠海市', value: 78 },
        { name: '汕头市', value: 65 },
        { name: '佛山市', value: 82 },
        { name: '韶关市', value: 52 },
        { name: '湛江市', value: 58 },
        { name: '肇庆市', value: 55 },
        { name: '江门市', value: 68 },
        { name: '茂名市', value: 48 },
        { name: '惠州市', value: 72 },
        { name: '梅州市', value: 45 },
        { name: '汕尾市', value: 42 },
        { name: '河源市', value: 38 },
        { name: '阳江市', value: 46 },
        { name: '清远市', value: 41 },
        { name: '东莞市', value: 88 },
        { name: '中山市', value: 75 },
        { name: '潮州市', value: 52 },
        { name: '揭阳市', value: 48 },
        { name: '云浮市', value: 35 },
    ],
    'jiangsu': [
        { name: '南京市', value: 92 },
        { name: '无锡市', value: 85 },
        { name: '徐州市', value: 68 },
        { name: '常州市', value: 78 },
        { name: '苏州市', value: 95 },
        { name: '南通市', value: 72 },
        { name: '连云港市', value: 55 },
        { name: '淮安市', value: 58 },
        { name: '盐城市', value: 62 },
        { name: '扬州市', value: 69 },
        { name: '镇江市', value: 65 },
        { name: '泰州市', value: 63 },
        { name: '宿迁市', value: 52 },
    ],
    'zhejiang': [
        { name: '杭州市', value: 96 },
        { name: '宁波市', value: 88 },
        { name: '温州市', value: 82 },
        { name: '嘉兴市', value: 75 },
        { name: '湖州市', value: 68 },
        { name: '绍兴市', value: 78 },
        { name: '金华市', value: 72 },
        { name: '衢州市', value: 58 },
        { name: '舟山市', value: 65 },
        { name: '台州市', value: 69 },
        { name: '丽水市', value: 55 },
    ]
}

// 城市的区县数据配置
export const districtMapData: Record<string, Array<{ name: string; value: number }>> = {
    // 南京市各区
    'nanjing': [
        { name: '玄武区', value: 95 },
        { name: '秦淮区', value: 88 },
        { name: '建邺区', value: 92 },
        { name: '鼓楼区', value: 90 },
        { name: '浦口区', value: 75 },
        { name: '栖霞区', value: 78 },
        { name: '雨花台区', value: 82 },
        { name: '江宁区', value: 85 },
        { name: '六合区', value: 65 },
        { name: '溧水区', value: 68 },
        { name: '高淳区', value: 62 },
    ],
    // 苏州市各区
    'suzhou': [
        { name: '虎丘区', value: 88 },
        { name: '吴中区', value: 85 },
        { name: '相城区', value: 82 },
        { name: '姑苏区', value: 92 },
        { name: '工业园区', value: 95 },
        { name: '高新区', value: 90 },
        { name: '常熟市', value: 78 },
        { name: '张家港市', value: 80 },
        { name: '昆山市', value: 88 },
        { name: '太仓市', value: 75 },
    ],
    // 杭州市各区
    'hangzhou': [
        { name: '上城区', value: 95 },
        { name: '拱墅区', value: 88 },
        { name: '西湖区', value: 92 },
        { name: '滨江区', value: 98 },
        { name: '萧山区', value: 85 },
        { name: '余杭区', value: 82 },
        { name: '临平区', value: 78 },
        { name: '钱塘区', value: 80 },
        { name: '富阳区', value: 72 },
        { name: '临安区', value: 68 },
        { name: '桐庐县', value: 65 },
        { name: '淳安县', value: 58 },
        { name: '建德市', value: 62 },
    ],
    // 广州市各区
    'guangzhou': [
        { name: '荔湾区', value: 88 },
        { name: '越秀区', value: 95 },
        { name: '海珠区', value: 90 },
        { name: '天河区', value: 98 },
        { name: '白云区', value: 82 },
        { name: '黄埔区', value: 85 },
        { name: '番禺区', value: 80 },
        { name: '花都区', value: 75 },
        { name: '南沙区', value: 78 },
        { name: '从化区', value: 65 },
        { name: '增城区', value: 68 },
    ],
    // 深圳市各区
    'shenzhen': [
        { name: '罗湖区', value: 88 },
        { name: '福田区', value: 95 },
        { name: '南山区', value: 98 },
        { name: '宝安区', value: 85 },
        { name: '龙岗区', value: 82 },
        { name: '盐田区', value: 78 },
        { name: '龙华区', value: 88 },
        { name: '坪山区', value: 75 },
        { name: '光明区', value: 72 },
    ],
    // 北京市各区
    'beijing': [
        { name: '东城区', value: 95 },
        { name: '西城区', value: 88 },
        { name: '朝阳区', value: 92 },
        { name: '丰台区', value: 78 },
        { name: '石景山区', value: 65 },
        { name: '海淀区', value: 98 },
        { name: '门头沟区', value: 45 },
        { name: '房山区', value: 52 },
        { name: '通州区', value: 68 },
        { name: '顺义区', value: 58 },
        { name: '昌平区', value: 72 },
        { name: '大兴区', value: 63 },
        { name: '怀柔区', value: 38 },
        { name: '平谷区', value: 35 },
        { name: '密云区', value: 42 },
        { name: '延庆区', value: 28 },
    ],
    // 上海市各区
    'shanghai': [
        { name: '黄浦区', value: 96 },
        { name: '徐汇区', value: 89 },
        { name: '长宁区', value: 85 },
        { name: '静安区', value: 92 },
        { name: '普陀区', value: 78 },
        { name: '虹口区', value: 82 },
        { name: '杨浦区', value: 88 },
        { name: '闵行区', value: 75 },
        { name: '宝山区', value: 68 },
        { name: '嘉定区', value: 72 },
        { name: '浦东新区', value: 94 },
        { name: '金山区', value: 55 },
        { name: '松江区', value: 69 },
        { name: '青浦区', value: 62 },
        { name: '奉贤区', value: 58 },
        { name: '崇明区', value: 45 },
    ],
    // 天津市各区
    'tianjin': [
        { name: '和平区', value: 92 },
        { name: '河东区', value: 85 },
        { name: '河西区', value: 88 },
        { name: '南开区', value: 90 },
        { name: '河北区', value: 78 },
        { name: '红桥区', value: 75 },
        { name: '东丽区', value: 68 },
        { name: '西青区', value: 72 },
        { name: '津南区', value: 65 },
        { name: '北辰区', value: 70 },
        { name: '武清区', value: 73 },
        { name: '宝坻区', value: 60 },
        { name: '滨海新区', value: 95 },
        { name: '宁河区', value: 55 },
        { name: '静海区', value: 58 },
        { name: '蓟州区', value: 52 },
    ],
    // 重庆市各区县
    'chongqing': [
        { name: '万州区', value: 75 },
        { name: '涪陵区', value: 72 },
        { name: '渝中区', value: 95 },
        { name: '大渡口区', value: 78 },
        { name: '江北区', value: 92 },
        { name: '沙坪坝区', value: 88 },
        { name: '九龙坡区', value: 85 },
        { name: '南岸区', value: 90 },
        { name: '北碚区', value: 80 },
        { name: '綦江区', value: 65 },
        { name: '大足区', value: 68 },
        { name: '渝北区', value: 93 },
        { name: '巴南区', value: 82 },
        { name: '黔江区', value: 60 },
        { name: '长寿区', value: 70 },
        { name: '江津区', value: 75 },
        { name: '合川区', value: 72 },
        { name: '永川区', value: 78 },
        { name: '南川区', value: 65 },
        { name: '璧山区', value: 80 },
        { name: '铜梁区', value: 68 },
        { name: '潼南区', value: 62 },
        { name: '荣昌区', value: 70 },
        { name: '开州区', value: 58 },
        { name: '梁平区', value: 60 },
        { name: '武隆区', value: 55 },
    ],
    // 成都市各区县
    'chengdu': [
        { name: '锦江区', value: 95 },
        { name: '青羊区', value: 92 },
        { name: '金牛区', value: 88 },
        { name: '武侯区', value: 90 },
        { name: '成华区', value: 85 },
        { name: '龙泉驿区', value: 78 },
        { name: '青白江区', value: 68 },
        { name: '新都区', value: 75 },
        { name: '温江区', value: 72 },
        { name: '双流区', value: 82 },
        { name: '郫都区', value: 80 },
        { name: '新津区', value: 70 },
        { name: '金堂县', value: 62 },
        { name: '大邑县', value: 58 },
        { name: '蒲江县', value: 55 },
        { name: '都江堰市', value: 73 },
        { name: '彭州市', value: 68 },
        { name: '邛崃市', value: 65 },
        { name: '崇州市', value: 67 },
        { name: '简阳市', value: 70 },
    ],
}

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

// 根据层级获取地图选项
export function getMapRegionOptionsByLevel(level: 'country' | 'province' | 'city' | 'district') {
    return mapRegions
        .filter(r => r.level === level)
        .map(r => ({
            value: r.name,
            label: r.label
        }))
}

// 获取省份的城市数据
export function getCityDataByProvince(provinceName: string): Array<{ name: string; value: number }> {
    return cityMapData[provinceName] || []
}

// 获取城市的区县数据
export function getDistrictDataByCity(cityName: string): Array<{ name: string; value: number }> {
    return districtMapData[cityName] || []
}

// 检查是否有城市级数据
export function hasCityData(provinceName: string): boolean {
    return !!cityMapData[provinceName]
}

// 检查是否有区县级数据
export function hasDistrictData(cityName: string): boolean {
    return !!districtMapData[cityName]
}

// 获取所有有城市数据的省份
export function getProvincesWithCityData(): MapRegionConfig[] {
    return mapRegions.filter(r => r.level === 'province' && hasCityData(r.name))
}

// 获取所有有区县数据的城市
export function getCitiesWithDistrictData(): MapRegionConfig[] {
    return mapRegions.filter(r => r.level === 'city' && hasDistrictData(r.name))
}

// 根据父级获取子级选项
export function getChildRegionOptions(parentName: string): Array<{ value: string; label: string }> {
    return mapRegions
        .filter(r => r.parent === parentName)
        .map(r => ({
            value: r.name,
            label: r.label
        }))
}

// 获取省份下的城市选项
export function getCityOptionsByProvince(provinceName: string): Array<{ value: string; label: string }> {
    return mapRegions
        .filter(r => r.level === 'city' && r.parent === provinceName)
        .map(r => ({
            value: r.name,
            label: r.label
        }))
}

// 获取城市地图的级联选择器选项（省-市结构）
export function getCityMapCascaderOptions() {
    // 获取所有省份
    const provinces = mapRegions.filter(r => r.level === 'province')
    
    return provinces.map(province => {
        // 获取该省份下的所有城市（不限制是否有区县数据）
        const cities = mapRegions
            .filter(r => r.level === 'city' && r.parent === province.name)
        
        // 如果省份本身是直辖市（如北京、上海、天津、重庆），也加入选项
        const options: Array<{ value: string; label: string }> = []
        
        // 直辖市：省份本身就是城市
        if (province.name === 'beijing' || province.name === 'tianjin' || 
            province.name === 'shanghai' || province.name === 'chongqing') {
            options.push({
                value: province.name,
                label: province.label
            })
        }
        
        // 添加该省份下的城市
        cities.forEach(city => {
            options.push({
                value: city.name,
                label: city.label
            })
        })
        
        // 只返回有城市数据的省份
        if (options.length > 0) {
            return {
                value: province.name,
                label: province.label,
                children: options
            }
        }
        
        return null
    }).filter(Boolean) as Array<{ value: string; label: string; children: Array<{ value: string; label: string }> }>
}

// 根据城市名称获取其省份和城市的级联路径
export function getCityMapCascaderPath(cityName: string): [string, string] | null {
    const city = mapRegions.find(r => r.name === cityName)
    if (!city) return null
    
    // 如果是直辖市（level为province），返回自己作为省和市
    if (city.level === 'province') {
        return [cityName, cityName]
    }
    
    // 如果是城市，返回其父级省份和自己
    if (city.level === 'city' && city.parent) {
        return [city.parent, cityName]
    }
    
    return null
}
