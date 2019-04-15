describe('#filter()', function() {
  let junction, container, target

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
