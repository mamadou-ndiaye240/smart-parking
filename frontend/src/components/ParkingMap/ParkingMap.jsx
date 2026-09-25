import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const parkingIcon = new L.DivIcon({
  className: "parking-marker",
  html: '<div class="parking-marker-box">P</div>',
  iconSize: [36, 44],
  iconAnchor: [18, 44],
});

function ParkingMap() {
  const parkings = [
    {
      name: "Parking Castellane",
      position: [43.2856, 5.3797],
      available: 42,
    },
    {
      name: "Parking Vieux-Port",
      position: [43.2944, 5.3742],
      available: 87,
    },
    {
      name: "Parking Opéra",
      position: [43.2929, 5.3771],
      available: 134,
    },
  ];

  return (
    <MapContainer center={[43.29, 5.378]} zoom={14} className="parking-map">
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {parkings.map((parking) => (
        <Marker
          key={parking.name}
          position={parking.position}
          icon={parkingIcon}
        >
          <Popup>
            <strong>{parking.name}</strong>
            <br />
            {parking.available} places disponibles
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default ParkingMap;
