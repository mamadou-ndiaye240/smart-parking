import "./Map.css";
import ParkingMap from "../components/ParkingMap/ParkingMap";

function Map() {
  return (
    <main className="map-page">
      <aside className="map-sidebar">
        <div className="map-header">
          <button className="back-button">←</button>

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

          <input type="text" placeholder="Rechercher un parking..." />
        </div>

        <div className="map-filters">
          <button className="filter active">Tous</button>

          <button className="filter">Temps réel</button>

          <button className="filter">Estimé</button>
        </div>

        <h2 className="nearby-heading">PARKINGS À PROXIMITÉ</h2>

        <div className="parking-list">
          {/* Parking Castellane */}
          <div className="map-parking-card">
            <div className="parking-card-top">
              <strong>Parking Castellane</strong>

              <span>320 m</span>
            </div>

            <p>10 Rue du Rouet, 13006 Marseille</p>

            <div className="parking-info">
              <span>42 / 180</span>

              <span>2,40 € / h</span>
            </div>

            <div className="availability">
              <div className="availability-bar">
                <div
                  className="availability-fill"
                  style={{ width: "70%" }}
                ></div>
              </div>
            </div>

            <span className="parking-status">Temps réel</span>
          </div>

          {/* Parking Vieux-Port */}
          <div className="map-parking-card">
            <div className="parking-card-top">
              <strong>Parking Vieux-Port</strong>

              <span>650 m</span>
            </div>

            <p>2 Quai du Port, 13002 Marseille</p>

            <div className="parking-info">
              <span>87 / 350</span>

              <span>3,00 € / h</span>
            </div>

            <div className="availability">
              <div className="availability-bar">
                <div
                  className="availability-fill"
                  style={{ width: "55%" }}
                ></div>
              </div>
            </div>

            <span className="parking-status">Temps réel</span>
          </div>
        </div>
      </aside>

      <section className="map-content">
        <ParkingMap />

        <div className="map-hint">Cliquez sur un marqueur ou une carte</div>

        <div className="map-legend">
          <div>
            <span className="legend-dot realtime"></span>
            Temps réel
          </div>

          <div>
            <span className="legend-dot estimated"></span>
            Estimé
          </div>

          <div>
            <span className="legend-dot unknown"></span>
            Non renseigné
          </div>
        </div>
      </section>
    </main>
  );
}

export default Map;
