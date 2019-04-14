const state = Symbol('FilterState')

conduit.define('filter', function(selector) {
  const src = conduit.junction(Route)
  src[state] = { selector, observers: new Map() }
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
    childList: true,
    subtree: true
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

  get selector() {
    return this.delegate[state].selector
  },

  matchElement(element) {
    return element.matches(this.selector)
  },

  matchElementsInTree(tree) {
    if (tree) {
      const match = this.matchElement(tree) ? [tree] : []
      const matches = Array.from(tree.querySelectorAll(this.selector))
      return match.concat(matches)
    } else {
      return Array.from(this.element.querySelectorAll(this.selector))
    }
  },

  elementProcessed(element, details) {
    this.delegate.matched(element, details)
  }
}
