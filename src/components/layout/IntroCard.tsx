
import type { ReactNode } from "react";

interface IntroCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

const IntroCard = ({ title, description, children }: IntroCardProps) => {
  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50 sm:p-9">
      <div className="mb-8 text-left">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>

      {children}
    </section>
  );
};

export default IntroCard;
