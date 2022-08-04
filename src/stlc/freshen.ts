import { Name } from "./basic";

export function freshen(used: Name[], name: Name): Name {
  if (used.includes(name)) {
    return freshen(used, name + "'");
  } else {
    return name;
  }
}