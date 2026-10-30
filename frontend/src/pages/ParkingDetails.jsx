import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ParkingDetails.css";

const API_URL = "http://localhost:5000/api/parkings";

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

function formatDistance(distance) {
  if (distance == null || !Number.isFinite(distance)) {
    return "Indisponible";
  }

  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }

  return `${distance.toFixed(1)} km`;
}

function ParkingDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [parking, setParking] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadParking(isInitialLoad = false) {
      try {
        if (isInitialLoad) {
          setLoading(true);
        }

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Impossible de récupérer les parkings.");
        }

        const parkings = await response.json();

        const selectedParking = parkings.find(
          (item) => String(item.id) === String(id),
        );

        if (!selectedParking) {
          throw new Error("Ce parking est introuvable.");
        }

        if (!cancelled) {
          setParking(selectedParking);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Une erreur est survenue.");
        }
      } finally {
        if (!cancelled && isInitialLoad) {
          setLoading(false);
        }
      }
    }

    loadParking(true);

    const interval = setInterval(() => {
      loadParking(false);
    }, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [id]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => {
        console.warn("Position GPS indisponible :", err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      },
    );
  }, []);

  if (loading) {
    return (
      <main className="details-page">
        <header className="details-header">
          <button
            className="details-back-button"
            onClick={() => navigate("/map")}
          >
            ←
          </button>
          <div>
            <span>DÉTAILS DU PARKING</span>
            <h1>Chargement...</h1>
          </div>
        </header>
      </main>
    );
  }

  if (error || !parking) {
    return (
      <main className="details-page">
        <header className="details-header">
          <button
            className="details-back-button"
            onClick={() => navigate("/map")}
          >
            ←
          </button>
          <div>
            <span>DÉTAILS DU PARKING</span>
            <h1>Parking introuvable</h1>
          </div>
        </header>
        <p>{error || "Les informations de ce parking sont indisponibles."}</p>
      </main>
    );
  }

  const capacity = parking.capacity != null ? Number(parking.capacity) : null;

  const availableSpaces =
    parking.availableSpaces != null ? Number(parking.availableSpaces) : null;

  const availabilityPercentage =
    capacity != null && capacity > 0 && availableSpaces != null
      ? Math.round((availableSpaces / capacity) * 100)
      : null;

  const distance =
    userLocation &&
    Number.isFinite(Number(parking.latitude)) &&
    Number.isFinite(Number(parking.longitude))
      ? calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          Number(parking.latitude),
          Number(parking.longitude),
        )
      : null;

  const statusLabel =
    parking.status === "realtime"
      ? "Temps réel"
      : parking.status === "indicative"
        ? "Donnée indicative"
        : "Non renseigné";

  const updatedAt = parking.availabilityUpdatedAt || parking.sourceUpdatedAt;

  const updateLabel = updatedAt
    ? new Date(updatedAt).toLocaleString("fr-FR")
    : "Date non renseignée";

  const ageInMinutes = updatedAt
    ? (Date.now() - new Date(updatedAt).getTime()) / 60000
    : null;

  const reliability =
    parking.status === "realtime" &&
    ageInMinutes !== null &&
    Number.isFinite(ageInMinutes) &&
    ageInMinutes >= 0 &&
    ageInMinutes <= 30
      ? Math.round(((30 - ageInMinutes) / 30) * 100)
      : null;

  return (
    <main className="details-page">
      <header className="details-header">
        <button
          className="details-back-button"
          onClick={() => navigate("/map")}
        >
          ←
        </button>

        <div>
          <span>DÉTAILS DU PARKING</span>
          <h1>{parking.name}</h1>
        </div>
      </header>

      <section className="details-content">
        <div className="details-left">
          <div className="parking-summary">
            <div className="summary-top">
              <div>
                <h2>{parking.name}</h2>
                <p>
                  📍 {parking.address || parking.city || "Adresse inconnue"}
                </p>
              </div>

              <span className="realtime-badge">● {statusLabel}</span>
            </div>

            <div className="summary-stats">
              <div>
                <span>Distance</span>
                <strong>{formatDistance(distance)}</strong>
              </div>

              <div>
                <span>Tarif</span>
                <strong>
                  {parking.pricePerHour != null
                    ? `${Number(parking.pricePerHour)
                        .toFixed(2)
                        .replace(".", ",")} € / h`
                    : "Non renseigné"}
                </strong>
              </div>

              <div>
                <span>Horaires</span>
                <strong>Non renseignés</strong>
              </div>
            </div>
          </div>

          <div className="details-information">
            <div className="information-row">
              <span>👥</span>
              <div>
                <small>CAPACITÉ TOTALE</small>
                <strong>
                  {capacity != null
                    ? `${capacity} places`
                    : "Capacité inconnue"}
                </strong>
              </div>
            </div>

            <div className="information-row">
              <span>☑</span>
              <div>
                <small>PLACES DISPONIBLES</small>
                <strong className="available">
                  {availableSpaces != null
                    ? `${availableSpaces} places libres`
                    : "Disponibilité non renseignée"}
                </strong>
              </div>
            </div>

            <div className="information-row">
              <span>◷</span>
              <div>
                <small>DERNIÈRE MISE À JOUR</small>
                <strong>{updateLabel}</strong>
              </div>
            </div>

            <div className="information-row">
              <span>◉</span>
              <div>
                <small>TYPE DE DONNÉES</small>
                <strong>
                  {statusLabel === "Temps réel"
                    ? "Disponibilité en temps réel"
                    : statusLabel === "Estimé"
                      ? "Disponibilité estimée"
                      : "Données non renseignées"}
                </strong>
              </div>
            </div>
          </div>

          <div className="reliability">
            <div className="reliability-top">
              <div>
                <strong>Fiabilité de l'information</strong>
                <span>
                  {reliability != null
                    ? "Basée sur les données reçues"
                    : "Fiabilité non déterminée"}
                </span>
              </div>

              <strong>{reliability != null ? `${reliability}%` : "—"}</strong>
            </div>

            <div className="reliability-bar">
              <div
                style={{
                  width: `${reliability ?? 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="details-right">
          <div className="availability-card">
            <span>DISPONIBILITÉ ACTUELLE</span>

            <div className="availability-circle">
              <strong>{availableSpaces ?? "—"}</strong>
              <small>/ {capacity != null ? capacity : "—"} places</small>
            </div>

            <strong>
              {availabilityPercentage != null
                ? `${availabilityPercentage}% disponible`
                : "Disponibilité inconnue"}
            </strong>
          </div>

          <div className="verified-card">
            <span>✓</span>
            <div>
              <strong>
                {statusLabel === "Temps réel"
                  ? "Données en temps réel"
                  : "Données disponibles"}
              </strong>
              <p>
                {updatedAt
                  ? `Dernière mise à jour : ${updateLabel}`
                  : "Mise à jour non renseignée"}
              </p>
            </div>
          </div>

          <button
            className="route-button"
            onClick={() => navigate(`/route/${parking.id}`)}
          >
            ➤ Voir l'itinéraire
          </button>
        </div>
      </section>
    </main>
  );
}

export default ParkingDetails;
