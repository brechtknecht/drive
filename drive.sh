#!/bin/bash
# Shell wrapper for drive CLI to enable directory changing

drive() {
  local first_arg="$1"

  # Check if this is a known subcommand that doesn't need special handling
  if [[ "$first_arg" == "park" ]] || [[ "$first_arg" == "list" ]] || [[ "$first_arg" == "unpark" ]] || [[ "$first_arg" == "home" ]] || [[ "$first_arg" == "--help" ]] || [[ "$first_arg" == "-h" ]] || [[ "$first_arg" == "--version" ]] || [[ "$first_arg" == "-V" ]]; then
    command drive "$@"
    return $?
  fi

  # Check if --editor or -e flag is present
  if [[ "$*" == *"--editor"* ]] || [[ "$*" == *"-e"* ]]; then
    command drive "$@"
    return $?
  fi

  # If arguments are provided and not a known command, treat as command to execute after selection
  if [[ -n "$1" ]]; then
    local command_to_run="$@"
    local tmpfile=$(mktemp)

    # Run selector and redirect output to temp file
    command drive > "$tmpfile"
    local exit_code=$?

    local output=$(cat "$tmpfile")
    rm -f "$tmpfile"

    if [ $exit_code -eq 0 ] && [ -n "$output" ] && [ -d "$output" ]; then
      cd "$output" && eval "$command_to_run"
      return $?
    else
      # If selector failed or was cancelled
      if [ -n "$output" ]; then
        echo "$output"
      fi
      return $exit_code
    fi
  fi

  # Default: no args, just show selector and cd
  local tmpfile=$(mktemp)
  command drive > "$tmpfile"
  local exit_code=$?

  local output=$(cat "$tmpfile")
  rm -f "$tmpfile"

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
