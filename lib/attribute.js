const state = Symbol('AttributeState')

conduit.define('attribute', function(attributeName) {
  const src = conduit.junction(Route)
  src[state] = { attributeName, observers: new Map() }
  return src
})

const Route = {
  observe(element, details = {}) {
    const { observers } = this[state]
    if (observers.has(element)) {
      if (details.type === 'unmatch') {
        observers.get(element).stop()
        observers.delete(element)
      } else {
        observers.get(element).refresh()
      }
    } else {
      const observer = Filter(element, this)
      observers.set(element, observer)
      observer.start()
    }
  },

  disconnect() {
    const { observers } = this[state]
    observers.forEach(o => o.stop())
    observers.clear()
  }
}

const Filter = function(element, delegate) {
  const filter = Object.create(Observer)
  const observer = conduit.observer(element, filter, {
    attributeFilter: [delegate[state].attributeName]
  })
  return Object.assign(filter, { observer, delegate })
}

const Observer = {
  start() {
    this.observer.start()
  },

  stop() {
    this.observer.stop()
  },

  refresh() {
    this.observer.refresh()
  },

  get element() {
    return this.observer.element
  },

  get attributeName() {
    return this.delegate[state].attributeName
  },

  matchElement(element) {
    return element.hasAttribute(this.attributeName)
  },

  matchElementsInTree() {
    const { element } = this
    return this.matchElement(element) ? [element] : []
  },

  elementProcessed(element, details) {
    this.delegate.matched(element, details)
  },

  elementAttributeChanged(element, attributeName) {
    if (this.attributeName == attributeName) {
      this.delegate.matched(element, { type: 'change' })
    }
  }
}
