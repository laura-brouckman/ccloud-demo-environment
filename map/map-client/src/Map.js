import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const VehicleMarker = (props) => {
  console.log(props);
  const { driverid, riderid, latitude, longitude } = props;
  return (
    <Marker position={[latitude, longitude]}>
      <Popup>
        <div>Driver {driverid} </div>
        <div>{riderid != null ? `Rider ${riderid}` : "No rider"} </div>
      </Popup>
    </Marker>
  );
};

export const Map = ({ data }) => {
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
  // return <MapContainer bounds={MAP_BOUNDS} scrollWheelZoom={true} />;
};
