declare module "*.yml" {
  const content: string;
  export default content;
}

declare module "*.proto" {
  const content: string;
  export default content;
}

declare module "./generated/protobuf/*.js" {
  const module: Record<string, unknown>;
  export = module;
}
