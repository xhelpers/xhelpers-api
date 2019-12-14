export async function promiseMe(promise): Promise<[any, any]> {
  return promise
    .then(data => {
      return [data, undefined];
    })
    .catch(error => {
      return Promise.resolve([undefined, error]);
    });
}
