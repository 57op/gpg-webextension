const REGISTERED_CONTENT_SCRIPTS = []

async function registerContentscripts(result/*, areaName = "local"*/) {
  console.log(result)

  if (!result.urls) {
    return
  }

  while (REGISTERED_CONTENT_SCRIPTS.length > 0) {
    REGISTERED_CONTENT_SCRIPTS.pop().unregister()
  }

  const matches = result.urls.newValue || result.urls

  if (matches.length > 0) {
    const cs = await browser.contentScripts.register({
      'js': [
        {
          'file': 'proxy.js'
        }
      ],
      'matches': matches,
      'runAt': 'document_start'
    })

    REGISTERED_CONTENT_SCRIPTS.push(cs)
  }
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
  const result = await nativeWrap(request)

  // TODO: how can we use this?
  console.log('sender', sender)

  return result
})


browser.storage.local.get('urls').then(registerContentscripts)
browser.storage.onChanged.addListener(registerContentscripts)
