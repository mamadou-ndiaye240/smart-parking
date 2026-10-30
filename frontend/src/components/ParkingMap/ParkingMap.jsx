import MarkerClusterGroup from "react-leaflet-cluster";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
} from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function createParkingIcon(status, availableSpaces) {
  let color = "#687488";
  let textColor = "#ffffff";

  if (status === "realtime" && availableSpaces > 0) {
    color = "#00e676";
    textColor = "#07110c";
  } else if (status === "realtime" && availableSpaces === 0) {
    color = "#ff5252";
  } else if (status === "estimated") {
    color = "#ffb000";
    textColor = "#171000";
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

function ParkingMap({ parkings = [], userLocation = null }) {
  const navigate = useNavigate();

  const validParkings = parkings.filter((parking) => {
    const latitude = Number(parking.latitude);
    const longitude = Number(parking.longitude);

    return (
      parking.id != null &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  });

  const initialCenter = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : validParkings.length > 0
      ? [Number(validParkings[0].latitude), Number(validParkings[0].longitude)]
      : [43.2965, 5.3698];

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <MapContainer
        key={
          userLocation
            ? `${userLocation.latitude}-${userLocation.longitude}`
            : "default-map"
        }
        center={initialCenter}
        zoom={13}
        className="parking-map"
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <CircleMarker
            center={[userLocation.latitude, userLocation.longitude]}
            radius={8}
            pathOptions={{
              color: "#ffffff",
              fillColor: "#2196f3",
              fillOpacity: 1,
            }}
          >
            <Popup>Vous êtes ici</Popup>
          </CircleMarker>
        )}

        {validParkings.map((parking) => {
          const available =
            parking.availableSpaces != null
              ? Number(parking.availableSpaces)
              : null;

          const statusLabel =
            parking.status === "realtime" && available !== null
              ? "Temps réel"
              : parking.status === "estimated" && available !== null
                ? "Estimé"
                : "Non renseigné";

          return (
            <Marker
              key={parking.id}
              position={[Number(parking.latitude), Number(parking.longitude)]}
              icon={createParkingIcon(parking.status, available)}
            >
              <Popup>
                <div>
                  <strong>{parking.name}</strong>
                  <br />
                  {parking.address || "Adresse non renseignée"}
                  <br />
                  Capacité :{" "}
                  {parking.capacity != null
                    ? `${parking.capacity} places`
                    : "inconnue"}
                  <br />
                  Disponibilité :{" "}
                  {available !== null
                    ? `${available} places libres`
                    : "inconnue"}
                  <br />
                  Données : {statusLabel}
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
          );
        })}
      </MapContainer>
    </div>
  );
}

export default ParkingMap;
