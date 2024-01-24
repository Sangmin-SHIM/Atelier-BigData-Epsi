from pyflink.common.serialization import SimpleStringSchema
from pyflink.common.typeinfo import Types
from pyflink.datastream import StreamExecutionEnvironment, TimeCharacteristic
from pyflink.datastream.connectors import FlinkKafkaConsumer
from pyflink.common.watermark_strategy import WatermarkStrategy
from pyflink.datastream.window import TumblingEventTimeWindows
from datetime import timedelta
import json

# Initialize the Flink environment
env = StreamExecutionEnvironment.get_execution_environment()
env.set_stream_time_characteristic(TimeCharacteristic.EventTime)
env.add_jars('file:///home/julien/Nextcloud/Documents/Ecoles/Epsi/I1/Modules/BigData/flink-sql-connector-kafka-1.17.2.jar')

# Define Kafka source
kafka_consumer = FlinkKafkaConsumer(
    topics='vehicules_lignes_circulation',
    deserialization_schema=SimpleStringSchema(),
    properties={'bootstrap.servers': 'localhost:9092'}
)

# Define the watermark strategy
watermark_strategy = WatermarkStrategy.for_bounded_out_of_orderness(timedelta(seconds=5))

# Add the source and watermark strategy to the environment
data_stream = env.add_source(kafka_consumer).assign_timestamps_and_watermarks(watermark_strategy)

# Process the data
def extract_vehicle_data(value):
    try:
        records = json.loads(value)
        return [(record['route'], record['count']) for record in records]
    except json.JSONDecodeError:
        return []

data_stream \
    .flat_map(lambda value, ctx: extract_vehicle_data(value), output_type=Types.TUPLE([Types.STRING(), Types.INT()])) \
    .key_by(lambda value: value[0]) \
    .window(TumblingEventTimeWindows.of(Time.seconds(3600))) \
    .reduce(lambda a, b: (a[0], a[1] + b[1]), lambda key, window, values: (key, values[0][1] / len(values))) \
    .map(lambda value: f'Route: {value[0]}, Average Count: {value[1]}') \
    .print()

# Execute the transformation
env.execute("Calculate Average Vehicles Per Route")
