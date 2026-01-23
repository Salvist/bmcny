// This root layout is required for Next.js but just passes through children
// The actual layout with i18n is in app/[locale]/layout.tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
