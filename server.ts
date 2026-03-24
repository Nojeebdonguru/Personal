import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/mosques", async (req, res) => {
    const { lat, lng, query } = req.query;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Google Places API Key not configured" });
    }

    try {
      let placesRes;
      if (lat && lng) {
        // Use nearbysearch for GPS coordinates
        placesRes = await axios.get(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=10000&type=mosque&key=${apiKey}`
        );
      } else if (query) {
        // Use textsearch for city, state, or zip code
        // This is much better for broad queries like "Texas" or "New York"
        placesRes = await axios.get(
          `https://maps.googleapis.com/maps/api/place/textsearch/json?query=mosques+in+${encodeURIComponent(query as string)}&key=${apiKey}`
        );
      } else {
        return res.status(400).json({ error: "Location parameters missing" });
      }

      // Fetch details for each place to get website URLs
      const mosques = await Promise.all(
        placesRes.data.results.map(async (place: any) => {
          const detailRes = await axios.get(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,geometry,website,formatted_address&key=${apiKey}`
          );
          const details = detailRes.data.result;
          return {
            id: place.place_id,
            name: details.name,
            lat: details.geometry.location.lat,
            lng: details.geometry.location.lng,
            address: details.formatted_address,
            website: details.website || null,
          };
        })
      );

      res.json(mosques);
    } catch (error: any) {
      console.error("Error fetching mosques:", error.message);
      res.status(500).json({ error: "Failed to fetch mosques" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
