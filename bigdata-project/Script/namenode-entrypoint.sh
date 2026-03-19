#!/bin/bash
set -e

NAMENODE_DIR=/data/hdfs/name

if [ ! -d "$NAMENODE_DIR/current" ]; then
  echo "HDFS not formatted — formatting NameNode..."
  hdfs namenode -format -force
else
  echo "HDFS already formatted — skipping format"
fi

echo "Starting NameNode..."
hdfs namenode &
NN_PID=$!

echo "Waiting for HDFS to be reachable..."
until hdfs dfs -ls / >/dev/null 2>&1; do
  sleep 10
done

echo "Waiting for HDFS to leave safe mode..."
until hdfs dfsadmin -safemode get | grep -q "OFF"; do
  sleep 10
done

echo "Initializing HDFS directories..."
hdfs dfs -mkdir -p /data_lake/bronze/documents || true
hdfs dfs -mkdir -p /data_lake/silver/ocr_text || true
hdfs dfs -mkdir -p /data_lake/gold || true

echo "HDFS ready. NameNode running."
wait $NN_PID