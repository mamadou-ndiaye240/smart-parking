import './Home.css'
import ParkingMap from '../components/ParkingMap/ParkingMap'
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  return (
    <main className="home">

      {/* Navigation */}
      <nav className="navbar">
        <div className="logo">
          <span>📍</span>
          <strong>
            Smart
            <br />
            Parking
          </strong>
        </div>

        <button className="about-button">
          À propos
        </button>
      </nav>

      {/* Contenu principal */}
      <section className="hero">

        {/* Partie gauche */}
        <div className="hero-content">

          <div className="status">
            🟢 Disponibilité en temps réel
          </div>

          <h1>
            Trouvez votre place.
            <br />
            <span>Garez-vous</span> sans
            <br />
            tourner.
          </h1>

          <p className="description">
            Smart Parking analyse en temps réel la disponibilité des
            parkings urbains autour de votre destination. Naviguez
            directement vers une place libre.
          </p>

          {/* Recherche */}
          <div className="search-box">
            <input
              type="text"
              placeholder="Où allez-vous ?"
            />

            <button onClick={() => navigate('/map')}>
              Rechercher
            </button>
          </div>

          <button className="location-button">
            ✣ &nbsp; Utiliser ma position
          </button>

          {/* Fonctionnalités */}
          <div className="features">
            <div>⚡ Mise à jour automatique de la disponibilité</div>
            <div>🗺️ Navigation intégrée jusqu'au parking</div>
            <div>📡 Données de capteurs et d'opérateurs partenaires</div>
          </div>

          {/* Parkings proches */}
          <h3 className="nearby-title">
            PARKINGS DÉTECTÉS À PROXIMITÉ
          </h3>

          <div className="parking-list">

            {/* Parking Castellane */}
            <div className="parking-card">
              <div className="parking-icon">📍</div>

              <div>
                <strong>Parking Castellane</strong>
                <span>🟠 42 places · 320 m</span>
              </div>
            </div>

            {/* Parking Vieux-Port */}
            <div className="parking-card">
              <div className="parking-icon">📍</div>

              <div>
                <strong>Parking Vieux-Port</strong>
                <span>🟠 87 places · 650 m</span>
              </div>
            </div>

            {/* Parking Opéra */}
            <div className="parking-card available">
              <div className="parking-icon">📍</div>

              <div>
                <strong>Parking Opéra</strong>
                <span>🟢 134 places · 890 m</span>
              </div>
            </div>

          </div>

        </div>

        {/* Carte à droite */}
        <div className="map-preview">
          <ParkingMap />
        </div>

      </section>

    </main>
  )
}

export default Home