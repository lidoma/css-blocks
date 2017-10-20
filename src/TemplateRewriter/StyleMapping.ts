import { ClassName } from "./ClassName";
import { Block, BlockObject } from "../Block";
import { OptionsReader } from "../OptionsReader";
import { TemplateAnalysis } from "../TemplateAnalysis";
import { TemplateInfo, TemplateTypes } from "@opticss/template-api";

export class StyleMapping<K extends keyof TemplateTypes> {
  template: TemplateInfo<K>;
  blocks: {
    [localName: string]: Block;
  };
  blockMappings: Map<BlockObject,ClassName[]>;

  constructor(template: TemplateInfo<K>) {
    this.template = template;
    this.blocks = {};
    this.blockMappings = new Map();
  }

  addBlockReference(name: string, block: Block) {
    this.blocks[name] = block;
  }

  addObjects(options: OptionsReader, ...objects: BlockObject[]) {
    objects.forEach(o => {
      if (o) {
        this.blockMappings.set(o, o.cssClasses(options));
      } else {
        console.error(new Error("FIXME: Undefined value passed as block object."));
      }
    });
  }

  mapObjects(...objects: BlockObject[]): ClassName[] {
    return objects.reduce<ClassName[]>((classes, o) => classes.concat(this.blockMappings.get(o) || []), []);
  }

  addBlock(localName: string | null, block: Block, options: OptionsReader) {
    this.blocks[localName || block.name] = block;
    block.all().forEach(o => {
      this.blockMappings.set(o, o.cssClass(options).split(/\s+/));
    });
  }
  static fromAnalysis<K extends keyof TemplateTypes>(
    analysis: TemplateAnalysis<K>,
    options: OptionsReader
  ): StyleMapping<K> {
    let mapping = new StyleMapping<K>(analysis.template as TemplateInfo<K>);
    Object.keys(analysis.blocks).forEach(name => {
      mapping.addBlockReference(name, analysis.blocks[name]);
    });
    mapping.addObjects(options, ...analysis.stylesFound);
    return mapping;
  }
}