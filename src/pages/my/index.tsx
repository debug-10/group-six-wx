import { View, Image, Navigator } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtButton, AtCard } from 'taro-ui'
import { useAppSelector, useAppDispatch } from '@/store'
import { setUserInfo } from '@/store/user'
import Nav from './components/Nav'
import './index.scss'

export default function My() {
  const dispatch = useAppDispatch()
  const userInfo = useAppSelector(state => state.user.userInfo)

  const handleClickLogin = () => {
    Taro.redirectTo({
      url: '/pages/login/index',
    })
  }

  const handleLogout = async () => {
    try {
      // 清除本地存储的用户信息和token
      Taro.removeStorageSync('user')
      Taro.removeStorageSync('token')
      // 清除 Redux store 中的用户信息
      dispatch(
        setUserInfo({
          id: 0,
          nickname: '',
          avatar: '',
          mobile: '',
        })
      )
      // 提示用户
      Taro.showToast({
        title: '退出成功',
        icon: 'success',
        duration: 2000,
      })
      // 可选：跳转到首页
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

  return (
    <>
      <Nav />
      <View className="my">
        {userInfo.id > 0 ? (
          <View>
            <Navigator url="/pages/pageUser/userInfo/index">
              <AtCard title={userInfo.nickname}>
                <Image
                  src={userInfo.avatar}
                  className="avatar"
                  onError={e => {
                    console.log('图片加载失败', e)
                    e.target.src =
                      'https://my-bucket-wyj.oss-cn-shanghai.aliyuncs.com/images/%E7%86%8A%E4%BA%8C.png'
                  }}
                />
              </AtCard>
            </Navigator>
            <AtButton onClick={handleLogout} type="secondary" className="logout-btn" full>
              退出登录
            </AtButton>
          </View>
        ) : null}
        {userInfo.id > 0 ? null : (
          <AtButton onClick={handleClickLogin} type="primary">
            前往登录
          </AtButton>
        )}
      </View>
    </>
  )
}
