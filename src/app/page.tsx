import { MultiStepForm } from "@/components/multi-step-form";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-background">
      <div className="container mx-auto">
        <div className="flex justify-end mb-4">
          <ModeToggle />
        </div>
        <MultiStepForm />
      </div>
    </main>
  );
}