import { Redirect } from 'expo-router';

/** Stara trasa — przekieruj na kartę dolną. */
export default function MessagesIndexRedirect() {
  return <Redirect href="/(tabs)/messages" />;
}
