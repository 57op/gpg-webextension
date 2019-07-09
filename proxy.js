(() => {
  console.log('Document-start')
  const API_JS_ID = 'gpg-api-inject'

  // do not inject
  if (document.getElementById(API_JS_ID) !== null) {
    return
  }

  console.log(`Truth: ${document.body ? 'too late' : 'perfect' }`)

  // inject the api script in the page
  const script = document.createElement('script')
  script.id = API_JS_ID
  script.src = browser.runtime.getURL('resources/api.js')
  script.onload = () => dispatchEvent(new Event('GPGLoaded'))
  document.documentElement.appendChild(script)

  // receive message from page script
  window.addEventListener('message', async e => {
    if (e.source === window &&
        e.data &&
        e.data.direction === 'from-page-script') {
      delete e.data.direction // don't like this, maybe wrap the request in e.data.request and e.data.direction?

      try {
        // send message to background script and wait for response
        const result = await browser.runtime.sendMessage(e.data)

        // send the response to the page script
        result.direction = 'from-content-script'
        window.postMessage(result, '*')
      } catch (e) {
        console.error('proxy', e)
      }
    }
  })
})()
