import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Pokemon.name) private pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      return this.pokemonModel.create(createPokemonDto);
    } catch (e) {
      this._handleExceptions(e);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = this.configService.get<number>('findLimit'), offset = 0 } = paginationDto;
    return this.pokemonModel.find().limit(limit).skip(offset);
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase() });
    }

    if (!pokemon) {
      throw new NotFoundException(
        `Pokemon whit id, name or no ${term} not found`,
      );
    }

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    updatePokemonDto.name = updatePokemonDto.name?.toLowerCase();
    try {
      await pokemon.updateOne(updatePokemonDto);
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (e) {
      this._handleExceptions(e);
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();

    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });

    if (deletedCount === 0) {
      throw new BadRequestException(`Pokemon with id '${id}' not found`);
    }

    return;
  }

  async seed(pokemonData: CreatePokemonDto[]) {
    await this.pokemonModel.insertMany(pokemonData);
  }

  private _handleExceptions(e: any) {
    if (e.code === 11000) {
      throw new BadRequestException(
        `Pokemon with '${JSON.stringify(e.keyValue)}' exists.`,
      );
    }
    console.log(e);
    throw new InternalServerErrorException(
      `Cannot create Pokemon - See server logs`,
    );
  }
}
