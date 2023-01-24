
function isEqual(arr1: string[], arr2: string[]) {
  return arr1.sort().join() === arr2.sort().join();
}

export class KeyGeneratorError extends Error {}

export class KeyGeneratorKey<T extends string = string> extends String {
  #generatorKeys: T[];

  #value: string;

  constructor(generatorKeys: T[], value: string) {
    super(value);
    this.#value = value;
    this.#generatorKeys = generatorKeys;
  }

  get generatorKeys() {
    return this.#generatorKeys;
  }

  toString() {
    return this.#value;
  }
}

export class KeyGenerator<T extends string> {
  #keys: T[];

  #separator: string;

  constructor(keys: [T, T, ...T[]], separator = '-') {
    this.#separator = separator;
    this.#keys = keys;
  }

  generate(props: Record<T, string>): KeyGeneratorKey<T> {
    const key = Object.entries(props)
      .sort(([a], [b]) => {
        return this.#keys.indexOf(b as T) - this.#keys.indexOf(a as T);
      })
      .map((_k, value) => value)
      .join(this.#separator);

    return new KeyGeneratorKey<T>(this.#keys, key);
  }

  extract(key: KeyGeneratorKey<T>): Record<T, string> {
    if (!isEqual(key.generatorKeys, this.#keys)) {
      const message = `Provided key does not belong to this generator. {
          expectedKeys: ${key.generatorKeys.join()}, 
          receivedKeys: ${this.#keys.join()}
      }`;

      throw new KeyGeneratorError(message);
    }

    const values = key.split(this.#separator);

    const obj = values.reduce((acc, value, index) => {
      const objKey = this.#keys[index];
      acc[objKey] = value;
      return acc;
    }, {} as Record<T, string>);

    return obj;
  }
}

const myKeyGenerator = new KeyGenerator(['projectName', 'deployTargetId']);

const key = myKeyGenerator.generate({
  projectName: 'Z00',
  deployTargetId: '1',
});
