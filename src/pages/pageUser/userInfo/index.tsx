import { View, Text, Button, Input, Image, RadioGroup, Radio, Label } from '@tarojs/components'
import { useEffect, useState } from 'react'
import { AtIcon, AtModal, AtInput, AtForm } from 'taro-ui'
import Taro from '@tarojs/taro'
import { useAppDispatch, useAppSelector } from '@/store'
import { setUserInfo } from '@/store/user'
import { updateUser, uploadAvatar } from '@/service/user'
import './index.scss'

const UserInfo = () => {
  // 获取全局状态中的用户信息
  const userInfo = useAppSelector(state => state.user.userInfo)
  // 管理本地用户信息状态
  const [myUserInfo, setMyUserInfo] = useState({
    id: userInfo.id,
    nickname: '',
    avatar: '',
    // 删除 gender 字段
  })

  useEffect(() => {
    // 初始化本地状态，从全局状态获取数据
    setMyUserInfo({
      ...myUserInfo,
      nickname: userInfo.nickname || '',
      avatar: userInfo.avatar || '',
      // 删除 gender 初始化
    })
  }, [userInfo])

  // 控制昵称修改弹窗的显示状态
  const [isOpenUserName, setIsOpenUserName] = useState(false)
  // 管理弹窗内输入的昵称
  const [nickname, setNickname] = useState('')
  // 上传状态
  const [uploading, setUploading] = useState(false)

  // 添加密码修改相关状态
  const [isOpenPassword, setIsOpenPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordLoading, setPasswordLoading] = useState(false)

  // 点击昵称触发弹窗显示并填充当前昵称
  const onNickNameChange = () => {
    setNickname(myUserInfo.nickname)
    setIsOpenUserName(true)
  }

  // 关闭昵称修改弹窗
  const closePopup = () => setIsOpenUserName(false)

  // 添加密码修改相关函数
  const onPasswordChange = () => {
    setPasswordForm({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
    setIsOpenPassword(true)
  }

  const closePasswordPopup = () => {
    setIsOpenPassword(false)
    setPasswordForm({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
  }

  const handlePasswordSubmit = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwordForm

    // 表单验证
    if (!oldPassword.trim()) {
      Taro.showToast({
        title: '请输入原密码',
        icon: 'none',
      })
      return
    }

    if (!newPassword.trim()) {
      Taro.showToast({
        title: '请输入新密码',
        icon: 'none',
      })
      return
    }

    if (newPassword.length < 6) {
      Taro.showToast({
        title: '新密码至少6位',
        icon: 'none',
      })
      return
    }

    if (newPassword !== confirmPassword) {
      Taro.showToast({
        title: '两次密码输入不一致',
        icon: 'none',
      })
      return
    }

    if (oldPassword === newPassword) {
      Taro.showToast({
        title: '新密码不能与原密码相同',
        icon: 'none',
      })
      return
    }

    try {
      setPasswordLoading(true)
      const response = await updateUser({
        password: newPassword,
      })

      if (response.code === 0) {
        Taro.showToast({
          title: '密码修改成功',
          icon: 'success',
        })
        setIsOpenPassword(false)
        setPasswordForm({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      } else {
        Taro.showToast({
          title: response.msg || '密码修改失败',
          icon: 'none',
        })
      }
    } catch (error) {
      console.error('密码修改失败:', error)
      Taro.showToast({
        title: '密码修改失败',
        icon: 'none',
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  // 获取Redux的dispatch
  const dispatch = useAppDispatch()

  // 验证图片文件
  // 检查文件类型 - 修复版
  const validateImageFile = (file: any) => {
    // 检查文件大小
    if (file.size > 5 * 1024 * 1024) {
      Taro.showToast({
        title: '图片大小不能超过5MB',
        icon: 'none',
        duration: 2000,
      })
      return false
    }

    // 通过文件扩展名检查类型（更可靠）
    const fileName = file.path || file.tempFilePath || ''
    const fileExtension = fileName.toLowerCase().split('.').pop()
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif']

    if (!allowedExtensions.includes(fileExtension)) {
      Taro.showToast({
        title: '只支持JPG、PNG、GIF格式图片',
        icon: 'none',
        duration: 2000,
      })
      return false
    }

    return true
  }

  // 处理头像修改
  const onAvatarChange = () => {
    if (uploading) {
      Taro.showToast({
        title: '正在上传中...',
        icon: 'none',
      })
      return
    }

    Taro.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back',
      success: async res => {
        const tempFile = res.tempFiles[0]

        // 验证文件
        if (!validateImageFile(tempFile)) {
          return
        }

        setUploading(true)

        // 显示上传进度
        Taro.showLoading({
          title: '上传中...',
          mask: true,
        })

        try {
          const avatarUrl = await uploadAvatar(tempFile.tempFilePath)

          // 更新本地状态
          setMyUserInfo(prev => ({ ...prev, avatar: avatarUrl }))

          // 更新全局状态
          dispatch(setUserInfo({ ...userInfo, avatar: avatarUrl }))

          Taro.hideLoading()
          Taro.showToast({
            title: '头像上传成功',
            icon: 'success',
            duration: 2000,
          })
        } catch (error) {
          console.error('头像上传失败:', error)
          Taro.hideLoading()
          Taro.showToast({
            title: error.message || '头像上传失败',
            icon: 'none',
            duration: 2000,
          })
        } finally {
          setUploading(false)
        }
      },
      fail: error => {
        console.error('选择图片失败:', error)
        Taro.showToast({
          title: '选择图片失败',
          icon: 'none',
          duration: 2000,
        })
      },
    })
  }

  // 提交弹窗内修改的昵称
  const submitNickName = () => {
    if (!nickname.trim()) {
      Taro.showToast({
        title: '昵称不能为空',
        icon: 'none',
      })
      return
    }

    if (nickname.trim().length > 20) {
      Taro.showToast({
        title: '昵称不能超过20个字符',
        icon: 'none',
      })
      return
    }

    setMyUserInfo(prev => ({ ...prev, nickname: nickname.trim() }))
    setIsOpenUserName(false)
  }

  // 提交用户信息更新
  const handleSubmit = async () => {
    if (!myUserInfo.nickname.trim()) {
      Taro.showToast({
        title: '昵称不能为空',
        icon: 'none',
      })
      return
    }

    try {
      Taro.showLoading({
        title: '保存中...',
        mask: true,
      })

      const res = await updateUser(myUserInfo)

      Taro.hideLoading()

      if (res.code === 0) {
        Taro.showToast({ title: '修改成功' })
        dispatch(setUserInfo({ ...userInfo, ...myUserInfo })) // 更新全局用户信息
        setTimeout(() => {
          Taro.navigateBack({ delta: 1 }) // 返回上一页
        }, 1000)
      } else {
        Taro.showToast({
          title: res.msg || '修改失败',
          icon: 'none',
        })
      }
    } catch (error) {
      Taro.hideLoading()
      console.error('更新用户信息失败:', error)
      Taro.showToast({
        title: '修改时出错',
        icon: 'none',
      })
    }
  }

  return (
    <View className="userInfoPage">
      <View className="user-info">
        <View className="avatar">
          <View className="row">
            <View className="left">头像</View>
            <View className={`right ${uploading ? 'uploading' : ''}`} onClick={onAvatarChange}>
              <View className="img">
                <Image
                  src={myUserInfo.avatar || '/assets/images/default-avatar.png'}
                  mode="aspectFill"
                />
                {uploading && (
                  <View className="upload-mask">
                    <View className="loading">上传中...</View>
                  </View>
                )}
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
              <Text className="txt">{myUserInfo.nickname || '未设置'}</Text>
              <AtIcon value="chevron-right" size="20" color="#b9b9b9" />
            </View>
          </View>
        </View>

        {/* 添加修改密码选项 */}
        <View className="password">
          <View className="row">
            <View className="left">修改密码</View>
            <View className="right" onClick={onPasswordChange}>
              <Text className="txt">点击修改</Text>
              <AtIcon value="chevron-right" size="20" color="#b9b9b9" />
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
              onInput={e => setNickname(e.detail.value)}
            />
          </View>
          <View className="footer">
            <Button className="submit-btn" onClick={submitNickName} size="mini">
              确认修改昵称
            </Button>
          </View>
        </View>
      </AtModal>

      {/* 添加密码修改弹窗 */}
      <AtModal className="passwordPopup" isOpened={isOpenPassword}>
        <View className="container">
          <View className="popHeader">
            <View className="title">修改密码</View>
            <View className="close" onClick={closePasswordPopup}>
              <AtIcon value="close" size={20} color="#999" />
            </View>
          </View>
          <View className="content">
            <AtForm>
              <AtInput
                name="oldPassword"
                title="原密码"
                type="password"
                placeholder="请输入原密码"
                value={passwordForm.oldPassword}
                onChange={value =>
                  setPasswordForm(prev => ({ ...prev, oldPassword: value as string }))
                }
              />
              <AtInput
                name="newPassword"
                title="新密码"
                type="password"
                placeholder="请输入新密码（至少6位）"
                value={passwordForm.newPassword}
                onChange={value =>
                  setPasswordForm(prev => ({ ...prev, newPassword: value as string }))
                }
              />
              <AtInput
                name="confirmPassword"
                title="确认新密码"
                type="password"
                placeholder="请再次输入新密码"
                value={passwordForm.confirmPassword}
                onChange={value =>
                  setPasswordForm(prev => ({ ...prev, confirmPassword: value as string }))
                }
              />
            </AtForm>
          </View>
          <View className="footer">
            <Button
              className="submit-btn"
              onClick={handlePasswordSubmit}
              size="mini"
              loading={passwordLoading}
            >
              确认修改密码
            </Button>
          </View>
        </View>
      </AtModal>
    </View>
  )
}

export default UserInfo
