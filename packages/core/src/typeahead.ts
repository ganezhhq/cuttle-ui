export interface TypeaheadOptions {
  /** Milliseconds of silence before the search text resets. Defaults to 500. */
  timeout?: number;
}

export type Typeahead = (key: string, labels: readonly string[], current: number) => number;

/**
 * Creates a matcher that returns the index of the next label matching typed
 * characters, or -1. Repeating one letter cycles through labels starting with it.
 */
export function createTypeahead(options: TypeaheadOptions = {}): Typeahead {
  const { timeout = 500 } = options;
  let search = '';
  let timer: ReturnType<typeof setTimeout> | undefined;

  return (key, labels, current) => {
    if (key.length !== 1) return -1;
    clearTimeout(timer);
    timer = setTimeout(() => (search = ''), timeout);
    search += key.toLowerCase();

    const isRepeat = [...search].every((char) => char === search[0]);
    const query = isRepeat ? search.charAt(0) : search;
    const start = isRepeat ? current + 1 : current;

    for (let i = 0; i < labels.length; i += 1) {
      const index = (Math.max(start, 0) + i) % labels.length;
      if (labels[index]?.toLowerCase().startsWith(query)) return index;
    }
    return -1;
  };
}
