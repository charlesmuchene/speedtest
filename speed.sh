#!/bin/bash

output_file=~/internet/result
output=$((speedtest | tail -n 5) 2>&1)
url=$((echo "$output" | tail -n 1 | cut -d / -f 6) 2>&1)
output=$((echo "$output" | head -n 4) 2>&1)
echo >> $output_file
echo "**********************************************" >> $output_file
echo $(date) >> $output_file
echo "**********************************************" >> $output_file
echo "$output" >> $output_file
echo "Url: $url" >> $output_file
