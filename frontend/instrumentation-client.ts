// Dev-only workaround for a React dev-mode bug: on Firefox, React's
// performance tracking can call performance.measure() with a negative end
// time, which throws and breaks the page. Swallow that error in development.
if (process.env.NODE_ENV === "development" && typeof performance !== "undefined") {
  const original = performance.measure.bind(performance);
  performance.measure = ((...args: Parameters<typeof original>) => {
    try {
      return original(...args);
    } catch {
      return undefined as unknown as PerformanceMeasure;
    }
  }) as typeof performance.measure;
}
