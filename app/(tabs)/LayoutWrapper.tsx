import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  useWindowDimensions, 
  ScrollView, 
  ActivityIndicator 
} from 'react-native';

interface WeatherAlert {
  event: string;
  headline: string;
  severity: string;
  onset: string;
  ends: string;
}

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  const isWebLarge = width >= 768;

  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch(
          'https://api.weather.gov/alerts/active?area=NC',
          {
            headers: {
              'User-Agent': 'MyWeatherApp (slundin@unca.edu)',
              'Accept': 'application/ld+json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const features = data?.features || [];

          const buncombeAlerts = features
            .filter((feature: any) => {
              const areaDesc = feature?.properties?.areaDesc || '';
              return areaDesc.includes('Buncombe');
            })
            .map((feature: any) => ({
              event: feature.properties.event,
              headline: feature.properties.headline,
              severity: feature.properties.severity,
              onset: feature.properties.onset,
              ends: feature.properties.ends,
            }));

          setAlerts(buncombeAlerts);
        }
      } catch (err) {
        console.error('Error fetching alerts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'extreme':
        return '#d32f2f';
      case 'severe':
        return '#f57c00';
      case 'moderate':
        return '#ffa726';
      case 'minor':
        return '#ffb300';
      default:
        return '#666';
    }
  };

  const getSeverityEmoji = (event: string) => {
    const lower = event?.toLowerCase() || '';
    if (lower.includes('tornado')) return '🌪️';
    if (lower.includes('thunder') || lower.includes('severe')) return '⛈️';
    if (lower.includes('flood')) return '🌊';
    if (lower.includes('wind')) return '💨';
    if (lower.includes('winter') || lower.includes('snow')) return '❄️';
    if (lower.includes('heat')) return '🌡️';
    if (lower.includes('freeze') || lower.includes('frost')) return '🧊';
    if (lower.includes('fog')) return '🌫️';
    return '⚠️';
  };

  const formatAlertTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <View style={[styles.container, isWebLarge ? styles.row : styles.column]}>
      
      {/* MAIN SCROLLABLE CONTENT (fixes web scrolling!) */}
      <ScrollView 
        style={styles.mainScroll}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {children}
      </ScrollView>

      {/* RIGHT-SIDE BULLETIN SCROLLS SEPARATELY */}
      <ScrollView 
        style={[
          styles.bulletin, 
          isWebLarge && { height: height - 20 }  // Only on desktop layout
        ]}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <Text style={styles.bulletinTitle}>📋 Bulletin (Special)</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#003da5" />
            <Text style={styles.loadingText}>Loading alerts...</Text>
          </View>
        ) : alerts.length > 0 ? (
          <>
            {alerts.map((alert, index) => (
              <View
                key={index}
                style={[
                  styles.alertCard,
                  { borderLeftColor: getSeverityColor(alert.severity) },
                ]}
              >
                <Text style={styles.alertEmoji}>{getSeverityEmoji(alert.event)}</Text>
                <Text style={styles.alertEvent}>{alert.event}</Text>
                <Text style={styles.alertHeadline}>{alert.headline}</Text>
                <Text style={styles.alertTime}>
                  Until: {formatAlertTime(alert.ends)}
                </Text>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.noAlertsContainer}>
            {/* <Text style={styles.noAlertsEmoji}>✅</Text>
            <Text style={styles.noAlertsText}>No active weather alerts</Text>
            <Text style={styles.noAlertsSubtext}>Asheville area is clear</Text> */}
          </View>
        )}

        <View style={styles.infoSection}>
        </View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 10,
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },

  /** MAIN CONTENT */
  mainScroll: {
    flex: 1,
    marginRight: 10,
  },

  /** BULLETIN RIGHT PANEL */
  bulletin: {
    width: 280,
    maxWidth: 280,
    backgroundColor: '#1a1d23',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    alignSelf: 'flex-start',
  },
  bulletinTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },

  loadingContainer: { alignItems: 'center', padding: 20 },
  loadingText: { color: '#888', marginTop: 10, fontSize: 12 },

  alertCard: {
    backgroundColor: '#25292e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  alertEmoji: { fontSize: 28, marginBottom: 5 },
  alertEvent: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  alertHeadline: { color: '#ccc', fontSize: 12, marginBottom: 8 },
  alertTime: { color: '#888', fontSize: 11, fontStyle: 'italic' },

  noAlertsContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#25292e',
    borderRadius: 8,
  },
  noAlertsEmoji: { fontSize: 48, marginBottom: 10 },
  noAlertsText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  noAlertsSubtext: { color: '#888', fontSize: 12 },

  infoSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  infoTitle: { color: '#003da5', fontSize: 14, fontWeight: 'bold' },
  infoText: { color: '#aaa', fontSize: 12, marginTop: 4 },
});
