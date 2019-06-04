function makeLi(url) {
  const li = document.createElement('li')
  const span = document.createElement('span')
  const btn = document.createElement('button')

  span.appendChild(document.createTextNode(url))
  btn.appendChild(document.createTextNode('X'))
  li.appendChild(span)
  li.appendChild(btn)

  btn.addEventListener('click', removeLi)

  return li
}

function removeLi(e) {
  e.target.parentNode.remove()
  saveOptions(e)
}

function saveOptions(e) {
  e.preventDefault()

  const url = document.querySelector('#url')

  if (url.value !== '') {
    document.querySelector('#url-list').appendChild( makeLi(url.value) )
    url.value = '';
  }

  const urls = Array
    .from(document.querySelectorAll('#url-list li:not(:first-child) span'))
    .map(li => li.textContent);

  browser.storage.local.set({
    urls: urls
  })

}

function restoreOptions() {
  function updateList(result) {
    if (!result.urls) {
      return
    }

    for (const url of result.urls) {
      urlList.appendChild(makeLi(url));
    }
  }

  function onError(err) {
    console.log(`Error: ${err}`)
  }

  const urlList = document.querySelector('#url-list')
  const getUrls = browser.storage.local.get('urls')
  getUrls.then(updateList, onError)
}

document.addEventListener('DOMContentLoaded', restoreOptions)
document.querySelector('#add-url-form').addEventListener('submit', saveOptions)
