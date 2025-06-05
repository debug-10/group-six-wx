import { View, Text } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { AtForm, AtInput, AtButton } from 'taro-ui'
import { updateUser } from '@/service/user'
import './index.scss'

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
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
      setLoading(true)
      const response = await updateUser({
        password: newPassword,
      })

      if (response.code === 0) {
        Taro.showToast({
          title: '密码修改成功',
          icon: 'success',
        })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
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
      setLoading(false)
    }
  }

  return (
    <View className="change-password">
      <AtForm>
        <View className="form-section">
          <AtInput
            name="oldPassword"
            title="原密码"
            type="password"
            placeholder="请输入原密码"
            value={oldPassword}
            onChange={value => setOldPassword(value as string)}
          />
          <AtInput
            name="newPassword"
            title="新密码"
            type="password"
            placeholder="请输入新密码（至少6位）"
            value={newPassword}
            onChange={value => setNewPassword(value as string)}
          />
          <AtInput
            name="confirmPassword"
            title="确认新密码"
            type="password"
            placeholder="请再次输入新密码"
            value={confirmPassword}
            onChange={value => setConfirmPassword(value as string)}
          />
        </View>

        <View className="submit-section">
          <AtButton type="primary" loading={loading} onClick={handleSubmit} className="submit-btn">
            确认修改
          </AtButton>
        </View>
      </AtForm>
    </View>
  )
}

export default ChangePassword
