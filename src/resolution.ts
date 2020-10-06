import { File } from "./file";
import { JsonSchema } from "./json-schema";
import { Pointer } from "./pointer";
import { Reference } from "./reference";
import { Resource } from "./resource";
import { createURL } from "./url";


export type URIType = "file" | "resource" | "anchor" | "pointer";


/**
 * The arguments that can be passed to the `Resolution` constructor
 */
export interface ResolutionArgs {
  resource: Resource;
  reference?: Reference;
  locationInFile: Pointer | string[];
  data: unknown;
  uri: string | URL;
  previousStep?: Resolution;
}

/**
 * The resolved data of a URI within the schema, along with information about how it was resolved.
 */
export class Resolution {
  /**
   * The JSON Schema in which the URI was resolved
   */
  public schema: JsonSchema;

  /**
   * The file that contains the resolved data
   */
  public file: File;

  /**
   * The JSON Schema resource that contains the resolved data
   */
  public resource: Resource;

  /**
   * The `$ref` pointer that was followed to reach this resolution, if any.
   */
  public reference?: Reference;

  /**
   * A pointer to the resolved data's location in the file
   */
  public locationInFile: Pointer;

  /**
   * The resolved data. This can be *any* JavaScript type.
   */
  public data: unknown;

  /**
   * The canonical URI of the resolved data
   *
   * @see https://json-schema.org/draft/2019-09/json-schema-core.html#rfc.section.8.2.2.2
   */
  public uri: URL;

  /**
   * The previous step in the resolution chain that led to this resolution.
   *
   * Resolving a URI can involve multiple "steps" if `$ref` pointers are encountered along the way.
   * Each step is a `Resolution` object, possibly with another `previousStep`, forming a resolution
   * chain that describes how the final value was resolved.
   */
  public previousStep?: Resolution;

  public constructor(args: ResolutionArgs) {
    this.schema = args.resource.schema;
    this.file = args.resource.file;
    this.resource = args.resource;
    this.reference = args.reference;
    this.data = args.data;
    this.locationInFile = args.locationInFile instanceof Pointer ? args.locationInFile : new Pointer(args.locationInFile);
    this.uri = args.uri instanceof URL ? args.uri : createURL(args.uri);
    this.previousStep = args.previousStep;
  }

  /**
   * The first step in the resolution chain.  That is, the most deeply nested `previousStep`.
   */
  public get firstStep(): Resolution {
    let step: Resolution = this;
    while (step.previousStep) {
      step = step.previousStep;
    }
    return step;
  }

  /**
   * An array of each step of the resolution chain, in order, starting with the first step
   * and ending with the final step (this resource).
   */
  public get steps(): Resolution[] {
    let steps: Resolution[] = [this];
    let step: Resolution = this;
    while (step.previousStep) {
      steps.push(step.previousStep);
      step = step.previousStep;
    }
    return steps.reverse();
  }
}
