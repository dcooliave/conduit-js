import conduit from '../lib/conduit.js'
import route from '../lib/listen.js'
import { testRoute, expectResult, nextTick } from './util.js'

describe('#listen()', function() {
  let junction, container

  before(function() {
    conduit.define('listen', route)
  })

  beforeEach(function() {
    junction = conduit.junction()
    container = document.createElement('div')
  })

  it('output clicked element', function() {
    const test = testRoute(junction.listen('click'))

    const event = new Event('click')
    junction.observe(container)
    container.dispatchEvent(event)

    const [result] = test

    expectResult(result, container, event)
  })
})
