describe('#filter()', function() {
  let junction, container, target

  before(function() {
    junction = conduit.junction()
    container = document.createElement('div')
    target = document.createElement('span')
  })

  afterEach(function() {
    junction.disconnect()
    container.innerHTML = ''
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
