# Flow

## What is implemented

Video and motion tasks default to the logical provider label FLOW. A handoff includes:

- capability VIDEO or MOTION
- selected account
- optional Gem label
- prompt and input file references
- expected output directory
- manual Flow steps

## What is not implemented

There is no Flow-specific browser automation or download adapter in the source runtime or this distribution. Flow must be opened and operated manually by the user.

If a future adapter is added, it should implement a separate provider interface, keep authentication outside Git, and preserve the approval and safety contract.

