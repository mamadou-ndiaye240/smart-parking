import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Route.css";
import ParkingMap from "../components/ParkingMap/ParkingMap";

function RoutePage() {
  const navigate = useNavigate();

  const [navigationStarted, setNavigationStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: "↑",
      instruction: "Suivre la rue locale vers le nord",
      distance: "200 m",
    },
    {
      icon: "→",
      instruction: "Tourner à droite sur Bd du 26e Bataillon",
      distance: "400 m",
    },
    {
      icon: "↑",
      instruction: "Continuer sur la Rue Centrale",
      distance: "1,1 km",
    },
    {
      icon: "↑",
      instruction: "Prendre la voie locale",
      distance: "250 m",
    },
    {
      icon: "→",
      instruction: "Tourner à droite vers le parking",
      distance: "120 m",
    },
    {
      icon: "↑",
      instruction: "Continuer jusqu'à l'entrée du parking",
      distance: "80 m",
    },
    {
      icon: "▧",
      instruction: "Vous êtes arrivé à Parking Castellane",
      distance: "Arrivée",
    },
  ];

  const currentInstruction = steps[currentStep];
  const isArrival = currentStep === steps.length - 1;

  function startNavigation() {
    setCurrentStep(0);
    setNavigationStarted(true);
  }

  function nextStep() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  function stopNavigation() {
    setCurrentStep(0);
    setNavigationStarted(false);
  }

  return (
    <main className="route-page">
      {/* CARTE */}

      <section className="route-map">
        <ParkingMap showRoute={true} />

        {/* BARRE DU HAUT */}

        <div className="route-topbar">
          <button
            className="route-back-button"
            onClick={() => navigate("/parking/castellane")}
          >
            ←
          </button>

          <div className="route-stat">
            <span>ARRIVÉE</span>
            <strong>7 min</strong>
          </div>

          <div className="route-stat">
            <span>DISTANCE</span>
            <strong>320 m</strong>
          </div>

          <div className="route-destination">
            <span>DESTINATION</span>
            <strong>Parking Castellane</strong>
          </div>

          <span className="route-status">● Temps réel</span>
        </div>

        {/* DESTINATION */}

        <div className="destination-popup">
          <strong>Parking Castellane</strong>

          <div>
            <span>●</span>
            42 places disponibles
          </div>

          <p>320 m · 2,40 € / h</p>
        </div>

        {/* PROCHAINE INSTRUCTION */}

        {navigationStarted && (
          <div className="next-instruction">
            <div className="instruction-icon">{currentInstruction.icon}</div>

            <div className="instruction-text">
              <strong>{currentInstruction.instruction}</strong>

              <span>{currentInstruction.distance}</span>
            </div>

            {!isArrival && (
              <button className="next-button" onClick={nextStep}>
                Suivant
              </button>
            )}
          </div>
        )}
      </section>

      {/* PANNEAU DU BAS */}

      <section className="route-panel">
        {!navigationStarted ? (
          <>
            <div className="route-instructions">
              <h2>ITINÉRAIRE SUGGÉRÉ</h2>

              {steps.map((step, index) => (
                <div className="route-step" key={index}>
                  <span>{step.icon}</span>

                  <p>{step.instruction}</p>

                  <small>{step.distance}</small>
                </div>
              ))}
            </div>

            <div className="route-summary">
              <h3>Parking Castellane</h3>

              <div className="route-summary-info">
                <div>
                  <span>Tarif</span>
                  <strong>2,40 € / h</strong>
                </div>

                <div>
                  <span>Disponible</span>
                  <strong>42 pl.</strong>
                </div>

                <div>
                  <span>Durée</span>
                  <strong>7 min</strong>
                </div>
              </div>

              <button className="start-route-button" onClick={startNavigation}>
                ▶ Démarrer l'itinéraire
              </button>
            </div>
          </>
        ) : (
          <div className="navigation-status">
            <div>
              <strong>
                {isArrival ? "Vous êtes arrivé" : "Navigation en cours"}
              </strong>

              <span>
                {isArrival
                  ? "Parking Castellane"
                  : `${currentInstruction.instruction} · ${currentInstruction.distance}`}
              </span>
            </div>

            <div className="navigation-actions">
              <span className="navigation-availability">
                ● 42 places disponibles
              </span>

              <button className="stop-route-button" onClick={stopNavigation}>
                Arrêter
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default RoutePage;
