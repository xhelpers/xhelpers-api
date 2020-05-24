export const useCache = async (
  request: { server?: any; auth?: any; method?: any; payload?: any },
  response: any
) => {
  if (process.env.USING_REDIS_CACHE !== "true") return;

  const { redis } = request.server.app;
  const { method, payload } = request;
  const redisKey = payload.id || payload._id;
  const { sub: redispath } = request.auth.credentials;

  switch (method) {
    case "POST":
    case "PATCH":
    case "PUT":
      await redis.lsetAsync(redisKey, 1, JSON.stringify(response));
      break;
    case "DELETE":
      await redis.lremAsync(redisKey, 1, JSON.stringify(response));
      break;
    default:
      break;
  }
}
