#! /bin/sh

RETVAL=0
prog="analytics_stream_sender"
http_port=9878

start () {
        DATE=`date "+%Y-%m-%d"`
        LOG_DIR=/mnt/log/node
        echo -n $"Starting $prog: "
    if [ "`stat -c %U /var/opt/node/bin/node`" != "$USER" ]; then
        chown $USER /var/opt/node/bin/node
    fi
    if [ ! -d $LOG_DIR ]; then
        mkdir -p $LOG_DIR
    fi
        CNT=30
        nohup /var/opt/node/bin/node --trace-gc /var/opt/analytics_stream_sender/src/index.js  -http_port $http_port -listener_port 53730 -relay_folder /tmp/send_to_x/ -processed_file /tmp/analytics.processed.log -listener_ips 127.0.0.1 -file_suffix .send_to_x -period_interval 60 >> $LOG_DIR/analytics_stream_sender-$DATE.log < /dev/null &
        cmd=`ps -ef | grep analytics_stream_sender | grep $http_port | grep -v grep | grep ^${_id} | awk '{print $2}'`
        while [ "$cmd" == "" ]
        do 
            if [ $CNT -ne 0 ] ; then
                CNT=`expr $CNT - 1`
                echo $"didn't get pid, sleep for 1s"
                echo $CNT
                sleep 1s 
            else
                break
            fi 
            cmd=`ps -ef | grep analytics_stream_sender | grep $http_port | grep -v grep | grep ^${_id} | awk '{print $2}'`
        done
        ps -ef | grep analytics_stream_sender | grep $http_port | grep -v grep | grep ^${_id} | awk '{print $2}' > /tmp/analytics_stream_sender.pid
        echo $"caught pid:"
        echo $cmd
        RETVAL=$?
        echo
        [ $RETVAL -eq 0 ]
}
stop () {
        echo $"Stopping the sender. Please confirm it has shut down gracefully (ps -ef | grep node) before restarting it."
        cat /tmp/analytics_stream_sender.pid | while read line
        do
            kill -2 $line
        done
        RETVAL=$?
        echo
        if [ $RETVAL -eq 0 ] ; then
            rm -f /tmp/analytics_stream_sender.pid
        fi
}

restart () {
        stop
        echo $"Stopped the script. Waiting for 10 seconds before starting it."
        sleep 10s
        start
}

# See how we were called.
case "$1" in
  start)
        start
        ;;
  stop)
        stop
        ;;
  restart)
        restart
        ;;
  *)
        echo $"Usage: $0 {start|stop|restart}"
        exit 1
esac

exit $?

