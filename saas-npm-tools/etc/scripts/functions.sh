#!/bin/bash

# Ensure that a set of environmental variables are set. The function accepts any
# number of environmental variable names. If any of those variables are missing
# then the a pretty error message is displayed, and an error status code is
# returned.
#
# example:
# require_variables ONE TWO THREE
#
function require_variables() {
	{ set +x; } 2>/dev/null

	local missing=""
	for i in $@; do
		if [[ -z "$( printf '%s' ${!i} )" ]]; then
			if [[ -n "${missing}" ]]; then
				missing="${missing}, ${i}"
			else
				missing="${i}"
			fi
		fi
	done

	# If any are missing then fail.
	if [[ -n "${missing}" ]]; then
		echo "Missing required environmental variable(s): ${missing}"
		return 1
	fi

	set -x
}
