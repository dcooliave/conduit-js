# conduit.js
Send DOM changes through a pipeline

```js
conduit.observe(document.body)
  .filter('a.list-item')
  .each(function(anchorElement, changes) {
    console.log(anchorElement, changes)
  })

conduit.observe(document.body)
  .attribute('data-theme')
  .each(function(bodyElement, changes) {
    console.log(bodyElement, changes)
  })

conduit.observe(document.body)
  .listen('click')
  .each(function(bodyElement, eventObject) {
    console.log(bodyElement, eventObject)
  })

conduit.observe(document.body)
  .follow(['#main', 'section', 'ul#list', 'li.list-item'])
  .each(function(listItemElement, changes) {
    console.log(listItemElement, changes)
  })

conduit.observe(document.body)
  .text('lorem ipsum')
  .each(function(textNode, changes) {
    console.log(textNode, changes)
  })
```

Under the hood
----
Conduit connects mutation observers together to form a pipeline for complex event processing.

Contruct
----
Use `.junction(function|object)`
```js
let junction0 = conduit.junction(function(element, changes) {
  doSomething(element)
})

let junction1 = conduit.junction({
  observe(element, changes) {
    doSomething(element)
  },
  disconnect() {
    cleanup()
  }
})
```

Produce
----
Use `#matched(element, data)`
```js
conduit.junction(function(element, changes) {
  let data = { ...changes, data: 'xyz' }
  this.matched(element, data)
})
```

Extend
----
Use `.define(name, factoryMethod)`
```js
conduit.define('log', function(name, verbose = false) {
  let logger = new Logger(name, verbose)
  return conduit.junction(function(element, changes) {
    logger.log(element, changes)
  })
})
```

Connect
----
Use `conduit(junction0, ..., junctionN)`
```js
conduit(junction0, junction1, junction2)
```
or call routes by name.
```js
conduit.observe(document.body).filter('.result').log('debug', true)
```

Routes
----
Each route produces an _element_ along with _changes_. `changes.type` will equal `match` when an element matches the route, `unmatch` when it doesn't or `change` when something changes.

Produce changes made to _attributeName_
```js
.attribute(attributeName)
```
Produce descendents that match _selector_
```js
.filter(selector)
```
Produce dom trees that match _selectors_
```js
.follow(selectors)
```
Produce text nodes that contain _string_
```js
.text(string)
```

Utilities
----
Start observing _element_. useful as the first route (or the pipeline's input)
```js
.observe(element)
```

Listen to element for _eventName_ events. Produces _element_ and an _eventObject_
```js
.listen(eventName)
```
Execute callback on each result. useful as the last route (or the pipeline's output)
```js
.each(callback)
```
