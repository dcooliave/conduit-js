const state = Symbol('FollowState')
const delegates = new WeakMap()

conduit.define('follow', function(path) {
  const src = conduit.junction(Route)
  const observers = new Map()
  const delegate = Object.create(Delegate)
  delegates.set(delegate, src)
  src[state] = { path, observers, delegate }
  return src
})

const Delegate = {
  pathMatched(element, details) {
    delegates.get(this).matched(element, details)
  }
}

const Route = {
  observe(element, details = {}) {
    const { observers, path, delegate } = this[state]
    if (observers.has(element)) {
      if (details.type === 'unmatch') {
        observers.get(element).stop()
        observers.delete(element)
      } else {
        observers.get(element).refresh()
      }
    } else {
      const observer = Filter(element, path, delegate)
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

const Filter = function(element, selectors, delegate) {
  const filter = Object.create(Observer)
  const path = Array.isArray(selectors) ? Selector(selectors) : selectors
  const observer = conduit.observer(element, filter, { childList: true })
  const children = new Map()
  return Object.assign(filter, { path, children, observer, delegate })
}

const Observer = {
  start() {
    this.observer.start()
    this.children.forEach(o => o.start())
  },

  stop() {
    this.observer.stop()
    this.children.forEach(o => o.stop())
  },

  refresh() {
    this.observer.refresh()
    this.children.forEach(o => o.refresh())
  },

  matchElement(element) {
    return element.matches(this.path.string)
  },

  matchElementsInTree(tree) {
    const matches = tree ? [tree] : Array.from(this.observer.element.children)
    return matches.filter(this.matchElement, this)
  },

  elementProcessed(element, details) {
    if (details.type == 'match') {
      this.elementMatched(element, details)
    } else {
      this.elementUnmatched(element, details)
    }
  },

  elementMatched(element, details) {
    const selector = this.path.next
    if (selector) {
      const child = Filter(element, selector, this)
      this.children.set(element, child)
      child.start()
    } else {
      this.pathMatched(element, details)
    }
  },

  elementUnmatched(element, details) {
    const child = this.children.get(element)
    if (child) {
      child.stop()
      this.children.delete(element)
    } else {
      this.pathMatched(element, details)
    }
  },

  pathMatched(element, details) {
    this.delegate.pathMatched(element, details)
  }
}

const Selector = function(path, start = 0) {
  const string = path[start], index = start + 1
  const next = index < path.length ? Selector(path, index) : null
  return { string, next }
}
