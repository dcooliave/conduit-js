# conduit.js
Send DOM changes through a pipeline.

```js
// Watch for anchors and get notified of changes to href.
conduit.observe(document.body)
  .filter('a.list-item')
  .attribute('href')
  .each(callback)
```

## Under the hood
Conduit connects mutation observers together to form a pipeline for complex mutation processing.

## API

- [conduit](#conduit)
- [observe](#observe)
- [junction](#junction)
- [define](#define)
- [attribute](#attribute)
- [filter](#filter)
- [follow](#follow)
- [text](#text)
- [listen](#listen)
- [each](#each)

### conduit

##### `conduit(route1, route2, ..., routeN)`
Builds a pipeline from a series of routes. Returns the last route in the pipeline.

#### example
```js
let one = conduit.junction(stepOne)
let two = conduit.junction(stepTwo)
let three = conduit.junction(stepThree)

conduit(one, two, three)
```

### observe

##### `conduit.observe(element)`
Useful as a first route (or a pipeline's input). Outputs `(element)` after next tick.

#### example
```js
// start a pipeline from the body
let observable = conduit.observe(document.body)

// create a route for spans and anchors
let routeA = observable.filter('span, a')

// create a route for images
let routeB = observable.filter('img')

routeA.each(log)
routeB.each(log)

function log(el) {
  console.log(el)
}
```

### junction

##### `let route = conduit.junction(opts)`
Creates a custom route.

`opts` can be a *function* or *object*. Implement a function `(element, details)` to receive input. Otherwise pass an object and implement an `observe(element, details)` method as input, and optionally a `disconnect()` method as a destructor. Call `this.matched(element, details)` to add data to the output.

#### example
```js
function doSomething() {
  let route = conduit.junction({ observe, disconnect })

  function observe(element, details) {
    observeSomething(element, (target, data) => {
      this.matched(target, { ...data, abc: 'xyz' })
    })
  }

  function disconnect() {
    cleanupSomething()
  }

  return route
}

conduit(one, two, doSomething(), three)
```

### define

##### `conduit.define(name, routeFactory)`
Creates a mixin for routes.

Specify the route's alias as `name` and a function that creates the route as `routeFactory`. Pipelines can then be extended with a new route by calling its alias.

#### example
```js
// highlights elements
conduit.define('paint', function(foreground, background) {
  return conduit.junction(function(element, details) {
    if (details.type == 'match') {
      element.style.color = foreground
      element.style.background = background
    }
    this.matched(element, details)
  })
})

conduit.observe(document.body).filter('div').paint('red', 'blue')
```

### attribute

##### `route.attribute(name)`
Observes an element for changes to an attribute.

Set `name` to the attribute name. Outputs `(element, details)` where `element` is the mutation target and `details` is an object. `details.type` will equal `match` if the attribute was set, `unmatch` if it was removed, or `change` if the value was changed.

#### example
```js
// log body when its 'theme' changes
conduit.observe(document.body).attribute('theme').each(eachResult)

function eachResult(element, details) {
  console.log(element, details)
}

document.body.setAttribute('theme', 'red')
document.querySelector('button').onclick = function() {
  document.body.setAttribute('theme', 'blue')
}
```

### filter

##### `route.filter(selector)`
Observes an element for a particular descendent.

Specify a valid CSS selector as `selector`. Outputs `(element, details)` where `element` is the node that was added or removed, and `details` is an object. `details.type` will equal `match` if the node was added or `unmatch` if it was removed.

#### example
```js
// log anchors and divs that are added to the document
conduit.observe(document.body).filter('a, div').each(logElement)

function logElement(element, details) {
  if (details.type == 'match')
    console.log(element)
}
```

### follow

##### `route.follow([selector0, selector1, ..., selectorN])`
Observes a element for a particular hierarchical structure.

Specify an array of valid CSS selectors. Outputs `(element, details)` where `element` is a descendent that matches the last selector, and `details` is an object. `details.type` will equal `match` if the node was added or `unmatch` if it was removed.

#### example
```js
// log anchors that are added to a subtree
let route = conduit.observe(document.body).follow(['main', 'section', 'div', 'a.nav'])

route.each(function(element, details) {
  if (details.type == 'match')
    console.assert(element.matches('main > section > div > a.nav'))
})
```

### text

##### `route.text(string)`
Observes a element for text nodes that contain or match a string.

`string` can be a String or RegExp. Outputs `(element, details)` where `element` is a text node and `details` is an object. `details.type` will equal `match` if the node contains the string, `unmatch` if the node doesn't match, or `change` if the node matches and the textual content was changed.

#### Example
```js
// log text nodes that contain 'lorem ipsum'
conduit.observe(document.body)
  .text('lorem ipsum')
  .each(function(node, details) {
    if (details.type == 'change')
      console.log('text changed.', node.data)
  })
```

### listen

##### `route.listen(eventName)`
Observes an element for events.

`eventName` is the type of event to listen for. Outputs `(element, eventObject)` where `element` is the node that dispatched the event and `eventObject` is the event object.

#### example
```js
// attach click handlers to images that are added to the document
conduit.observe(document.body)
  .filter('img')
  .listen('click')
  .each(function(element, eventObject) {
    console.assert(element.nodeName == 'IMG')
    console.assert(eventObject.type == 'click')
  })
```

### each

##### `route.each(callback)`
Useful as a last route (or a pipeline's output). `callback` is invoked with the output of the route before it.

#### example

```js
// log divs that are added to the document
conduit.observe(document.body).filter('div').each(logElement)

function logElement(element, details) {
  console.log('el: %o, type: %s', element, details.type)
}

setInterval(() => {
  document.body.appendChild(document.createElement('div'))
}, 1000)
```

## Acknowledgments
Inspiration for Conduit comes from [stimulus](https://github.com/stimulusjs/stimulus/).
