// inject the api script in the page
const script = document.createElement('script')
script.src = browser.runtime.getURL('resources/api.js')
script.onload = e => dispatchEvent(new Event('GPGLoaded'))
document.head.appendChild(script)

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
