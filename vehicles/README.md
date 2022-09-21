# Vehicles

## Set up project

Create and activate a Python virtual environment to give yourself a clean, isolated workspace:

```
virtualenv env

source env/bin/activate
```

Python 3.x
Install the Kafka library

```
pip install confluent-kafka
```

Python 2.7x
First install [librdkafka](https://github.com/edenhill/librdkafka#installation).
Then install the python libraries:

```
pip install confluent-kafka configparser
```

## Configuration

In order for the producers to connect to your Confluent Cloud cluster, you will need to fill in the bootstrap server and API key/secret in the `client.ini` file.

1. Navigate to your Cluster and then to Cluster Settings.
2. Copy the `Bootstrap server` and paste it into the the config.
3. Create a Kafka API key under Data Integrations > API Keys and paste the key and secret into the config file.

## Create Topic

In the Confluent Cloud UI, navigate to `Topics` and create a topic called `vehicle_locations`. This will be the topic that each vehicle produces its location data to.

## Run the code

You can run a single vehicle with the `vehicle.py` script:

```
chmod u+x vehicle.py
python vehicle.py 2
```

Pass in an id from 1-15 to use.

Alternatively, you can quickly run all of the available vehicles using:

```
chmod u+x main.py
python main.py
```

Press ctrl+C to stop producing data.
