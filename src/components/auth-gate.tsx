import AuthRequired from '@/components/auth-required';

interface AuthGateProps {
  title: string;
  description?: string;
  minHeight?: string;
  children: React.ReactNode;
}

export default function AuthGate({ title, description, minHeight = '70vh', children }: AuthGateProps) {
  return (
    <div className="relative" style={{ minHeight }}>
      <div className="blur-sm opacity-30 pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <AuthRequired title={title} description={description} />
      </div>
    </div>
  );
}
