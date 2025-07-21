#!/usr/bin/env bash
#   Use this script to test if a given TCP host/port are available
#   Source: https://github.com/vishnubob/wait-for-it

set -e

host="$1"
shift

until nc -z "$host" 5432; do
  echo "Waiting for $host:5432..."
  sleep 1
done

exec "$@" 