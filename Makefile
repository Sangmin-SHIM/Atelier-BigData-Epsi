KAFKA_DIR = /home/julien/Nextcloud/Documents/Ecoles/Epsi/I1/Modules/BigData/kafka_2.13-3.6.1
FLINK_DIR = /home/julien/Nextcloud/Documents/Ecoles/Epsi/I1/Modules/BigData/flink-1.18.1
SERVER_PROPERTIES = /home/julien/Nextcloud/Documents/Ecoles/Epsi/I1/Modules/BigData/kafka_2.13-3.6.1/config/kraft/server.properties
KAFKA_LOG_FILE = kafka.log
FLINK_LOG_FILE = flink.log

start:
	$(KAFKA_DIR)/bin/kafka-server-start.sh $(SERVER_PROPERTIES)

stop:
	$(KAFKA_DIR)/bin/kafka-server-stop.sh

run-background:
	nohup $(KAFKA_DIR)/bin/kafka-server-start.sh $(SERVER_PROPERTIES) > $(KAFKA_LOG_FILE) 2>&1 &

clean-kafka-logs:
	rm -f $(KAFKA_LOG_FILE)

clean-flink-logs:
	rm -f $(FLINK_LOG_FILE)

# Other useful Kafka commands
create-topic:
	$(KAFKA_DIR)/bin/kafka-topics.sh --create --topic trafic_itineraire --partitions 1 --replication-factor 1 --bootstrap-server localhost:9092
delete-topic:
	$(KAFKA_DIR)/bin/kafka-topics.sh --delete --topic topic_name --bootstrap-server localhost:9092

list-topics:
	$(KAFKA_DIR)/bin/kafka-topics.sh --list --bootstrap-server localhost:9092

describe-topic:
	$(KAFKA_DIR)/bin/kafka-topics.sh --describe --topic my-topic --bootstrap-server localhost:9092

produce-message:
	$(KAFKA_DIR)/bin/kafka-console-producer.sh --topic my-topic --broker-list localhost:9092

consume-messages:
	$(KAFKA_DIR)/bin/kafka-console-consumer.sh --topic my-topic --from-beginning --bootstrap-server localhost:9092

logs:
	tail -f $(KAFKA_LOG_FILE) $(FLINK_LOG_FILE)

reconfigure:
	KAFKA_CLUSTER_ID=$$($(KAFKA_DIR)/bin/kafka-storage.sh random-uuid); \
	$(KAFKA_DIR)/bin/kafka-storage.sh format -t $$KAFKA_CLUSTER_ID -c $(SERVER_PROPERTIES)

run-flink-background:
	nohup $(FLINK_DIR)/bin/start-cluster.sh > $(FLINK_LOG_FILE) 2>&1 &

stop-flink:
	$(FLINK_DIR)/bin/stop-cluster.sh