describe('#listen()', function() {
  let junction, container

  before(function() {
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
