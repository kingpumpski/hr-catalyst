import { type ReactNode, useEffect, useRef, useState } from "react";

type LazySectionProps = {
  children: ReactNode;
  fallback?: ReactNode;
  navId?: string;
};

const LazySection = ({
  children,
  fallback = <div className="min-h-[220px]" />,
  navId,
}: LazySectionProps) => {
  const supportsIntersectionObserver = typeof IntersectionObserver !== "undefined";
  const [isVisible, setIsVisible] = useState(() => !supportsIntersectionObserver);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isVisible || !supportsIntersectionObserver) return;

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin: "240px 0px", threshold: 0.01 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [isVisible, supportsIntersectionObserver]);

  return (
    <div ref={ref} data-nav-section={navId} className="below-fold-section">
      {isVisible ? children : fallback}
    </div>
  );
};

export default LazySection;
