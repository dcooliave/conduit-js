import conduit from './lib/conduit.js'
import attribute from './lib/attribute.js'
import each from './lib/each.js'
import filter from './lib/filter.js'
import follow from './lib/follow.js'
import listen from './lib/listen.js'
import text from './lib/text.js'

conduit.define('attribute', attribute)
conduit.define('each', each)
conduit.define('filter', filter)
conduit.define('follow', follow)
conduit.define('listen', listen)
conduit.define('text', text)

export default conduit
