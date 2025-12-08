import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import LayoutWrapper from './LayoutWrapper';

interface ForecastPeriod {
  name: string;
  temperature: number;
  temperatureUnit: string;
  shortForecast: string;
  icon: string;
  startTime: string;
  detailedForecast: string;
  probabilityOfPrecipitation?: {
    value: number | null;
  };
}

interface HourlyForecast {
  startTime: string;
  temperature: number;
  probabilityOfPrecipitation?: {
    value: number | null;
  };
  shortForecast: string;
}

export default function IndexScreen() {
  const [todayForecast, setTodayForecast] = useState<ForecastPeriod | null>(null);
  const [weekForecast, setWeekForecast] = useState<ForecastPeriod[]>([]);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const isWebLarge = width >= 768;

  useEffect(() => {
    const fetchAllForecasts = async () => {
      try {
        setError(null);
        setLoading(true);

        // Fetch regular forecast (for today and 5-day)
        const forecastResponse = await fetch(
          'https://api.weather.gov/gridpoints/GSP/49,72/forecast',
          {
            headers: {
              'User-Agent': 'MyWeatherApp (slundin@unca.edu)',
              'Accept': 'application/geo+json',
            },
          }
        );

        if (!forecastResponse.ok) {
          throw new Error(`Forecast API error: ${forecastResponse.status}`);
        }

        const forecastData = await forecastResponse.json();
        console.log('Forecast data received:', JSON.stringify(forecastData, null, 2));
        
        // Try multiple paths to find periods
        let periods: ForecastPeriod[] = [];
        if (forecastData?.properties?.periods) {
          periods = forecastData.properties.periods;
        } else if (forecastData?.periods) {
          periods = forecastData.periods;
        }

        console.log('Periods found:', periods.length);

        if (periods.length === 0) {
          throw new Error('No forecast periods found in API response');
        }

        // Set today's forecast (first daytime period)
        const today = periods.find((p) => !p.name.toLowerCase().includes('night'));
        setTodayForecast(today || periods[0]);

        // Set 5-day forecast (next 5 daytime periods)
        const daytimePeriods = periods.filter(
          (p) => !p.name.toLowerCase().includes('night')
        );
        setWeekForecast(daytimePeriods.slice(0, 5));

        // Fetch hourly forecast
        const hourlyResponse = await fetch(
          'https://api.weather.gov/gridpoints/GSP/49,72/forecast/hourly',
          {
            headers: {
              'User-Agent': 'MyWeatherApp (slundin@unca.edu)',
              'Accept': 'application/geo+json',
            },
          }
        );

        if (hourlyResponse.ok) {
          const hourlyData = await hourlyResponse.json();
          console.log('Hourly data received');
          const hourlyPeriods = hourlyData?.properties?.periods || [];
          console.log('Hourly periods found:', hourlyPeriods.length);
          setHourlyForecast(hourlyPeriods.slice(0, 12)); // Next 12 hours
        } else {
          console.log('Hourly forecast failed:', hourlyResponse.status);
        }
      } catch (err: any) {
        console.error('Error fetching forecast:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllForecasts();
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      hour12: true 
    });
  };

  const getWeatherEmoji = (forecast: string) => {
    const lower = forecast.toLowerCase();
    if (lower.includes('thunder')) return '⛈️';
    if (lower.includes('rain') || lower.includes('shower')) return '🌧️';
    if (lower.includes('snow')) return '❄️';
    if (lower.includes('cloud')) return '☁️';
    if (lower.includes('partly')) return '⛅';
    if (lower.includes('clear') || lower.includes('sunny')) return '☀️';
    return '🌤️';
  };

  const hasSevereWeather = (forecast: string) => {
    const lower = forecast.toLowerCase();
    return lower.includes('thunder') || lower.includes('severe');
  };

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

  if (error) {
    return (
      <LayoutWrapper>
        <ScrollView style={styles.content}>
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>⚠️ Error loading weather</Text>
            <Text style={styles.errorDetail}>{error}</Text>
            <Text style={styles.errorDetail}>
              Check the console for detailed API response
            </Text>
          </View>
        </ScrollView>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <ScrollView style={styles.fullScroll}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>⛈️ The Asheville Atmosphere</Text>
          </View>

          <View style={styles.content}>
            {/* Today Section */}
            {todayForecast && (
              <View style={styles.todaySection}>
                <Text style={styles.sectionTitle}>Today</Text>
                <View style={styles.todayContent}>
                  <Image
                    source={{ uri: todayForecast.icon }}
                    style={styles.todayIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.todayTemp}>
                    {todayForecast.temperature}°{todayForecast.temperatureUnit}
                  </Text>
                  <Text style={styles.todayForecast}>
                    {todayForecast.shortForecast}
                  </Text>
                  <Text style={styles.todayName}>{todayForecast.name}</Text>
                </View>
                <View style={styles.waveDecoration}>
                  <Text style={styles.waveText}>〰️〰️〰️〰️</Text>
                </View>
              </View>
            )}

            {/* Hourly Section */}
            {hourlyForecast.length > 0 && (
              <View style={styles.hourlySection}>
                <Text style={styles.sectionTitle}>Hourly</Text>

                {/* Temperature Row */}
                <View style={styles.hourlyRow}>
                  <Text style={styles.hourlyLabel}>Temp</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.hourlyScroll}
                  >
                    {hourlyForecast.map((hour, index) => (
                      <View key={index} style={styles.hourlyItem}>
                        <Text style={styles.hourlyValue}>{hour.temperature}°</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>

                {/* Precipitation Row */}
                <View style={styles.hourlyRow}>
                  <Text style={styles.hourlyLabel}>Precip</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.hourlyScroll}
                  >
                    {hourlyForecast.map((hour, index) => {
                      const precipValue = hour.probabilityOfPrecipitation?.value || 0;
                      return (
                        <View key={index} style={styles.hourlyItem}>
                          <View style={styles.precipBar}>
                            <View
                              style={[
                                styles.precipFill,
                                { height: `${precipValue}%` },
                              ]}
                            />
                          </View>
                          <Text style={styles.hourlyValueSmall}>{precipValue}%</Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Thunder Row */}
                <View style={styles.hourlyRow}>
                  <Text style={styles.hourlyLabel}>Thunder</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.hourlyScroll}
                  >
                    {hourlyForecast.map((hour, index) => (
                      <View key={index} style={styles.hourlyItem}>
                        <Text style={styles.thunderIcon}>
                          {hasSevereWeather(hour.shortForecast) ? '⚡' : '—'}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>

                {/* Time Labels */}
                <View style={styles.hourlyRow}>
                  <Text style={styles.hourlyLabel}></Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.hourlyScroll}
                  >
                    {hourlyForecast.map((hour, index) => (
                      <View key={index} style={styles.hourlyItem}>
                        <Text style={styles.timeLabel}>
                          {formatTime(hour.startTime)}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}

            {/* 5 Day Forecast */}
            {weekForecast.length > 0 && (
              <View style={styles.fiveDaySection}>
                <Text style={styles.sectionTitle}>5 Day</Text>
                <View style={styles.fiveDayGrid}>
                  {weekForecast.map((day, index) => (
                    <View key={index} style={styles.dayCard}>
                      <Text style={styles.dayEmoji}>
                        {getWeatherEmoji(day.shortForecast)}
                      </Text>
                      <Text style={styles.dayName}>{day.name.split(' ')[0]}</Text>
                      <Text style={styles.dayTemp}>{day.temperature}°</Text>
                      <Text style={styles.dayForecast} numberOfLines={2}>
                        {day.shortForecast}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Radar Section */}
            <View style={styles.radarSection}>
              <Text style={styles.sectionTitle}>Radar</Text>
              <View style={styles.radarPlaceholder}>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </LayoutWrapper>
  );
}

const styles = StyleSheet.create({
  fullScroll: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: '#1a1d23',
    padding: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#003da5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 15,
  },
  todaySection: {
    backgroundColor: '#1a1d23',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  todayContent: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  todayIcon: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  todayTemp: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  todayForecast: {
    fontSize: 18,
    color: '#ccc',
    marginBottom: 5,
  },
  todayName: {
    fontSize: 16,
    color: '#888',
  },
  waveDecoration: {
    marginTop: 15,
    alignItems: 'center',
  },
  waveText: {
    fontSize: 24,
    color: '#003da5',
  },
  hourlySection: {
    backgroundColor: '#1a1d23',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  hourlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  hourlyLabel: {
    width: 70,
    fontSize: 15,
    fontWeight: '600',
    color: '#aaa',
  },
  hourlyScroll: {
    flex: 1,
  },
  hourlyItem: {
    width: 65,
    alignItems: 'center',
    marginRight: 10,
  },
  hourlyValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  hourlyValueSmall: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 5,
  },
  precipBar: {
    width: 30,
    height: 50,
    backgroundColor: '#25292e',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#444',
  },
  precipFill: {
    width: '100%',
    backgroundColor: '#003da5',
  },
  thunderIcon: {
    fontSize: 24,
  },
  timeLabel: {
    fontSize: 12,
    color: '#888',
  },
  fiveDaySection: {
    backgroundColor: '#1a1d23',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  fiveDayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  dayCard: {
    flex: 1,
    minWidth: 110,
    backgroundColor: '#25292e',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  dayEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  dayName: {
    fontSize: 15,
    color: '#aaa',
    marginBottom: 5,
    fontWeight: '600',
  },
  dayTemp: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  dayForecast: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  radarSection: {
    backgroundColor: '#1a1d23',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  radarPlaceholder: {
    backgroundColor: '#25292e',
    borderRadius: 8,
    padding: 40,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  radarEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  radarLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  radarSubtext: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorDetail: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
});