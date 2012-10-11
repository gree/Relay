#! /bin/sh

RETVAL=0
prog="analytics_stream"

start () {
        DATE=`date "+%Y-%m-%d"`
        echo -n $"Starting $prog: "
    if [ "`stat -c %U /usr/local/bin/node`" != "$USER" ]; then
        chown $USER /usr/local/bin/node
    fi
        nohup /usr/local/bin/node --trace-gc /tmp/analytics_stream_listener/src/index.js  -http_port 9876 -log_server_port 53730 -storage_folder /tmp/analytics_stream_storage >> /tmp/analytics_stream_listener-$DATE.log < /dev/null &
        
        touch /tmp/analytics_stream_listener.pid
        ps -ef | grep analytics_stream_listener | grep -v grep | grep ^${_id} | awk '{print $2}' > /tmp/analytics_stream_listener.pid
        RETVAL=$?
        echo
        [ $RETVAL -eq 0 ]
}
stop () {
        echo -n $"Stopping $prog: Sending kill signal... Please wait for 60 seconds for it finish flushing buffered data to vertica. "
        cat /tmp/analytics_stream_listener.pid | while read line
        do
            kill -2 $line
        done
        RETVAL=$?
        echo
        if [ $RETVAL -eq 0 ] ; then
            rm -f /tmp/analytics_stream_listener.pid
        fi
}

# See how we were called.
case "$1" in
  start)
        start
        ;;
  stop)
        stop
        ;;
  *)
        echo $"Usage: $0 {start|stop}"
        exit 1
esac

exit $?
