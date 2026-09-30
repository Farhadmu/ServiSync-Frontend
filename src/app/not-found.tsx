import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-background to-muted/30">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
        <Compass className="h-8 w-8 animate-pulse" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
        404 — Page Not Found
      </h1>
      <p className="mt-3 text-base text-muted-foreground max-w-md">
        The page or service you are searching for does not exist or has been relocated within ServiSync.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild variant="default">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return Home
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
