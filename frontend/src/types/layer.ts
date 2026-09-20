export type LayerNodeType = 'group' | 'layer';

export interface AdminLayerNode {
  id: string;
  type: LayerNodeType;
  title: string;
  parentId: string | null;
  enabled: boolean;
  expanded?: boolean;
  
  url?: string;
  isFile?: boolean;
  fileName?: string;
  opacity?: number;
}