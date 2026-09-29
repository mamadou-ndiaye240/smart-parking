import { useNavigate } from "react-router-dom";
import "./ParkingDetails.css";

function ParkingDetails() {
  const navigate = useNavigate();

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
          <h1>Parking Castellane</h1>
        </div>
      </header>

      <section className="details-content">
        <div className="details-left">
          <div className="parking-summary">
            <div className="summary-top">
              <div>
                <h2>Parking Castellane</h2>

                <p>📍 10 Rue du Rouet, 13006 Marseille</p>
              </div>

              <span className="realtime-badge">● Temps réel</span>
            </div>

            <div className="summary-stats">
              <div>
                <span>Distance</span>
                <strong>320 m</strong>
              </div>

              <div>
                <span>Tarif</span>
                <strong>2,40 € / h</strong>
              </div>

              <div>
                <span>Horaires</span>
                <strong>24h/24 - 7j/7</strong>
              </div>
            </div>
          </div>

          <div className="details-information">
            <div className="information-row">
              <span>👥</span>

              <div>
                <small>CAPACITÉ TOTALE</small>
                <strong>180 places</strong>
              </div>
            </div>

            <div className="information-row">
              <span>☑</span>

              <div>
                <small>PLACES DISPONIBLES</small>
                <strong className="available">42 places libres</strong>
              </div>
            </div>

            <div className="information-row">
              <span>◷</span>

              <div>
                <small>DERNIÈRE MISE À JOUR</small>
                <strong>il y a 1 min</strong>
              </div>
            </div>

            <div className="information-row">
              <span>◉</span>

              <div>
                <small>TYPE DE DONNÉES</small>
                <strong>Disponibilité en temps réel</strong>
              </div>
            </div>
          </div>

          <div className="reliability">
            <div className="reliability-top">
              <div>
                <strong>Fiabilité de l'information</strong>
                <span>Basée sur les données du capteur</span>
              </div>

              <strong>97%</strong>
            </div>

            <div className="reliability-bar">
              <div></div>
            </div>
          </div>
        </div>

        <div className="details-right">
          <div className="availability-card">
            <span>DISPONIBILITÉ ACTUELLE</span>

            <div className="availability-circle">
              <strong>42</strong>
              <small>/ 180 places</small>
            </div>

            <strong>23% disponible</strong>
          </div>

          <div className="verified-card">
            <span>✓</span>

            <div>
              <strong>Données vérifiées</strong>
              <p>Capteurs actifs · Mise à jour en continu</p>
            </div>
          </div>

          <button
            className="route-button"
            onClick={() => navigate("/route/castellane")}
          >
            ➤ Voir l'itinéraire
          </button>
        </div>
      </section>
    </main>
  );
}

export default ParkingDetails;
