/// <reference types="@figma/plugin-typings" />

import { fetchAppData } from './itunes-api'
import { createLayout } from './layout'

declare const __html__: string

// 设置较小的窗口尺寸，因为UI更简洁了
figma.showUI(__html__, { width: 300, height: 400 })

interface UIMessage {
  type: string
  appId: string
  config: {
    iconSize: number
    screenshotWidth: number
    spacing: number
  }
}

// 监听 UI 消息
figma.ui.onmessage = async (msg: UIMessage) => {
  if (msg.type === 'fetch-app') {
    try {
      // 开始加载提示
      figma.notify('正在获取应用数据...')
      
      // 获取应用数据
      const appData = await fetchAppData(msg.appId)
      
      // 创建布局提示
      figma.notify('正在创建布局...')
      
      // 创建布局
      const frame = await createLayout(appData, msg.config)
      
      // 将新创建的 frame 移动到视图中心
      const center = figma.viewport.center
      frame.x = center.x - frame.width / 2
      frame.y = center.y - frame.height / 2
      
      // 选中创建的 frame
      figma.currentPage.selection = [frame]
      
      // 调整视图以显示整个 frame
      figma.viewport.scrollAndZoomIntoView([frame])
      
      figma.notify('布局创建成功!')
    } catch (error: any) {
      // 发送错误消息到 UI
      figma.ui.postMessage({
        type: 'error',
        message: error.message
      })
      figma.notify('发生错误: ' + error.message)
    }
  }
} 