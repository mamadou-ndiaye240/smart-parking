const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "OPTIONS"],
  }),
);

app.use(express.json());
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "smart_parking",
  port: 5432,
  password: process.env.DB_PASSWORD,
});

pool
  .query("SHOW client_encoding")
  .then((result) => console.log("Encodage PostgreSQL :", result.rows[0]))
  .catch((error) => console.error(error));

// Synchronisation des disponibilités depuis l'API officielle
const SOURCE_URL =
  "https://data.ampmetropole.fr/api/explore/v2.1/catalog/datasets/disponibilites-des-places-de-parkings/records/";

async function synchronizeParkings() {
  const client = await pool.connect();

  try {
    console.log("Actualisation des disponibilités...");

    // Récupérer toutes les pages de l'API
    const records = [];
    const limit = 100;
    let offset = 0;
    let totalCount = Infinity;

    while (offset < totalCount) {
      const url = new URL(SOURCE_URL);
      url.searchParams.set("limit", String(limit));
      url.searchParams.set("offset", String(offset));

      const response = await fetch(url, {
        signal: AbortSignal.timeout(20000),
      });

      if (!response.ok) {
        throw new Error(`API officielle : HTTP ${response.status}`);
      }

      const data = await response.json();

      if (
        !Array.isArray(data.results) ||
        !Number.isFinite(Number(data.total_count))
      ) {
        throw new Error("Réponse inattendue de l'API officielle.");
      }

      totalCount = Number(data.total_count);
      records.push(...data.results);

      if (data.results.length === 0) break;
      offset += data.results.length;
    }

    // Ne rien modifier si la récupération est incomplète.
    if (records.length !== totalCount || records.length === 0) {
      throw new Error(
        `Récupération incomplète : ${records.length}/${totalCount}`,
      );
    }

    await client.query("BEGIN");

    let updated = 0;
    let skipped = 0;

    for (const p of records) {
      if (!p.nom || typeof p.nom !== "string") {
        skipped++;
        continue;
      }

      const name = p.nom.trim();

      // N'actualiser que les noms correspondant à une seule ligne.
      const matches = await client.query(
        `SELECT COUNT(*)::int AS total
         FROM parking_realtime
         WHERE LOWER(TRIM(name)) = LOWER(TRIM($1))`,
        [name],
      );

      if (matches.rows[0].total !== 1) {
        skipped++;
        continue;
      }

      const numberOrNull = (value) => {
        if (value === null || value === undefined || value === "") {
          return null;
        }
        const n = Number(value);
        return Number.isFinite(n) ? n : null;
      };

      const realtime =
        p.tempsreel === true ||
        (typeof p.tempsreel === "string" &&
          p.tempsreel.trim().toLowerCase() === "true");

      const rawDate = p.datemajpy;
      const parsedDate = rawDate ? new Date(rawDate) : null;
      const updatedAt =
        parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null;

      await client.query(
        `UPDATE parking_realtime
         SET capacity = COALESCE($2, capacity),
             available_spaces = $3,
             description = COALESCE($4, description),
             parking_type = COALESCE($5, parking_type),
             site = COALESCE($6, site),
             address = COALESCE($7, address),
             postal_code = COALESCE($8, postal_code),
             realtime = $9,
             occupied_spaces = $10,
             operator = COALESCE($11, operator),
             opening_hours = COALESCE($12, opening_hours),
             longitude = COALESCE($13, longitude),
             latitude = COALESCE($14, latitude),
             geo_point = COALESCE($15, geo_point),
             updated_at = COALESCE($16, updated_at),
             availability_rate = $17
         WHERE LOWER(TRIM(name)) = LOWER(TRIM($1))`,
        [
          name,
          numberOrNull(p.voitureplacescapacite),
          numberOrNull(p.voitureplacesdisponibles),
          p.description || null,
          p.typeparking || null,
          p.site || null,
          p.adresse || null,
          p.codepostal || null,
          realtime,
          numberOrNull(p.voitureplacesoccupees),
          p.producteur || null,
          p.horairestexte || null,
          numberOrNull(p.longitude),
          numberOrNull(p.latitude),
          p.pointgeo ? JSON.stringify(p.pointgeo) : null,
          updatedAt,
          numberOrNull(p.tauxdisponibilite),
        ],
      );

      updated++;
    }

    await client.query("COMMIT");

    console.log(
      `Synchronisation terminée : ${updated} lignes actualisées, ` +
        `${skipped} ignorées (nom absent, inconnu ou ambigu).`,
    );
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {}

    console.error("Échec de la synchronisation :", error.message);
  } finally {
    client.release();
  }
}

app.get("/", (req, res) => {
  res.json({
    message: "Smart Parking API",
  });
});

