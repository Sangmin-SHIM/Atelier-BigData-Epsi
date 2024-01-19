KAFKA_DIR = /home/julien/Nextcloud/Documents/Ecoles/Epsi/I1/Modules/BigData/kafka_2.13-3.6.1
SERVER_PROPERTIES = /home/julien/Nextcloud/Documents/Ecoles/Epsi/I1/Modules/BigData/kafka_2.13-3.6.1/config/kraft/server.properties
LOG_FILE = kafka.log

start:
	$(KAFKA_DIR)/bin/kafka-server-start.sh $(SERVER_PROPERTIES)

stop:
	$(KAFKA_DIR)/bin/kafka-server-stop.sh

run-background:
	nohup $(KAFKA_DIR)/bin/kafka-server-start.sh $(SERVER_PROPERTIES) > $(LOG_FILE) 2>&1 &

clean-logs:
	rm -f $(LOG_FILE)

# Other useful Kafka commands
create-topic:
	$(KAFKA_DIR)/bin/kafka-topics.sh --create --topic tbm2 --partitions 1 --replication-factor 1 --bootstrap-server localhost:9092

list-topics:
	$(KAFKA_DIR)/bin/kafka-topics.sh --list --bootstrap-server localhost:9092

describe-topic:
	$(KAFKA_DIR)/bin/kafka-topics.sh --describe --topic my-topic --bootstrap-server localhost:9092

produce-message:
	$(KAFKA_DIR)/bin/kafka-console-producer.sh --topic my-topic --broker-list localhost:9092

consume-messages:
	$(KAFKA_DIR)/bin/kafka-console-consumer.sh --topic my-topic --from-beginning --bootstrap-server localhost:9092

logs:
	tail -f $(LOG_FILE)

reconfigure:
	KAFKA_CLUSTER_ID=$$($(KAFKA_DIR)/bin/kafka-storage.sh random-uuid); \
	$(KAFKA_DIR)/bin/kafka-storage.sh format -t $$KAFKA_CLUSTER_ID -c $(SERVER_PROPERTIES)