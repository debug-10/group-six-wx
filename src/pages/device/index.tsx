import { View, Text } from '@tarojs/components'
import { useState } from 'react'
import { AtButton, AtInput } from 'taro-ui'
import Taro from '@tarojs/taro'
import { sendCommand } from '@/service/device'
import './index.scss'

const DeviceControl: React.FC = () => {
  const [deviceId, setDeviceId] = useState('')
  const [command, setCommand] = useState('')
  const [loading, setLoading] = useState(false)

  // 发送控制命令
  const handleSendCommand = async () => {
    if (!deviceId.trim() || !command.trim()) {
      Taro.showToast({
        title: '设备ID和命令不能为空',
        icon: 'none'
      })
      return
    }

    setLoading(true)
    try {
      const res = await sendCommand(deviceId, command)
      if (res.code === 0) {
        Taro.showToast({
          title: '命令发送成功',
          icon: 'success'
        })
        // 清空命令输入
        setCommand('')
      } else {
        Taro.showToast({
          title: res.msg || '发送失败',
          icon: 'error'
        })
      }
    } catch (error) {
      console.error('发送命令出错：', error)
      Taro.showToast({
        title: '网络错误',
        icon: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='device-control'>
      <View className='form'>
        <AtInput
          name='deviceId'
          title='设备ID'
          type='text'
          placeholder='请输入设备ID'
          value={deviceId}
          onChange={(value: string) => setDeviceId(value)}
        />
        
        <AtInput
          name='command'
          title='控制命令'
          type='text'
          placeholder='请输入控制命令'
          value={command}
          onChange={(value: string) => setCommand(value)}
        />

        <AtButton 
          type='primary' 
          loading={loading}
          onClick={handleSendCommand}
          className='submit-btn'
        >
          发送命令
        </AtButton>
      </View>
    </View>
  )
}

export default DeviceControl
