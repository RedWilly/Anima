#!/bin/bash
set -e

# 1. Check if iterations argument is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

# 2. Start the for loop
for ((i=1; i<=$1; i++)); do
  echo "Iteration $i"
  echo "----------------"

  # 3. Run the coding agent (Claude) with context files and instructions
  # This command saves the agent's output into the $result variable
  result=$(gemini --approval-mode auto_edit \
    "@plans/prd.json @plans/progress.txt @code_styleguides/general.md @code_styleguides/typescript.md \
Follow the code style guides strictly when writing any code. \
1. Find the highest-priority feature to work on (YOU decide the priority - not necessarily first in the list). \
2. Read and understand the existing codebase to ensure consistency with existing patterns and conventions. \
3. Implement the feature using modular and sub-modular design - break down functionality into small, focused modules for easier debugging. \
4. Check that types pass via bun run typecheck. \
5. Run tests via bun test. Use fast-check for property-based testing to validate function properties and edge cases. \
6. Update the PRD with the work that was done. \
7. Append your progress to plans/progress.txt as a note for the next person working in the codebase. \
8. Make a git commit using format: git commit -m '[Title] - [Description]'. \
9. ONLY WORK ON A SINGLE FEATURE. After completing ALL steps above (including the commit), if the PRD is complete, output <promise>COMPLETE</promise>.")

  # 4. Print the result to the console
  echo "$result"

  # 5. Check if the agent signalled completion
  if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
    echo "PRO complete, exiting."
    
    # Optional: Send a notification (The video uses a custom tool 'tt')
    # tt notify "CVM PRD complete after $i iterations"
    
    exit 0
  fi
done