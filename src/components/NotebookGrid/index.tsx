import React from 'react'
import { View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'
import tip from '@/static/images/tip.png'

interface NotebookGridProps {
  data: Array<{
    id: number      // 添加 id 字段
    name: string
    cover: string
  }>
}

const NotebookGrid: React.FC<NotebookGridProps> = ({ data }) => {
  // 添加点击处理函数
  const handleCategoryClick = (item) => {
    Taro.navigateTo({
      url: `/pages/note-category/index?id=${item.id}&name=${item.name}`
    })
  }

  return (
    <View className="notebook-grid">
      {data.map((item, index) => (
        <View
          key={index}
          className="notebook-item"
          style={{ backgroundImage: `url(${item.cover})`, backgroundSize: 'cover' }}
          onClick={() => handleCategoryClick(item)}  // 添加点击事件
        >
          <Image src={tip} className="tip" />
          <Text className="notebook-title">{item.name}</Text>
        </View>
      ))}
    </View>
  )
}

export default NotebookGrid
