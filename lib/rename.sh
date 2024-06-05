#!/bin/bash

from="sample-data.json"
to="items.json"

for dir in src/*/; do
    if [ -f "$dir/$from" ]; then
        mv "$dir/$from" "$dir/$to"
        echo "Renamed $dir/$from to $dir/$to.json"
    else
        echo "No $from found in $dir"
    fi
done
