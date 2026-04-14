import { ReactNode } from "react";

type FilterBarProps = {
  children: ReactNode;
};

export default function FilterBar({ children }: FilterBarProps) {
  return <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">{children}</div>;
}
