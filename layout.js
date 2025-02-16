var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function createLayout(appData, config) {
    return __awaiter(this, void 0, void 0, function* () {
        // 创建主 Frame
        const frame = figma.createFrame();
        frame.name = "App Store Assets Layout";
        // 设置初始位置
        let currentX = config.spacing;
        let currentY = config.spacing;
        // 添加图标
        const iconNode = yield figma.createImageAsync(appData.artworkUrl512);
        const iconFrame = figma.createFrame();
        iconFrame.name = "App Icon";
        iconFrame.resize(config.iconSize, config.iconSize);
        iconFrame.fills = [{
                type: 'IMAGE',
                imageHash: iconNode.hash,
                scaleMode: 'FILL'
            }];
        iconFrame.x = currentX;
        iconFrame.y = currentY;
        frame.appendChild(iconFrame);
        // 更新位置到截图区域
        currentY += config.iconSize + config.spacing;
        // 创建截图容器
        const screenshotsFrame = figma.createFrame();
        screenshotsFrame.name = "Screenshots";
        screenshotsFrame.x = currentX;
        screenshotsFrame.y = currentY;
        // 添加截图
        let screenshotX = 0;
        for (const url of appData.screenshotUrls) {
            const screenshotNode = yield figma.createImageAsync(url);
            const screenshotFrame = figma.createFrame();
            screenshotFrame.name = `Screenshot ${screenshotsFrame.children.length + 1}`;
            // 计算高度保持原始比例
            const aspectRatio = screenshotNode.width / screenshotNode.height;
            const screenshotHeight = config.screenshotWidth / aspectRatio;
            screenshotFrame.resize(config.screenshotWidth, screenshotHeight);
            screenshotFrame.fills = [{ type: 'IMAGE', imageHash: screenshotNode.hash, scaleMode: 'FILL' }];
            screenshotFrame.x = screenshotX;
            screenshotFrame.y = 0;
            screenshotsFrame.appendChild(screenshotFrame);
            screenshotX += config.screenshotWidth + config.spacing;
        }
        // 调整截图容器大小
        screenshotsFrame.resize(screenshotX - config.spacing, screenshotsFrame.height);
        // 调整主 Frame 大小
        frame.resize(Math.max(screenshotsFrame.width + config.spacing * 2, config.iconSize + config.spacing * 2), currentY + screenshotsFrame.height + config.spacing);
        frame.appendChild(screenshotsFrame);
        return frame;
    });
}
