import React from 'react';
import { WikiPage } from './WikiPage';
import { productWikiData } from '../../data/productWiki';

export default function ProductWiki() {
  return <WikiPage title="Product Feature Wiki" data={productWikiData} />;
}
