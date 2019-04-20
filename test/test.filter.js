import conduit from '../lib/conduit.js'
import route from '../lib/filter.js'
import { testRoute, expectResult, nextTick } from './util.js'

describe('#filter()', function() {
  let junction, container, target

  before(function() {
    conduit.define('filter', route)
  })

  beforeEach(function() {
    junction = conduit.junction()
    container = document.createElement('div')
    target = document.createElement('span')
  })

  it('output matched element', function() {
    const test = testRoute(junction.filter('span'))

    container.appendChild(target)
    junction.observe(container)

    const [result] = test

    expectResult(result, target, {
      type: 'match'
    })
  })

  it('output unmatched element', async function() {
    const test = testRoute(junction.filter('span'))

    container.appendChild(target)
    junction.observe(container)
    container.removeChild(target)
    await nextTick()

    const [, result] = test

    expectResult(result, target, {
      type: 'unmatch'
    })
  })
})
