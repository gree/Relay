Note: INCOMPLETE DESCRIPTION

##Why Period Interval?

The concept of period_interval was introduced to make relay a reliable system. It also allows for flexibility in how often you stream the data.

First, we log the data in "chunks" of style mentioned in README because if the process crashes for any reason. It can easily resume knowing where it left off which would be hard to do if we were tailing a single file and keeping track of where the cursor was.

We chose `2 * period_interval` as the minimum amount of age of the file to negate the issue of some data being written to a file and the sender picking it up before the file was completely written to.