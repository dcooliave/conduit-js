describe('#text()', function() {
  let junction, container

  beforeEach(function() {
    junction = conduit.junction()
    container = document.createElement('div')
  })

  it('output matched text node', function() {
    const test = testRoute(junction.text('xyz'))

    const target = container.appendChild(document.createTextNode('xyz'))
    junction.observe(container)

    const [result] = test

    expectResult(result, target, {
      type: 'match'
    })
  })

  it('output unmatched text node', async function() {
    const test = testRoute(junction.text('xyz'))

    const target = container.appendChild(document.createTextNode('xyz'))
    junction.observe(container)
    target.data = 'abc'
    await nextTick()

    const [, result] = test

    expectResult(result, target, {
      type: 'unmatch'
    })
  })

  it('output changed text node', async function() {
    const test = testRoute(junction.text('xyz'))

    const target = container.appendChild(document.createTextNode(''))
    junction.observe(container)
    target.data = 'abc'
    target.data = 'xyz'
    await nextTick()

    const [, result] = test

    expectResult(result, target, {
      type: 'change'
    })
  })
})
