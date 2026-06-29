interface IconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

export function CatIcon({ className, size = 20, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Head */}
      <ellipse cx="12" cy="15" rx="7" ry="6.5" />
      {/* Left ear */}
      <path d="M6.5 10.5L8 5l3.5 4.5" />
      {/* Right ear */}
      <path d="M17.5 10.5L16 5l-3.5 4.5" />
      {/* Eyes */}
      <circle cx="9.5" cy="14" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="14" r="1.1" fill="currentColor" stroke="none" />
      {/* Nose – small inverted triangle */}
      <path d="M11.5 16.5L12 17.5l.5-1z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function DogIcon({ className, size = 20, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Head */}
      <circle cx="12" cy="13" r="7" />
      {/* Left floppy ear */}
      <path d="M5 10.5Q3 16 5 19q3 3 4.5-.5" />
      {/* Right floppy ear */}
      <path d="M19 10.5q2 5.5 0 8.5q-3 3-4.5-.5" />
      {/* Eyes */}
      <circle cx="9.5" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="12" r="1.1" fill="currentColor" stroke="none" />
      {/* Nose */}
      <rect x="10" y="14" width="4" height="2.5" rx="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PawIcon({ className, size = 20, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Main pad */}
      <ellipse cx="12" cy="17" rx="5.5" ry="4.5" />
      {/* Toe pads */}
      <ellipse cx="7.5"  cy="12"  rx="1.75" ry="2.25" />
      <ellipse cx="11"   cy="10"  rx="1.75" ry="2.25" />
      <ellipse cx="15"   cy="10"  rx="1.75" ry="2.25" />
      <ellipse cx="18.5" cy="12"  rx="1.75" ry="2.25" />
    </svg>
  );
}

export function AnimalIcon({ species, className, size, strokeWidth }: { species: string } & IconProps) {
  if (species === "CAT") return <CatIcon className={className} size={size} strokeWidth={strokeWidth} />;
  if (species === "DOG") return <DogIcon className={className} size={size} strokeWidth={strokeWidth} />;
  return <PawIcon className={className} size={size} strokeWidth={strokeWidth} />;
}