app.get("/api/parkings", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.city,
        p.latitude,
        p.longitude,
        p.capacity,
        p.parking_type,
        p.status AS access_status,
        p.source,
        p.source_updated_at,
        r.available_spaces,
        r.realtime,
        r.updated_at AS realtime_updated_at,
        r.availability_rate
      FROM parkings p
      LEFT JOIN LATERAL (
        SELECT
          available_spaces,
          realtime,
          updated_at,
          availability_rate
        FROM parking_realtime
        WHERE LOWER(TRIM(name)) = LOWER(TRIM(p.name))
        ORDER BY
          realtime DESC NULLS LAST,
          updated_at DESC NULLS LAST
        LIMIT 1
      ) r ON TRUE
      ORDER BY p.name;
    `);

    const parkings = result.rows.map((parking) => {
      const updatedTimestamp = parking.realtime_updated_at
        ? new Date(parking.realtime_updated_at).getTime()
        : NaN;

      const ageInMinutes = (Date.now() - updatedTimestamp) / 60000;

      const isFresh =
        Number.isFinite(updatedTimestamp) &&
        ageInMinutes >= 0 &&
        ageInMinutes <= 30;

      const availabilityKnown =
        parking.available_spaces !== null &&
        parking.available_spaces !== undefined;

      const availabilityStatus = !availabilityKnown
        ? "unknown"
        : parking.realtime === true && isFresh
          ? "realtime"
          : "indicative";

      return {
        id: parking.id,
        name: parking.name,
        address: parking.city,
        latitude: Number(parking.latitude),
        longitude: Number(parking.longitude),
        capacity: parking.capacity,
        availableSpaces: availabilityKnown
          ? Number(parking.available_spaces)
          : null,
        pricePerHour: null,
        status: availabilityStatus,
        parkingType: parking.parking_type,
        source: parking.source,
        sourceUpdatedAt:
          parking.realtime_updated_at || parking.source_updated_at,
        availabilityRate: availabilityKnown
          ? Number(parking.availability_rate)
          : null,
        availabilityUpdatedAt: parking.realtime_updated_at,
        availabilityKnown,
      };
    });

    res.json(parkings);
  } catch (error) {
    console.error("Erreur PostgreSQL :", error);

    res.status(500).json({
      message: "Erreur lors de la récupération des parkings",
    });
  }
});

// Calcule les distances et durées routières de plusieurs parkings.
app.post("/api/route-matrix", async (req, res) => {
  const { startLat, startLng, destinations } = req.body;

  const validCoordinate = (value, min, max) =>
    value !== null &&
    value !== undefined &&
    value !== "" &&
    Number.isFinite(Number(value)) &&
    Number(value) >= min &&
    Number(value) <= max;

  if (
    !validCoordinate(startLat, -90, 90) ||
    !validCoordinate(startLng, -180, 180) ||
    !Array.isArray(destinations) ||
    destinations.length === 0 ||
    destinations.length > 50
  ) {
    return res.status(400).json({
      message: "Position de départ ou liste de destinations invalide.",
    });
  }

  const invalidDestination = destinations.some(
    (destination) =>
      !validCoordinate(destination.latitude, -90, 90) ||
      !validCoordinate(destination.longitude, -180, 180),
  );

  if (invalidDestination) {
    return res.status(400).json({
      message: "Une ou plusieurs coordonnées de parking sont invalides.",
    });
  }

  try {
    // OSRM attend longitude,latitude.
    const coordinates = [
      `${Number(startLng)},${Number(startLat)}`,
      ...destinations.map(
        (destination) =>
          `${Number(destination.longitude)},${Number(destination.latitude)}`,
      ),
    ].join(";");

    const destinationIndexes = destinations
      .map((_, index) => index + 1)
      .join(";");

    const url =
      `https://router.project-osrm.org/table/v1/driving/${coordinates}` +
      `?sources=0&destinations=${destinationIndexes}` +
      "&annotations=distance,duration";

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(502).json({
        message: "Le service de calcul des itinéraires est indisponible.",
      });
    }

    const data = await response.json();

    if (data.code !== "Ok" || !data.distances?.[0] || !data.durations?.[0]) {
      return res.status(502).json({
        message: "Impossible de calculer les itinéraires.",
      });
    }

    const routes = destinations.map((destination, index) => {
      const distance = data.distances[0][index];
      const duration = data.durations[0][index];

      return {
        id: destination.id,
        distanceMeters: distance,
        durationSeconds: duration,
        distanceKm:
          distance === null ? null : Math.round((distance / 1000) * 100) / 100,
        durationMinutes: duration === null ? null : Math.ceil(duration / 60),
        reachable:
          distance !== null &&
          duration !== null &&
          distance <= 5000 &&
          duration <= 30 * 60,
      };
    });

    res.json({ routes });
  } catch (error) {
    console.error("Erreur OSRM :", error);

    res.status(502).json({
      message: "Erreur lors du calcul des itinéraires.",
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Backend lancé sur http://localhost:${PORT}`);

  synchronizeParkings();

  setInterval(synchronizeParkings, 15 * 60 * 1000);
});
