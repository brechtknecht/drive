#!/bin/bash
# Shell wrapper for drive CLI to enable directory changing

drive() {
  # Check if this is a subcommand that doesn't need cd
  if [[ "$1" == "park" ]] || [[ "$1" == "list" ]] || [[ "$1" == "unpark" ]] || [[ "$1" == "setup" ]] || [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]] || [[ "$1" == "--version" ]] || [[ "$1" == "-V" ]]; then
    command drive "$@"
    return $?
  fi

  # Check if --editor or -e flag is present
  if [[ "$*" == *"--editor"* ]] || [[ "$*" == *"-e"* ]]; then
    command drive "$@"
    return $?
  fi

  # For the selector (no args or other args), capture output and cd
  local output
  output=$(command drive "$@")
  local exit_code=$?

  if [ $exit_code -eq 0 ] && [ -n "$output" ] && [ -d "$output" ]; then
    cd "$output" || return 1
  else
    # If there was output but not a valid directory, print it
    if [ -n "$output" ]; then
      echo "$output"
    fi
    return $exit_code
  fi
}
