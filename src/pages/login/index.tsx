import React, { useState, useEffect } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import { sendCode, mobileLogin, getUserInfo, accountLogin, wechatLogin } from '@/service/user'
import { isPhoneAvailable, isCodeAvailable } from '@/utils/validate'
import Taro from '@tarojs/taro'
import { setUserInfo } from '@/store/user'
import { AtTabs, AtTabsPane } from 'taro-ui'
import './index.scss'
import { useAppDispatch } from '@/store'

const Login = () => {
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(60)
  const [timer, setTimer] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mobileForm, setMobileForm] = useState<MobileLoginDTO>({
    mobile: '',
    code: '',
  })
  const [accountForm, setAccountForm] = useState<AccountLoginDTO>({
    username: '',
    password: '',
  })

  const dispatch = useAppDispatch()

  useEffect(() => {
    let interval
    if (timer) {
      interval = setInterval(() => {
        setCount(prevCount => {
          if (prevCount === 1) {
            clearInterval(interval)
            setTimer(false)
            return 60
          }
          return prevCount - 1
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timer])

  const sendMobileCode = async () => {
    if (!mobileForm.mobile || !isPhoneAvailable(mobileForm.mobile)) {
      Taro.showToast({
        title: '请输入正确的手机号',
        icon: 'none',
      })
      return
    }

    setTimer(true)
    try {
      const res = await sendCode(mobileForm.mobile)
      if (res.data.code === 0) {
        Taro.showToast({
          title: '验证码发送成功',
          icon: 'success',
        })
      } else {
        Taro.showToast({
          title: res.data.msg || '验证码发送失败',
          icon: 'none',
        })
        setTimer(false)
        setCount(60)
      }
    } catch (error) {
      console.error('发送验证码失败:', error)
      Taro.showToast({
        title: '网络错误，请重试',
        icon: 'none',
      })
      setTimer(false)
      setCount(60)
    }
  }

  const getLoginUserInfo = async () => {
    try {
      const res = await getUserInfo()
      if (res.data.code === 0) {
        dispatch(setUserInfo(res.data.data))
        Taro.setStorageSync('user', res.data.data)
      } else {
        console.error('获取用户信息失败:', res.data.msg)
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  const handleMobileLogin = async () => {
    if (!mobileForm.mobile || !isPhoneAvailable(mobileForm.mobile)) {
      Taro.showToast({
        title: '请输入正确的手机号',
        icon: 'none',
      })
      return
    }
    if (!mobileForm.code || !isCodeAvailable(mobileForm.code)) {
      Taro.showToast({
        title: '请输入正确的验证码',
        icon: 'none',
      })
      return
    }

    setLoading(true)
    Taro.showLoading({ title: '登录中...' })

    try {
      const res = await mobileLogin(mobileForm)
      if (res.data.code === 0) {
        Taro.setStorageSync('token', res.data.data.accessToken)
        await getLoginUserInfo()

        Taro.showToast({
          title: '登录成功',
          icon: 'success',
        })

        setTimeout(() => {
          Taro.switchTab({
            url: '/pages/index/index',
          })
        }, 1500)
      } else {
        Taro.showToast({
          title: res.data.msg || '登录失败',
          icon: 'none',
        })
      }
    } catch (error) {
      console.error('手机号登录失败:', error)
      Taro.showToast({
        title: '登录失败，请重试',
        icon: 'none',
      })
    } finally {
      setLoading(false)
      Taro.hideLoading()
    }
  }

  const handleAccountLogin = async () => {
    if (!accountForm.username) {
      Taro.showToast({
        title: '请输入用户名',
        icon: 'none',
      })
      return
    }
    if (!accountForm.password) {
      Taro.showToast({
        title: '请输入密码',
        icon: 'none',
      })
      return
    }

    setLoading(true)
    Taro.showLoading({ title: '登录中...' })

    try {
      const res = await accountLogin(accountForm)
      if (res.data.code === 0) {
        Taro.setStorageSync('token', res.data.data.accessToken)
        await getLoginUserInfo()

        Taro.showToast({
          title: '登录成功',
          icon: 'success',
        })

        setTimeout(() => {
          Taro.switchTab({
            url: '/pages/index/index',
          })
        }, 1500)
      } else {
        Taro.showToast({
          title: res.data.msg || '登录失败',
          icon: 'none',
        })
      }
    } catch (error) {
      console.error('账号登录失败:', error)
      Taro.showToast({
        title: '登录失败，请重试',
        icon: 'none',
      })
    } finally {
      setLoading(false)
      Taro.hideLoading()
    }
  }

  // 微信一键登录
  const handleWechatLogin = async () => {
    setLoading(true)
    Taro.showLoading({ title: '微信登录中...' })

    try {
      // 获取微信登录code
      const loginRes = await Taro.login()
      if (loginRes.code) {
        // 调用后端微信登录接口
        const res = await wechatLogin(loginRes.code)
        if (res.data.code === 0) {
          Taro.setStorageSync('token', res.data.data.accessToken)
          await getLoginUserInfo()

          Taro.showToast({
            title: '微信登录成功',
            icon: 'success',
          })

          setTimeout(() => {
            Taro.switchTab({
              url: '/pages/index/index',
            })
          }, 1500)
        } else {
          Taro.showToast({
            title: res.data.msg || '微信登录失败',
            icon: 'none',
          })
        }
      } else {
        Taro.showToast({
          title: '获取微信授权失败',
          icon: 'none',
        })
      }
    } catch (error) {
      console.error('微信登录失败:', error)
      Taro.showToast({
        title: '微信登录失败，请重试',
        icon: 'none',
      })
    } finally {
      setLoading(false)
      Taro.hideLoading()
    }
  }

  const handleInputCode = e => {
    setMobileForm({ ...mobileForm, code: e.detail.value })
  }

  const handleInputPhone = e => {
    setMobileForm({ ...mobileForm, mobile: e.detail.value })
  }

  const handleInputUsername = e => {
    setAccountForm({ ...accountForm, username: e.detail.value })
  }

  const handleInputPassword = e => {
    setAccountForm({ ...accountForm, password: e.detail.value })
  }

  // 修复发送验证码按钮的事件处理
  const handleSendCode = () => {
    if (loading) return
    sendMobileCode()
  }

  // 修复微信登录按钮的事件处理
  const handleWechatLoginClick = () => {
    if (loading) return
    handleWechatLogin()
  }

  return (
    <View className="loginPage">
      <AtTabs
        current={current}
        tabList={[{ title: '验证码登录' }, { title: '账号密码登录' }]}
        onClick={value => setCurrent(value)}
      >
        <AtTabsPane current={current} index={0}>
          <View className="form">
            <Input
              className="input"
              type="text"
              placeholder="请输入手机号"
              value={mobileForm.mobile}
              onInput={handleInputPhone}
              disabled={loading}
            />
            <View className="code">
              <Input
                className="password"
                type="text"
                placeholder="请输入验证码"
                value={mobileForm.code}
                onInput={handleInputCode}
                disabled={loading}
              />
              {!timer ? (
                <Button className="btn" onClick={handleSendCode} disabled={loading} size="mini">
                  获取验证码
                </Button>
              ) : (
                <Button className="btn" disabled size="mini">
                  {count}秒后重发
                </Button>
              )}
            </View>
            <Button
              className="button"
              onClick={handleMobileLogin}
              disabled={loading}
              loading={loading}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </View>
        </AtTabsPane>

        <AtTabsPane current={current} index={1}>
          <View className="form">
            <Input
              className="input"
              type="text"
              placeholder="请输入用户名"
              value={accountForm.username}
              onInput={handleInputUsername}
              disabled={loading}
            />
            <Input
              className="input"
              type="password"
              placeholder="请输入密码"
              value={accountForm.password}
              onInput={handleInputPassword}
              disabled={loading}
            />
            <Button
              className="button"
              onClick={handleAccountLogin}
              disabled={loading}
              loading={loading}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </View>
        </AtTabsPane>
      </AtTabs>

      <View className="extra">
        <View className="caption">
          <Text>其他登录方式</Text>
        </View>
        <View className="options">
          <Text
            className={`icon icon-weixin ${loading ? 'disabled' : ''}`}
            onClick={handleWechatLoginClick}
          >
            微信一键登录
          </Text>
        </View>
      </View>
      <View className="tips">登录/注册即视为同意《服务条款》和《隐私协议》</View>
    </View>
  )
}

export default Login
