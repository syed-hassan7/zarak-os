let pendingQuery: string | null = null;

type PendingQueryListener = () => void;
const listeners = new Set<PendingQueryListener>();

export function setPendingQuery(query: string): void {
  pendingQuery = query;
  listeners.forEach((listener) => listener());
}

export function consumePendingQuery(): string | null {
  const query = pendingQuery;
  pendingQuery = null;
  return query;
}

export function subscribeToPendingQuery(listener: PendingQueryListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
