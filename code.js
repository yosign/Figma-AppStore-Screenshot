// __awaiter helper function
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

figma.showUI(__html__, { width: 300, height: 400, title: "AppStore Screenshot Hunter" });
// 付费相关配置
const PAYMENT_CONFIG = {
    price: 4.99,
    name: 'Super Screenshot Pro'
};
// 免费使用次数限制
const FREE_USAGE_LIMIT = 3;
// 存储键名
const STORAGE_KEYS = {
    USAGE_COUNT: 'screenshot_usage_count',
    SUBSCRIPTION_STATUS: 'subscription_status'
};
// 检查用户的使用权限
async function checkUsagePermission() {
    try {
        // 获取当前使用次数
        const usageCount = await figma.clientStorage.getAsync(STORAGE_KEYS.USAGE_COUNT) || 0;
        
        // 检查订阅状态
        const subscriptionStatus = await figma.clientStorage.getAsync(STORAGE_KEYS.SUBSCRIPTION_STATUS);
        
        // 如果有有效订阅，直接允许使用
        if (subscriptionStatus && subscriptionStatus.isActive) {
            return {
                canUse: true,
                message: '订阅有效'
            };
        }
        
        // 检查免费使用次数
        if (usageCount < FREE_USAGE_LIMIT) {
            return {
                canUse: true,
                message: `免费使用次数还剩 ${FREE_USAGE_LIMIT - usageCount} 次`
            };
        }
        
        // 超出免费使用次数限制
        return {
            canUse: false,
            message: '已超出免费使用次数限制，请订阅以继续使用'
        };
    } catch (error) {
        console.error('检查使用权限时出错:', error);
        return {
            canUse: false,
            message: '检查使用权限时出错'
        };
    }
}
// 记录使用次数
async function recordUsage() {
    try {
        const currentCount = await figma.clientStorage.getAsync(STORAGE_KEYS.USAGE_COUNT) || 0;
        await figma.clientStorage.setAsync(STORAGE_KEYS.USAGE_COUNT, currentCount + 1);
    } catch (error) {
        console.error('记录使用次数时出错:', error);
    }
}
// 处理订阅
async function handleSubscription() {
    try {
        // 检查支付 API 是否可用
        if (typeof figma.payments === 'undefined') {
            console.error('Payments API not available');
            return false;
        }

        // 启动支付流程
        await figma.payments.initiateCheckoutAsync({
            // 使用 PAID_FEATURE 表示这是付费功能
            interstitial: 'PAID_FEATURE'
        });

        // 检查支付结果
        if (figma.payments.status.type === 'PAID') {
            // 更新订阅状态
            await figma.clientStorage.setAsync(STORAGE_KEYS.SUBSCRIPTION_STATUS, {
                isActive: true,
                purchaseDate: new Date().toISOString()
            });
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('处理订阅时出错:', error);
        return false;
    }
}
// 搜索 App Store 应用的函数
function searchAppStore(term_1) {
    return __awaiter(this, arguments, void 0, function* (term, country = 'us') {
        try {
            const baseUrl = 'https://itunes.apple.com/search';
            const params = [
                `term=${encodeURIComponent(term)}`,
                `country=${country}`,
                'entity=software',
                'limit=10',
                'media=software'
            ].join('&');
            const requestUrl = `${baseUrl}?${params}`;
            console.log('Searching apps:', requestUrl);
            // 使用全局 fetch API
            const response = yield fetch(requestUrl);
            const data = yield response.json();
            console.log('Search results:', data);
            // 格式化搜索结果
            return data.results.map(app => ({
                id: app.trackId,
                name: app.trackName,
                developer: app.sellerName,
                icon: app.artworkUrl60,
                price: app.formattedPrice || 'Free'
            }));
        }
        catch (error) {
            console.error('Error searching apps:', error);
            throw error;
        }
    });
}
// 从网页获取截图的函数
function getScreenshotsFromWebpage(appId, appName, country) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 构建URL
            const storeUrl = `https://apps.apple.com/${country}/app/${appName}/id${appId}`;
            console.log('Fetching from App Store URL:', storeUrl);
            // 使用 fetch 获取数据
            const response = yield fetch(storeUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5'
                }
            });
            // 如果请求失败，尝试从 iTunes API 获取更多信息
            const lookupUrl = `https://itunes.apple.com/lookup?id=${appId}&country=${country}&entity=software&limit=1`;
            const lookupResponse = yield fetch(lookupUrl);
            const lookupData = yield lookupResponse.json();
            if (!lookupData.results || lookupData.results.length === 0) {
                return [];
            }
            const result = lookupData.results[0];
            const screenshots = [];
            // 收集所有可能的截图
            if (result.screenshotUrls) {
                screenshots.push(...result.screenshotUrls);
            }
            if (result.ipadScreenshotUrls) {
                screenshots.push(...result.ipadScreenshotUrls);
            }
            if (result.appletvScreenshotUrls) {
                screenshots.push(...result.appletvScreenshotUrls);
            }
            // 处理截图 URL
            return screenshots.map(url => {
                if (!url)
                    return null;
                let processedUrl = url;
                if (url.startsWith('//')) {
                    processedUrl = 'https:' + url;
                }
                else if (url.startsWith('http:')) {
                    processedUrl = url.replace('http:', 'https:');
                }
                // 替换为高分辨率版本
                return processedUrl.replace(/\d+x\d+bb/, '1290x2796bb');
            }).filter(Boolean);
        }
        catch (error) {
            console.error('Error fetching from webpage:', error);
            return [];
        }
    });
}
// 获取 Qimai 截图的函数
function getQimaiScreenshots(appId_1) {
    return __awaiter(this, arguments, void 0, function* (appId, country = 'us') {
        try {
            const qimaiUrl = `https://api.qimai.cn/app/baseinfo?appid=${appId}&country=${country}`;
            const proxyUrl = `https://home.yosign.cn:7043/${qimaiUrl}`;
            console.log('Fetching screenshots from Qimai API through proxy:', proxyUrl);
            const response = yield fetch(proxyUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Accept-Language': 'en-US,en;q=0.5'
                }
            });
            const data = yield response.json();
            console.log('Qimai API response:', data);
            // 检查是否有 screenshot 数据
            if (data && data.code === 10000 && data.screenshot && Array.isArray(data.screenshot)) {
                // 优先使用 iPhone 的截图
                const iPhoneScreenshots = data.screenshot.find(item => item.name === 'iPhone');
                if (iPhoneScreenshots && Array.isArray(iPhoneScreenshots.value)) {
                    console.log('Found iPhone screenshots:', iPhoneScreenshots.value.length);
                    return iPhoneScreenshots.value;
                }
                // 如果没有 iPhone 截图，尝试使用 iPad 截图
                const iPadScreenshots = data.screenshot.find(item => item.name === 'iPad');
                if (iPadScreenshots && Array.isArray(iPadScreenshots.value)) {
                    console.log('Found iPad screenshots:', iPadScreenshots.value.length);
                    return iPadScreenshots.value;
                }
            }
            // 如果没有找到设备截图，尝试使用活动图片
            if (data && data.code === 10000 && data.activityInfo && Array.isArray(data.activityInfo)) {
                const activityUrls = data.activityInfo
                    .filter(item => item.url && typeof item.url === 'string')
                    .map(item => item.url);
                if (activityUrls.length > 0) {
                    console.log('Found activity screenshots:', activityUrls.length);
                    return activityUrls;
                }
            }
            console.log('No valid screenshots found in Qimai API response');
            return [];
        }
        catch (error) {
            console.error('Error fetching from Qimai API:', error);
            return [];
        }
    });
}
// 获取 App Store 应用数据的函数
function getAppStoreData(appId_1) {
    return __awaiter(this, arguments, void 0, function* (appId, country = 'us') {
        try {
            const baseUrl = 'https://itunes.apple.com/lookup';
            const params = [
                `id=${appId}`,
                `country=${country}`,
                'entity=software',
                'limit=1',
                'media=software',
                'platform=iphone',
                'lang=en_us',
                'version=2'
            ].join('&');
            const requestUrl = `${baseUrl}?${params}`;
            console.log('Fetching from URL:', requestUrl);
            // 使用全局 fetch API
            const response = yield fetch(requestUrl);
            const data = yield response.json();
            console.log('Raw API Response:', data);
            if (!data.results || data.results.length === 0) {
                throw new Error(`App not found for ID: ${appId}`);
            }
            const result = data.results[0];
            // 检查是否有任何类型的截图
            let selectedScreenshots = [];
            let screenshotSource = ''; // 记录截图来源
            // 优先使用 iTunes API 返回的截图
            if (result.screenshotUrls && result.screenshotUrls.length > 0) {
                selectedScreenshots = result.screenshotUrls;
                screenshotSource = 'iTunes API iPhone';
                console.log('Using iTunes API iPhone screenshots');
            }
            else if (result.ipadScreenshotUrls && result.ipadScreenshotUrls.length > 0) {
                selectedScreenshots = result.ipadScreenshotUrls;
                screenshotSource = 'iTunes API iPad';
                console.log('Using iTunes API iPad screenshots');
            }
            else if (result.appletvScreenshotUrls && result.appletvScreenshotUrls.length > 0) {
                selectedScreenshots = result.appletvScreenshotUrls;
                screenshotSource = 'iTunes API Apple TV';
                console.log('Using iTunes API Apple TV screenshots');
            }
            // 如果 API 没有返回任何截图，尝试从七麦数据获取
            if (selectedScreenshots.length === 0) {
                console.log('No screenshots from iTunes API, trying Qimai API...');
                const qimaiScreenshots = yield getQimaiScreenshots(appId, country);
                if (qimaiScreenshots.length > 0) {
                    selectedScreenshots = qimaiScreenshots;
                    screenshotSource = 'Qimai API';
                    console.log(`Found ${qimaiScreenshots.length} screenshots from Qimai API`);
                }
                else {
                    console.log('No screenshots found from Qimai API, trying App Store webpage...');
                }
            }
            // 如果七麦数据也没有截图，再尝试从 App Store 网页获取
            if (selectedScreenshots.length === 0) {
                console.log('No screenshots from APIs, trying to fetch from App Store webpage...');
                // 尝试不同的地区获取截图
                const countries = [country, ...['us', 'gb', 'jp', 'cn'].filter(c => c !== country)];
                for (const tryCountry of countries) {
                    try {
                        // 首先尝试使用应用名称构建URL
                        const appName = result.trackName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                        const screenshots = yield getScreenshotsFromWebpage(appId, appName, tryCountry);
                        if (screenshots.length > 0) {
                            selectedScreenshots = screenshots;
                            console.log(`Found ${screenshots.length} screenshots in ${tryCountry} store`);
                            break;
                        }
                        // 如果使用应用名称失败，尝试直接使用ID
                        const screenshotsWithId = yield getScreenshotsFromWebpage(appId, '', tryCountry);
                        if (screenshotsWithId.length > 0) {
                            selectedScreenshots = screenshotsWithId;
                            console.log(`Found ${screenshotsWithId.length} screenshots in ${tryCountry} store using ID only`);
                            break;
                        }
                        console.log(`No screenshots found in ${tryCountry} store`);
                    }
                    catch (error) {
                        console.error(`Error fetching from ${tryCountry} store:`, error);
                        continue;
                    }
                }
            }
            // 处理截图URL，获取高分辨率版本
            result.screenshotUrls = selectedScreenshots.map(url => {
                if (!url)
                    return null;
                let processedUrl = url;
                if (url.startsWith('//')) {
                    processedUrl = 'https:' + url;
                }
                else if (url.startsWith('http:')) {
                    processedUrl = url.replace('http:', 'https:');
                }
                // 替换尺寸参数为高分辨率版本
                return processedUrl.replace(/\d+x\d+bb/, '1290x2796bb');
            }).filter(Boolean);
            console.log('Processed app data:', {
                name: result.trackName,
                id: result.trackId,
                screenshots: {
                    count: (result.screenshotUrls && result.screenshotUrls.length) || 0,
                    urls: result.screenshotUrls || []
                },
                icon: result.artworkUrl512
            });
            return result;
        }
        catch (error) {
            console.error('Error fetching app data:', error);
            throw error;
        }
    });
}
// 创建布局的函数
function createLayout(appData, config) {
    return __awaiter(this, void 0, void 0, function* () {
        // 创建主 Frame
        const frame = figma.createFrame();
        frame.name = `${appData.trackId}`;
        // 设置最小尺寸和默认间距
        const MIN_SIZE = 0.01;
        const TEXT_SPACING = 8; // 文本元素之间的间距
        // 设置初始位置
        let currentX = config.spacing;
        let currentY = config.spacing;
        // 创建图标容器 Frame
        const iconContainer = figma.createFrame();
        iconContainer.name = "Icon Container";
        iconContainer.x = currentX;
        iconContainer.y = currentY;
        iconContainer.fills = [];
        // 添加图标
        const iconNode = yield figma.createImageAsync(appData.artworkUrl512);
        const iconFrame = figma.createFrame();
        iconFrame.name = "App Icon";
        // 使用 256 作为默认图标尺寸
        const iconSize = 256;
        iconFrame.resize(iconSize, iconSize);
        iconFrame.fills = [{
                type: 'IMAGE',
                imageHash: iconNode.hash,
                scaleMode: 'FILL'
            }];
        iconFrame.cornerRadius = iconSize * 0.2237; // iOS 圆角比例
        iconFrame.x = 0;
        iconFrame.y = 0;
        // 添加图标阴影效果
        iconFrame.effects = [{
                type: 'DROP_SHADOW',
                color: { r: 0, g: 0, b: 0, a: 0.1 },
                offset: { x: 0, y: 2 },
                radius: 8,
                visible: true,
                blendMode: 'NORMAL'
            }];
        // 加载字体
        yield figma.loadFontAsync({ family: "Inter", style: "Regular" });
        yield figma.loadFontAsync({ family: "Inter", style: "Bold" });
        // 创建文本信息
        const nameText = figma.createText();
        nameText.characters = appData.trackName || 'Untitled App';
        nameText.fontSize = 20;
        nameText.fontName = { family: "Inter", style: "Bold" };
        nameText.textAlignHorizontal = "LEFT";
        nameText.textAutoResize = "WIDTH_AND_HEIGHT";
        const devText = figma.createText();
        devText.characters = appData.sellerName || 'Unknown Developer';
        devText.fontSize = 14;
        devText.textAlignHorizontal = "LEFT";
        devText.textAutoResize = "WIDTH_AND_HEIGHT";
        const metaText = figma.createText();
        const rating = appData.averageUserRating ? appData.averageUserRating.toFixed(1) : 'N/A';
        const version = appData.version || '1.0';
        metaText.characters = `Version ${version} • Rating ${rating}`;
        metaText.fontSize = 12;
        metaText.textAlignHorizontal = "LEFT";
        metaText.textAutoResize = "WIDTH_AND_HEIGHT";
        // 定位文本
        nameText.x = 0;
        nameText.y = iconSize + TEXT_SPACING;
        devText.x = 0;
        devText.y = nameText.y + nameText.height + TEXT_SPACING;
        metaText.x = 0;
        metaText.y = devText.y + devText.height + TEXT_SPACING;
        // 将所有元素添加到图标容器
        iconContainer.appendChild(iconFrame);
        iconContainer.appendChild(nameText);
        iconContainer.appendChild(devText);
        iconContainer.appendChild(metaText);
        // 调整图标容器大小为最宽文本的宽度
        const containerWidth = Math.max(iconSize, nameText.width, devText.width, metaText.width);
        // 调整图标容器大小
        iconContainer.resize(containerWidth, metaText.y + metaText.height);
        // 将图标容器添加到主 Frame
        frame.appendChild(iconContainer);
        // 更新当前位置到截图区域
        currentY = iconContainer.y + iconContainer.height + config.spacing;
        // 创建截图容器
        const screenshotsFrame = figma.createFrame();
        screenshotsFrame.name = "Screenshots";
        screenshotsFrame.x = currentX;
        screenshotsFrame.y = currentY;
        screenshotsFrame.fills = [];
        // 添加截图
        let screenshotX = 0;
        console.log('Screenshots URLs:', appData.screenshotUrls);
        if (appData.screenshotUrls.length === 0) {
            // 如果没有截图，添加一个提示文本
            yield figma.loadFontAsync({ family: "Inter", style: "Regular" });
            const noScreenshotsText = figma.createText();
            noScreenshotsText.characters = "No screenshots available";
            noScreenshotsText.fontSize = 14;
            noScreenshotsText.x = 0;
            noScreenshotsText.y = 0;
            screenshotsFrame.appendChild(noScreenshotsText);
            // 设置容器大小为文本大小
            screenshotsFrame.resize(Math.max(noScreenshotsText.width + config.spacing * 2, MIN_SIZE), Math.max(noScreenshotsText.height + config.spacing * 2, MIN_SIZE));
        }
        else {
            // 计算合适的截图显示尺寸
            const IPHONE_RATIO = 1290 / 2796; // iPhone 14 Pro Max 比例
            const displayWidth = 375; // 设置一个合适的显示宽度
            const displayHeight = displayWidth / IPHONE_RATIO;
            // 计算每张截图的进度增量
            const progressIncrement = 89 / appData.screenshotUrls.length; // 10-99%的范围分配给截图下载
            let currentProgress = 10; // 从10%开始
            for (const url of appData.screenshotUrls) {
                try {
                    console.log('Processing screenshot URL:', url);
                    // 更新进度消息
                    figma.ui.postMessage({
                        type: 'progress-update',
                        progress: Math.round(currentProgress),
                        message: `正在下载第 ${screenshotsFrame.children.length + 1}/${appData.screenshotUrls.length} 张截图...`
                    });
                    const screenshotNode = yield figma.createImageAsync(url);
                    const screenshotFrame = figma.createFrame();
                    screenshotFrame.name = `Screenshot ${screenshotsFrame.children.length + 1}`;
                    // 使用预设的显示尺寸
                    screenshotFrame.resize(displayWidth, displayHeight);
                    // 设置图片填充
                    screenshotFrame.fills = [{
                            type: 'IMAGE',
                            imageHash: screenshotNode.hash,
                            scaleMode: 'FILL'
                        }];
                    // 设置圆角和阴影
                    screenshotFrame.cornerRadius = 16;
                    screenshotFrame.effects = [{
                            type: 'DROP_SHADOW',
                            color: { r: 0, g: 0, b: 0, a: 0.1 },
                            offset: { x: 0, y: 2 },
                            radius: 4,
                            visible: true,
                            blendMode: 'NORMAL'
                        }];
                    // 定位
                    screenshotFrame.x = screenshotX;
                    screenshotFrame.y = 0;
                    screenshotsFrame.appendChild(screenshotFrame);
                    screenshotX += displayWidth + config.spacing;
                    // 更新进度
                    currentProgress += progressIncrement;
                }
                catch (error) {
                    console.error('加载截图失败:', error, url);
                    continue;
                }
            }
            // 调整截图容器大小
            const containerWidth = screenshotX - config.spacing;
            const containerHeight = displayHeight;
            screenshotsFrame.resize(Math.max(containerWidth, MIN_SIZE), Math.max(containerHeight, MIN_SIZE));
        }
        // 将所有元素添加到主 Frame
        frame.appendChild(screenshotsFrame);
        // 调整主 Frame 大小
        const frameWidth = Math.max(screenshotsFrame.width + config.spacing * 2, iconContainer.width + config.spacing * 2, MIN_SIZE);
        const frameHeight = Math.max(screenshotsFrame.y + screenshotsFrame.height + config.spacing, MIN_SIZE);
        frame.resize(frameWidth, frameHeight);
        return frame;
    });
}
// 测试环境重置订阅状态
async function resetSubscriptionStatus() {
    try {
        await figma.clientStorage.setAsync(STORAGE_KEYS.SUBSCRIPTION_STATUS, null);
        await figma.clientStorage.setAsync(STORAGE_KEYS.USAGE_COUNT, 0);
        return true;
    } catch (error) {
        console.error('重置订阅状态时出错:', error);
        return false;
    }
}
// 监听 UI 消息
figma.ui.onmessage = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    if (msg.type === 'reset-subscription') {
        const success = yield resetSubscriptionStatus();
        figma.ui.postMessage({
            type: 'reset-subscription-result',
            success
        });
        if (success) {
            // 重新检查权限状态
            const permissionStatus = yield checkUsagePermission();
            figma.ui.postMessage({
                type: 'permission-status',
                canUse: permissionStatus.canUse,
                message: permissionStatus.message
            });
        }
    } else if (msg.type === 'check-permission') {
        // 检查使用权限
        const permissionStatus = yield checkUsagePermission();
        figma.ui.postMessage({
            type: 'permission-status',
            canUse: permissionStatus.canUse,
            message: permissionStatus.message
        });
    }
    else if (msg.type === 'subscribe') {
        // 处理订阅
        const success = yield handleSubscription();
        figma.ui.postMessage({
            type: 'subscription-result',
            success
        });
    }
    else if (msg.type === 'search-apps') {
        try {
            const results = yield searchAppStore(msg.term, msg.country);
            // 发送搜索结果回UI
            figma.ui.postMessage({
                type: 'search-results',
                results: results
            });
        }
        catch (error) {
            figma.ui.postMessage({
                type: 'error',
                message: error.message
            });
        }
    }
    else if (msg.type === 'fetch-app') {
        try {
            // 检查使用权限
            const permissionStatus = yield checkUsagePermission();
            if (!permissionStatus.canUse) {
                figma.ui.postMessage({
                    type: 'error',
                    message: permissionStatus.message
                });
                return;
            }
            // 开始获取数据
            figma.ui.postMessage({
                type: 'progress-update',
                progress: 0,
                message: '正在获取应用数据...'
            });
            const appData = yield getAppStoreData(msg.appId, msg.country);
            // 更新进度 - 数据获取完成
            figma.ui.postMessage({
                type: 'progress-update',
                progress: 10,
                message: '开始下载截图...'
            });
            const frame = yield createLayout(appData, msg.config);
            // 更新进度 - 布局创建完成
            figma.ui.postMessage({
                type: 'progress-update',
                progress: 100,
                message: '采集包装完成！'
            });
            // 将新创建的 frame 移动到视图中心
            const center = figma.viewport.center;
            frame.x = center.x - frame.width / 2;
            frame.y = center.y - frame.height / 2;
            // 选中创建的 frame
            figma.currentPage.selection = [frame];
            // 调整视图以显示整个 frame
            figma.viewport.scrollAndZoomIntoView([frame]);
            // 记录使用次数
            yield recordUsage();
            // 刷新权限状态
            const newPermissionStatus = yield checkUsagePermission();
            figma.ui.postMessage({
                type: 'permission-status',
                canUse: newPermissionStatus.canUse,
                message: newPermissionStatus.message
            });
            figma.notify('采集包装完成！');
        }
        catch (error) {
            figma.ui.postMessage({
                type: 'error',
                message: error.message
            });
            figma.notify('发生错误: ' + error.message);
        }
    }
});
