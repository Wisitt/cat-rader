import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export function PassportBookIcon(props: IconProps) {
  return <IconBase {...props}><path d="M5 3.5h11a3 3 0 0 1 3 3v14H7a2 2 0 0 1-2-2z" /><path d="M7 3.5v17M10 9.5c.7-2.7 3.3-2.7 4 0M9.5 14c1.4-2 4.6-2 6 0" /><circle cx="10.3" cy="7.2" r=".7" /><circle cx="13.7" cy="7.2" r=".7" /></IconBase>;
}

export function PawShieldIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 2.8 19 6v5.2c0 4.4-2.8 8.2-7 10-4.2-1.8-7-5.6-7-10V6z" /><ellipse cx="12" cy="14.3" rx="2.8" ry="2.2" /><circle cx="8.7" cy="11" r="1" /><circle cx="11" cy="9.5" r="1" /><circle cx="13.5" cy="9.5" r="1" /><circle cx="15.7" cy="11" r="1" /></IconBase>;
}

export function HeartShieldIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 21c-4.2-1.8-7-5.5-7-10V6l7-3.2L19 6v5c0 4.5-2.8 8.2-7 10Z" /><path d="M12 16.2 8.9 13a2 2 0 0 1 2.8-2.8l.3.4.3-.4a2 2 0 0 1 2.8 2.8Z" /></IconBase>;
}

export function QrTagIcon(props: IconProps) {
  return <IconBase {...props}><path d="m3.5 9 7-6h8v8l-6 7a2.2 2.2 0 0 1-3.2.1l-5.9-5.9A2.2 2.2 0 0 1 3.5 9Z" /><circle cx="15.5" cy="6.5" r="1" /><path d="M8 10h2v2H8zM12 10h2v2h-2zM10 12h2v2h-2zM14 13h2v2h-2z" /></IconBase>;
}

export function VaccineCareIcon(props: IconProps) {
  return <IconBase {...props}><path d="m14.5 3 6.5 6.5M17 5.5l-9.8 9.8a2.4 2.4 0 0 0 0 3.4l.1.1a2.4 2.4 0 0 0 3.4 0l9.8-9.8M5.5 16.5 3 19l2 2 2.5-2.5M12 8l4 4M9.5 10.5l4 4" /></IconBase>;
}

export function SafeLocationIcon(props: IconProps) {
  return <IconBase {...props}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><path d="m9 10 2 2 4-4" /></IconBase>;
}

export function LostRibbonIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="9" r="6" /><path d="m8.5 14-1 7 4.5-2 4.5 2-1-7M12 6.5v3M12 12h.01" /></IconBase>;
}

export function MatchPawIcon(props: IconProps) {
  return <IconBase {...props}><ellipse cx="10" cy="15.5" rx="4" ry="3.2" /><circle cx="6.5" cy="11" r="1.2" /><circle cx="9" cy="8.8" r="1.2" /><circle cx="12" cy="8.8" r="1.2" /><circle cx="14.5" cy="11" r="1.2" /><path d="m18 4 .5 1.5L20 6l-1.5.5L18 8l-.5-1.5L16 6l1.5-.5zM19 13l.4 1.1 1.1.4-1.1.4L19 16l-.4-1.1-1.1-.4 1.1-.4z" /></IconBase>;
}
