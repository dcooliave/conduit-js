{const state = Symbol('ConduitState')
const routes = {}

const Base = {
  on(evt, fn) {
    const { events } = this[state], { [evt]: e = [] } = events
    events[evt] = e.concat(fn)
    return this
  },

  off(evt, fn) {
    const { events } = this[state], { [evt]: e } = events
    if (e) events[evt] = e.filter(f => f !== fn)
    return this
  },

  emit(evt, ...args) {
    const { [evt]: e } = this[state].events
    if (e) e.forEach(f => f.apply(this, args))
    return this
  }
}

{
  const reserved = { writable: false }
  for (const key of Object.keys(Base)) {
    Object.defineProperty(routes, key, reserved)
  }
}

const Self = {
  observe(...data) {
    this.matched(...data)
  },

  matched(...data) {
    this.emit('data', ...data)
  },

  disconnect() {
    this.emit('end')
  }
}

function conduit(...routes) {
  if (routes.length < 2) throw Error('invalid arguments')
  return routes.reduce(conduit.join)
}

Object.defineProperties(conduit, {
  define: {
    value(name, ctor) {
      routes[name] = function(...args) {
        return conduit.join(this, ctor(...args))
      }
    }
  },
  observe: {
    value(element) {
      const input = conduit.junction()
      window.setTimeout(() => input.observe(element), 0)
      return input
    }
  },
  junction: {
    value(options = {}) {
      const src = Object.assign(Object.create(Base), routes, Self)
      if (typeof options == 'function') options = { observe: options }
      if (options.observe) src.observe = options.observe
      if (options.disconnect) src.disconnect = options.disconnect
      src[state] = { events: {} }
      return src
    }
  },
  join: {
    value(src, dest) {
      function ondata(...data) {
        dest.observe(...data)
      }

      function onend() {
        src.off('data', ondata)
        src.off('end', onend)
        dest.disconnect()
        dest.emit('end')
      }

      src.on('data', ondata)
      src.on('end', onend)

      return dest
    }
  }
})}
{// Original source code: https://github.com/stimulusjs/stimulus/
const state = Symbol('ObserverState')

Object.defineProperty(conduit, 'observer', {
  value(element, delegate, options) {
    const observer = Object.create(Observer)
    const started = false
    const elements = new Set()
    const elementObserver = new MutationObserver(Observer.processMutations.bind(observer))
    observer[state] = { started, elements, delegate, element, options, elementObserver }
    return observer
  }
})

const Observer = {
  start() {
    const data = this[state], { elementObserver, options, started } = data
    if (!started) {
      data.started = true
      elementObserver.observe(this.element, options)
      this.refresh()
    }
  },

  stop() {
    const data = this[state], { elementObserver, options, started } = data
    if (started) {
      elementObserver.takeRecords()
      elementObserver.disconnect()
      data.started = false
    }
  },

  refresh() {
    const data = this[state], { elements, delegate, started } = data
    if (started) {
      const matches = new Set(delegate.matchElementsInTree())
      for (const element of elements) {
        if (!matches.has(element)) {
          this.removeElement(element)
        }
      }
      for (const element of matches) {
        this.addElement(element)
      }
    }
  },

  get element() {
    return this[state].element
  },

  processMutations(mutations) {
    if (this[state].started) {
      for (const mutation of mutations) {
        this.processMutation(mutation)
      }
    }
  },

  processMutation(mutation) {
    if (mutation.type == 'attributes') {
      this.processAttributeChange(mutation.target, mutation.attributeName)
    } else if (mutation.type == 'childList') {
      this.processRemovedNodes(mutation.removedNodes)
      this.processAddedNodes(mutation.addedNodes)
    } else if (mutation.type == 'characterData') {
      this.processCharacterDataChange(mutation.target)
    }
  },

  processAttributeChange(element, attributeName) {
    const { elements, delegate } = this[state]
    if (elements.has(element)) {
      if (delegate.elementAttributeChanged && delegate.matchElement(element)) {
        delegate.elementAttributeChanged(element, attributeName)
      } else {
        this.removeElement(element)
      }
    } else if (delegate.matchElement(element)) {
      this.addElement(element)
    }
  },

  processCharacterDataChange(node) {
    const { elements, delegate } = this[state]
    if (elements.has(node)) {
      if (delegate.elementCharacterDataChanged && delegate.matchElement(node)) {
        delegate.elementCharacterDataChanged(node)
      } else {
        this.removeElement(node)
      }
    } else if (delegate.matchElement(node)) {
      this.addElement(node)
    }
  },

  processAddedNodes(nodes) {
    for (const node of nodes) {
      const element = this.elementFromNode(node)
      if (element && this.elementIsActive(element)) {
        this.processTree(element, this.addElement)
      }
    }
  },

  processRemovedNodes(nodes) {
    for (const node of nodes) {
      const element = this.elementFromNode(node)
      if (element) {
        this.processTree(element, this.removeElement)
      }
    }
  },

  processTree(tree, processor) {
    const { delegate } = this[state]
    for (const element of delegate.matchElementsInTree(tree)) {
      processor.call(this, element)
    }
  },

  elementFromNode(element) {
    if (element.nodeType == Node.ELEMENT_NODE) {
      return element
    }
  },

  elementIsActive(element) {
    if (element.isConnected != this.element.isConnected) {
      return false
    } else {
      return this.element.contains(element)
    }
  },

  addElement(element) {
    const { elements, delegate } = this[state]
    if (!elements.has(element)) {
      if (this.elementIsActive(element)) {
        elements.add(element)
        if (delegate.elementProcessed) {
          delegate.elementProcessed(element, { type: 'match' })
        }
      }
    }
  },

  removeElement(element) {
    const { elements, delegate } = this[state]
    if (elements.has(element)) {
      elements.delete(element)
      if (delegate.elementProcessed) {
        delegate.elementProcessed(element, { type: 'unmatch' })
      }
    }
  }
}}
{const state = Symbol('AttributeState')

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
}}
{conduit.define('each', function(cb) {
  return conduit.junction(cb)
})}
{const state = Symbol('FilterState')

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
}}
{const state = Symbol('FollowState')
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
}}
{const state = Symbol('ListenerState')

conduit.define('listen', function(eventName, useCapture = false) {
  const src = conduit.junction(Route)
  src[state] = { useCapture, eventName, listeners: new Map() }
  return src
})

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
}}
{const state = Symbol('TextState')

conduit.define('text', function(query) {
  const src = conduit.junction(Route)
  src[state] = { query: new RegExp(query), observers: new Map() }
  return src
})

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
}}
