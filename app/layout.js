import './globals.css';

export const metadata = {
  title: 'MyCricket Web',
  description: 'Live, upcoming and finished cricket matches with scorecards and admin-managed news.',
};

export default function RootLayout({children}) {
  return (
    <html lang="en">
      <body>
        <div className="bgPattern" />
        {children}
      </body>
    </html>
  );
}
