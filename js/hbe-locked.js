/* 加密文章（hexo-blog-encrypt）的配套脚本，做两件事：
   1. 解锁前给 <html> 打上 hbe-locked 标记，配合 css/hbe-custom.css 隐藏目录卡片
   2. 解锁后把正文补进站内搜索索引——只存在当前标签页的 sessionStorage 里，
      关掉标签页就没了，不会写到服务器，也不会进入 search.xml
*/
(function () {
  'use strict'

  var STORE_PREFIX = 'hbe-search:'

  function currentEntry () {
    var container = document.getElementById('article-container')
    if (!container) return null
    var text = (container.innerText || '').replace(/\s+/g, ' ').trim()
    if (!text) return null
    var titleEl = document.querySelector('.post-title')
    return {
      title: (titleEl ? titleEl.textContent : document.title).trim(),
      content: text,
      url: decodeURIComponent(location.pathname)
    }
  }

  function mergeEntry (entry) {
    var search = window.__btfLocalSearch
    if (!search || !Array.isArray(search.datas) || !entry) return
    for (var i = 0; i < search.datas.length; i++) {
      // 索引里可能已有这篇的「标题条目」（正文为空），替换成带正文的版本
      if (search.datas[i].url === entry.url) {
        search.datas[i] = entry
        return
      }
    }
    search.datas.push(entry)
  }

  function mergeStored () {
    try {
      for (var i = 0; i < sessionStorage.length; i++) {
        var key = sessionStorage.key(i)
        if (!key || key.indexOf(STORE_PREFIX) !== 0) continue
        mergeEntry(JSON.parse(sessionStorage.getItem(key)))
      }
    } catch (e) { /* sessionStorage 不可用时静默跳过 */ }
  }

  if (document.getElementById('hexo-blog-encrypt')) {
    document.documentElement.classList.add('hbe-locked')
  }

  window.addEventListener('hexo-blog-decrypt', function () {
    document.documentElement.classList.remove('hbe-locked')
    var entry = currentEntry()
    if (!entry) return
    try { sessionStorage.setItem(STORE_PREFIX + entry.url, JSON.stringify(entry)) } catch (e) {}
    mergeEntry(entry)
  })

  // 搜索数据是异步拉取的：拉完（search:loaded）和页面加载完各补一次
  window.addEventListener('search:loaded', mergeStored)
  window.addEventListener('load', mergeStored)
})()
