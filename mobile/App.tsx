import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Main" 
          component={() => <div>PostQode Nexus Mobile - Coming Soon</div>}
          options={{ title: 'PostQode Nexus' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
