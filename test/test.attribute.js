import conduit from '../lib/conduit.js'
import route from '../lib/attribute.js'
import { testRoute, expectResult, nextTick } from './util.js'

describe('#attribute()', function() {
  let junction, container

  before(function() {
    conduit.define('attribute', route)
  })

  beforeEach(function() {
    junction = conduit.junction()
    container = document.createElement('div')
  })

  it('output matched element', function() {
    const test = testRoute(junction.attribute('xyz'))

    const target = container
    target.setAttribute('xyz', 'abc')
    junction.observe(container)

    const [result] = test

    expectResult(result, target, {
      type: 'match'
    })
  })

  it('output unmatched element', async function() {
    const test = testRoute(junction.attribute('xyz'))

    const target = container
    target.setAttribute('xyz', 'abc')
    junction.observe(container)
    target.removeAttribute('xyz')
    await nextTick()

    const [, result] = test

    expectResult(result, target, {
      type: 'unmatch'
    })
  })

  it('output changed element', async function() {
    const test = testRoute(junction.attribute('xyz'))

    const target = container
    target.setAttribute('xyz', 'abc')
    junction.observe(container)
    target.setAttribute('xyz', 'def')
    await nextTick()

    const [, result] = test

    expectResult(result, target, {
      type: 'change'
    })
  })
})
