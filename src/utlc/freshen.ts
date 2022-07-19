import { Name } from "./basic";

export function freshen(name: Name, used: Name[]): Name {
  if (used.includes(name)) {
    return freshen(name + "'", used);
  } else {
    return name;
  }
}
