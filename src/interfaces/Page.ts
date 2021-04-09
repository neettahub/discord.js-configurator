import { Item } from '../Item'

export interface StilizeData {
  all: {
    fulfilled: {
      /** How much pages are fulfilled */
      pages: number;
      /** How much items are fulfilled */
      items: number;
    };
    toBeFulfilled: {
      /** How much pages remains be fulfilled */
      pages: number;
      /** How much items remains be fulfilled */
      items: number;
    };
    /** How much pages are created */
    pages: number;
    /** How much items are created */
    items: number;
  };
  /** Refers to the current page */
  page: {
    /** How much items remains to be fulfilled in the current page */
    missingItemsToBeFulfilled: number;
    /** How much items are fulfilled in the current page */
    itemsFulfilled: number;
  };
}

export interface PageOptions {
  /** Whether it should be required as default  `default=true` */
  defaultRequired?: boolean;
  /** Whether it should be a list as default  `default=false` */
  defaultIsList?: boolean;
  /** If it is a list, how it will be splitted `default=,` */
  defaultSplitBy?: string;
  /** How the message will be created */
  stilize?: (items: Item[], data: StilizeData) => Promise<any>
}
