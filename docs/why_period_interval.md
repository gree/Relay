##Why Period Interval?

The concept of period_interval was introduced to make relay a more reliable system without adding too much complexity to the code base.

First, we log the data in "chunks" of style mentioned in README because if the process crashes for any reason, it can easily resume knowing where it left off (which would be hard to do if we were tailing a single file and keeping track of where the cursor was). It also allows for flexibility in how often you stream the data.

We chose `currentTime() - 2 * period_interval` as the maximum age of the file to process to negate the issue of some data being written to a file and the sender picking the file up for processing before the file was completely written to.

Embracing this concept made the code base much simpler, easy to understand and easy to maintain.