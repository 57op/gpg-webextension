async function onUpdateTab (tabId, changeInfo, tab) {
  if (changeInfo.status === 'loading' && changeInfo.url) {
    // inject proxy and script
    browser.tabs.executeScript(
      tabId,
      {
        'file': 'proxy.js',
        'runAt': 'document_start'
      })
    browser.tabs.executeScript(
      tabId,
      {
        'code': `
          const script = document.createElement('script')
          script.src = '${browser.runtime.getURL('resources/api.js')}'
          document.head.appendChild(script)
          0`,
        'runAt': 'document_start'
      })
  }
}

async function registerContentscripts(result/*, areaName = "local"*/) {
  if (!result.urls) {
    return
  }

  const matches = result.urls.newValue || result.urls

  if (browser.tabs.onUpdated.hasListener(onUpdateTab)) {
    browser.tabs.onUpdated.removeListener(onUpdateTab)
  }

  // only watch whitelisted urls
  browser.tabs.onUpdated.addListener(onUpdateTab, { 'urls': matches, 'properties': ['status'] })
}

async function nativeWrap(request) {
  // console.log(`background received from content-script: ${request}`)
  const result = {}

  try {
    const response = await browser.runtime
      .sendNativeMessage('gpg', request)

    result.action = request.action
    result.type = response.type
    result.data = response.data
  } catch (e) {
    result.type = 'error'
    result.data = 'unexpected error'
  }

  return result
}

// receive message from content-script
browser.runtime.onMessage.addListener(async (request, sender) => {
  return await nativeWrap(request)
})

browser.storage.local.get('urls').then(registerContentscripts)
browser.storage.onChanged.addListener(registerContentscripts)