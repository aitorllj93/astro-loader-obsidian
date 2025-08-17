
import type { z, ZodRawShape, ZodTypeAny } from 'zod';

export type Definition = {
	name: string;
	description: string;
	input: ZodRawShape,
	output: ZodRawShape,
}


export type Handler<
	Args extends undefined | ZodRawShape = undefined,
	Output extends undefined | ZodRawShape = undefined,
> = Args extends ZodRawShape ? 
	(args: z.objectOutputType<Args, ZodTypeAny>) => 
		Output extends ZodRawShape ? (z.objectOutputType<Output, ZodTypeAny> | Promise<z.objectOutputType<Output, ZodTypeAny>>) : void :
	() => Output extends ZodRawShape ? (z.objectOutputType<Output, ZodTypeAny> | Promise<z.objectOutputType<Output, ZodTypeAny>>) : void;
