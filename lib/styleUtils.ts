const breakpoints = {
  small: 600,
  medium: 768,
  large: 1024,
};

type MediaQueryFunction = (strings: TemplateStringsArray, ...values: any[]) => string;

const media: Record<string, MediaQueryFunction> = {
  small: (strings, ...values) =>
    `@media (max-width: ${breakpoints.small}px) { ${String.raw(strings, ...values)} }`,

  medium: (strings, ...values) =>
    `@media (min-width: ${breakpoints.small + 1}px) and (max-width: ${
      breakpoints.medium
    }px) { ${String.raw(strings, ...values)} }`,

  large: (strings, ...values) =>
    `@media (min-width: ${breakpoints.medium + 1}px) { ${String.raw(strings, ...values)} }`,
};

export default media;
