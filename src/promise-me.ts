export const promiseMe = async (promise: any): Promise<[any, any]> => {
  return promise
    .then((data: any) => [data, undefined])
    .catch((error: any) => {
      return Promise.resolve([undefined, error]);
    });
}
