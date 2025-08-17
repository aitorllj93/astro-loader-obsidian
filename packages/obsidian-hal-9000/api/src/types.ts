
import type { z, ZodRawShape, ZodTypeAny } from 'zod';
import type { DocumentInputSchema, DocumentSchema, PlaceInputSchema, PlaceSchema } from './schemas';

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


export type Document = z.input<typeof DocumentSchema>;
export type DocumentInput = z.input<typeof DocumentInputSchema>;

export type PlaceInput = z.input<typeof PlaceInputSchema>;
export type Place = z.infer<typeof PlaceSchema>;
