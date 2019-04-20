export function nextTick() {
  return new Promise(resolve => {
    setTimeout(resolve, 0)
  })
}

export function testRoute(route) {
  const results = []
  route.on('data', (...args) => {
    results.push(args)
  })
  return results
}

export function expectResult(result, target, expected) {
  const [element, details] = result
  chai.expect(element).to.equal(target)
  chai.expect(details).to.deep.equal(expected)
}
