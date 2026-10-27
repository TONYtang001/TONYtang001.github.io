/* 加密文章：解锁前给 <html> 打标记，配合 css/hbe-custom.css 隐藏目录卡片 */
(function () {
  if (!document.getElementById('hexo-blog-encrypt')) return
  document.documentElement.classList.add('hbe-locked')
  window.addEventListener('hexo-blog-decrypt', function () {
    document.documentElement.classList.remove('hbe-locked')
  })
})()
