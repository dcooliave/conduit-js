import conduit from '../lib/conduit.js'
import { testRoute, expectResult, nextTick } from './util.js'

describe('.observer()', function() {
  let observer, container, delegate, results

  beforeEach(function() {
    results = []
    container = document.createElement('div')

    delegate = {
      elementAttributeChanged(attributeName) {
        results.push(['elementAttributeChanged', attributeName])
      },
      elementCharacterDataChanged(node) {
        results.push(['elementCharacterDataChanged', node])
      },
      elementProcessed(element) {
        results.push(['elementProcessed', element])
      }
    }

    observer = conduit.observer(container, delegate, {
      characterData: true,
      attributes: true,
      childList: true,
      subtree: true
    })
  })

  it('detect childList mutation', async function() {
    const target = document.createElement('div')

    delegate.matchElementsInTree = () => [target]
    delegate.matchElement = () => true

    observer.start()
    container.appendChild(target)

    await nextTick()

    chai.expect(results).to.deep.equal([
      ['elementProcessed', target]
    ])
  })

  it('detect attributes mutation', async function() {
    const target = container

    delegate.matchElementsInTree = () => [target]
    delegate.matchElement = () => true

    observer.start()
    container.setAttribute('type', 'dog')

    await nextTick()

    chai.expect(results).to.deep.equal([
      ['elementProcessed', container],
      ['elementAttributeChanged', container]
    ])
  })

  it('detect characterData mutation', async function() {
    const target = document.createTextNode('')

    delegate.matchElementsInTree = () => [target]
    delegate.matchElement = () => true

    observer.start()
    container.appendChild(target)
    target.data = 'foo'
    target.data = 'bar'

    await nextTick()

    chai.expect(results).to.deep.equal([
      ['elementProcessed', target],
      ['elementCharacterDataChanged', target]
    ])
  })
})
