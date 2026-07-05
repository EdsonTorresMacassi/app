export interface CatalogItem {
  catalogId?: number;
  catalogType?: string;
  parentId?: number;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
}
