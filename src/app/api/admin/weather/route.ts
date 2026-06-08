import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const latitude = 26.9124;
  const longitude = 75.7873;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=uv_index_max,precipitation_sum,temperature_2m_max&timezone=Asia/Kolkata`;

  // Standard high-quality fallback for Jaipur summer/monsoon weather
  const generateFallbackData = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }

    return {
      success: true,
      source: 'fallback',
      daily: {
        time: dates,
        uv_index_max: [8.5, 9.2, 7.8, 6.5, 8.2, 9.0, 8.8],
        precipitation_sum: [0.0, 0.0, 1.2, 4.5, 0.5, 0.0, 0.0],
        temperature_2m_max: [41.5, 42.1, 39.8, 37.5, 39.0, 40.5, 41.2]
      }
    };
  };

  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 3000); // 3-second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 3600 } // Cache hourly
    });
    
    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`Weather API returned status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.daily || !data.daily.time) {
      throw new Error('Weather API payload missing daily forecast details');
    }

    return NextResponse.json({
      success: true,
      source: 'api',
      daily: {
        time: data.daily.time,
        uv_index_max: data.daily.uv_index_max || [8, 8, 8, 8, 8, 8, 8],
        precipitation_sum: data.daily.precipitation_sum || [0, 0, 0, 0, 0, 0, 0],
        temperature_2m_max: data.daily.temperature_2m_max || [40, 40, 40, 40, 40, 40, 40]
      }
    });

  } catch (error) {
    console.warn('Weather API fetch failed, serving local fallback data:', error);
    return NextResponse.json(generateFallbackData());
  }
}
