// receive message from page script
window.addEventListener('message', e => {
  if (e.source === window &&
      e.data &&
      e.data.direction === 'from-page-script') {
    // send message to background script
    browser.runtime.sendMessage(e.data)
  }
})

// receive message from background script
browser.runtime.onMessage.addListener(async result => {
  // console.log(`content-script received from background: ${result}`)
  // send message to page script
  result.direction = 'from-content-script'
  window.postMessage(result, '*')
})