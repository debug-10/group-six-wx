import { View, Text, Image } from '@tarojs/components'
import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { AtButton, AtList, AtListItem } from 'taro-ui'
import { useAppSelector, useAppDispatch } from '@/store'
import { setUserInfo, clearUserInfo } from '@/store/user'
import { getUserInfo } from '@/service/user'
import './index.scss'

export default function My() {
  const dispatch = useAppDispatch()
  const userInfo = useAppSelector(state => state.user.userInfo)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userInfo.id > 0) {
      loadUserInfo()
    }
  }, [])

  // 获取最新用户信息
  const loadUserInfo = async () => {
    try {
      setLoading(true)
      const response = await getUserInfo()
      if (response.data && response.data.code === 0) {
        const userData = {
          id: response.data.data.id,
          nickname: response.data.data.nickname,
          avatar: response.data.data.avatarUrl, // 确保正确映射avatarUrl到avatar
          mobile: response.data.data.phone,
          username: response.data.data.username,
          role: response.data.data.role,
          tenantId: response.data.data.tenantId,
        }
        dispatch(setUserInfo(userData))
        // 同步到本地存储
        Taro.setStorageSync('user', userData)
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClickLogin = () => {
    Taro.redirectTo({
      url: '/pages/login/index',
    })
  }

  const handleEditProfile = () => {
    Taro.navigateTo({
      url: '/pages/pageUser/userInfo/index',
    })
  }

  const handleLogout = async () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: res => {
        if (res.confirm) {
          try {
            // 清除本地存储的用户信息和token
            Taro.removeStorageSync('user')
            Taro.removeStorageSync('token')
            // 清除 Redux store 中的用户信息
            dispatch(clearUserInfo())
            // 提示用户
            Taro.showToast({
              title: '退出成功',
              icon: 'success',
              duration: 2000,
            })
            // 跳转到首页
            Taro.switchTab({
              url: '/pages/index/index',
            })
          } catch (error) {
            Taro.showToast({
              title: '退出失败',
              icon: 'error',
            })
          }
        }
      },
    })
  }

  const getRoleText = (role: number) => {
    switch (role) {
      case 1:
        return '超级管理员'
      case 2:
        return '租户管理员'
      case 3:
        return '普通用户'
      default:
        return '普通用户'
    }
  }

  if (userInfo.id === 0) {
    return (
      <View className="my">
        <View className="login-prompt">
          <Image
            className="login-avatar"
            src="https://my-bucket-wyj.oss-cn-shanghai.aliyuncs.com/images/%E7%86%8A%E4%BA%8C.png"
          />
          <Text className="login-text">登录后查看更多功能</Text>
          <AtButton onClick={handleClickLogin} type="primary" className="login-btn">
            立即登录
          </AtButton>
        </View>
      </View>
    )
  }

  return (
    <View className="my">
      {/* 用户信息卡片 */}
      <View className="user-card">
        <View className="user-header">
          <Image
            src={
              userInfo.avatar ||
              'https://my-bucket-wyj.oss-cn-shanghai.aliyuncs.com/images/%E7%86%8A%E4%BA%8C.png'
            }
            className="avatar"
            onError={e => {
              console.log('图片加载失败', e)
              e.target.src =
                'https://my-bucket-wyj.oss-cn-shanghai.aliyuncs.com/images/%E7%86%8A%E4%BA%8C.png'
            }}
          />
          <View className="user-info">
            <Text className="nickname">{userInfo.nickname || '未设置昵称'}</Text>
            <Text className="username">用户名: {userInfo.username || userInfo.phone}</Text>
            <Text className="mobile">手机号: {userInfo.phone}</Text>
            <Text className="role">身份: {getRoleText(userInfo.role)}</Text>
          </View>
        </View>
      </View>

      {/* 功能菜单 */}
      <AtList className="menu-list">
        <AtListItem
          title="编辑个人信息"
          arrow="right"
          iconInfo={{ size: 20, color: '#007aff', value: 'user' }}
          onClick={handleEditProfile}
        />
      </AtList>

      {/* 退出登录 */}
      <View className="logout-section">
        <AtButton onClick={handleLogout} type="secondary" className="logout-btn" full>
          退出登录
        </AtButton>
      </View>
    </View>
  )
}
