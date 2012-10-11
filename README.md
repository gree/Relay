RELAY
=====

Relay is a log shipping system built using nodejs. It is highly scalable and reliable system. It is designed to be decentralized and failure of one of the nodes in the system does not affect the overall health of the system. It is a bare bones system with only a few command line parameters need to be setup and you should be good to go.

Relay is completely blind to the data and any type of data can be shipped over it. Senders and Listeners can be used indepedently and can be used as stand alone pluggable parts in your application. 

#GETTING STARTED

Relay consists of a sender which looks for a bunch of files in a specified folder and then ships them over to the listener to the specified listener port. Listener listens on the specified port and just writes all the incoming data into a file called logged_lines.txt.

The only concept to keep in mind is called the `period_interval`. It determines how often the files are shipped from the sender to the listener. You can tweak this interval to stream large batches more infrequently (once every 5 minutes) or smaller batches (once every 5 - 10 seconds) more frequently depending on your use case. Before we get into the meat of it lets understand how to setup the sender.

##Sender

###How to log your data to the relay folder. 
Relay doesn't care about the actual data you want to ship. But it does care about the file name you are logging to. The file name you are logging to should be of the format: `[any-string].[suffix].[unixtimestamp]`. An example file would be - ` analytics.send_to_hadoop.1000 `. Remember the `period_interval` we mentioned earlier? The sender checks the relay_folder every `period_interval`. We will call this mechanism a `cycle`. 

Every `cycle` the sender scans for any files having unix timestamp older than `2 * period_interval` and takes them up for processing. Currently it will process upto 7 files in a single cycle. We plan to make this configurable in the later versions. It will not go to the next cycle until the current cycle completes.

###The command line params to start your relay sender process - 
-http_port - The port on which the listener returns a "SUCCESS" response. It is used as a health check that the process is running.

-listener_port - The port on which to SEND THE DATA TO. ie. It'll be the port on which the receiving process will listen to.  

-relay_folder - The folder in which the files are logged to. 

-processed_file - Optional argument. The file to which the data is written to AFTER it has been succesfully sent to a listener. 

-listener_ips - A comma separated list of ip addresses on which the listeners are running. 

These are the two more important arguments to understand. 

-file\_suffix - The file suffix for which the sender scans in the relay_folder and grabs certain files to send over provided they meet the following criteria.

-period\_interval - The time period for which the process checks for older files in the relay_folder.

##Listener
TO DO 

#AUTHORS

Karan Kurani

Elaine Wang

#LICENSE
The MIT License Copyright (c) 2012 GREE, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.