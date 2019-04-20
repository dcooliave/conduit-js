import conduit from './conduit.js'

const state = Symbol('ListenerState')

export default function(eventName, useCapture = false) {
  const src = conduit.junction(Route)
  src[state] = { useCapture, eventName, listeners: new Map() }
  return src
}

const Route = {
  observe(element, details = {}) {
    const { listeners } = this[state]
    if (listeners.has(element)) {
      if (details.type === 'unmatch') {
        listeners.get(element).stop()
        listeners.delete(element)
      }
    } else {
      const listener = Listener(element, this)
      listeners.set(element, listener)
      listener.start()
    }
  },

  disconnect() {
    const { listeners } = this[state]
    listeners.forEach(l => l.stop())
    listeners.clear()
  }
}

const Listener = function(element, delegate) {
  const handler = Object.create(Observer)
  return Object.assign(handler, { element, delegate })
}

const Observer = {
  start() {
    this.element.addEventListener(this.event, this, this.capture)
  },

  stop() {
    this.element.removeEventListener(this.event, this, this.capture)
  },

  handleEvent(event) {
    this.delegate.matched(this.element, event)
  },

  get event() {
    return this.delegate[state].eventName
  },

  get capture() {
    return this.delegate[state].useCapture
  }
}
