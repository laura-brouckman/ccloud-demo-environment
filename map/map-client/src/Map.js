import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const VehicleMarker = (props) => {
  const {
    driverFirstName,
    driverLastName,
    driverRating,
    vehicleMake,
    vehicleModel,
    riderFirstName,
    riderLastName,
    riderRating,
    latitude,
    longitude,
  } = props;
  return (
    <Marker position={[latitude, longitude]}>
      <Popup>
        <div>
          <div>
            <b>Driver: </b> {driverFirstName} {driverLastName} ({driverRating}
            &#9733;)
          </div>
          <div>
            <b>Vehicle: </b>
            {vehicleModel} {vehicleMake}
          </div>
          <div>
            <b>Rider: </b>{" "}
            {riderFirstName
              ? `${riderFirstName} ${riderLastName} (${riderRating}★)`
              : "No rider"}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export const Map = ({ data }) => {
  console.log("Data is ", data);
  return (
    <MapContainer center={[47.607088939995585, -122.32795715332033]} zoom={11}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {Object.keys(data).map((key) => (
        <VehicleMarker key={key} {...data[key]} />
      ))}
    </MapContainer>
  );
};
