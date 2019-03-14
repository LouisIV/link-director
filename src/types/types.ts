export interface IDirectorConfig {
  settings?: object;
  directions: IDirections;
}

export interface IDirectedLink {
  icon?: string;
  link: string;
}

export interface IDirection {
  icon?: string;
  director: IDirector;
}

export interface IDirections {
  [key: string]: IDirection;
}

export interface IDirector {
  url?: string;
  map?: object | string[];
  [key: string]: any;
}

export interface IDirectionArgs {
  altLink?: string;
  params?: IDirectionArgParams;
}

export interface IDirectionArgParams {
  [key: string]: any;
}

export interface ISettings {
  noWarnOnFallback?: boolean;
  noWarnOnAssumptions?: boolean;
  [key: string]: any;
}
