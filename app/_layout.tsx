import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConvexReactClient } from 'convex/react';
import App from '@/App';

const asyncStorage = {
  getItem: AsyncStorage.getItem,
  setItem: AsyncStorage.setItem,
  removeItem: AsyncStorage.removeItem,
};

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  return (
    <ConvexAuthProvider client={convex} storage={asyncStorage}>
        <Stack
         screenOptions={{
          headerShown: false,
        }}
        >
          <Stack.Screen name="index"/>
          <Stack.Screen name="register"  />
          <Stack.Screen name="verification"  />
          <Stack.Screen name="username"  />
          {/* <Stack.Screen name="SignIn"  />
          <Stack.Screen name="OtherDevices" /> */}
          <Stack.Screen name="sessionVerification" />
          <Stack.Screen name="chatScreen"  />
          {/* <Stack.Screen name="dm"  />
          <Stack.Screen name="dmCreate" />
          <Stack.Screen name="chatbox" />
          <Stack.Screen name="Profile"  />
          <Stack.Screen name="call" />
          <Stack.Screen name="BillSplit" /> */}
        </Stack>
      </ConvexAuthProvider>
  );
}
// export default function RootLayout({ children }: { children: React.ReactNode}) {
//   return (
//     <ConvexAuthProvider client={convex} storage={asyncStorage}>
//       {/* {children} */}
//       <App/>
//     </ConvexAuthProvider>
//   );
// }
