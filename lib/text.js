import conduit from './conduit.js'

const state = Symbol('TextState')

export default function(query) {
  const src = conduit.junction(Route)
  src[state] = { query: new RegExp(query), observers: new Map() }
  return src
}

const Route = {
  observe(element, details) {
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
    characterData: true,
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

  get query() {
    return this.delegate[state].query
  },

  matchElement(element) {
    return this.query.test(element.textContent)
  },

  matchElementsInTree(tree) {
    if (tree && tree.nodeType == Node.TEXT_NODE) {
      return this.matchElement(tree) ? [tree] : []
    } else {
      const element = tree || this.observer.element
      const result = document.evaluate('.//text()', element, null,
        XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null)
      let node, matches = []
      while (node = result.iterateNext()) {
        if (this.matchElement(node)) {
          matches.push(node)
        }
      }
      return matches
    }
  },

  elementProcessed(element, details) {
    this.delegate.matched(element, details)
  },

  elementCharacterDataChanged(node) {
    this.delegate.matched(node, { type: 'change' })
  }
}
