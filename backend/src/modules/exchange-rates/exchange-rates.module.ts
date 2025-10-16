import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExchangeRatesController } from './exchange-rates.controller';
import { ExchangeRatesService } from './exchange-rates.service';
import { CurrencyConversionService } from './currency-conversion.service';
import { ExchangeRate, ExchangeRateSchema } from './schemas/exchange-rate.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExchangeRate.name, schema: ExchangeRateSchema }
    ])
  ],
  controllers: [ExchangeRatesController],
  providers: [ExchangeRatesService, CurrencyConversionService],
  exports: [ExchangeRatesService, CurrencyConversionService]
})
export class ExchangeRatesModule {}
