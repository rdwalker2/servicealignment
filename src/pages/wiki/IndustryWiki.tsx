import React from 'react';
import { WikiPage } from './WikiPage';
import { industryWikiData } from '../../data/industryWiki';

export default function IndustryWiki() {
  return <WikiPage title="Domain & Industry Knowledge" data={industryWikiData} />;
}
