import { LeasingPortal } from "./requests/LeasingPortal";

export function Home() {
  return (
    <main className="min-h-screen bg-[var(--page-bg)] py-4 sm:py-6 lg:py-8">
      <div className="mx-auto w-full max-w-[1280px] px-3 sm:px-6 lg:px-10">
        <LeasingPortal />
      </div>
    </main>
  );
}
