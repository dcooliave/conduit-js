#!/usr/bin/env bash

FILES=('conduit' 'observer' 'attribute' 'each' 'filter' 'follow' 'listen' 'text')
OUTFILE='conduit.js'

> $OUTFILE

for i in "${FILES[@]}"; do
  echo "{$(cat "lib/$i.js")}" >> $OUTFILE
done
