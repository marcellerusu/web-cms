type Rule = {
  type: string;
  value: any;
};

type Number = Rule & {
  type: "range";
  min: number;
  max: number;
  value: number;
};

type Color = Rule & {
  type: "color";
};

export let number: Number = {
  value: 0,
  type: "range",
  min: 0,
  max: 20,
} as const;

export let color: Omit<Color, "value"> = {
  type: "color",
} as const;

export function format({ type, value }: Rule) {
  switch (type) {
    case "range":
      return `${value}px`;
    case "color":
      return value;
    default:
      console.assert(false, "Not available to format");
  }
}

export function eq(lhs: Rule, rhs: Rule) {
  return lhs.type === rhs.type && lhs.value === rhs.value;
}

export function discard<T extends Record<string, Rule>>(
  object: T,
  ...keys: (keyof T)[]
) {
  let entries = Object.entries(object).filter(([key]) => !keys.includes(key));
  return Object.fromEntries(entries);
}
