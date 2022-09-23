# Map

One useful view of our rideshare data is a live map of where each vehicle is, along with its driver and (potentially) rider information.

To get all of this information into one stream of data, we can use ksqlDB to join our profile data with our vehicle location data.

## Create a ksqlDB cluster

(instructions)

## Create ksqlDB tables for rider and driver profiles.

<b>Important</b> Set auto.offset.reset to `Earliest` for all of the ksqlDB queries

```
CREATE TABLE rider_profiles_table (
  id INT PRIMARY KEY,
  firstname VARCHAR,
  lastname VARCHAR,
  rating DOUBLE,
  timestamp TIMESTAMP
) WITH (
  FORMAT = 'JSON',
  KAFKA_TOPIC = 'rider_profiles'
);

CREATE TABLE driver_profiles_table (
  id INT PRIMARY KEY,
  firstname VARCHAR,
  lastname VARCHAR,
  rating DOUBLE,
  make VARCHAR,
  model VARCHAR,
  timestamp TIMESTAMP
) WITH (
  FORMAT = 'JSON',
  KAFKA_TOPIC = 'driver_profiles'
);
```

## Create a stream for vehicle locations.

```
CREATE STREAM vehicle_locations_stream (
  driverid INT KEY,
  riderid INT,
  lat double,
  lon double
) WITH (
  FORMAT = 'JSON',
  KAFKA_TOPIC = 'vehicle_locations'
);
```

## Join the data

Add driver information to vehicle locations:

```
CREATE STREAM vehicle_locations_with_drivers
    WITH (
      KAFKA_TOPIC = 'vehicle_locations_with_drivers',
      FORMAT = 'JSON',
      PARTITIONS = 1
    )
    AS SELECT
      v.driverid,
      v.riderid,
      v.lat,
      v.lon,
      d.firstname as driver_firstname,
      d.lastname as driver_lastname,
      d.rating as driver_rating,
      d.make as vehicle_make,
      d.model as vehicle_model
    FROM vehicle_locations_stream v
    INNER JOIN driver_profiles_table d ON v.driverid = d.id;
```

Add rider information to vehicle locations:

```
CREATE STREAM vehicle_locations_with_drivers_and_riders
    WITH (
      KAFKA_TOPIC = 'vehicle_locations_with_drivers_and_riders',
      FORMAT = 'JSON',
      PARTITIONS = 1
    )
    AS SELECT
      v.driverid,
      v.riderid,
      v.lat,
      v.lon,
      v.driver_firstname,
      v.driver_lastname,
      v.driver_rating,
      v.vehicle_make,
      v.vehicle_model,
      r.firstname as rider_firstname,
      r.lastname as rider_lastname,
      r.rating as rider_rating
    FROM vehicle_locations_with_drivers v
    LEFT OUTER JOIN rider_profiles_table r ON v.riderid = r.id;
```

## Run the map server + client.

Run the server

```
npm start
```

Run the client

```
cd map-client
npm start
```

View the live map at `http://localhost:3001`
