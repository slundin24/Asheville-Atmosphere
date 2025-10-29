import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import IndexScreen from './index';
import AboutScreen from './about';

const Tab = createMaterialTopTabNavigator();

export default function TabLayout() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#003da5',
        tabBarInactiveTintColor: '#fff',
        tabBarStyle: { backgroundColor: '#25292e' },
        tabBarIndicatorStyle: { backgroundColor: '#003da5' },
        tabBarLabelStyle: { fontSize: 16, fontWeight: 'bold' },
      }}
    >
      <Tab.Screen
        name="index"
        component={IndexScreen}
        options={{
          title: 'NWS',
        }}
      />
      <Tab.Screen
        name="about"
        component={AboutScreen}
        options={{
          title: 'ATMS',
        }}
      />
    </Tab.Navigator>
  );
}


