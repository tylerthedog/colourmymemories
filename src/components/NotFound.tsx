import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface NotFoundProps {
  navigate: (to: string) => void;
}

export default function NotFound({ navigate }: NotFoundProps) {
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", window.location.pathname);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="text-center max-w-sm bg-card border border-border p-8 rounded-2xl shadow-card space-y-6 animate-fade-in-up">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl mx-auto select-none">
          🤔
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-foreground">Page Not Found</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Oops! The color palette you're looking for doesn't exist here. Let's get you back to safety.
          </p>
        </div>
        <button
          onClick={() => {
            navigate('/');
            window.scrollTo({ top: 0 });
          }}
          className="w-full h-11 rounded-xl text-sm font-bold shadow-soft flex items-center justify-center gap-2 gradient-primary text-primary-foreground transform duration-250 cursor-pointer hover:opacity-90"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
}
