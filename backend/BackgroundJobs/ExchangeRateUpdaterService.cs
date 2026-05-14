using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace Backend.BackgroundJobs
{
    public class ExchangeRateUpdaterService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ExchangeRateUpdaterService> _logger;

        public ExchangeRateUpdaterService(IServiceProvider serviceProvider, ILogger<ExchangeRateUpdaterService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Exchange Rate Updater Background Service is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("Updating Exchange Rates...");

                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var dbContext = scope.ServiceProvider.GetRequiredService<BankingDbContext>();
                    var redisService = scope.ServiceProvider.GetRequiredService<IRedisCacheService>();

                    // Simulate fetching from TCMB or External API
                    var simulatedRates = new List<ExchangeRate>
                    {
                        new ExchangeRate { CurrencyCode = "USD", CurrencyName = "Amerikan Doları", BuyRate = 32.15m, SellRate = 32.25m, Source = "TCMB", UpdatedAt = DateTime.UtcNow },
                        new ExchangeRate { CurrencyCode = "EUR", CurrencyName = "Euro", BuyRate = 35.10m, SellRate = 35.25m, Source = "TCMB", UpdatedAt = DateTime.UtcNow },
                        new ExchangeRate { CurrencyCode = "GBP", CurrencyName = "İngiliz Sterlini", BuyRate = 40.50m, SellRate = 40.80m, Source = "TCMB", UpdatedAt = DateTime.UtcNow },
                        new ExchangeRate { CurrencyCode = "XAU", CurrencyName = "Altın (Gram)", BuyRate = 2450.0m, SellRate = 2465.0m, Source = "TCMB", UpdatedAt = DateTime.UtcNow }
                    };

                    foreach (var rate in simulatedRates)
                    {
                        var existing = await dbContext.ExchangeRates.SingleOrDefaultAsync(e => e.CurrencyCode == rate.CurrencyCode, stoppingToken);
                        if (existing != null)
                        {
                            existing.BuyRate = rate.BuyRate;
                            existing.SellRate = rate.SellRate;
                            existing.UpdatedAt = rate.UpdatedAt;
                        }
                        else
                        {
                            dbContext.ExchangeRates.Add(rate);
                        }

                        // Save history
                        dbContext.ExchangeRateHistories.Add(new ExchangeRateHistory
                        {
                            CurrencyCode = rate.CurrencyCode,
                            BuyRate = rate.BuyRate,
                            SellRate = rate.SellRate,
                            Source = rate.Source,
                            RecordedAt = rate.UpdatedAt
                        });
                    }

                    await dbContext.SaveChangesAsync(stoppingToken);

                    // Update Redis Cache
                    var liveRatesDict = new Dictionary<string, object>();
                    foreach (var rate in simulatedRates)
                    {
                        liveRatesDict[rate.CurrencyCode] = new { rate.BuyRate, rate.SellRate };
                    }

                    await redisService.SetAsync("rates:live", liveRatesDict, TimeSpan.FromMinutes(60));

                    _logger.LogInformation("Exchange Rates updated successfully in DB and Redis.");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while updating exchange rates.");
                }

                // Wait 1 hour before updating again
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
        }
    }
}
