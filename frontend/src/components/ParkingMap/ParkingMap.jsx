import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  CircleMarker,
} from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function createParkingIcon(status) {
  let color = "#00e676";
  let textColor = "#07110c";

  if (status === "Estimé") {
    color = "#ffb000";
    textColor = "#171000";
  }

  if (status === "Non renseigné") {
    color = "#687488";
    textColor = "#ffffff";
  }

  return new L.DivIcon({
    className: "parking-marker",
    html: `
      <div
        class="parking-marker-box"
        style="
          background: ${color};
          color: ${textColor};
          box-shadow: 0 0 12px ${color}99;
        "
      >
        P
      </div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
  });
}

function ParkingMap({ showRoute = false, filter = "Tous" }) {
  const navigate = useNavigate();

  const parkings = [
    {
      id: "castellane",
      name: "Parking Castellane",
      position: [43.2856, 5.3797],
      available: 42,
      capacity: 180,
      status: "Temps réel",
    },
    {
      id: "vieux-port",
      name: "Parking Vieux-Port",
      position: [43.2944, 5.3742],
      available: 87,
      capacity: 350,
      status: "Estimé",
    },
    {
      id: "opera",
      name: "Parking Opéra",
      position: [43.2929, 5.3771],
      available: 134,
      capacity: 250,
      status: "Non renseigné",
    },
  ];

  const visibleParkings = parkings.filter((parking) => {
    return filter === "Tous" || parking.status === filter;
  });

  const route = [
    [43.289, 5.367],
    [43.289, 5.372],
    [43.287, 5.372],
    [43.287, 5.376],
    [43.2856, 5.3797],
  ];

  return (
    <MapContainer center={[43.289, 5.374]} zoom={14} className="parking-map">
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {visibleParkings.map((parking) => (
        <Marker
          key={parking.id}
          position={parking.position}
          icon={createParkingIcon(parking.status)}
        >
          <Popup>
            <div>
              <strong>{parking.name}</strong>
              <br />
              {parking.available} / {parking.capacity} places disponibles
              <br />
              <span>{parking.status}</span>
              <br />
              <button
                onClick={() => navigate(`/parking/${parking.id}`)}
                style={{
                  marginTop: "8px",
                  padding: "6px 10px",
                  border: "none",
                  borderRadius: "6px",
                  background: "#00e676",
                  color: "#07110c",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Voir les détails
              </button>
            </div>
          </Popup>
        </Marker>
      ))}

      {showRoute && (
        <>
          <Polyline
            positions={route}
            pathOptions={{
              color: "#00d9ff",
              weight: 5,
              opacity: 0.9,
              dashArray: "10 8",
            }}
          />

          <CircleMarker
            center={route[0]}
            radius={9}
            pathOptions={{
              color: "#00d9ff",
              fillColor: "#00d9ff",
              fillOpacity: 1,
            }}
          />
        </>
      )}
    </MapContainer>
  );
}

export default ParkingMap;
