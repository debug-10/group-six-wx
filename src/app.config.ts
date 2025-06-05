export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/login/index',
    'pages/my/index',
    'pages/my/password/index', // 添加修改密码页面
    'pages/notice/index',
    'pages/pageUser/userInfo/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1296db',
    navigationBarTitleText: 'NoteApp',
    navigationBarTextStyle: 'white',
    enablePullDownRefresh: true, // 开启下拉刷新
  },
  tabBar: {
    color: '#333',
    selectedColor: '#1296db',
    backgroundColor: '#fff',
    borderStyle: 'white',
    list: [
      {
        text: '首页',
        pagePath: 'pages/index/index',
        iconPath: 'static/tabs/home.png',
        selectedIconPath: 'static/tabs/home_selected.png',
      },
      {
        text: '公告',
        pagePath: 'pages/notice/index',
        iconPath: 'static/tabs/notice.png',
        selectedIconPath: 'static/tabs/notice_selected.png',
      },
      {
        text: '我的',
        pagePath: 'pages/my/index',
        iconPath: 'static/tabs/my.png',
        selectedIconPath: 'static/tabs/my_selected.png',
      },
    ],
  },
})
