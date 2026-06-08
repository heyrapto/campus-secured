function getCampusLandmark(lat: number, lng: number): string | null {
  // FUTMINNA Bosso Campus is approx centered around 9.628, 6.520
  // FUTMINNA Gidan Kwano Campus is approx centered around 9.528, 6.452
  const landmarks = [
    { name: "FUTMINNA Bosso Campus - Main Gate", lat: 9.628643, lng: 6.520563 },
    { name: "Bosso Campus - School of Science Education", lat: 9.6295, lng: 6.5215 },
    { name: "Bosso Campus - Hostel Area", lat: 9.6270, lng: 6.5190 },
    { name: "Gidan Kwano Campus - School of Agriculture (SAAT)", lat: 9.5265, lng: 6.4510 },
    { name: "Gidan Kwano Campus - Main Library", lat: 9.5290, lng: 6.4530 },
    { name: "Gidan Kwano Campus - School of Engineering (SEET)", lat: 9.5310, lng: 6.4550 },
    { name: "Gidan Kwano Campus - Love Garden / Student Center", lat: 9.5280, lng: 6.4525 },
    { name: "Gidan Kwano Campus - Convocation Square", lat: 9.5300, lng: 6.4515 },
    { name: "Gidan Kwano Campus - Clinic", lat: 9.5340, lng: 6.4480 }
  ];

  for (const landmark of landmarks) {
    const dLat = lat - landmark.lat;
    const dLng = lng - landmark.lng;
    const distance = Math.sqrt(dLat * dLat + dLng * dLng); // Euclidean distance (approx)
    if (distance < 0.0015) { // within ~150 meters
      return landmark.name;
    }
  }
  return null;
}

export async function getReadableAddress(lat: number, lng: number): Promise<string> {
  const landmark = getCampusLandmark(lat, lng);
  if (landmark) return landmark;

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
      headers: {
        'User-Agent': 'CampusShield-Safety-System/1.0'
      },
      next: { revalidate: 3600 } // Cache for performance
    });
    if (res.ok) {
      const data = await res.json();
      if (data.display_name) {
        // Return a clean version of the address
        return data.display_name;
      }
    }
  } catch (e) {
    console.error("Geocoding lookup failed", e);
  }
  
  return `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}
