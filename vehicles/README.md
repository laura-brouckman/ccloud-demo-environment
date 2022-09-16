# Vehicles

This folder contains all of the code for setting up the vehicle location producers.

Each vehicle is represented by a simpe Node.js application that produces it's location to the `vehicle_locations` topic every few seconds.

## Edit the .properties file

In order for the producers to connect to your Confluent Cloud cluster, you will need to fill in the bootstrap server and API key/secret in the `vehicle_client_config.properties` file.

1. Navigate to your Cluster and then to Cluster Settings.
2. Copy the `Bootstrap server` and paste it into the the config.
3. Create a Kafka API key under Data Integrations > API Keys and paste the key and secret into the config file.

## Install the dependencies

```
npm install
```

## Run the code

```
npm start [number of vehicles, defaults to 1]
```
