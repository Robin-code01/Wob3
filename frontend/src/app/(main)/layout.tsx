import AuthHeader from "@/components/layout/auth-header";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <AuthHeader />
      {children}
    </>
  );
}
