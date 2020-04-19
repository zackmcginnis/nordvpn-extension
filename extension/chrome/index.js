// Init our local connection status
let connection_status = false

const STATUS_DISCONNECTED = 'Status: Disconnected'

// Connect to our native messaging host
const port = chrome.runtime.connectNative('com.nordvpn.toggle')

// When the user clicks the extension icon in the browser icon tray,
// we send a message to our script which will toggle their NordVPN connection status 
chrome.browserAction.onClicked.addListener((tab) => {
  const message = connection_status ? 'disconnect' : 'connect'
  console.log('sending message to ', message)
  port.postMessage({message})
});

// Receive a message from the host after attempting to toggle NordVPN 
port.onMessage.addListener((req) => {
  if (chrome.runtime.lastError) {
    console.log(chrome.runtime.lastError.message)
    throw new Error(chrome.runtime.lastError.message)
  }
  handleMessage(req)
})

// Update our local value of connection_status based on the message we receive from our native messaging host
function handleMessage (req) {
  console.log(req)
  const message = req.message
  console.log(`Response from script. NordVPN connection status: ${message}`)
  if(message == 'status') {
    connection_status = parseStatus(req.output)
  } else {
    // ENTER_CREDENTIALS and 'disconnected will reach here.
    // Only 'connected' will generate a connection_status of 'true'
    connection_status = req.message == 'connected' ? true : false
  }
  
  updateIconImage(connection_status)
}

// Set our browser icon based on our updated connection status
const updateIconImage = (status) => {
  chrome.tabs.query({active:true, windowType:"normal", currentWindow: true}, (d) => {
    const tabId = d[0].id
    const path = status ? './icons/connected.png' : './icons/disconnected.png'
    chrome.browserAction.setIcon({path, tabId})
  })
}

port.onDisconnect.addListener(() => {
  console.error('Disconnected')
  if (chrome.runtime.lastError) {
    console.log(chrome.runtime.lastError.message)
    throw new Error(chrome.runtime.lastError.message)
  }
})

function parseStatus(statusMessage) {
  console.log('statusMessage ', statusMessage.includes(STATUS_DISCONNECTED))
  if(statusMessage.includes(STATUS_DISCONNECTED)) {
    return false
  } else {
    return true
  }
}

const getInitialConnectionStatusOfMachine = () => {
  const message = 'status'
  port.postMessage({message})
}

getInitialConnectionStatusOfMachine()