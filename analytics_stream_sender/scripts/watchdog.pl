#!/usr/bin/perl

use strict;
use POSIX qw/strftime/;

my ($host, $date, $time);
my $health_str;
my $response = $health_str;
my $EMAIL_LIMIT = 80;
my $RESTART_LIMIT = 90;
my $MAIL_TO = "example@email.com";
my $NODE_MODULE = "analytics_sender";
chomp ($date = `date '+%Y-%m-%d'`);
chomp ($time = `date '+%H:%M:%S'`);
chomp ($host = `hostname`);
chomp(my $health_str = `curl -s -S --write-out :%{http_code} 127.0.0.1:9878` );
print($health_str);

open FILE, "/tmp/analytics_stream_sender.pid" or die "Couldn't open file";
my $pid.=<FILE>;
close FILE;
chomp ($pid);

if ($health_str =~ /(.*):200/) {
    my $state = $1;
    if ($state =~ /SUCCESS/) {
        print 'running fine';
    } else {
        my $restart = &restart_node($response);
        `echo "The process $pid for $NODE_MODULE at $date $time on $host has response status $state and will be restarted.\n\n Output of restart command:\n $restart\n" | mail $MAIL_TO -s "$host CPU use service RESTART alert"`;
    }
} else {
   my $restart = &restart_node($response);
   `echo "The process $pid for $NODE_MODULE at $date $time on $host has response code other than 200 and will be restarted.\n\n Output of restart command:\n $restart\n" | mail $MAIL_TO -s "$host CPU use service RESTART alert"`;
};

sub restart_node {

   my $health_str = shift;

   chomp(my $date = strftime('%Y-%m-%d_%H:%M',localtime));

   my $log = "/tmp/node-errors-$date.log";

   open (FILE, ">>$log");
   print FILE "Restarting $NODE_MODULE service $health_str " . $date . "\n";

   print "restarting node\n";
   my $restart_node = `cd /tmp/analytics_stream_sender && ./scripts/run_analytics_stream_vertica_sender.sh restart`;
}
