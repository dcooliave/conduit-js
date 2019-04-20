import conduit from '../lib/conduit.js'
import route from '../lib/each.js'
import { testRoute, expectResult, nextTick } from './util.js'

describe('#each()', function() {
  let junction, container

  before(function() {
    conduit.define('each', route)
  })

  beforeEach(function() {
    junction = conduit.junction()
    container = document.createElement('div')
  })

  it('map input to output', function() {
    const test = testRoute(junction.each())
    junction.observe(container)
    const [result] = test
    expectResult(result, container, undefined)
  })
})
