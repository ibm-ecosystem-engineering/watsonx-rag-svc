import {Field, ObjectType} from "@nestjs/graphql";
import {GreetingModel} from "../models";

@ObjectType({ description: 'greeting' })
export class Greeting implements GreetingModel {
    @Field()
    greeting: string;
}
