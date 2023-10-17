import { Controller, Get } from '@nestjs/common';
import { HelloWorldApi } from '../../services';
import {ApiTags} from "@nestjs/swagger";

@ApiTags('hello')
@Controller()
export class HelloWorldController {
  constructor(private readonly service: HelloWorldApi) {}

  @Get()
  getHello(): string {
    return this.service.getHello().greeting;
  }
}
