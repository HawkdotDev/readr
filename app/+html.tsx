import { ScrollView, StyleSheet } from 'react-native';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>Readr — The Quiet Sanctuary</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
