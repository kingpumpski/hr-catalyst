import { ReactNode, useEffect, useRef, useState } from "react";

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
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (hasTriggered || typeof IntersectionObserver === "undefined") {
      return;
    }

    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasTriggered(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px 0px",
        threshold: 0.1,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasTriggered]);

  return (
    <div ref={ref} data-nav-section={navId}>
      {isVisible ? children : fallback}
    </div>
  );
};

export default LazySection;
