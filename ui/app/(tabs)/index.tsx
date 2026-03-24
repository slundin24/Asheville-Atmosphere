import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import LayoutWrapper from './LayoutWrapper';

// Daily forecast peroid from NWS API
interface ForecastPeriod {
  name: string; 
  temperature: number;
  temperatureUnit: string;
  shortForecast: string;
  icon: string;
  startTime: string;
  detailedForecast: string;
  isDaytime: boolean;
}

// Hourly forecast structure
interface HourlyForecast {
  startTime: string;
  temperature: number;
  probabilityOfPrecipitation?: {
    value: number | null;
  };
  shortForecast: string;
}

// Main screen
export default function IndexScreen() {

  // Today's forecast (top card)
  const [todayForecast, setTodayForecast] = useState<ForecastPeriod | null>(null);

  // 5-day forecast (10 periods day/night)
  const [weekForecast, setWeekForecast] = useState<ForecastPeriod[]>([]);

  // Hourly forecast data
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);

  // Current observed weather (not forecast)
  const [currentWeather, setCurrentWeather] = useState<any>(null);

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data fetching
  useEffect(() => {
    const fetchAllForecasts = async () => {
      try {
        setLoading(true);
        setError(null);

        const headers = {
          'User-Agent': 'MyWeatherApp (slundin@unca.edu)',
          'Accept': 'application/geo+json',
        };

        // lat and lon for Asheville, NC
        const lat = 35.5959111;
        const lon = -82.5500442;

        const pointRes = await fetch(
          // NWS API endpoint with lat and lon for Asheville, NC
          `https://api.weather.gov/points/${lat},${lon}`,
          { headers }
        );
        const pointData = await pointRes.json();

        // API endpoints
        const forecastUrl = pointData.properties.forecast;
        const hourlyUrl = pointData.properties.forecastHourly;
        const stationsUrl = pointData.properties.observationStations;

        // Daily forecast
        const forecastRes = await fetch(forecastUrl, { headers });
        const forecastData = await forecastRes.json();

        // Day/night periods
        const periods: ForecastPeriod[] = forecastData.properties.periods;

        // First period (current day or night)
        setTodayForecast(periods[0]);

        // First 10 periods (5 days of day and night pairs)
        setWeekForecast(periods.slice(0, 10));

        // Hourly forecast
        const hourlyRes = await fetch(hourlyUrl, { headers });
        const hourlyData = await hourlyRes.json();
        setHourlyForecast(hourlyData.properties.periods.slice(0, 12)); // limit to next 12 hours

        // Get nearest weather station
        const stationsRes = await fetch(stationsUrl, { headers });
        const stationsData = await stationsRes.json();
        const stationUrl = stationsData.features[0].id;

        // Get latest observation
        const obsRes = await fetch(`${stationUrl}/observations/latest`, {
          headers,
        });
        const obsData = await obsRes.json();
        const current = obsData.properties;

        // Convert celsius to fahrenheit
        const tempC = current.temperature?.value;
        const tempF = tempC !== null ? (tempC * 9) / 5 + 32 : null;

        // forecast for today's weather box
        setCurrentWeather({
          temperature: tempF,
          icon: current.icon,
          text: current.textDescription,
        });

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllForecasts();
  }, []);

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true,
    });
  };

  // Detect severe/thunder conditions for the lightning icon
  const hasSevereWeather = (forecast: string) => {
    const lower = forecast.toLowerCase();
    return lower.includes('thunder') || lower.includes('severe');
  };

  // Group day/night into pairs for the 5-day
  const groupedForecast = [];
  for (let i = 0; i < weekForecast.length; i += 2) {
    groupedForecast.push({
      day: weekForecast[i],
      night: weekForecast[i + 1],
    });
  }

  // Loading state
  if (loading) {
    return (
      <LayoutWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#003da5" />
          <Text style={styles.loadingText}>Loading Asheville weather...</Text>
        </View>
      </LayoutWrapper>
    );
  }

  // Error state
  if (error) {
    return (
      <LayoutWrapper>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      </LayoutWrapper>
    );
  }

  // Main UI
  return (
    <LayoutWrapper>
      <ScrollView style={styles.fullScroll}>
        <View style={styles.container}>

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>The Asheville Atmosphere</Text>
          </View>

          <View style={styles.content}>

            {/* TODAY */}
            {todayForecast && currentWeather && (
              <View style={styles.todaySection}>
                <Text style={styles.sectionTitle}>
                  {todayForecast.name}
                </Text>

                <View style={styles.todayContent}>
                  <Image
                    source={{ uri: currentWeather.icon }}
                    style={styles.todayIcon}
                  />

                  <Text style={styles.todayTemp}>
                    {Math.round(currentWeather.temperature)}°
                  </Text>

                  <Text style={styles.todayForecast}>
                    {currentWeather.text}
                  </Text>

                  <Text style={styles.todayName}>
                    {todayForecast.shortForecast}
                  </Text>
                </View>
              </View>
            )}

            {/* HOURLY */}
            {hourlyForecast.length > 0 && (
              <View style={styles.hourlySection}>
                <Text style={styles.sectionTitle}>Hourly</Text>

                <View style={{ flexDirection: 'row' }}>
                  <View style={{ marginRight: 10 }}>
                    <Text style={styles.hourlyLabel}>Temp</Text>
                    <Text style={styles.hourlyLabel}>Precip</Text>
                    <Text style={styles.hourlyLabel}>Thunder</Text>
                    <Text style={styles.hourlyLabel}></Text>
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {hourlyForecast.map((hour, index) => {
                      const precip = hour.probabilityOfPrecipitation?.value ?? 0;

                      return (
                        <View key={index} style={styles.hourlyColumn}>
                          <Text style={styles.hourlyValue}>
                            {hour.temperature}°
                          </Text>

                          <View style={styles.precipBar}>
                            <View
                              style={[
                                styles.precipFill,
                                { height: `${precip}%` },
                              ]}
                            />
                          </View>
                          <Text style={styles.hourlyValueSmall}>{precip}%</Text>

                          <Text style={styles.thunderIcon}>
                            {hasSevereWeather(hour.shortForecast) ? '⚡' : '—'}
                          </Text>

                          <Text style={styles.timeLabel}>
                            {formatTime(hour.startTime)}
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            )}

            {/* 5 DAY */}
            <View style={styles.fiveDaySection}>
              <Text style={styles.sectionTitle}>5 Day</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.fiveDayScroll}
              >
                {groupedForecast.slice(0, 5).map((pair, index) => (
                  <View key={index} style={styles.dayCard}>

                    <Text style={styles.dayName}>
                      {pair.day?.name.split(' ')[0]}
                    </Text>

                    <Text style={styles.dayTemp}>
                      ☀️ {pair.day?.temperature}°
                    </Text>

                    <Text style={styles.nightTemp}>
                      🌙 {pair.night?.temperature}°
                    </Text>

                      {/* short forecast */}
                    <Text style={styles.dayForecast} numberOfLines={2}>
                      {pair.day?.shortForecast}
                    </Text>

                  </View>
                ))}
              </ScrollView>
            </View>

          </View>
        </View>
      </ScrollView>
    </LayoutWrapper>
  );
}

const styles = StyleSheet.create({
  fullScroll: { flex: 1 },
  container: { flex: 1 },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    backgroundColor: '#1a1d23',
    padding: 15,
  },

  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },

  content: { padding: 15 },

  todaySection: {
    backgroundColor: '#1a1d23',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 10,
  },

  todayContent: { alignItems: 'center' },

  todayIcon: { width: 100, height: 100 },

  todayTemp: { fontSize: 48, color: '#fff' },

  todayForecast: { color: '#ccc' },

  todayName: { color: '#888' },

  hourlySection: {
    backgroundColor: '#1a1d23',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },

  hourlyLabel: {
    height: 55,
    color: '#aaa',
  },

  hourlyColumn: {
    width: 65,
    alignItems: 'center',
    marginRight: 10,
  },

  hourlyValue: { color: '#fff', fontWeight: 'bold' },

  hourlyValueSmall: { color: '#aaa', fontSize: 12 },

  precipBar: {
    width: 25,
    height: 50,
    backgroundColor: '#333',
    justifyContent: 'flex-end',
    marginVertical: 4,
  },

  precipFill: { width: '100%', backgroundColor: '#003da5' },

  thunderIcon: { fontSize: 18, marginVertical: 4 },

  timeLabel: { color: '#888', fontSize: 12, marginTop: 4 },

  fiveDaySection: {
    backgroundColor: '#1a1d23',
    padding: 20,
    borderRadius: 12,
  },

  fiveDayScroll: {
    paddingRight: 10,
  },

  dayCard: {
    backgroundColor: '#25292e',
    padding: 12,
    borderRadius: 10,
    width: 120,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },

  dayName: {
    color: '#aaa',
    fontWeight: '600',
    marginBottom: 4,
  },

  dayTemp: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },

  nightTemp: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 6,
  },

  dayForecast: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },

  loadingText: { color: '#fff' },

  errorText: { color: 'red' },
});