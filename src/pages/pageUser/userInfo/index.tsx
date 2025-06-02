import { Image, View, Text, RadioGroup, Label, Radio, Button, Input } from '@tarojs/components'
import { useEffect, useState } from 'react'
import { AtIcon, AtModal } from 'taro-ui'
import Taro from '@tarojs/taro'
import { useAppDispatch, useAppSelector } from '@/store'
import { setUserInfo } from '@/store/user'  // Add this import
import { updateUser } from '@/service/user'
import './index.scss'

const UserInfo = () => {
  // 获取全局状态中的用户信息
  const userInfo = useAppSelector(state => state.user.userInfo)
  // 管理本地用户信息状态
  const [myUserInfo, setMyUserInfo] = useState({
    id: userInfo.id,
    nickname: '',
    avatar: '',
    gender: 0,
  })

  useEffect(() => {
    // 初始化本地状态，从全局状态获取数据
    setMyUserInfo({
      ...myUserInfo,
      nickname: userInfo.nickname || '',
      avatar: userInfo.avatar || '',
      gender: userInfo.gender || 0,
    })
  }, [userInfo])

  // 控制昵称修改弹窗的显示状态
  const [isOpenUserName, setIsOpenUserName] = useState(false)
  // 管理弹窗内输入的昵称
  const [nickname, setNickname] = useState('')

  // 点击昵称触发弹窗显示并填充当前昵称
  const onNickNameChange = () => {
    setNickname(myUserInfo.nickname)
    setIsOpenUserName(true)
  }

  // 关闭昵称修改弹窗
  const closePopup = () => setIsOpenUserName(false)

  // 性别选择变化处理
  const onGenderChange = e => {
    setMyUserInfo(prev => ({ ...prev, gender: e.detail.value }))
  }

  // 获取Redux的dispatch
  const dispatch = useAppDispatch()

  // 处理头像修改
  const onAvatarChange = () => {
    Taro.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: res => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        Taro.uploadFile({
          url: 'http://localhost:8080/content/api/file/upload',
          filePath: tempFilePath,
          name: 'file',
          header: {
            Authorization: Taro.getStorageSync('token'),
          },
          success: fileRes => {
            const url = JSON.parse(fileRes.data).data
            setMyUserInfo(prev => ({ ...prev, avatar: url }))
            dispatch(setUserInfo({ ...userInfo, avatar: url }))  // This line should now work
            Taro.showToast({
              title: '上传成功',
              icon: 'success',
              duration: 2000,
            })
          },
          fail: err => {
            console.log(err)
            Taro.showToast({
              title: '上传失败',
              icon: 'none',
              duration: 2000,
            })
          },
        })
      },
    })
  }

  // 提交弹窗内修改的昵称
  const submitNickName = () => {
    if (!nickname.trim()) {
      Taro.showToast({
        title: '昵称不能为空',
        icon: 'none'
      })
      return
    }
    setMyUserInfo(prev => ({ ...prev, nickname: nickname.trim() }))
    setIsOpenUserName(false)
  }

  // 提交用户信息更新
  const handleSubmit = async () => {
    try {
      const res = await updateUser(myUserInfo)
      if (res.code === 0) {
        Taro.showToast({ title: '修改成功' })
        dispatch(setUserInfo(res.data)) // 更新全局用户信息
        setTimeout(() => {
          Taro.navigateBack({ delta: 1 }) // 返回上一页
        }, 1000)
      } else {
        Taro.showToast({ title: '修改失败' })
      }
    } catch (error) {
      Taro.showToast({ title: '修改时出错' })
    }
  }

  return (
    <View className="userInfoPage">
      <View className="user-info">
        <View className="avatar">
          <View className="row">
            <View className="left">头像</View>
            <View className="right" onClick={onAvatarChange}>
              <View className="img">
                <Image src={myUserInfo.avatar} mode="aspectFill" />
              </View>
              <View className="icon">
                <AtIcon value="chevron-right" size="20" color="#b9b9b9" />
              </View>
            </View>
          </View>
        </View>

        <View className="nickname">
          <View className="row">
            <View className="left">昵称</View>
            <View className="right" onClick={onNickNameChange}>
              <Text className="txt">{myUserInfo.nickname}</Text>
              <AtIcon value="chevron-right" size="20" color="#b9b9b9" />
            </View>
          </View>
        </View>

        <View className="gender">
          <View className="row">
            <View className="left">性别</View>
            <View className="right">
              <RadioGroup onChange={onGenderChange}>
                <Label className="radio">
                  <Radio value="0" color="#1296db" checked={myUserInfo.gender === 0} />男
                </Label>
                <Label className="radio">
                  <Radio value="1" color="#1296db" checked={myUserInfo.gender === 1} />女
                </Label>
              </RadioGroup>
            </View>
          </View>
        </View>
      </View>

      <Button className="button" onClick={handleSubmit}>
        保存
      </Button>

      {/* 昵称修改弹窗 */}
      <AtModal className="nickNamePopup" isOpened={isOpenUserName}>
        <View className="container">
          <View className="popHeader">
            <View className="title">修改用户昵称</View>
            <View className="close" onClick={closePopup}>
              <AtIcon value="close" size={20} color="#999" />
            </View>
          </View>
          <View className="content">
            <Input
              className="input"
              type="text"
              placeholder="请输入昵称"
              value={nickname}
              maxlength={20}
              onInput={e => setNickname(e.detail.value)}  // 将 onChange 改为 onInput
            />
          </View>
          <View className="footer">
            <Button className="submit-btn" onClick={submitNickName} size="mini">
              确认修改昵称
            </Button>
          </View>
        </View>
      </AtModal>
    </View>
  )
}

export default UserInfo
