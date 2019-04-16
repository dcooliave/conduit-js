# conduit.js
Send DOM changes through a pipeline.

```js
conduit.observe(document.body) // start tracking changes to body
  .filter('a.list-item') // observe added/removed anchors
  .attribute('href') // observe changes to href
  .each(callback) // get results
```

## Under the hood
Conduit connects mutation observers together to form a pipeline for complex mutation processing.

## Contruct

### `.junction(path)`
Accepts input and produces output.

#### Arguments
1. `path` *(function|object)*: The function to invoke on the input. If path is an object, `path.observe` will be used for input, and `path.end` for cleanup.

#### Output
1. `element` The observed element.
2. `details` Details about the mutation.

#### Example
```js
let junction1 = conduit.junction(function(element, details) {
  doSomething(element)
})

let junction2 = conduit.junction({
  observe(element, details) {
    doSomething(element)
  },
  disconnect() {
    cleanup()
  }
})
```

## Produce

### `#matched(element, details)`
Produces output.

#### Arguments
1. `element` *(HTMLElement)*: The node that changed.
2. `details` *(object)* Details about the mutation.

#### Example
```js
conduit.junction(function(element, details) {
  let data = { ...changes, name: 'xyz' }
  this.matched(element, data)
})
```

## Extend

### `.define(name, factoryMethod)`
Adds a mixin for routes.

#### Arguments
1. `name` *(string)*: The name of the route.
2. `factoryMethod` *(function)* A junction constructor.

#### Example
```js
conduit.define('log', function(name, verbose = false) {
  let logger = new Logger(name, verbose)
  return conduit.junction(function(element, changes) {
    logger.log(element, changes)
  })
})
```

## Connect

### `.observe(element)`
Observes an element for changes. Useful as the first route (or the pipeline's input).

#### Arguments
1. `element` *(HTMLElement)*: A target element.

#### Example
```js
conduit.observe(document.body).filter('.result').log('debug', true)
```

### `conduit(...junctions)`
Connects a pipeline.

#### Arguments
1. `...junctions` *(array)*: A list of junctions.

### Example
```js
conduit(getUsers(), matchFollowers(), printMessage())
```

## Routes
Each route accepts a node as input, observes changes to it, and produces a descendent as output.

----

### `.attribute(attributeName)`
Observes changes to an attribute.

#### Arguments
1. `attributeName` *(string)*: The name of an attribute node.

#### Output
1. `element` The observed element.
2. `details` Details about the mutation. `details.type` will equal `matched` if the attribute was set, `unmatched` if it was removed, or `changed` if the value was changed.

#### Example
```js
conduit.observe(document.body)
  .attribute('data-theme')
  .each(function(body, details.type) {
    console.log(body.getAttribute('data-theme'), details.type)
  })
```

----

### `.filter(selector)`
Observes descendents that match a CSS selector.

#### Arguments
1. `selector` *(string)*: A CSS selector.

#### Output
1. `element` The observed element.
2. `details` Details about the mutation. `details.type` will equal `matched` if the node was added or `unmatched` if it was removed.

#### Example
```js
conduit.observe(document.body)
  .filter('a.list-item')
  .each(function(anchor, details) {
    console.log(document.body.contains(anchor), details.type)
  })
```

----

### `.follow(selectors)`
Observes dom trees that match a list of CSS selectors.

#### Arguments
1. `selectors` *(array)*: A list of CSS selectors.

#### Output
1. `element` The observed element.
2. `details` Details about the mutation. `details.type` will equal `matched` if the node was added or `unmatched` if it was removed.

#### Example
```js
conduit.observe(document.body)
  .follow(['#main', 'section', 'ul#list', 'li.list-item'])
  .each(function(node, details) {
    console.log(node, details.type)
  })
```

----

### `.text(matcher)`
Observes text nodes that contain a substring.

#### Arguments
1. `matcher` *(string|RegExp)*: A substring to search for.

#### Output
1. `element` The observed text node.
2. `details` Details about the mutation. `details.type` will equal `matched` if the node contains the substring, or `unmatched` if the substring was removed.

#### Example
```js
conduit.observe(document.body)
  .text('lorem ipsum')
  .each(function(node, details) {
    console.log(node.data, details.type)
  })
```

----

## Utilities

### `.observe(element)`
Observes an element for changes. Useful as the first route (or the pipeline's input).

#### Arguments
1. `element` *(HTMLElement)*: A target element.

#### Example
```js
conduit.observe(document.body).each(doSomethingWithBody)
```

----

### `.listen(eventName)`
Observes elements that dispatch a specific event.

#### Arguments
1. `eventName` *(string)*: An eventObject's name.

#### Output
1. `element` The observed element.
2. `eventObject` The event.

#### Example
```js
junction.listen('click').each(doSomething)
```

----

### `.each(callback)`
Executes a function on each result. Useful as the last route (or the pipeline's output).

#### Arguments
1. `callback` *(function)*: A function to invoke with output from the previous route.

#### Example

```js
junction.each(doSomething)
```
