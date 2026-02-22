export default function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M50 15C45 15 40 17 37 20L30 28L25 35L20 45L18 55L20 65L25 72L30 78L35 82L40 85L45 87L50 88L55 87L60 85L65 82L70 78L75 72L80 65L82 55L80 45L75 35L70 28L63 20C60 17 55 15 50 15Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
      <path
        d="M45 25C42 25 40 27 40 30C40 33 42 35 45 35C48 35 50 33 50 30C50 27 48 25 45 25Z"
        fill="white"
      />
      <path
        d="M55 25C52 25 50 27 50 30C50 33 52 35 55 35C58 35 60 33 60 30C60 27 58 25 55 25Z"
        fill="white"
      />
      <path
        d="M50 40C48 40 46 42 46 44C46 46 48 48 50 48C52 48 54 46 54 44C54 42 52 40 50 40Z"
        fill="white"
      />
      <path
        d="M35 50L30 60L28 70L30 75L35 78L40 80L45 82L50 83L55 82L60 80L65 78L70 75L72 70L70 60L65 50L60 45L55 42L50 40L45 42L40 45L35 50Z"
        fill="currentColor"
        fillOpacity="0.7"
      />
      <path
        d="M25 60L20 65L18 70L20 75L25 78L30 80L35 82L40 83L45 82L50 83L55 82L60 83L65 82L70 83L75 82L80 80L85 78L90 75L92 70L90 65L85 60L80 55L75 52L70 50L65 48L60 47L55 46L50 45L45 46L40 47L35 48L30 50L25 52L25 60Z"
        fill="currentColor"
        fillOpacity="0.5"
      />
    </svg>
  );
}
