using System;
using System.Text.Json;
using System.Threading.Tasks;
using StackExchange.Redis;

namespace Backend.Services
{
    public class RedisCacheService : IRedisCacheService
    {
        private readonly IDatabase _cacheDb;

        public RedisCacheService(IConnectionMultiplexer redisConnection)
        {
            _cacheDb = redisConnection.GetDatabase();
        }

        public async Task<T?> GetAsync<T>(string key)
        {
            var value = await _cacheDb.StringGetAsync(key);
            if (value.IsNullOrEmpty)
            {
                return default;
            }
            return JsonSerializer.Deserialize<T>(value.ToString()!);
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
        {
            var jsonValue = JsonSerializer.Serialize(value);
            if (expiry.HasValue)
            {
                await _cacheDb.StringSetAsync(key, jsonValue, expiry.Value);
            }
            else
            {
                await _cacheDb.StringSetAsync(key, jsonValue);
            }
        }

        public async Task RemoveAsync(string key)
        {
            await _cacheDb.KeyDeleteAsync(key);
        }
    }
}
