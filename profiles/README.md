# Profiles

## Setting up your Postgres database

The driver and rider profiles are stored in a Postgres database. To populate the database, create 2 tables:

```
CREATE TABLE rider_profiles
  (
    id SERIAL PRIMARY KEY NOT NULL,
    riderid character varying(50) NOT NULL,
    firstname character varying(128) NOT NULL,
    lastname character varying(128) NOT NULL,
    rating float,
    timestamp timestamp without time zone DEFAULT now() NOT NULL
  );

CREATE TABLE driver_profiles
  (
    id SERIAL PRIMARY KEY NOT NULL,
    driverid character varying(50) NOT NULL,
    firstname character varying(128) NOT NULL,
    lastname character varying(128) NOT NULL,
    rating float,
    make varchar(50) not null,
    model varchar(50) not null,
    timestamp timestamp without time zone DEFAULT now() NOT NULL
  );
```

Using psql, populate these tables with the sample data provided in the csv files:

```
psql -h <host> -U <user> -d <dbname> -c "\copy rider_profiles (riderid, firstname, lastname, rating) FROM './rider_profiles.csv' with (format csv,header true, delimiter ',');"
# COPY 30

psql -h <host> -U <user> -d <dbname> -c "\copy driver_profiles (driverid, firstname, lastname, rating, make, model) FROM './driver_profiles.csv' with (format csv,header true, delimiter ',');"
# COPY 15
```

## Connecting Postgres to Confluent Cloud

Now that the Postgres database is populated, we need to get this profile data into Confluent Cloud. Luckily, Confluent Cloud provides fully-managed connectors which makes this process codeless.

In the Confluent Cloud UI, navigate to your cluster and then to Data Integration --> Connectors. Look for the Postgres Source connector and select it.

### Topic Selection

The first step is to define a prefix for the topics that will be created. The connector will automatically create topics for each database table being synced, and you can optionally add a prefix to create topics with names {prefix}{db_table}. For our demo, we leave this blank.

### Kafka credentials

The next step is to create an API key for the connector. For the demo, you can use Global Access.

### Authentication

Next, you will be asked to enter information about your Postgres database, including the host, port, connection credentials, database name, and SSL credentials.

### Configuration

On this step, you'll configure settings for the connection between the Postgrse DB and Confluent Cloud.
The settings are:
| Field Name | Value |
| --------------------------- | ------------------------------------- |
| Output record value format | JSON |
| Table names | rider_profiles, driver_profiles |
| Table type | TABLE |
| Database timezone | your timezone |

You will also want to configure some of the Advanced options as follows:
| Field Name | Value |
| --------------------------- | ------------------------------------- |
| Mode | Incrementing |
| Incrementing col name | id |

Finally, to extract the id from the driver/user profiles and set it as the message's key, you can add the following Single Message Transforms:
| Field Name | Value |
| --------------------------- | ---------------------------------------------- |
| Transform Name | AddKey |
| Transform Type | org.apache.kafka.connect.transforms.ValueToKey |
| Fields | id |

| Field          | Value                                                |
| -------------- | ---------------------------------------------------- |
| Transform Name | ExtractKey                                           |
| Transform Type | org.apache.kafka.connect.transforms.ExtractField$Key |
| Field          | id                                                   |

### Sizing

The final step is to choose the number of tasks. For the demo, you can just use one task.

### Review and launch

Before launching your connector, confirm that the JSON configuration on the Review page matches the Connector config JSON file provided in this repo. Then, launch your connector.

## Verifying your Connector

The connector will take a couple of minutes to get up and running. Once it does, you can navigate to the topics tab. The driver_profiles and user_profiles topics should be automatically created.
You can inspect the data in these topics by clicking on the topic name and going to the Messages tab. Then, choose "Jump to Offset" and jump to Offset 0 in Partition 0. You should see 20 messages, one per each profile.
