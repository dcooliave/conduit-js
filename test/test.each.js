describe('#each()', function() {
  let junction, container

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
