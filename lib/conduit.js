import observer from './observer.js'

const state = Symbol('ConduitState')
const routes = {}

export default function conduit(...routes) {
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
  },
  observer: {
    value: observer
  }
})

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
