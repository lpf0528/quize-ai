// index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    TabCur: 0,
    scrollLeft: 0,
    tabList: [{
      id: 0,
      name: '关注'
    }, {
      id: 1,
      name: '推荐'
    }, {
      id: 2,
      name: '热榜'
    }, {
      id: 3,
      name: '快讯'
    }, {
      id: 4,
      name: '视频'
    }, {
      id: 5,
      name: '科技'
    }],
    swiperList: [{
      title: '腾讯Q1财报',
      des: '腾讯Q1营收净利润超预期，微信月活破11亿',
      url: 'https://image.meiye.art/Fha6tqRTIwHtlLW3xuZBJj8ZXSX3?imageMogr2/thumbnail/450x/interlace/1'
    }, {
      title: '腾讯Q1财报',
      des: '腾讯Q1营收净利润超预期，微信月活破11亿',
      url: 'https://image.meiye.art/FhHGe9NyO0uddb6D4203jevC_gzc?imageMogr2/thumbnail/450x/interlace/1',
    }, {
      title: '腾讯Q1财报',
      des: '腾讯Q1营收净利润超预期，微信月活破11亿',
      url: 'https://image.meiye.art/FlqKg5bugFQD5Qzm_QhGM7ET4Mtx?imageMogr2/thumbnail/450x/interlace/1',
    }],
  },

  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
  }
})
