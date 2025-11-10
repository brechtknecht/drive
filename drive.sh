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
    local tmpfile="/tmp/drive-output-$$"

    # Set env vars so CLI knows where to write and what command will run
    export DRIVE_OUTPUT_FILE="$tmpfile"
    export DRIVE_COMMAND="$command_to_run"

    # Run selector - CLI will write output to temp file
    command drive
    local exit_code=$?

    unset DRIVE_OUTPUT_FILE
    unset DRIVE_COMMAND

    # Read the output from temp file
    local output=""
    if [ -f "$tmpfile" ]; then
      output=$(cat "$tmpfile")
      rm -f "$tmpfile"
    fi

    if [ $exit_code -eq 0 ] && [ -n "$output" ] && [ -d "$output" ]; then
      cd "$output" && eval "$command_to_run"
      return $?
    else
      return $exit_code
    fi
  fi

  # Default: no args, just show selector and cd
  local tmpfile="/tmp/drive-output-$$"
  export DRIVE_OUTPUT_FILE="$tmpfile"

  command drive
  local exit_code=$?

  unset DRIVE_OUTPUT_FILE

  # Read the output from temp file
  local output=""
  if [ -f "$tmpfile" ]; then
    output=$(cat "$tmpfile")
    rm -f "$tmpfile"
  fi

  if [ $exit_code -eq 0 ] && [ -n "$output" ] && [ -d "$output" ]; then
    cd "$output" || return 1
  else
    return $exit_code
  fi
}
