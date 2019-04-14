describe('#follow()', function() {
  let junction, container, target

  before(function() {
    junction = conduit.junction()
    container = document.createElement('div')
  })

  afterEach(function() {
    junction.disconnect()
    container.innerHTML = ''
  })

  it('output matched element', function() {
    const test = testRoute(junction.follow(['span', 'b']))

    const span = container.appendChild(document.createElement('span'))
    const target = span.appendChild(document.createElement('b'))
    junction.observe(container)

    const [result] = test

    expectResult(result, target, {
      type: 'match'
    })
  })

  it('output unmatched element', async function() {
    const test = testRoute(junction.follow(['span', 'b']))

    const span = container.appendChild(document.createElement('span'))
    const target = span.appendChild(document.createElement('b'))
    junction.observe(container)
    span.removeChild(target)
    await nextTick()

    const [, result] = test

    expectResult(result, target, {
      type: 'unmatch'
    })
  })
})
