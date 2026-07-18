import React from 'react';
import { WikiPage } from './WikiPage';
import { commercialWikiData } from '../../data/commercialWiki';

export default function CommercialWiki() {
  return <WikiPage title="Pricing & Commercials" data={commercialWikiData} />;
}
