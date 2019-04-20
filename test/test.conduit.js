import conduit from '../lib/conduit.js'
import { testRoute, expectResult, nextTick } from './util.js'

describe('conduit()', function() {
  let container, routes

  beforeEach(function() {
    routes = [
      conduit.junction(),
      conduit.junction(),
      conduit.junction()
    ]
    container = document.createElement('div')
  })

  it('join routes', function() {
    const test = testRoute(conduit(...routes))
    routes[0].observe(container)
    const [result] = test
    expectResult(result, container, undefined)
  })
})
