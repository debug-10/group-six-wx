import { useAppSelector } from '@/store'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './nav.scss'
const Nav = () => {
  const userInfo = useAppSelector(state => state.user.userInfo) || { id: 0 }
  const safeAreaInsets = Taro.getWindowInfo().safeArea || { top: 0 }
  const handleClick = () => {
    if (userInfo && userInfo.id > 0) {
      Taro.navigateTo({ url: '/pageUser/userInfo/index' })
    }
  }
  return (
    <View className="navbar" style={{ paddingTop: safeAreaInsets!.top + 10 + 'px' }}>
      <View className="text" onClick={handleClick}>
        <Text className="logo-text">个⼈中⼼</Text>
      </View>
    </View>
  )
}
export default Nav
