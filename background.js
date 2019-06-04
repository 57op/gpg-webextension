async function nativeWrap(request) {
  // console.log(`background received from content-script: ${request}`)
  const result = {}

  try {
    const response = await browser.runtime
      .sendNativeMessage('gpg', request)

    result.type = response.type
    result.data = response.data
  } catch (e) {
    result.type = 'error'
    result.data = 'unexpected error'
  }

  return result
}

// receive message from content-script
browser.runtime.onMessage.addListener(async request => {
  const result = await nativeWrap(request)
  const activeTab = await browser.tabs.query({ 'active': true })
  browser.tabs.sendMessage(activeTab[0].id, result)
})
