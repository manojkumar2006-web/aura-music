export async function getUserLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    }
  });
}

export async function getWeather(latitude: number, longitude: number): Promise<string> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch weather data");
  const data = await res.json();
  const code = data.current_weather.weathercode;

  // Map WMO weather codes to our simple vibes
  if (code === 0) return 'Clear';
  if (code >= 1 && code <= 3) return 'Cloudy';
  if (code >= 51 && code <= 67) return 'Rainy';
  if (code >= 80 && code <= 82) return 'Rainy';
  if (code >= 95 && code <= 99) return 'Stormy';
  if (code >= 71 && code <= 77) return 'Snowy';
  if (code >= 85 && code <= 86) return 'Snowy';

  return 'Sunny'; // fallback
}

export async function getRegionIndustry(latitude: number, longitude: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'AuraMusic/1.0'
    }
  });
  if (!res.ok) throw new Error("Failed to fetch region data");
  const data = await res.json();
  const state = data.address?.state?.toLowerCase() || '';

  if (state.includes('tamil nadu')) return 'Kollywood';
  if (state.includes('andhra') || state.includes('telangana')) return 'Tollywood';
  if (state.includes('karnataka')) return 'Sandalwood';
  if (state.includes('kerala')) return 'Mollywood';
  if (state.includes('maharashtra') || state.includes('delhi') || state.includes('punjab') || state.includes('uttar pradesh') || state.includes('haryana')) return 'Bollywood';
  
  // Default to Bollywood if unknown, or return a generic "Global"
  return 'Bollywood';
}
