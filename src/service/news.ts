import { http } from '@/utils/http'

// 公告相关接口
export const getNewsList = (params?: {
  title?: string
  visibleRange?: number
  tenantId?: number
}) => {
  return http<NewsVO[]>({
    method: 'GET',
    url: '/share-admin-api/api/news/list',
    data: params,
  })
}

// 获取最新公告（用于首页显示）
export const getLatestNews = () => {
  return http<NewsVO[]>({
    method: 'GET',
    url: '/share-admin-api/api/news/list',
    data: {
      visibleRange: 1, // 只获取所有用户可见的公告
    },
  })
}
