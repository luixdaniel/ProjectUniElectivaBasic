type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SearchInput({ value, onChange, placeholder = "Buscar..." }: SearchInputProps) {
  return (
    <input
      className="w-full rounded-md border border-[rgba(148,163,184,0.15)] bg-[rgba(15,23,42,0.6)] px-4 py-2 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-500 focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
    />
  );
}
