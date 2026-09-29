import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Map.css";
import ParkingMap from "../components/ParkingMap/ParkingMap";

function Map() {
  const navigate = useNavigate();

  const [selectedParking, setSelectedParking] = useState(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tous");

  const parkings = [
    {
      id: "castellane",
      name: "Parking Castellane",
      address: "10 Rue du Rouet, 13006 Marseille",
      distance: "320 m",
      places: "42 / 180",
      price: "2,40 € / h",
      availability: "70%",
      status: "Temps réel",
    },
    {
      id: "vieux-port",
      name: "Parking Vieux-Port",
      address: "2 Quai du Port, 13002 Marseille",
      distance: "650 m",
      places: "87 / 350",
      price: "3,00 € / h",
      availability: "55%",
      status: "Estimé",
    },
  ];

  const filteredParkings = parkings.filter((parking) => {
    const matchesSearch = parking.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      activeFilter === "Tous" || parking.status === activeFilter;

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
          <button
            className={`filter ${activeFilter === "Tous" ? "active" : ""}`}
            onClick={() => setActiveFilter("Tous")}
          >
            Tous
          </button>

          <button
            className={`filter ${
              activeFilter === "Temps réel" ? "active" : ""
            }`}
            onClick={() => setActiveFilter("Temps réel")}
          >
            Temps réel
          </button>

          <button
            className={`filter ${activeFilter === "Estimé" ? "active" : ""}`}
            onClick={() => setActiveFilter("Estimé")}
          >
            Estimé
          </button>
        </div>

        <h2 className="nearby-heading">PARKINGS À PROXIMITÉ</h2>

        <div className="parking-list">
          {filteredParkings.map((parking) => (
            <div
              key={parking.id}
              className={`map-parking-card ${
                selectedParking === parking.id ? "selected" : ""
              }`}
              onClick={() => setSelectedParking(parking.id)}
            >
              <div className="parking-card-top">
                <strong>{parking.name}</strong>

                <span>{parking.distance}</span>
              </div>

              <p>{parking.address}</p>

              <div className="parking-info">
                <span>{parking.places}</span>

                <span>{parking.price}</span>
              </div>

              <div className="availability">
                <div className="availability-bar">
                  <div
                    className="availability-fill"
                    style={{
                      width: parking.availability,
                    }}
                  ></div>
                </div>
              </div>

              <span
                className={`parking-status ${
                  parking.status === "Estimé" ? "estimated-status" : ""
                }`}
              >
                {parking.status}
              </span>

              {selectedParking === parking.id && (
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
          ))}

          {filteredParkings.length === 0 && (
            <p className="no-results">Aucun parking trouvé</p>
          )}
        </div>
      </aside>

      <section className="map-content">
        <ParkingMap filter={activeFilter} />

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
