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
