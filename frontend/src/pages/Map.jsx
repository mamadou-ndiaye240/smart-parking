import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Map.css";
import ParkingMap from "../components/ParkingMap/ParkingMap";

const MAX_DISTANCE_KM = 2;

function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const earthRadius = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function Map() {
  const navigate = useNavigate();

  const [selectedParking, setSelectedParking] = useState(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tous");
  const [parkings, setParkings] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("loading");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Charger les parkings depuis le backend
  useEffect(() => {
    fetch("http://localhost:5000/api/parkings")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des parkings");
        }

        return response.json();
      })
      .then((data) => {
        setParkings(data);
        setError("");
      })
      .catch((err) => {
        console.error("Erreur de chargement :", err);
        setError("Impossible de charger les parkings");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Récupérer la position réelle de l'utilisateur
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setLocationStatus("success");
      },
      (err) => {
        console.error("Erreur de géolocalisation :", err);
        setLocationStatus("error");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      },
    );
  }, []);

  const getStatusLabel = (parking) => {
    if (parking.status === "realtime" && parking.availableSpaces != null) {
      return "Temps réel";
    }

    if (parking.status === "estimated" && parking.availableSpaces != null) {
      return "Estimé";
    }

    return "Non renseigné";
  };

  const getAvailabilityPercentage = (parking) => {
    if (
      parking.availableSpaces == null ||
      !parking.capacity ||
      parking.capacity <= 0
    ) {
      return null;
    }

    return Math.round(
      (Number(parking.availableSpaces) / Number(parking.capacity)) * 100,
    );
  };

  // Calculer la distance et garder uniquement les parkings
  // situés à 5 km maximum de la position de l'utilisateur.
  const nearbyParkings =
    userLocation === null
      ? []
      : parkings
          .map((parking) => {
            const latitude = Number(parking.latitude);
            const longitude = Number(parking.longitude);

            if (
              !Number.isFinite(latitude) ||
              !Number.isFinite(longitude) ||
              latitude < -90 ||
              latitude > 90 ||
              longitude < -180 ||
              longitude > 180
            ) {
              return null;
            }

            const distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              latitude,
              longitude,
            );

            return {
              ...parking,
              distance,
            };
          })
          .filter(
            (parking) =>
              parking !== null && parking.distance <= MAX_DISTANCE_KM,
          )
          .sort((a, b) => a.distance - b.distance);

  // Appliquer la recherche et les filtres aux parkings proches
  const filteredParkings = nearbyParkings.filter((parking) => {
    const name = (parking.name || "").toLowerCase();
    const city = (parking.city || parking.address || "").toLowerCase();

    const query = search.trim().toLowerCase();

    const matchesSearch = name.includes(query) || city.includes(query);

    const statusLabel = getStatusLabel(parking);

    const matchesFilter =
      activeFilter === "Tous" || statusLabel === activeFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <main className="map-page">
      <aside className="map-sidebar">
        <div className="map-header">
          <button className="back-button" onClick={() => navigate("/")}>
            ←
          </button>

          <div className="map-logo">
            <span>📍</span>
            <strong>
              Smart
              <br />
              Parking
            </strong>
          </div>
        </div>

        <div className="map-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Rechercher un parking..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="map-filters">
          {["Tous", "Temps réel", "Estimé"].map((filter) => (
            <button
              key={filter}
              className={`filter ${activeFilter === filter ? "active" : ""}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <h2 className="nearby-heading">
          {locationStatus === "success"
            ? `${filteredParkings.length} PARKING${
                filteredParkings.length > 1 ? "S" : ""
              } À PROXIMITÉ`
            : "PARKINGS À PROXIMITÉ"}
        </h2>

        <div className="parking-list">
          {loading && <p className="no-results">Chargement des parkings...</p>}

          {!loading && !error && locationStatus === "loading" && (
            <p className="no-results">Recherche de ta position...</p>
          )}

          {!loading && !error && locationStatus === "error" && (
            <div className="no-results">
              <p>
                Active la localisation dans ton navigateur pour afficher les
                parkings proches de toi.
              </p>

              <button onClick={() => window.location.reload()}>
                Réessayer
              </button>
            </div>
          )}

          {error && (
            <div className="no-results">
              <p>{error}</p>

              <button onClick={() => window.location.reload()}>
                Réessayer
              </button>
            </div>
          )}

          {!loading &&
            !error &&
            locationStatus === "success" &&
            filteredParkings.map((parking) => {
              const statusLabel = getStatusLabel(parking);

              const availability = getAvailabilityPercentage(parking);

              return (
                <div
                  key={parking.id}
                  className={`map-parking-card ${
                    String(selectedParking) === String(parking.id)
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => setSelectedParking(parking.id)}
                >
                  <div className="parking-card-top">
                    <strong>{parking.name}</strong>

                    <span>
                      {parking.distance < 1
                        ? `${Math.round(parking.distance * 1000)} m`
                        : `${parking.distance.toFixed(1)} km`}
                    </span>
                  </div>

                  <p>
                    {parking.address ||
                      parking.city ||
                      "Adresse non renseignée"}
                  </p>

                  <div className="parking-info">
                    <span>
                      {parking.capacity != null
                        ? `${parking.capacity} places au total`
                        : "Capacité inconnue"}
                    </span>

                    <span>
                      {parking.pricePerHour != null
                        ? `${Number(parking.pricePerHour)
                            .toFixed(2)
                            .replace(".", ",")} € / h`
                        : "Tarif non renseigné"}
                    </span>
                  </div>

                  <div className="availability">
                    {availability !== null ? (
                      <>
                        <div className="availability-bar">
                          <div
                            className="availability-fill"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(0, availability),
                              )}%`,
                            }}
                          />
                        </div>

                        <span>
                          {parking.availableSpaces} places disponibles (
                          {availability}%)
                        </span>
                      </>
                    ) : (
                      <span>Disponibilité non renseignée</span>
                    )}
                  </div>

                  <span
                    className={`parking-status ${
                      statusLabel === "Estimé"
                        ? "estimated-status"
                        : statusLabel === "Non renseigné"
                          ? "unknown-status"
                          : ""
                    }`}
                  >
                    {statusLabel}
                  </span>

                  {String(selectedParking) === String(parking.id) && (
                    <button
                      className="details-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/parking/${parking.id}`);
                      }}
                    >
                      Voir les détails →
                    </button>
                  )}
                </div>
              );
            })}

          {!loading &&
            !error &&
            locationStatus === "success" &&
            filteredParkings.length === 0 && (
              <p className="no-results">
                {nearbyParkings.length === 0
                  ? "Aucun parking trouvé dans un rayon de 2 km."
                  : "Aucun parking ne correspond à ta recherche ou à ce filtre."}
              </p>
            )}
        </div>
      </aside>

      <section className="map-content">
        <ParkingMap
          parkings={filteredParkings}
          filter={activeFilter}
          userLocation={userLocation}
        />

        <div className="map-hint">
          Parkings dans un rayon de 2 km · Clique sur un marqueur pour voir les
          détails
        </div>

        <div className="map-legend">
          <div>
            <span className="legend-dot realtime" />
            Temps réel
          </div>

          <div>
            <span className="legend-dot estimated" />
            Estimé
          </div>

          <div>
            <span className="legend-dot unknown" />
            Non renseigné
          </div>
        </div>
      </section>
    </main>
  );
}

export default Map;
