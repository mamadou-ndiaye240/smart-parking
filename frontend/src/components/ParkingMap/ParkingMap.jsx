import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

function ParkingMap() {
  const parkings = [
    {
      name: 'Parking Castellane',
      position: [43.2856, 5.3797],
      available: 42,
    },
    {
      name: 'Parking Vieux-Port',
      position: [43.2944, 5.3742],
      available: 87,
    },
    {
      name: 'Parking Opéra',
      position: [43.2929, 5.3771],
      available: 134,
    },
  ]

  return (
    <MapContainer
      center={[43.2900, 5.3780]}
      zoom={14}
      className="parking-map"
    >
      <TileLayer
       attribution='&copy; OpenStreetMap contributors'
       url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
     />
      {parkings.map((parking) => (
        <CircleMarker
          key={parking.name}
          center={parking.position}
          radius={9}
          pathOptions={{
            color: '#00e676',
            fillColor: '#00e676',
            fillOpacity: 1,
          }}
        >
          <Popup>
            <strong>{parking.name}</strong>
            <br />
            {parking.available} places disponibles
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}

export default ParkingMap