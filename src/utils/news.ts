// 公告概览视图对象
interface NewsVO {
  id: number
  title: string
  createTime: string
  tenantName?: string
}

// 公告详情视图对象
interface NewsDetailVO {
  id: number
  title: string
  content: string
  createTime: string
  tenantName?: string
}
