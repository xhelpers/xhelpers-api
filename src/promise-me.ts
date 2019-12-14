export async function promiseMe(promise: any): Promise<[any, any]> {
  return promise
    .then((data: any) => [data, undefined])
    .catch((error: any) => {
      return Promise.resolve([undefined, error]);
    });
}
