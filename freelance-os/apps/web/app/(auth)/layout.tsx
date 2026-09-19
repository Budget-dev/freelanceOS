export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Keep the authentication experience clean and focused.
  // No large marketing footer is rendered here.
  return (
    <>
      {children}
    </>
  );
}
