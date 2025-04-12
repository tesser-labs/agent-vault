// Namespace
export type Namespace = string;
export type NamespacedName = `${Namespace}_${string}`;

export function isNamespacedName(name: string): name is NamespacedName {
  return name.includes("_");
}

export function addNamespace(
  namespace: Namespace,
  name: string
): NamespacedName {
  return `${namespace}_${name}`;
}

export function parseNamespace(namespacedName: NamespacedName) {
  const [namespace, ...name] = namespacedName.split("_");
  return { namespace, name: name.join("_") };
}
