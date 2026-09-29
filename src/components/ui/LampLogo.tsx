export function LampLogo({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}logo.png`}
      alt=""
      aria-hidden="true"
      width={256}
      height={256}
      decoding="async"
      className={`shrink-0 drop-shadow-[0_6px_14px_rgb(61_42_28/0.35)] ${className}`}
    />
  );
}
