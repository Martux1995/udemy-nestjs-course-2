import { Injectable } from '@nestjs/common';
import { AxiosAdapter } from '../common/adapters/axios.adapter';
import { PokemonService } from '../pokemon/pokemon.service';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {
  constructor(
    private readonly http: AxiosAdapter,
    private readonly pokemonService: PokemonService,
  ) {}

  async executeSeed() {
    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=650',
    );

    const pokeArray = data.results.map(({ name, url }) => {
      const segment = url.split('/');

      const no = +segment[segment.length - 2];

      return { name, no };
    });

    await this.pokemonService.seed(pokeArray);

    return 'Seed Executed';
  }
}
