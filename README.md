# conduit.js
Send DOM mutations through a pipeline

```js
conduit.observe(document.body)
  .filter('a.list-item')
  .each(function(anchorElement, mutationDetails) {
    console.log(anchorElement, mutationDetails)
  })

conduit.observe(document.body)
  .attribute('data-theme')
  .each(function(bodyElement, mutationDetails) {
    console.log(bodyElement, mutationDetails)
  })

conduit.observe(document.body)
  .listen('click')
  .each(function(bodyElement, eventObject) {
    console.log(bodyElement, eventObject)
  })

conduit.observe(document.body)
  .follow(['#main', 'section', 'ul#list', 'li.list-item'])
  .each(function(listItemElement, mutationDetails) {
    console.log(listItemElement, mutationDetails)
  })

conduit.observe(document.body)
  .text('lorem ipsum')
  .each(function(textNode, mutationDetails) {
    console.log(textNode, mutationDetails)
  })

let users = conduit.observe(node).filter(selectors.userList)
users.follow(paths.userEmail).text(emailRegex).each(printEmail)
users.follow(paths.userStat).attribute('data-status').each(printStatus)
users.each(printUser)
```

Under the hood
----
Conduit connects mutation observers together to form a pipeline for complex event processing.

Contruct
----
Use `junction(function|object)`
```js
let junc = conduit.junction(function(element, mutationDetails) {
  doSomething(element)
})

let junc = conduit.junction({
  observe(element, mutationDetails) {
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
conduit.junction(function(element, mutationDetails) {
  let data = { ...mutationDetails, data: 'xyz' }
  this.matched(element, data)
})
```

Extend
----
Use `define(name, factoryMethod)`:
```js
conduit.define('log', function(name, verbose = false) {
  let logger = new Logger(name, verbose)
  return conduit.junction(function(element, mutationDetails) {
    logger.log(element, mutationDetails)
  })
})
```

Connect
----
```js
conduit.observe(document.body).filter('.result').log('debug', true)
```
