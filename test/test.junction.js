describe('.junction()', function() {
  let junction, container

  beforeEach(function() {
    junction = conduit.junction()
    container = document.createElement('div')
  })

  it('accept input', function() {
    const test = testRoute(junction)
    junction.observe(container)
    const [result] = test
    expectResult(result, container, undefined)
  })

  it('produce output', function() {
    const test = testRoute(junction)
    junction.matched(container)
    const [result] = test
    expectResult(result, container, undefined)
  })
})
