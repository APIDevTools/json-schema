/**
 * Creates an iterator that itates through all grandchildren
 */
export function iterate<TChild, TGrandchild>(children: TChild[], grandchildKey: keyof TChild): Iterable<TGrandchild> {
  return {
    [Symbol.iterator]() {
      let childIndex = 0;
      let grandchildIndex = 0;

      return {
        next(): IteratorResult<TGrandchild> {
          if (childIndex >= children.length) {
            return { done: true, value: undefined };
          }

          let child = children[childIndex];
          let grandchildren = child[grandchildKey] as unknown as TGrandchild[];

          if (grandchildIndex >= grandchildren.length) {
            childIndex++;
            grandchildIndex = 0;
            return this.next();
          }

          let grandchild = grandchildren[grandchildIndex];
          grandchildIndex++;
          return { value: grandchild };
        }
      };
    },
  };
}
