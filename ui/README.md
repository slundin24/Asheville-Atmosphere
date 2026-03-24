Asheville Atmosphere is a responsive web and mobile weather application that delivers real-time and forecasted conditions for Asheville, NC using data from the National Weather Service (NWS) API. The app displays current conditions, hourly trends (temperature, precipitation, and thunder indicators), and a five-day forecast with both daytime and nighttime periods.

The frontend is built with React Native using Expo, allowing a single codebase to support both web and mobile platforms. The interface adapts to screen size, using a sidebar bulletin board on web and an interactive bottom sheet on mobile for a more intuitive user experience. Navigation is handled with Expo Router, and responsive behavior is managed through React Native’s layout system.

The backend provides authentication and bulletin board functionality through a REST API, where users can securely log in and, based on their role (admin/moderator), create or manage posts. Authentication is handled using token-based requests, and data is stored in a database that tracks users and bulletin comments.

The project emphasizes usability, responsive design, and actionable weather insights by combining reliable government forecast data with a streamlined, user-friendly interface.


****** README from shell of basic expo start up ******
# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.


