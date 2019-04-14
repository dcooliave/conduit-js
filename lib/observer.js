// Original source code: https://github.com/stimulusjs/stimulus/
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
}
