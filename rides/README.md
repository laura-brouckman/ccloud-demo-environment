# Rides

The last thing we're going to do is dump some useful data into our analytics service or data warehouse for further analysis.

One useful type of data would be "rides", where a ride is defined as all of the locations that a driver and rider pair went to.

We can create a table of these rides with the follow ksqlDB command:

```
CREATE TABLE rides WITH (KAFKA_TOPIC = 'rides', FORMAT = 'JSON', PARTITIONS = 1) AS
SELECT
  v_riderid,
  driverid,
  COLLECT_LIST('{ "lat"' + CAST(lat AS VARCHAR) + '", "lon" : "' + CAST(lon AS VARCHAR) + '"}') AS locations
FROM vehicle_locations_with_drivers_and_riders
WHERE driverid IS NOT NULL AND v_riderid IS NOT NULL
GROUP BY driverid, v_riderid
EMIT CHANGES;
```

## Create a sink

Now that we have our `rides` topic available to consume, we can send it to a downstream service for future use! In this demo, we set up a simple Snowflake connector.

In the Confluent Cloud UI, navigate to your cluster and then to Data Integration --> Connectors. Look for the Snowflake Sinke and select it.

### Topic Selection

Select `rides`

### Kafka credentials

The next step is to create an API key for the connector. For the demo, you can use Global Access.

### Authentication

Next, you will be asked to enter information about your Snowfl database, including the host, port, connection credentials, database name, and SSL credentials.

Create a table in Snowflake with the following:

```
create table rides_1 (
	RECORD_CONTENT variant,
	RECORD_METADATA variant
);
```

Then, follow this [guide](https://docs.confluent.io/cloud/current/connectors/cc-snowflake-sink.html) to set up a fully-managed Snowflake connector.
