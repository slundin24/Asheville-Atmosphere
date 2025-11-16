import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import LayoutWrapper from './LayoutWrapper';

interface ForecastPeriod {
  name: string;
  temperature: number;
  temperatureUnit: string;
  shortForecast: string;
  icon: string;
  startTime: string;
}

export default function IndexScreen() {
  const [todayForecast, setTodayForecast] = useState<ForecastPeriod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<any>(null); // optional: display raw JSON

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        setError(null);
        setLoading(true);

        const url = 'https://api.weather.gov/gridpoints/GSP/49,72/forecast';
        console.log('Fetching from:', url);

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'MyWeatherApp (slundin@unca.edu)',
            'Accept': 'application/ld+json',
          },
        });

        if (!response.ok) {
          throw new Error(`Network response not ok: ${response.status}`);
        }

        const data = await response.json();
        setRawData(data); // keep raw JSON for debugging
        console.log('Full API data:', JSON.stringify(data, null, 2));

        // Try to access forecast periods in multiple ways
        let periods: ForecastPeriod[] | undefined = undefined;
        if (data?.properties?.periods) periods = data.properties.periods;
        else if (data?.periods) periods = data.periods;
        else if (data?.forecast?.periods) periods = data.forecast.periods;

        if (!periods || periods.length === 0) {
          throw new Error('No forecast periods found in API response');
        }

        // Pick the first daytime forecast (skip "night")
        const today = periods.find(
          (p) => !p.name.toLowerCase().includes('night')
        );

        setTodayForecast(today || null);
      } catch (err: any) {
        console.error('Error fetching forecast:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, []);

  return (
    <LayoutWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Today's Forecast</Text>
        <Text style={styles.subtitle}>Asheville, NC</Text>

        {loading && <ActivityIndicator size="large" color="#fff" />}
        {error && <Text style={styles.error}>Error: {error}</Text>}

        {!loading && !error && todayForecast && (
          <View style={styles.card}>
            <Image
              source={{ uri: todayForecast.icon }}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.day}>{todayForecast.name}</Text>
            <Text style={styles.temp}>
              {todayForecast.temperature}°{todayForecast.temperatureUnit}
            </Text>
            <Text style={styles.desc}>{todayForecast.shortForecast}</Text>
            <Text style={styles.time}>
              {new Date(todayForecast.startTime).toLocaleString()}
            </Text>
          </View>
        )}

        {!loading && !error && !todayForecast && (
          <>
            <Text style={styles.error}>No forecast data available.</Text>
            <ScrollView style={{ maxHeight: 300, marginTop: 20 }}>
              <Text style={{ color: '#fff', fontSize: 12 }}>
                {JSON.stringify(rawData, null, 2)}
              </Text>
            </ScrollView>
          </>
        )}
      </ScrollView>
    </LayoutWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: 260,
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  day: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  temp: {
    color: '#FFD700',
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  desc: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  time: {
    color: '#999',
    fontSize: 12,
  },
  error: {
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
  },
});
