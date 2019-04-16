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
Use `.junction(function|object)`
```js
let junction0 = conduit.junction(function(element, details) {
  doSomething(element)
})

let junction1 = conduit.junction({
  observe(element, details) {
    doSomething(element)
  },
  disconnect() {
    cleanup()
  }
})
```

## Produce
Use `#matched(element, data)`
```js
conduit.junction(function(element, details) {
  let data = { ...details, data: 'xyz' }
  this.matched(element, data)
})
```

## Extend
Use `.define(name, factoryMethod)`
```js
conduit.define('log', function(name, verbose = false) {
  let logger = new Logger(name, verbose)
  return conduit.junction(function(element, details) {
    logger.log(element, details)
  })
})
```

## Connect
Use routes
```js
conduit.observe(document.body).filter('.result').log('debug', true)
```

or a pipeline.
```js
conduit(junction0, ..., junctionN)
```

## Routes
Each route produces an element along with details about the mutation.

----

### `.attribute(attributeName)`
Observes changes to an attribute.

#### Arguments
1. `attributeName` *(string)*: The name of an attribute node.

#### Produces
*(element, details)*: The observed element along with details about the changed attribute. `details.type` will equal `matched` if the attribute was set, `unmatched` if it was removed, or `changed` if the value was changed.

#### Example
```js
conduit.observe(document.body)
  .attribute('data-theme')
  .each(function(body, details) {
    console.log(body.getAttribute('data-theme'), details.type)
  })
```

----

### `.filter(selector)`
Observes descendents that match a CSS selector.

#### Arguments
1. `selector` *(string)*: A CSS selector.

#### Produces
*(element, details)*: The observed element along with details about additions and removals. `details.type` will equal `matched` if the node was added or `unmatched` if it was removed.

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

#### Produces
*(element, details)*: The observed element matching the last selector, along with details about additions and removals. `details.type` will equal `matched` if the node was added or `unmatched` if it was removed.

#### Example
```js
conduit.observe(document.body)
  .follow(['#main', 'section', 'ul#list', 'li.list-item'])
  .each(function(node, details) {
    console.log(node.matches('#main > section > ul#list > li.list-item'), details.type)
  })
```

----

### `.text(matcher)`
Observes text nodes that contain a substring.

#### Arguments
1. `matcher` *(string|RegExp)*: A substring to search for.

#### Produces
*(node, details)*: The observed text node along with details about additions and removals. `details.type` will equal `matched` if the node contains the substring, or `unmatched` if the substring was removed.

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
Observe an element for changes. Useful as the first route (or the pipeline's input).

#### Arguments
1. `element` *(HTMLElement)*: A target element.

#### Example
```js
conduit.observe(document.body).each(doSomethingWithBody)
```

----

### `.listen(eventName)`
Observe elements that dispatch an event.

#### Arguments
1. `eventName` *(string)*: An eventObject's name.

#### Produces
*(element, eventObject)*: The event target that triggered the event. `eventObject` is the event itself.

#### Example
```js
junction.listen('click').each(doSomething)
```

----

### `.each(callback)`
Execute a function on each result. Useful as the last route (or the pipeline's output).

#### Arguments
1. `callback` *(function)*: A function to invoke with output from the previous route.

#### Example

```js
junction.each(doSomething)
```
