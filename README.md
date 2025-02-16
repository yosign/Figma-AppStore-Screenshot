# Figma App Store Screenshot Plugin

一个 Figma 插件，用于自动获取和布局 App Store 应用的截图。

## 功能特点

- 支持通过应用名称或 App ID 搜索应用
- 自动获取高分辨率应用截图
- 支持多个数据源（App Store API、七麦数据）
- 自动创建美观的布局
- 实时显示下载进度
- 支持自定义图标尺寸和间距

## 使用方法

1. 在 Figma 中安装插件
2. 通过应用名称或 App ID 搜索应用
3. 选择目标应用
4. 配置布局参数（可选）
5. 点击"采集包装"按钮
6. 等待截图下载和布局完成

## 开发

### 环境要求

- Node.js
- Figma Desktop App
- Figma Plugin API

### 安装

```bash
npm install
```

### 构建

```bash
npm run build
```

### 开发模式

```bash
npm run watch
```

## 许可证

MIT 