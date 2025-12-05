import { PageLoader } from "@/components/ui/loading";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <PageLoader 
        message="Učitavanje..." 
        submessage="Molimo sačekajte dok se podaci učitavaju"
      />
    </div>
  );
}

